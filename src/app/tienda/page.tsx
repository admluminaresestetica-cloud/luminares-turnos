"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ShoppingCart, ArrowLeft, Tag as TagIcon, X } from "lucide-react";
import CarritoDrawer from "@/components/CarritoDrawer";
import BannerCarousel from "./components/BannerCarousel";
import BeneficiosTienda from "./components/BeneficiosTienda";
import FooterTienda from "@/components/FooterTienda";
import { useCarrito } from "@/context/CarritoContext";
import { useConfig } from "@/context/ConfigContext";
import { Producto } from "@/types/tienda";
import BotonFlotanteCarrito from "./components/BotonFlotanteCarrito";
import ThemeToggle from "@/components/ThemeToggle";
import Fuse from "fuse.js";
import { useSearchParams } from "next/navigation";
import ModalExito from "@/components/carrito/ModalExito";

import BuscadorYCategorias from "./components/BuscadorYCategorias";
import GridProductos from "./components/GridProductos";
import ModalDetalleProducto from "./components/ModalDetalleProducto";
import TagsFiltros from "./components/TagsFiltros";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function TiendaContenido() {
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);
  const [cargando, setCargando] = useState(true);
  const searchParams = useSearchParams();
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [codigoPedidoMP, setCodigoPedidoMP] = useState<string | undefined>(undefined);
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

// 1. Lectura de parámetros de la URL (Mercado Pago, Categoría, Etiqueta)
  useEffect(() => {
    const status = searchParams.get("status");
    const externalRef = searchParams.get("external_reference");

    // Si regresa de Mercado Pago aprobado o success
    if (status === "approved" || status === "success") {
      if (typeof vaciarCarrito === "function") {
        vaciarCarrito();
      }
      if (externalRef) {
        // Guardamos los primeros 6 caracteres del ID para el código corto (#2D26C6)
        setCodigoPedidoMP(externalRef.slice(0, 6).toUpperCase());
      }
      setMostrarModalExito(true);
    }

    // Si viene desde un Banner con filtro de categoría
    const catParam = searchParams.get("categoria");
    if (catParam) {
      setCategoriaFiltro(catParam);
    }

    // Si viene desde un Banner con filtro de etiqueta
    const tagParam = searchParams.get("etiqueta") || searchParams.get("tag") || searchParams.get("promo");
    if (tagParam) {
      setTagSeleccionado(tagParam);
    }
  }, [searchParams, vaciarCarrito]);

  const cerrarModalYLimpiar = () => {
    setMostrarModalExito(false);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // 2. Carga inicial de datos desde Supabase
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

  // Abrir modal de un producto puntual si viene en la URL (?producto=ID)
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
      resultado = resultado.filter((p) => p.categoria?.toLowerCase() === categoriaFiltro.toLowerCase());
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
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center font-sans">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0E6E55] border-t-transparent" />
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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-[#12151B] dark:text-zinc-100 flex flex-col justify-between font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      <div>
        {/* Navbar / App Bar superior limpia */}
        <nav className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-4 py-3.5 backdrop-blur-md sm:px-10 sm:py-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl transition-all active:scale-95 border border-slate-200/80 dark:border-zinc-700/80 shadow-xs"
              title="Volver a la selección principal"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </Link>

            <Link
              href="/tienda"
              onClick={resetearFiltros}
              className="flex min-w-0 items-center gap-3 cursor-pointer transition-opacity hover:opacity-85 active:scale-[0.98]"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 shadow-xs p-1.5 overflow-hidden">
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
                <h2 className="m-0 truncate text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                  {config?.nombre_empresa || "Luminares"}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E6E55] animate-pulse" />
                  <span className="truncate text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    {config?.subtitulo_tienda || "Tienda Oficial"}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setModalAbierto(true)}
              className="relative flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 transition-all duration-200 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 active:scale-95 cursor-pointer shadow-xs"
            >
              <ShoppingCart className="h-4 w-4 shrink-0 text-slate-700 dark:text-zinc-300" strokeWidth={2.2} />
              <span className="hidden sm:inline">Mi Carrito</span>

              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 bg-[#0E6E55] px-1.5 text-[10px] font-extrabold leading-none text-white shadow-md animate-in zoom-in-50 duration-200 sm:static sm:ml-1 sm:h-5 sm:min-w-[20px] sm:border-0 sm:text-[11px]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

<div className="mx-auto max-w-[1150px] px-4 pb-28 pt-4 sm:px-10 sm:pb-16 space-y-5 sm:space-y-6">
          {/* 1. Buscador y Filtros Principales (Bien arriba para fácil acceso) */}
          <BuscadorYCategorias
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            categorias={categorias}
            categoriaSeleccionada={categoriaFiltro}
            onCategoriaSelect={setCategoriaFiltro}
            ordenarPor={ordenarPor}
            onOrdenarChange={setOrdenarPor}
          />

          {/* 2. Banner de Promociones / Novedades */}
          <div className="pt-1">
            <BannerCarousel />
          </div>

          {/* 3. Burbujas de Marcas / Etiquetas */}
          <TagsFiltros
            tags={tags}
            tagSeleccionado={tagSeleccionado}
            onSelectTag={(slug) => setTagSeleccionado(slug)}
          />

          {/* Indicador visual de etiqueta activa */}
          {hayTagActivo && (
            <div className="flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-[#0E6E55]/25 rounded-[22px] px-4 sm:px-5 py-3.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#0E6E55] dark:text-emerald-400">
                <div className="w-7 h-7 rounded-xl bg-[#0E6E55]/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <TagIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <span>
                  Filtrando por etiqueta:{" "}
                  <strong className="underline decoration-2 underline-offset-2">#{tagSeleccionado}</strong>
                </span>
              </div>
              <button
                onClick={() => setTagSeleccionado(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <span>Limpiar</span>
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* 4. Bloque compacto de Beneficios con un respiro superior */}
          <div className="pt-2">
            <BeneficiosTienda />
          </div>

          {/* 5. Catálogo de Productos */}
          <div className="pt-2">
            <GridProductos
              productos={productosOrdenados}
              cargando={cargando}
              onVerDetalle={(prod) => setProductoSeleccionado(prod)}
            />
          </div>
        </div>

        <ModalDetalleProducto
          producto={productoSeleccionado}
          todosProductos={productos}
          onClose={() => setProductoSeleccionado(null)}
          onSeleccionarProducto={(prod) => setProductoSeleccionado(prod)}
          onAbrirCarrito={() => setModalAbierto(true)}
          onFiltrarPorTag={(tag) => setTagSeleccionado(tag)}
        />

        {/* 🟢 Modal de Éxito de Mercado Pago */}
        <ModalExito
          mostrar={mostrarModalExito}
          esMercadoPago={true}
          codigoPedido={codigoPedidoMP}
          onAceptar={cerrarModalYLimpiar}
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

export default function TiendaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center font-sans">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0E6E55] border-t-transparent" />
        </div>
      }
    >
      <TiendaContenido />
    </Suspense>
  );
}
