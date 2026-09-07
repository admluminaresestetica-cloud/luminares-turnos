"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Sparkles, Check } from "lucide-react";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";

interface ModalDetalleProductoProps {
  producto: Producto | null;
  todosProductos?: Producto[];
  onClose: () => void;
  onSeleccionarProducto?: (prod: Producto) => void;
}

export default function ModalDetalleProducto({
  producto,
  todosProductos = [],
  onClose,
  onSeleccionarProducto,
}: ModalDetalleProductoProps) {
  const [cantidad, setCantidad] = useState(1);
  const [agregadosLocales, setAgregadosLocales] = useState<Record<string, boolean>>({});
  const { agregarAlCarrito } = useCarrito();
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Cada vez que cambia el producto seleccionado, reseteamos la cantidad y el scroll
  useEffect(() => {
    setCantidad(1);
    setAgregadosLocales({});
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [producto]);

  // Soporte para cerrar con tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (producto) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [producto, onClose]);

  if (!producto) return null;

  const precioOriginal = Number(producto.precio_original ?? producto.precio_anterior) || 0;
  const tieneDescuento = precioOriginal > producto.precio;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(((precioOriginal - producto.precio) / precioOriginal) * 100)
    : 0;

  const handleAgregarPrincipal = () => {
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto);
    }
    onClose();
  };

  // Agregar rápido 1-Clic para productos relacionados
  const handleAgregarRapido = (e: React.MouseEvent, relProd: Producto) => {
    e.stopPropagation();
    agregarAlCarrito(relProd);

    setAgregadosLocales((prev) => ({ ...prev, [relProd.id]: true }));
    setTimeout(() => {
      setAgregadosLocales((prev) => ({ ...prev, [relProd.id]: false }));
    }, 1500);
  };

  // Lógica de Cross-Selling
  const complementosOtrasCategorias = todosProductos.filter(
    (p) => p.id !== producto.id && p.categoria !== producto.categoria
  );

  const deLaMismaCategoria = todosProductos.filter(
    (p) => p.id !== producto.id && p.categoria === producto.categoria
  );

  const productosRelacionados = [...complementosOtrasCategorias, ...deLaMismaCategoria].slice(0, 3);

  return (
    /* Fondo oscuro / Backdrop: tocar acá afuera cierra el modal */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Contenedor del Modal (e.stopPropagation evita que hacer clic dentro cierre el modal) */}
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Botón Cerrar Sticky: se mantiene visible arriba a la derecha al hacer scroll */}
        <button
          onClick={onClose}
          className="sticky top-0 float-right z-20 -mr-2 -mt-2 sm:-mr-4 sm:-mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 backdrop-blur-md transition-colors hover:bg-slate-200 hover:text-slate-800 cursor-pointer shadow-sm"
          title="Cerrar (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start clear-both">
          {/* Imagen Principal */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
            {producto.imagen_url ? (
              <Image
                src={producto.imagen_url}
                alt={producto.nombre}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                Sin Imagen
              </div>
            )}

            {tieneDescuento && (
              <span className="absolute top-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                -{porcentajeDescuento}% OFF
              </span>
            )}
          </div>

          {/* Información del Producto */}
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

              {producto.descripcion && (
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  {producto.descripcion}
                </p>
              )}
            </div>

            {/* Selector de Cantidad y Botón Principal */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <span className="text-xs font-semibold text-slate-600 pl-2">Cantidad:</span>
                <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-1">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-slate-900">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAgregarPrincipal}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0E6E55] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#0b5944] active:scale-[0.98] shadow-md shadow-[#0E6E55]/20 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Agregar al Carrito • ${(producto.precio * cantidad).toLocaleString("es-AR")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sección Cross-Selling */}
        {productosRelacionados.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#0E6E55]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Completa tu rutina / Recomendados
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Suma en 1-clic</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {productosRelacionados.map((rel) => {
                const relPrecioOriginal = Number(rel.precio_original ?? rel.precio_anterior) || 0;
                const relTieneDesc = relPrecioOriginal > rel.precio;
                const fueAgregado = agregadosLocales[rel.id];

                return (
                  <div
                    key={rel.id}
                    onClick={() => onSeleccionarProducto && onSeleccionarProducto(rel)}
                    className="group relative flex flex-col justify-between text-left rounded-2xl border border-slate-100 p-2.5 hover:border-[#0E6E55]/40 hover:bg-slate-50/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                        {rel.imagen_url ? (
                          <Image
                            src={rel.imagen_url}
                            alt={rel.nombre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-300">
                            Sin Foto
                          </div>
                        )}

                        {relTieneDesc && (
                          <span className="absolute top-1 left-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            OFF
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-slate-800 truncate block w-full group-hover:text-[#0E6E55] transition-colors">
                        {rel.nombre}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-slate-100/60">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0E6E55]">
                          ${rel.precio.toLocaleString("es-AR")}
                        </span>
                        {relTieneDesc && (
                          <span className="text-[9px] text-slate-400 line-through">
                            ${relPrecioOriginal.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAgregarRapido(e, rel)}
                        title="Agregar directamente al carrito"
                        className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                          fueAgregado
                            ? "bg-emerald-600 text-white scale-110"
                            : "bg-[#0E6E55]/10 text-[#0E6E55] hover:bg-[#0E6E55] hover:text-white"
                        }`}
                      >
                        {fueAgregado ? (
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}