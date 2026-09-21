"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ShoppingBag, ArrowLeft, Tag as TagIcon, X, Sparkles } from "lucide-react";
import CarritoDrawer from "@/components/CarritoDrawer";
import BannerCarousel from "./components/BannerCarousel";
import BeneficiosTienda from "./components/BeneficiosTienda";
import FooterTienda from "@/components/FooterTienda";
import { useCarrito } from "@/context/CarritoContext";
import { useConfig } from "@/context/ConfigContext";
import { Producto } from "@/types/tienda";
import BotonFlotanteCarrito from "./components/BotonFlotanteCarrito";
import Fuse from "fuse.js";

import BuscadorYCategorias from "./components/BuscadorYCategorias";
import GridProductos from "./components/GridProductos";
import ModalDetalleProducto from "./components/ModalDetalleProducto";
import TagsFiltros from "./components/TagsFiltros";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TiendaPage() {
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(["Todos"]);

  const [tags, setTags] = useState<any[]>([]);
  const [tagSeleccionado, setTagSeleccionado] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [ordenarPor, setOrdenarPor] = useState("destacados");

  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const context = useCarrito();
  const items = context?.items || context?.carrito || [];
  const vaciarCarrito = context?.vaciarCarrito;

  const totalItems = Array.isArray(items)
    ? items.reduce((acc: number, item: any) => acc + (Number(item?.cantidad) || 1), 0)
    : 0;

  // Listener para detectar cuando Mercado Pago retorna con éxito (?status=success)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");

    if (status === "success" && typeof vaciarCarrito === "function") {
      vaciarCarrito();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [vaciarCarrito]);

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

    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from("tags_busqueda")
          .select("*")
          .eq("activo", true)
          .order("orden", { ascending: true });

        if (error) {
          console.error("Error al cargar tags:", error);
        } else {
          setTags(data || []);
        }
      } catch (err) {
        console.error("Error inesperado al cargar tags:", err);
      }
    };

    fetchProductos();
    fetchCategorias();
    fetchTags();
  }, []);

  useEffect(() => {
    if (productos.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("producto");

      if (idParam) {
        const prodEncontrado = productos.find(
          (p) => String(p.id) === String(idParam)
        );
        if (prodEncontrado) {
          setProductoSeleccionado(prodEncontrado);
        }
      }
    }
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    if (tagSeleccionado) {
      const criterio = tagSeleccionado.toLowerCase();
      resultado = resultado.filter((p) => {
        const nombre = p.nombre?.toLowerCase() || "";
        const cat = p.categoria?.toLowerCase() || "";
        const tagsProd = Array.isArray(p.etiquetas)
          ? p.etiquetas.map((t) => String(t).toLowerCase())
          : [];

        return (
          nombre.includes(criterio) ||
          cat.includes(criterio) ||
          tagsProd.some((t) => t.includes(criterio))
        );
      });
    }

    if (busqueda.trim() !== "") {
      const fuseOptions = {
        keys: ["nombre", "categoria", "descripcion", "etiquetas"],
        threshold: 0.4,
        ignoreLocation: true,
      };

      const fuse = new Fuse(resultado, fuseOptions);
      resultado = fuse.search(busqueda).map((res) => res.item);
    }

    if (categoriaFiltro === "Ofertas") {
      resultado = resultado.filter((p) => {
        const precioBase = Number(p.precio_original) || 0;
        return precioBase > p.precio;
      });
    } else if (categoriaFiltro !== "Todos") {
      resultado = resultado.filter((p) => p.categoria === categoriaFiltro);
    }

    return resultado;
  }, [productos, busqueda, categoriaFiltro, tagSeleccionado]);

  const productosOrdenados = useMemo(() => {
    return [...productosFiltrados].sort((a, b) => {
      if (ordenarPor === "precio-asc") {
        return a.precio - b.precio;
      }
      if (ordenarPor === "precio-desc") {
        return b.precio - a.precio;
      }
      if (ordenarPor === "descuento") {
        const descA = (Number(a.precio_original) || a.precio) - a.precio;
        const descB = (Number(b.precio_original) || b.precio) - b.precio;
        return descB - descA;
      }
      return 0;
    });
  }, [productosFiltrados, ordenarPor]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0E6E55] border-t-transparent" />
      </div>
    );
  }

  const resetearFiltros = () => {
    setBusqueda("");
    setCategoriaFiltro("Todos");
    setOrdenarPor("destacados");
    setTagSeleccionado(null);
  };

  const hayTagActivo = Boolean(tagSeleccionado);

  return (
    <div
      className={`min-h-screen text-[#12151B] flex flex-col justify-between transition-colors duration-500 ease-in-out ${
        hayTagActivo ? "bg-[#EEF5F2]" : "bg-[#F7F7F5]"
      }`}
    >
      <div>
        {/* Barra de navegación superior optimizada tipo App Bar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-[#E7E5E0]/80 bg-white/85 px-4 py-3.5 backdrop-blur-xl sm:px-10 sm:py-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B675F] hover:text-[#12151B] bg-slate-100/80 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-all active:scale-95 border border-[#E7E5E0]/60 shadow-xs"
              title="Volver a la selección principal"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden md:inline">Inicio</span>
            </Link>

            <Link
              href="/tienda"
              onClick={resetearFiltros}
              className="flex min-w-0 items-center gap-3 cursor-pointer transition-opacity hover:opacity-85 active:scale-[0.98]"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11 rounded-2xl bg-white border border-slate-200/80 shadow-xs p-1.5 overflow-hidden">
                <Image
                  src={config?.logo_url || "/logodoradoo.svg"}
                  alt={config?.nombre_empresa || "Logo"}
                  width={44}
                  height={44}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>

              <div className="flex min-w-0 flex-col leading-tight">
                <h2 className="m-0 truncate text-sm sm:text-base font-extrabold tracking-tight text-[#12151B]">
                  {config?.nombre_empresa || "Luminares"}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E6E55] animate-pulse" />
                  <span className="truncate text-[11px] font-semibold text-[#6B675F]">
                    {config?.subtitulo_tienda || "Tienda Oficial"}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <button
            onClick={() => setModalAbierto(true)}
            className="relative flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#12151B] transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="h-4 w-4 shrink-0 text-slate-700" strokeWidth={2.2} />
            <span className="hidden sm:inline">Mi Carrito</span>

            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-[#0E6E55] px-1 text-[10px] font-extrabold leading-none text-white shadow-xs sm:static sm:ml-1 sm:h-5 sm:min-w-[20px] sm:border-0 sm:text-[11px]">
                {totalItems}
              </span>
            )}
          </button>
        </nav>

        <div className="mx-auto max-w-[1150px] px-4 pb-28 pt-4 sm:px-10 sm:pb-16">
          <BannerCarousel />

          <BeneficiosTienda />

          <TagsFiltros
            tags={tags}
            tagSeleccionado={tagSeleccionado}
            onSelectTag={(slug) => setTagSeleccionado(slug)}
          />

          {/* Indicador visual moderno de etiqueta activa */}
          {hayTagActivo && (
            <div className="mb-6 flex items-center justify-between bg-white border border-[#0E6E55]/30 rounded-[22px] px-4 sm:px-5 py-3.5 shadow-[0_8px_20px_-6px_rgba(14,110,85,0.08)] animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#0E6E55]">
                <div className="w-7 h-7 rounded-xl bg-[#0E6E55]/10 flex items-center justify-center shrink-0">
                  <TagIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <span>
                  Filtrando por etiqueta:{" "}
                  <strong className="underline decoration-2 underline-offset-2">#{tagSeleccionado}</strong>
                </span>
              </div>
              <button
                onClick={() => setTagSeleccionado(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <span>Limpiar</span>
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}

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

        <ModalDetalleProducto
          producto={productoSeleccionado}
          todosProductos={productos}
          onClose={() => setProductoSeleccionado(null)}
          onSeleccionarProducto={(prod) => setProductoSeleccionado(prod)}
          onAbrirCarrito={() => setModalAbierto(true)}
          onFiltrarPorTag={(tag) => setTagSeleccionado(tag)}
        />

        <CarritoDrawer
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
        />

        <BotonFlotanteCarrito onOpenCarrito={() => setModalAbierto(true)} />
      </div>

      <FooterTienda />
    </div>
  );
}