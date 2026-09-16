"use client";

import Image from "next/image";
import { Plus, Minus, Sparkles } from "lucide-react";
import { Producto } from "@/types/tienda";

interface ProductosRelacionadosProps {
  productosRelacionados: Producto[];
  items: any[];
  onSeleccionarProducto: (prod: Producto) => void;
  handleSumarRecomendado: (e: React.MouseEvent, rel: Producto, cant: number, stock: number) => void;
  handleRestarRecomendado: (e: React.MouseEvent, rel: Producto, cant: number) => void;
}

export default function ProductosRelacionados({
  productosRelacionados,
  items,
  onSeleccionarProducto,
  handleSumarRecomendado,
  handleRestarRecomendado,
}: ProductosRelacionadosProps) {
  if (productosRelacionados.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-[#0E6E55]" />
        También te puede interesar
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {productosRelacionados.map((rel) => {
          const relPrecioOriginal = Number(rel.precio_original ?? (rel as any).precio_anterior) || 0;
          const relTieneDesc = relPrecioOriginal > rel.precio;
          const relStock = rel.stock ?? 0;

          const itemRelEnCarrito = Array.isArray(items)
            ? items.find((item: any) => item.id === rel.id)
            : null;
          const relCantidadEnCarrito = itemRelEnCarrito ? itemRelEnCarrito.cantidad : 0;
          const relLimiteAlcanzado = relCantidadEnCarrito >= relStock;

          return (
            <div
              key={rel.id}
              onClick={() => onSeleccionarProducto && onSeleccionarProducto(rel)}
              className="group relative flex flex-col justify-between text-left rounded-2xl border border-slate-100 p-2.5 hover:border-[#0E6E55]/40 hover:bg-slate-50/80 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.97]"
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

                {relCantidadEnCarrito === 0 ? (
                  <button
                    onClick={(e) => handleSumarRecomendado(e, rel, relCantidadEnCarrito, relStock)}
                    disabled={relStock <= 0}
                    title="Agregar al carrito"
                    className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#0E6E55]/10 text-[#0E6E55] hover:bg-[#0E6E55] hover:text-white transition-all active:scale-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 rounded-xl p-0.5 shadow-sm">
                    <button
                      onClick={(e) => handleRestarRecomendado(e, rel, relCantidadEnCarrito)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition-all active:scale-90 font-bold text-xs"
                      title="Restar una unidad"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <span className="text-[11px] font-extrabold text-emerald-900 px-1">
                      {relCantidadEnCarrito}
                    </span>

                    <button
                      onClick={(e) => handleSumarRecomendado(e, rel, relCantidadEnCarrito, relStock)}
                      disabled={relLimiteAlcanzado}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition-all active:scale-90 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Sumar una unidad"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
