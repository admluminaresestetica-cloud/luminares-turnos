"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ShoppingCart, ArrowLeft, Tag as TagIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CarritoDrawer from "@/components/carrito/CarritoDrawer";
import BannerCarousel from "./components/BannerCarousel";
import BeneficiosTienda from "./components/BeneficiosTienda";
import FooterTienda from "@/components/common/FooterTienda";
import { useCarrito } from "@/context/CarritoContext";
import { useConfig } from "@/context/ConfigContext";
import { Producto } from "@/types/tienda";
import BotonFlotanteCarrito from "./components/BotonFlotanteCarrito";
import ThemeToggle from "@/components/common/ThemeToggle";
import Fuse from "fuse.js";
import ModalExito from "@/components/carrito/ModalExito";

import BuscadorYCategorias from "./components/BuscadorYCategorias";
import GridProductos from "./components/GridProductos";
import ModalDetalleProducto from "./components/ModalDetalleProducto";
import TagsFiltros from "./components/TagsFiltros";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* Fondo neutro con orbes grises: profundidad sin competir con el acento dinámico */
function FondoOrbes() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-slate-400/10 dark:bg-zinc-700/15 blur-3xl" />
      <div className="absolute -right-40 top-1/3 h-[520px] w-[520px] rounded-full bg-slate-400/10 dark:bg-zinc-700/15 blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 h-[460px] w-[460px] rounded-full bg-slate-400/10 dark:bg-zinc-700/15 blur-3xl" />
    </div>
  );
}

function PantallaCarga() {
  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center font-sans">
      <FondoOrbes />
      <div className="relative z-10 rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    </div>
  );
}

function TiendaContenido() {
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(["Todos"]);

  const [tags, setTags] = useState<any[]>([]);
  const [tagSeleccionado, setTagSeleccionado] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [codigoPedidoExito, setCodigoPedidoExito] = useState<string | undefined>(undefined);
  const [itemsPedidoExito, setItemsPedidoExito] = useState<any[]>([]);
  const [totalPedidoExito, setTotalPedidoExito] = useState<number>(0);
  
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
    const urlParams = new URLSearchParams(window.location.search);

    // Si regresa de Mercado Pago con éxito
    const status = urlParams.get("status");
    const pedidoId = urlParams.get("pedido_id");

    if (status === "success") {
      if (typeof vaciarCarrito === "function") {
        vaciarCarrito();
      }

if (pedidoId) {
        setCodigoPedidoExito(pedidoId);       
        // 🟢 Consultamos el total en la tabla 'pedidos' y los productos en 'pedido_items'
        const fetchDetallePedidoExito = async () => {
          // 1. Traemos el total del pedido
          const { data: pedidoData } = await supabase
            .from("pedidos")
            .select("total")
            .eq("id", pedidoId)
            .maybeSingle();

          if (pedidoData) {
            setTotalPedidoExito(Number(pedidoData.total) || 0);
          }

          // 2. Traemos los productos reales desde 'pedido_items' que acabamos de validar
          const { data: itemsData, error: itemsError } = await supabase
            .from("pedido_items")
            .select("nombre_producto, cantidad, precio_unitario")
            .eq("pedido_id", pedidoId);

          if (!itemsError && itemsData) {
            setItemsPedidoExito(itemsData);
          }
        };

        fetchDetallePedidoExito();
        setMostrarModalExito(true);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Si viene desde un Banner con filtro de categoría
    const catParam = urlParams.get("categoria");
    if (catParam) {
      setCategoriaFiltro(catParam);
    }

    // Si viene desde un Banner con filtro de etiqueta
    const tagParam = urlParams.get("etiqueta") || urlParams.get("tag") || urlParams.get("promo");
    if (tagParam) {
      setTagSeleccionado(tagParam);
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
    return <PantallaCarga />;
  }

  const resetearFiltros = () => {
    setBusqueda("");
    setCategoriaFiltro("Todos");
    setOrdenarPor("destacados");
    setTagSeleccionado(null);
  };

  const hayTagActivo = Boolean(tagSeleccionado);

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between font-sans selection:bg-primary/20 selection:text-foreground transition-colors">
      <FondoOrbes />

      <div className="relative z-10">
        {/* App Bar flotante de vidrio */}
        <div className="sticky top-0 z-50 px-3 pt-3 sm:px-10 sm:pt-4">
          <nav className="mx-auto flex max-w-[1150px] items-center justify-between gap-3 rounded-3xl border border-border bg-card/80 px-3 py-2.5 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 sm:px-4 sm:py-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <motion.div whileTap={{ scale: 0.92 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Link
                  href="/"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground sm:h-11 sm:w-11"
                  title="Volver a la selección principal"
                  aria-label="Volver a la selección principal"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[2.2]" />
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} className="min-w-0">
                <Link
                  href="/tienda"
                  onClick={resetearFiltros}
                  className="flex min-w-0 cursor-pointer items-center gap-3 transition-opacity hover:opacity-85"
                >
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background/60 p-1.5 sm:h-11 sm:w-11">
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
                    <h2 className="m-0 truncate text-sm font-extrabold tracking-tight text-foreground sm:text-base">
                      {config?.nombre_empresa || "Luminares"}
                    </h2>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      <span className="truncate text-[11px] font-semibold text-muted-foreground">
                        {config?.subtitulo_tienda || "Tienda Oficial"}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={() => setModalAbierto(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-3.5 text-xs font-bold text-foreground transition-colors hover:bg-background/90 sm:h-11 sm:px-4 sm:text-sm"
              >
                <ShoppingCart className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.2} />
                <span className="hidden sm:inline">Mi Carrito</span>

                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-card bg-primary px-1.5 text-[10px] font-extrabold leading-none text-primary-foreground shadow-md sm:static sm:ml-1 sm:border-0 sm:text-[11px]"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </nav>
        </div>

        <div className="mx-auto max-w-[1150px] space-y-5 px-4 pb-28 pt-5 sm:space-y-6 sm:px-10 sm:pb-16">
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
          <AnimatePresence initial={false}>
            {hayTagActivo && (
              <motion.div
                key="tag-activo"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="flex items-center justify-between rounded-3xl border border-primary/25 bg-card/80 px-4 py-3 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 sm:px-5 sm:py-3.5"
              >
                <div className="flex min-w-0 items-center gap-2.5 text-xs font-bold text-primary sm:text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <TagIcon className="h-3.5 w-3.5 stroke-[2.2]" />
                  </div>
                  <span className="truncate">
                    Filtrando por etiqueta:{" "}
                    <strong className="underline decoration-2 underline-offset-2">#{tagSeleccionado}</strong>
                  </span>
                </div>
                <motion.button
                  onClick={() => setTagSeleccionado(null)}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl border border-border bg-background/60 px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>Limpiar</span>
                  <X className="h-3.5 w-3.5 stroke-[2.5]" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

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

        <CarritoDrawer
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
        />

        {/* MODAL DE ÉXITO AUTOMÁTICO AL VOLVER DE MERCADO PAGO */}
        <ModalExito
          mostrar={mostrarModalExito}
          onAceptar={() => setMostrarModalExito(false)}
          esMercadoPago={true}
          codigoPedido={codigoPedidoExito}
          items={itemsPedidoExito}
          total={totalPedidoExito}
        />

        <BotonFlotanteCarrito onOpenCarrito={() => setModalAbierto(true)} />
      </div>

      <div className="relative z-10">
        <FooterTienda />
      </div>
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense fallback={<PantallaCarga />}>
      <TiendaContenido />
    </Suspense>
  );
}