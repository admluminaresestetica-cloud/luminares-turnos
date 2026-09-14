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
    <div className="flex flex-col gap-4">
      {/* Selector rápido de categorías por pills */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaSeleccionada(cat)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              categoriaSeleccionada === cat
                ? "bg-[#0E6E55] text-white shadow-sm"
                : "bg-white text-[#6B675F] border border-[#E7E5E0] hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla táctil de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E7E5E0] bg-white p-6 text-center">
          <span className="text-3xl">📦</span>
          <p className="mt-2 text-xs font-medium text-gray-500">
            No se encontraron productos coincidentes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {productosFiltrados.map((prod) => {
            const sinStock = prod.stock <= 0;
            return (
              <button
                key={prod.id}
                disabled={sinStock}
                onClick={() => onAgregarAlCarrito(prod)}
                className={`group relative flex flex-col justify-between rounded-2xl border border-[#E7E5E0] bg-white p-3 text-left transition-all hover:border-[#0E6E55] hover:shadow-md disabled:opacity-50 disabled:hover:border-[#E7E5E0] disabled:hover:shadow-none`}
              >
                <div>
                  {/* Badge de Stock */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {prod.categoria || "General"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        sinStock
                          ? "bg-red-100 text-red-600"
                          : prod.stock <= (prod.stock_minimo || 5)
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {sinStock ? "Sin Stock" : `${prod.stock} un.`}
                    </span>
                  </div>

                  {/* Título */}
                  <h4 className="mt-2 line-clamp-2 text-xs font-bold text-[#12151B] group-hover:text-[#0E6E55]">
                    {prod.nombre}
                  </h4>
                </div>

                {/* Precio */}
                <div className="mt-3 flex items-baseline justify-between border-t border-gray-100 pt-2">
                  <span className="text-sm font-extrabold text-[#12151B]">
                    ${prod.precio.toLocaleString("es-AR")}
                  </span>
                  <span className="text-[10px] font-bold text-[#0E6E55] opacity-0 transition-opacity group-hover:opacity-100">
                    + Agregar
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