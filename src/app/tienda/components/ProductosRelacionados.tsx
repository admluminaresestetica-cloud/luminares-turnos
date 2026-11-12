"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Minus, SoapDispenserDroplet } from "lucide-react";
import { Producto } from "@/types/tienda";

interface ProductosRelacionadosProps {
  productosRelacionados: Producto[];
  items: any[];
  onSeleccionarProducto: (prod: Producto) => void;
  handleSumarRecomendado: (e: React.MouseEvent, rel: Producto, cant: number, stock: number) => void;
  handleRestarRecomendado: (e: React.MouseEvent, rel: Producto, cant: number) => void;
}

const springTap = { type: "spring" as const, stiffness: 420, damping: 20 };

export default function ProductosRelacionados({
  productosRelacionados,
  items,
  onSeleccionarProducto,
  handleSumarRecomendado,
  handleRestarRecomendado,
}: ProductosRelacionadosProps) {
  if (productosRelacionados.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
          <SoapDispenserDroplet className="h-4 w-4 text-primary" />
        </span>
        También te puede interesar
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {productosRelacionados.map((rel, index) => {
          const relPrecioOriginal = Number(rel.precio_original ?? (rel as any).precio_anterior) || 0;
          const relTieneDesc = relPrecioOriginal > rel.precio;
          const relStock = rel.stock ?? 0;

          const itemRelEnCarrito = Array.isArray(items)
            ? items.find((item: any) => item.id === rel.id)
            : null;
          const relCantidadEnCarrito = itemRelEnCarrito ? itemRelEnCarrito.cantidad : 0;
          const relLimiteAlcanzado = relCantidadEnCarrito >= relStock;

          return (
            <motion.div
              key={rel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 26, delay: index * 0.05 }}
              onClick={() => onSeleccionarProducto && onSeleccionarProducto(rel)}
              className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-border bg-white p-2.5 text-left shadow-lg shadow-black/5 transition-colors hover:border-primary/30 dark:bg-zinc-900 dark:shadow-black/20"
            >
              <div>
                <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-zinc-800">
                  {rel.imagen_url ? (
                    <Image
                      src={rel.imagen_url}
                      alt={rel.nombre}
                      fill
                      sizes="(max-width: 640px) 33vw, 160px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-300 dark:text-zinc-600">
                      Sin Foto
                    </div>
                  )}

                  {relTieneDesc && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground shadow-lg shadow-primary/20">
                      OFF
                    </span>
                  )}
                </div>

                <span className="block w-full truncate text-xs font-semibold text-slate-800 transition-colors group-hover:text-primary dark:text-zinc-200">
                  {rel.nombre}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-1 border-t border-border pt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary">
                    ${rel.precio.toLocaleString("es-AR")}
                  </span>
                  {relTieneDesc && (
                    <span className="text-[9px] text-slate-400 line-through dark:text-zinc-500">
                      ${relPrecioOriginal.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>

                {relCantidadEnCarrito === 0 ? (
                  <motion.button
                    onClick={(e) => handleSumarRecomendado(e, rel, relCantidadEnCarrito, relStock)}
                    disabled={relStock <= 0}
                    whileTap={relStock <= 0 ? undefined : { scale: 0.88 }}
                    transition={springTap}
                    title="Agregar al carrito"
                    aria-label="Agregar al carrito"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    className="flex items-center gap-1 rounded-xl border border-primary/25 bg-primary/10 p-0.5"
                  >
                    <motion.button
                      onClick={(e) => handleRestarRecomendado(e, rel, relCantidadEnCarrito)}
                      whileTap={{ scale: 0.88 }}
                      transition={springTap}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-white text-primary shadow-xs transition-colors hover:bg-primary/10 dark:bg-zinc-800"
                      title="Restar una unidad"
                      aria-label="Restar una unidad"
                    >
                      <Minus className="h-3 w-3" />
                    </motion.button>

                    <motion.span
                      key={relCantidadEnCarrito}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 24 }}
                      className="px-1 text-[11px] font-extrabold text-primary"
                    >
                      {relCantidadEnCarrito}
                    </motion.span>

                    <motion.button
                      onClick={(e) => handleSumarRecomendado(e, rel, relCantidadEnCarrito, relStock)}
                      disabled={relLimiteAlcanzado}
                      whileTap={relLimiteAlcanzado ? undefined : { scale: 0.88 }}
                      transition={springTap}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-white text-primary shadow-xs transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800"
                      title="Sumar una unidad"
                      aria-label="Sumar una unidad"
                    >
                      <Plus className="h-3 w-3" />
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}