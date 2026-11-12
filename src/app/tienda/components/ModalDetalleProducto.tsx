"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Plus, Minus, ShoppingCartPlus, Share2, CreditCard, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";
import AcordeonFAQ from "./AcordeonFAQ";
import GaleriaProducto from "./GaleriaProducto";
import ProductosRelacionados from "./ProductosRelacionados";
import CarruselEtiquetaModal from "./CarruselEtiquetaModal";
import { calcularCuotas } from "@/lib/precios";
import { supabase } from "@/lib/supabase";

interface ModalDetalleProductoProps {
  producto: Producto | null;
  todosProductos: Producto[];
  onClose: () => void;
  onSeleccionarProducto: (prod: Producto) => void;
  onAbrirCarrito?: () => void;
  onFiltrarPorTag?: (tag: string) => void;
}

export default function ModalDetalleProducto({
  producto,
  todosProductos,
  onClose,
  onFiltrarPorTag,
  onSeleccionarProducto,
  onAbrirCarrito,
}: ModalDetalleProductoProps) {
  const [cantidad, setCantidad] = useState(1);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentOffsetY, setCurrentOffsetY] = useState<number>(0);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string>("");

  // Estado para controlar el mini carrusel desplegable por etiqueta
  const [tagSeleccionadoCarrusel, setTagSeleccionadoCarrusel] = useState<string | null>(null);
  const [faqsTienda, setFaqsTienda] = useState<any[]>([]);
   
  const context = useCarrito();
  const agregarAlCarrito = context?.agregarAlCarrito;
  const actualizarCantidad = (context as any)?.actualizarCantidad;
  const eliminarDelCarrito = (context as any)?.eliminarDelCarrito;
  const items = context?.items || context?.carrito || [];

  const modalContainerRef = useRef<HTMLDivElement>(null);

  const stockDisponible = producto?.stock ?? 0;
  const sinStock = stockDisponible <= 0;

  const itemEnCarrito = Array.isArray(items) && producto
    ? items.find((item: any) => item.id === producto.id)
    : null;
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
  const maximoPermitidoParaAgregar = Math.max(0, stockDisponible - cantidadEnCarrito);

  const imagenesTotales: string[] = (producto as any)?.imagenes_urls?.length
    ? (producto as any).imagenes_urls
    : (producto as any)?.imagenes?.length
    ? (producto as any).imagenes
    : producto?.imagen_url
    ? [producto.imagen_url]
    : [];

  useEffect(() => {
    setCurrentOffsetY(0);
    setCantidad(maximoPermitidoParaAgregar > 0 ? 1 : 0);
    setTagSeleccionadoCarrusel(null);

    if (imagenesTotales.length > 0) {
      setImagenSeleccionada(imagenesTotales[0]);
    } else {
      setImagenSeleccionada("");
    }

    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [producto, maximoPermitidoParaAgregar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (producto) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [producto, onClose]);

  useEffect(() => {
    if (!producto) return;
    const scrollYPrevio = window.scrollY;
    const bodyStyle = document.body.style;

    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollYPrevio}px`;
    bodyStyle.left = "0";
    bodyStyle.right = "0";
    bodyStyle.width = "100%";
    bodyStyle.overscrollBehaviorY = "contain";

    return () => {
      bodyStyle.position = "";
      bodyStyle.top = "";
      bodyStyle.left = "";
      bodyStyle.right = "";
      bodyStyle.width = "";
      bodyStyle.overscrollBehaviorY = "";
      window.scrollTo(0, scrollYPrevio);
    };
  }, [producto]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (modalContainerRef.current && modalContainerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };


useEffect(() => {
    const fetchFaqsTienda = async () => {
      const { data, error } = await supabase
        .from("preguntas_frecuentes")
        .select("*")
        .order("orden", { ascending: true });

      if (!error && data) {
        const filtradas = data.filter(
          (f: any) => f.ubicacion === "tienda" || f.ubicacion === "ambos" || !f.ubicacion
        );
        
        // Ponianos el console.log acá:
        console.log("FAQs filtradas para tienda:", filtradas);
        
        setFaqsTienda(filtradas);
      }
    };

    fetchFaqsTienda();
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) setCurrentOffsetY(deltaY);
  };

  const handleTouchEnd = () => {
    if (currentOffsetY > 100) {
      setCurrentOffsetY(0);
      onClose();
    } else {
      setCurrentOffsetY(0);
    }
    setStartY(null);
  };

  // Cálculo optimizado de productos relacionados con puntuación inteligente
  const productosRelacionados = useMemo(() => {
    if (!producto || !todosProductos.length) return [];

    return todosProductos
      .filter((p) => p.id !== producto.id && (p.stock ?? 0) > 0)
      .map((p) => {
        let puntos = 0;

        // Si comparten etiquetas (#), suma 10 puntos por cada etiqueta igual
        if (producto.etiquetas && p.etiquetas) {
          const coincideTag = p.etiquetas.some((tag) => producto.etiquetas?.includes(tag));
          if (coincideTag) puntos += 10;
        }

        // Si es de la misma categoría, suma 5 puntos
        if (p.categoria === producto.categoria) puntos += 5;

        return { producto: p, puntos };
      })
      .sort((a, b) => b.puntos - a.puntos)
      .map((item) => item.producto)
      .slice(0, 3);
  }, [producto, todosProductos]);

  if (!producto) return null;

  const precioOriginal = Number(producto.precio_original ?? (producto as any).precio_anterior) || 0;
  const tieneDescuento = precioOriginal > producto.precio;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(((precioOriginal - producto.precio) / precioOriginal) * 100)
    : 0;

  const permiteCuotas = producto.permite_cuotas !== false;
  const { montoCuota } = calcularCuotas(producto.precio || 0);

  const handleCompartir = async () => {
    const urlProducto = `${window.location.origin}/tienda/producto/${producto.id}`;
    const shareData = {
      title: producto.nombre,
      text: `¡Mirá este producto en Luminares! ${producto.nombre} a $${producto.precio.toLocaleString("es-AR")}`,
      url: urlProducto,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error al compartir:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(urlProducto);
        alert("¡Enlace del producto copiado al portapapeles!");
      } catch (err) {
        console.error("Error al copiar enlace:", err);
      }
    }
  };

  const handleAgregarPrincipal = () => {
    if (cantidad <= 0 || maximoPermitidoParaAgregar <= 0 || !agregarAlCarrito) return;
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto);
    }
    onClose();
  };

  const handleComprarAhora = () => {
    if (cantidad <= 0 || maximoPermitidoParaAgregar <= 0 || !agregarAlCarrito) return;
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto);
    }
    onClose();
    if (onAbrirCarrito) onAbrirCarrito();
  };

  const handleRestarRecomendado = (e: React.MouseEvent, relProd: Producto, cantActual: number) => {
    e.stopPropagation();
    if (cantActual > 1 && actualizarCantidad) {
      actualizarCantidad(relProd.id, cantActual - 1);
    } else if (eliminarDelCarrito) {
      eliminarDelCarrito(relProd.id);
    } else if (actualizarCantidad) {
      actualizarCantidad(relProd.id, 0);
    }
  };

  const handleSumarRecomendado = (e: React.MouseEvent, relProd: Producto, cantActual: number, relStock: number) => {
    e.stopPropagation();
    if (cantActual < relStock) {
      if (cantActual > 0 && actualizarCantidad) {
        actualizarCantidad(relProd.id, cantActual + 1);
      } else if (agregarAlCarrito) {
        agregarAlCarrito(relProd);
      }
    }
  };

  const puedeSumar = cantidad < maximoPermitidoParaAgregar;
  const puedeRestar = cantidad > 1;
  const compraDeshabilitada = sinStock || maximoPermitidoParaAgregar <= 0;

  const springTap = { type: "spring" as const, stiffness: 420, damping: 20 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center overscroll-none bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative flex max-h-[90vh] w-full flex-col justify-between overflow-y-auto overscroll-contain rounded-t-3xl border border-border bg-white p-4 shadow-lg shadow-black/5 animate-in slide-in-from-bottom-8 duration-300 dark:bg-zinc-900 dark:shadow-black/20 sm:max-h-[88vh] sm:max-w-2xl sm:rounded-3xl sm:p-8"
        style={{
          overscrollBehaviorY: "contain",
          transform: `translateY(${currentOffsetY}px)`,
          transition: startY === null ? "transform 0.2s ease-out" : "none",
        }}
      >
        {/* Barra superior indicadora de deslizamiento para mobile */}
        <div className="-mt-1 mb-3 flex cursor-grab justify-center active:cursor-grabbing sm:hidden">
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Botones Flotantes de Cierre / Compartir */}
        <div className="sticky top-0 z-30 -mr-1 -mt-1 flex items-center gap-2 float-right sm:-mr-4 sm:-mt-4">
          <motion.button
            onClick={handleCompartir}
            whileTap={{ scale: 0.9 }}
            transition={springTap}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:text-foreground dark:shadow-black/20"
            title="Compartir producto"
            aria-label="Compartir producto"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>

          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            transition={springTap}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:text-foreground dark:shadow-black/20"
            title="Cerrar (Esc)"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="clear-both grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          {/* GALERÍA DE IMÁGENES */}
          <GaleriaProducto
            producto={producto}
            imagenSeleccionada={imagenSeleccionada}
            setImagenSeleccionada={setImagenSeleccionada}
            imagenesTotales={imagenesTotales}
            tieneDescuento={tieneDescuento}
            porcentajeDescuento={porcentajeDescuento}
            sinStock={sinStock}
          />

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {producto.categoria}
              </span>

              <h2 className="mt-1 text-xl font-bold leading-snug tracking-tight text-foreground sm:text-2xl">
                {producto.nombre}
              </h2>

              {/* ETIQUETAS / TAGS */}
              {producto.etiquetas && producto.etiquetas.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {producto.etiquetas.map((tag, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      onClick={() => setTagSeleccionadoCarrusel(tag)}
                      whileTap={{ scale: 0.94 }}
                      transition={springTap}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                      title={`Ver productos con #${tag}`}
                    >
                      <Tag className="h-3 w-3 opacity-70" />
                      #{tag}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* PRECIOS, CUOTAS Y STOCK (bloque bento) */}
              <div className="mt-4 rounded-2xl border border-border bg-background/60 p-3.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground">
                    ${producto.precio.toLocaleString("es-AR")}
                  </span>
                  {tieneDescuento && (
                    <span className="text-sm font-medium text-muted-foreground line-through">
                      ${precioOriginal.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>

                {!sinStock && (
                  <div className="mt-2">
                    {permiteCuotas ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        <CreditCard className="h-3.5 w-3.5" />
                        3 cuotas fijas de ${montoCuota.toLocaleString("es-AR")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-card/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        Solo Contado / Débito
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-2.5 text-xs text-muted-foreground">
                  Stock disponible: <strong className="text-foreground">{stockDisponible}</strong>
                  {cantidadEnCarrito > 0 && (
                    <span className="ml-1 font-medium text-primary">
                      ({cantidadEnCarrito} en el carrito)
                    </span>
                  )}
                </p>
              </div>

              {producto.descripcion && (
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {producto.descripcion}
                </p>
              )}
            </div>

            {/* CONTROLES DE CANTIDAD (DESKTOP) */}
            <div className="hidden space-y-3 pt-2 sm:block">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-2">
                <span className="pl-2 text-xs font-semibold text-muted-foreground">Cantidad a agregar:</span>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card/80 p-1">
                  <motion.button
                    onClick={() => puedeRestar && setCantidad(cantidad - 1)}
                    disabled={!puedeRestar}
                    whileTap={puedeRestar ? { scale: 0.88 } : undefined}
                    transition={springTap}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      puedeRestar
                        ? "cursor-pointer text-foreground hover:bg-muted"
                        : "cursor-not-allowed text-muted-foreground/40"
                    }`}
                    aria-label="Restar cantidad"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </motion.button>

                  <motion.span
                    key={cantidad}
                    initial={{ scale: 0.8, opacity: 0.4 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 24 }}
                    className="w-6 text-center text-sm font-bold text-foreground"
                  >
                    {cantidad}
                  </motion.span>

                  <motion.button
                    onClick={() => puedeSumar && setCantidad(cantidad + 1)}
                    disabled={!puedeSumar}
                    whileTap={puedeSumar ? { scale: 0.88 } : undefined}
                    transition={springTap}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      puedeSumar
                        ? "cursor-pointer text-foreground hover:bg-muted"
                        : "cursor-not-allowed text-muted-foreground/40"
                    }`}
                    aria-label="Sumar cantidad"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>

              <motion.button
                onClick={handleAgregarPrincipal}
                disabled={compraDeshabilitada}
                whileHover={compraDeshabilitada ? undefined : { scale: 1.01 }}
                whileTap={compraDeshabilitada ? undefined : { scale: 0.97 }}
                transition={springTap}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors ${
                  compraDeshabilitada
                    ? "cursor-not-allowed bg-muted text-muted-foreground"
                    : "cursor-pointer bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                }`}
              >
                <ShoppingCartPlus className="h-4 w-4" />
                <span>
                  {sinStock
                    ? "Sin stock disponible"
                    : maximoPermitidoParaAgregar <= 0
                    ? "Máximo alcanzado en el carrito"
                    : `Agregar al Carrito • $${(producto.precio * cantidad).toLocaleString("es-AR")}`}
                </span>
              </motion.button>

              <motion.button
                onClick={handleComprarAhora}
                disabled={compraDeshabilitada}
                whileHover={compraDeshabilitada ? undefined : { scale: 1.01 }}
                whileTap={compraDeshabilitada ? undefined : { scale: 0.97 }}
                transition={springTap}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-card/60 py-3 text-sm font-bold text-primary backdrop-blur-xl transition-colors hover:bg-primary/10 ${
                  compraDeshabilitada ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <span>Comprar ahora</span>
              </motion.button>
            </div>
          </div>
        </div>

        <AcordeonFAQ faqs={faqsTienda} />
        {/* SUBCOMPONENTE DE PRODUCTOS RECOMENDADOS */}
        <ProductosRelacionados
          productosRelacionados={productosRelacionados}
          items={items}
          onSeleccionarProducto={onSeleccionarProducto}
          handleSumarRecomendado={handleSumarRecomendado}
          handleRestarRecomendado={handleRestarRecomendado}
        />

        {/* BARRA STICKY INFERIOR EXCLUSIVA PARA MOVILES (CON MARGEN PARA BOTTOM NAV) */}
        <div className="sticky bottom-0 z-40 -mx-4 -mb-4 mt-6 space-y-2 border-t border-border bg-card/80 p-3 pb-20 backdrop-blur-xl sm:hidden sm:pb-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Cantidad:</span>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-1">
              <motion.button
                onClick={() => puedeRestar && setCantidad(cantidad - 1)}
                disabled={!puedeRestar}
                whileTap={puedeRestar ? { scale: 0.88 } : undefined}
                transition={springTap}
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  puedeRestar ? "bg-card text-foreground shadow-xs" : "text-muted-foreground/40"
                }`}
                aria-label="Restar cantidad"
              >
                <Minus className="h-3 w-3" />
              </motion.button>
              <motion.span
                key={cantidad}
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className="w-5 text-center text-xs font-bold text-foreground"
              >
                {cantidad}
              </motion.span>
              <motion.button
                onClick={() => puedeSumar && setCantidad(cantidad + 1)}
                disabled={!puedeSumar}
                whileTap={puedeSumar ? { scale: 0.88 } : undefined}
                transition={springTap}
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  puedeSumar ? "bg-card text-foreground shadow-xs" : "text-muted-foreground/40"
                }`}
                aria-label="Sumar cantidad"
              >
                <Plus className="h-3 w-3" />
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={handleAgregarPrincipal}
              disabled={compraDeshabilitada}
              whileTap={compraDeshabilitada ? undefined : { scale: 0.96 }}
              transition={springTap}
              className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-bold transition-colors ${
                compraDeshabilitada
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              }`}
            >
              <ShoppingCartPlus className="h-3.5 w-3.5" />
              <span>
                {sinStock ? "Sin Stock" : `$${(producto.precio * cantidad).toLocaleString("es-AR")}`}
              </span>
            </motion.button>

            <motion.button
              onClick={handleComprarAhora}
              disabled={compraDeshabilitada}
              whileTap={compraDeshabilitada ? undefined : { scale: 0.96 }}
              transition={springTap}
              className={`flex items-center justify-center rounded-2xl border border-primary/40 bg-card/60 py-3 text-xs font-bold text-primary ${
                compraDeshabilitada ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <span>Comprar ahora</span>
            </motion.button>
          </div>
        </div>

        {/* CARRUSEL DESPLEGABLE DE PRODUCTOS POR ETIQUETA */}
        {tagSeleccionadoCarrusel && (
          <CarruselEtiquetaModal
            isOpen={Boolean(tagSeleccionadoCarrusel)}
            tag={tagSeleccionadoCarrusel}
            productos={todosProductos}
            items={items}
            handleSumarRecomendado={handleSumarRecomendado}
            handleRestarRecomendado={handleRestarRecomendado}
            onClose={() => setTagSeleccionadoCarrusel(null)}
            onSeleccionarProducto={(prod) => {
              setTagSeleccionadoCarrusel(null);
              onSeleccionarProducto(prod);
            }}
            onVerMasGlobal={(tag) => {
              if (onFiltrarPorTag) onFiltrarPorTag(tag);
              onClose();
            }}
          />
        )}
      </div>
    </motion.div>
  );
}