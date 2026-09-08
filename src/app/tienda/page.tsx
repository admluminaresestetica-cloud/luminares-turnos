"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ShoppingBag } from "lucide-react";
import CarritoDrawer from "@/components/CarritoDrawer";
import BannerCarousel from "./components/BannerCarousel";
import FooterTienda from "@/components/FooterTienda";
import { useCarrito } from "@/context/CarritoContext";
import { Producto } from "@/types/tienda";
import BotonFlotanteCarrito from "./components/BotonFlotanteCarrito";

// Componentes modularizados
import BuscadorYCategorias from "./components/BuscadorYCategorias";
import GridProductos from "./components/GridProductos";
import ModalDetalleProducto from "./components/ModalDetalleProducto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TiendaPage() {
  const [mounted, setMounted] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(["Todos"]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [ordenarPor, setOrdenarPor] = useState("destacados");

  // Estado para el modal de detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Cálculo seguro del total de ítems desde el contexto
  const context = useCarrito();
  const items = context?.items || context?.carrito || [];
  const totalItems = Array.isArray(items)
    ? items.reduce((acc: number, item: any) => acc + (Number(item?.cantidad) || 1), 0)
    : 0;

  useEffect(() => {
    setMounted(true);

    const fetchProductos = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("activo", true);

        if (error) {
          console.error("Error al cargar productos:", error);
        } else {
          setProductos(data || []);
        }
      } catch (err) {
        console.error("Error inesperado al cargar productos:", err);
      } finally {
        setCargando(false);
      }
    };

    const fetchCategorias = async () => {
      try {
        const { data, error } = await supabase
          .from("categorias")
          .select("nombre")
          .order("nombre", { ascending: true });

        if (error) {
          console.error("Error al cargar categorías:", error);
        } else if (data && data.length > 0) {
          setCategorias(["Todos", ...data.map((c) => c.nombre)]);
        }
      } catch (err) {
        console.error("Error inesperado al cargar categorías:", err);
      }
    };

    fetchProductos();
    fetchCategorias();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0E6E55] border-t-transparent" />
      </div>
    );
  }

  // Lógica de filtrado con soporte para Ofertas
  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre ? p.nombre.toLowerCase().includes(busqueda.toLowerCase()) : true;
    
    let coincideCategoria = true;
    if (categoriaFiltro === "Ofertas") {
      const precioBase = Number(p.precio_original ?? p.precio_anterior) || 0;
      coincideCategoria = precioBase > p.precio;
    } else if (categoriaFiltro !== "Todos") {
      coincideCategoria = p.categoria === categoriaFiltro;
    }

    return coincideBusqueda && coincideCategoria;
  });

  // Lógica de Ordenamiento
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (ordenarPor === "precio-asc") {
      return a.precio - b.precio;
    }
    if (ordenarPor === "precio-desc") {
      return b.precio - a.precio;
    }
    if (ordenarPor === "descuento") {
      const descA = ((Number(a.precio_original ?? a.precio_anterior) || a.precio) - a.precio);
      const descB = ((Number(b.precio_original ?? b.precio_anterior) || b.precio) - b.precio);
      return descB - descA;
    }
    return 0;
  });

  const resetearFiltros = () => {
    setBusqueda("");
    setCategoriaFiltro("Todos");
    setOrdenarPor("destacados");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#12151B] flex flex-col justify-between">
      <div>
        {/* Navbar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-[#E7E5E0] bg-white/90 px-4 py-3 backdrop-blur-md sm:px-10 sm:py-4">
          <Link
            href="https://www.mireservalumin.com.ar/tienda"
            onClick={resetearFiltros}
            className="flex min-w-0 items-center gap-2 sm:gap-3 cursor-pointer transition-opacity hover:opacity-80 active:scale-[0.98]"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center sm:h-12 sm:w-12">
              <Image
                src="/logotiendanegro.svg"
                alt="Logo Luminares"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="flex min-w-0 flex-col leading-tight">
              <h2 className="m-0 truncate text-base font-bold tracking-tight text-[#12151B] sm:text-lg">
                Luminares
              </h2>
              <span className="hidden truncate text-[11px] font-medium text-[#6B675F] sm:block sm:text-sm">
                Tienda Oficial
              </span>
            </div>
          </Link>

          {/* Botón del Carrito en Navbar */}
          <button
            onClick={() => setModalAbierto(true)}
            className="relative flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#E7E5E0] bg-white p-2.5 text-sm font-semibold text-[#12151B] transition-all duration-200 hover:border-[#12151B]/40 hover:shadow-sm active:scale-95 sm:px-4 sm:py-2.5 cursor-pointer"
          >
            <ShoppingBag className="h-[18px] w-[18px] shrink-0 sm:h-4 sm:w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Mi Carrito</span>

            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-[#0E6E55] px-1 text-[10px] font-extrabold leading-none text-white shadow-sm sm:static sm:ml-1 sm:h-5 sm:min-w-[20px] sm:border-0 sm:text-[11px]">
                {totalItems}
              </span>
            )}
          </button>
        </nav>

        {/* Contenido Principal */}
        <div className="mx-auto max-w-[1150px] px-4 pb-28 pt-4 sm:px-10 sm:pb-16">
          <BannerCarousel />

          <BuscadorYCategorias
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            categorias={categorias}
            categoriaSeleccionada={categoriaFiltro}
            onCategoriaSelect={setCategoriaFiltro}
            ordenarPor={ordenarPor}
            onOrdenarChange={setOrdenarPor}
          />

          <GridProductos
            productos={productosOrdenados}
            cargando={cargando}
            onVerDetalle={(prod) => setProductoSeleccionado(prod)}
          />
        </div>

        {/* Modal de Detalle de Producto */}
        <ModalDetalleProducto
          producto={productoSeleccionado}
          todosProductos={productos}
          onClose={() => setProductoSeleccionado(null)}
          onSeleccionarProducto={(prod) => setProductoSeleccionado(prod)}
          onAbrirCarrito={() => setModalAbierto(true)}
        />

        {/* Drawer del Carrito */}
        <CarritoDrawer
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
        />

        {/* Botón Flotante para Celulares */}
        <BotonFlotanteCarrito onOpenCarrito={() => setModalAbierto(true)} />
      </div>

      <FooterTienda />
    </div>
  );
}