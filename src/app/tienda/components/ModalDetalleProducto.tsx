"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
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
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    setCantidad(1);
  }, [producto]);

  if (!producto) return null;

  const precioOriginal = Number(producto.precio_original ?? producto.precio_anterior) || 0;
  const tieneDescuento = precioOriginal > producto.precio;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(((precioOriginal - producto.precio) / precioOriginal) * 100)
    : 0;

  const handleAgregar = () => {
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto);
    }
    onClose();
  };

  // Productos relacionados (misma categoría, excluyendo el actual)
  const productosRelacionados = todosProductos
    .filter((p) => p.id !== producto.id && p.categoria === producto.categoria)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Imagen */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
            {producto.imagen_url ? (
              <Image
                src={producto.imagen_url}
                alt={producto.nombre}
                fill
                className="object-cover"
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

          {/* Información */}
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

            {/* Selector de Cantidad y Botón */}
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
                onClick={handleAgregar}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0E6E55] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#0b5944] active:scale-[0.98] shadow-md shadow-[#0E6E55]/20 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Agregar al Carrito • ${(producto.precio * cantidad).toLocaleString("es-AR")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sección Cross-Selling / Productos Relacionados */}
        {productosRelacionados.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              También te puede interesar
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {productosRelacionados.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => onSeleccionarProducto && onSeleccionarProducto(rel)}
                  className="group flex flex-col text-left rounded-xl border border-slate-100 p-2 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 mb-2">
                    {rel.imagen_url && (
                      <Image
                        src={rel.imagen_url}
                        alt={rel.nombre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate w-full">
                    {rel.nombre}
                  </span>
                  <span className="text-xs font-bold text-[#0E6E55] mt-0.5">
                    ${rel.precio.toLocaleString("es-AR")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}