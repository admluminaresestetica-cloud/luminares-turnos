"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
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
    <div className="mt-8 pt-6 border-t border-border">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
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
              className="group relative flex flex-col justify-between text-left rounded-2xl border border-border bg-card p-2.5 hover:border-[#0E6E55]/40 dark:hover:border-emerald-500/40 hover:bg-accent/50 transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-[0.97]"
            >
              <div>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/50 mb-2 border border-border/40">
                  {rel.imagen_url ? (
                    <Image
                      src={rel.imagen_url}
                      alt={rel.nombre}
                      fill
                      sizes="(max-width: 640px) 33vw, 150px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground/60">
                      Sin Foto
                    </div>
                  )}

                  {relTieneDesc && (
                    <span className="absolute top-1 left-1 rounded-md bg-[#0E6E55] dark:bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                      OFF
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-foreground truncate block w-full group-hover:text-[#0E6E55] dark:group-hover:text-emerald-400 transition-colors">
                  {rel.nombre}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">
                    ${rel.precio.toLocaleString("es-AR")}
                  </span>
                  {relTieneDesc && (
                    <span className="text-[9px] text-muted-foreground line-through">
                      ${relPrecioOriginal.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>

                {relCantidadEnCarrito === 0 ? (
                  <button
                    type="button"
                    onClick={(e) => handleSumarRecomendado(e, rel, relCantidadEnCarrito, relStock)}
                    disabled={relStock <= 0}
                    title="Agregar al carrito"
                    className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#0E6E55]/10 text-[#0E6E55] dark:bg-emerald-500/15 dark:text-emerald-400 hover:bg-[#0E6E55] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all active:scale-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                ) : (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl p-0.5 shadow-2xs shrink-0"
                  >
                    <button
                      type="button"
                      onClick={(e) => handleRestarRecomendado(e, rel, relCantidadEnCarrito)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-card text-emerald-800 dark:text-emerald-300 hover:bg-accent transition-all active:scale-90 font-bold text-xs cursor-pointer"
                      title="Restar una unidad"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <span className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-200 px-0.5">
                      {relCantidadEnCarrito}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleSumarRecomendado(e, rel, relCantidadEnCarrito, relStock)}
                      disabled={relLimiteAlcanzado}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-card text-emerald-800 dark:text-emerald-300 hover:bg-accent transition-all active:scale-90 font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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