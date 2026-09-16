"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Minus, ShoppingBag, Share2, CreditCard } from "lucide-react";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";
import AcordeonFAQ from "./AcordeonFAQ";
import GaleriaProducto from "./GaleriaProducto";
import ProductosRelacionados from "./ProductosRelacionados";
import { calcularCuotas } from "@/lib/precios";

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

  const complementosOtrasCategorias = todosProductos.filter(
    (p) => p.id !== producto.id && p.categoria !== producto.categoria
  );
  const deLaMismaCategoria = todosProductos.filter(
    (p) => p.id !== producto.id && p.categoria === producto.categoria
  );
  const productosRelacionados = [...complementosOtrasCategorias, ...deLaMismaCategoria].slice(0, 3);

  const puedeSumar = cantidad < maximoPermitidoParaAgregar;
  const puedeRestar = cantidad > 1;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overscroll-none"
    >
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
        style={{
          overscrollBehaviorY: "contain",
          transform: `translateY(${currentOffsetY}px)`,
          transition: startY === null ? "transform 0.2s ease-out" : "none",
        }}
      >
        <div className="flex justify-center -mt-2 mb-2 py-2 sm:hidden cursor-grab active:cursor-grabbing">
          <span className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>

        <div className="sticky top-0 float-right z-20 -mr-2 -mt-2 sm:-mr-4 sm:-mt-4 flex items-center gap-2">
          <button
            onClick={handleCompartir}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/90 text-slate-600 backdrop-blur-md transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90 cursor-pointer shadow-sm"
            title="Compartir producto"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 backdrop-blur-md transition-all hover:bg-slate-200 hover:text-slate-800 active:scale-90 cursor-pointer shadow-sm"
            title="Cerrar (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start clear-both">
          {/* GALERÍA DE IMÁGENES & ETIQUETAS */}
          <GaleriaProducto
          producto={producto}
          imagenSeleccionada={imagenSeleccionada}
          setImagenSeleccionada={setImagenSeleccionada}
          imagenesTotales={imagenesTotales}
          tieneDescuento={tieneDescuento}
          porcentajeDescuento={porcentajeDescuento}
          sinStock={sinStock}
          onFiltrarPorTag={onFiltrarPorTag} 
          onClose={onClose}     
/>

          {/* INFORMACIÓN Y ACCIONES DEL PRODUCTO */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E6E55]">
                {producto.categoria}
              </span>

              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl mt-1">
                {producto.nombre}
              </h2>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  ${producto.precio.toLocaleString("es-AR")}
                </span>
                {tieneDescuento && (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    ${precioOriginal.toLocaleString("es-AR")}
                  </span>
                )}
              </div>

              {!sinStock && (
                <div className="mt-2">
                  {permiteCuotas ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                      <CreditCard className="h-3.5 w-3.5" />
                      3 cuotas de ${montoCuota.toLocaleString("es-AR")} con MP
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Solo Contado / Débito
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500 mt-2">
                Stock disponible: <strong className="text-slate-800">{stockDisponible}</strong>
                {cantidadEnCarrito > 0 && (
                  <span className="ml-1 text-emerald-700 font-medium">
                    ({cantidadEnCarrito} en el carrito)
                  </span>
                )}
              </p>

              {producto.descripcion && (
                <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {producto.descripcion}
                </p>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <span className="text-xs font-semibold text-slate-600 pl-2">Cantidad a agregar:</span>
                <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-1">
                  <button
                    onClick={() => puedeRestar && setCantidad(cantidad - 1)}
                    disabled={!puedeRestar}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-90 ${
                      puedeRestar
                        ? "text-slate-700 hover:bg-slate-100 cursor-pointer"
                        : "text-slate-300 cursor-not-allowed"
                    }`}
                    title="Restar cantidad"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="w-6 text-center text-sm font-bold text-slate-900">
                    {cantidad}
                  </span>

                  <button
                    onClick={() => puedeSumar && setCantidad(cantidad + 1)}
                    disabled={!puedeSumar}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-90 ${
                      puedeSumar
                        ? "text-slate-700 hover:bg-slate-100 cursor-pointer"
                        : "text-slate-300 cursor-not-allowed"
                    }`}
                    title={!puedeSumar ? "Límite de stock alcanzado" : "Sumar cantidad"}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAgregarPrincipal}
                disabled={sinStock || maximoPermitidoParaAgregar <= 0}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all ${
                  sinStock || maximoPermitidoParaAgregar <= 0
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-[#0E6E55] text-white hover:bg-[#0b5944] active:scale-[0.98] shadow-md shadow-[#0E6E55]/20 cursor-pointer"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {sinStock
                    ? "Sin stock disponible"
                    : maximoPermitidoParaAgregar <= 0
                    ? "Máximo alcanzado en el carrito"
                    : `Agregar al Carrito • $${(producto.precio * cantidad).toLocaleString("es-AR")}`}
                </span>
              </button>

              <button
                onClick={handleComprarAhora}
                disabled={sinStock || maximoPermitidoParaAgregar <= 0}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all mt-2.5 active:scale-[0.98] ${
                  sinStock || maximoPermitidoParaAgregar <= 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed border-transparent"
                    : "border-2 border-[#0E6E55] bg-transparent text-[#0E6E55] hover:bg-[#0E6E55]/10 cursor-pointer"
                }`}
              >
                <span>Comprar ahora</span>
              </button>
            </div>
          </div>
        </div>

        <AcordeonFAQ />

        {/* SUBCOMPONENTE DE PRODUCTOS RECOMENDADOS */}
        <ProductosRelacionados
          productosRelacionados={productosRelacionados}
          items={items}
          onSeleccionarProducto={onSeleccionarProducto}
          handleSumarRecomendado={handleSumarRecomendado}
          handleRestarRecomendado={handleRestarRecomendado}
        />
      </div>
    </div>
  );
}
