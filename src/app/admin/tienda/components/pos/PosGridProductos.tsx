"use client";

import { useState, useMemo } from "react";
import { ProductoPOS } from "./types";

interface PosGridProductosProps {
  productos: ProductoPOS[];
  busqueda: string;
  onAgregarAlCarrito: (producto: ProductoPOS) => void;
}

export default function PosGridProductos({
  productos,
  busqueda,
  onAgregarAlCarrito,
}: PosGridProductosProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("Todas");

  // Obtener lista de categorías únicas
  const categorias = useMemo(() => {
    const cats = Array.from(new Set(productos.map((p) => p.categoria || "General")));
    return ["Todas", ...cats];
  }, [productos]);

  // Filtrado de productos por búsqueda y categoría
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchCat =
        categoriaSeleccionada === "Todas" || (p.categoria || "General") === categoriaSeleccionada;
      
      const q = busqueda.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(q)) ||
        (p.categoria && p.categoria.toLowerCase().includes(q));

      return matchCat && matchQuery;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Selector rápido de categorías en pills deslizables */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaSeleccionada(cat)}
            className={`shrink-0 whitespace-nowrap rounded-2xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 sm:py-1.5 ${
              categoriaSeleccionada === cat
                ? "bg-[#0E6E55] text-white shadow-md shadow-[#0E6E55]/20"
                : "bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla táctil de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-3xl mb-1">📦</span>
          <p className="text-xs font-bold text-gray-500 dark:text-zinc-400">
            No se encontraron productos coincidentes.
          </p>
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
            Probá seleccionando otra categoría o limpiando la búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 sm:gap-3.5">
          {productosFiltrados.map((prod) => {
            const sinStock = prod.stock <= 0;
            return (
              <button
                key={prod.id}
                disabled={sinStock}
                onClick={() => onAgregarAlCarrito(prod)}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-3 text-left transition-all active:scale-95 sm:p-3.5 dark:bg-zinc-900 ${
                  sinStock
                    ? "opacity-50 border-gray-200 dark:border-zinc-800 cursor-not-allowed"
                    : "border-gray-200/80 hover:border-[#0E6E55] hover:shadow-md dark:border-zinc-800 dark:hover:border-[#0E6E55]"
                }`}
              >
                <div>
                  {/* Encabezado: Categoría + Badge de Stock */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-400 uppercase tracking-wider truncate">
                      {prod.categoria || "General"}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black ${
                        sinStock
                          ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                          : prod.stock <= (prod.stock_minimo || 5)
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      }`}
                    >
                      {sinStock ? "Sin Stock" : `${prod.stock} un.`}
                    </span>
                  </div>

                  {/* Título */}
                  <h4 className="mt-1.5 line-clamp-2 text-xs font-bold text-gray-800 dark:text-zinc-100 group-hover:text-[#0E6E55] leading-snug">
                    {prod.nombre}
                  </h4>
                </div>

                {/* Pie: Precio + Botón rápido de agregar */}
                <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-2 w-full">
                  <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-zinc-100">
                    ${prod.precio.toLocaleString("es-AR")}
                  </span>
                  
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-xl bg-[#0E6E55]/10 text-[#0E6E55] text-xs font-black group-hover:bg-[#0E6E55] group-hover:text-white transition-colors">
                    +
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}