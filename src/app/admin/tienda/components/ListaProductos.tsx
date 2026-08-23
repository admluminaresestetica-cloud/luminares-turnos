"use client";

import { useState } from "react";

interface ListaProductosProps {
  productos: any[];
  onEliminar: (id: any) => void;
  onEditar: (producto: any) => void;
  onToggleActivo?: (id: any, nuevoEstado: boolean) => void;
  onRestock?: (id: any, cantidadASumar: number) => void;
}

export default function ListaProductos({
  productos,
  onEliminar,
  onEditar,
  onToggleActivo,
  onRestock,
}: ListaProductosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [modalRestockId, setModalRestockId] = useState<number | string | null>(null);
  const [cantidadRestock, setCantidadRestock] = useState<number>(1);

  // Buscador por nombre, categoría o precio
  const productosFiltrados = productos.filter((p) => {
    const termino = busqueda.toLowerCase();
    const coincideNombre = p.nombre?.toLowerCase().includes(termino);
    const coincideCategoria = p.categoria?.toLowerCase().includes(termino);
    const coincidePrecio = p.precio?.toString().includes(termino);
    return coincideNombre || coincideCategoria || coincidePrecio;
  });

  const handleConfirmarRestock = (id: number | string) => {
    if (cantidadRestock <= 0) return;
    if (onRestock) {
      onRestock(id, cantidadRestock);
    }
    setModalRestockId(null);
    setCantidadRestock(1);
  };

  return (
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-lg font-bold text-[#12151B]">
          📦 Listado de Productos
        </h2>

        {/* Buscador Global */}
        <input
          type="text"
          placeholder="Buscar por nombre, categoría o precio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3 py-2 text-xs text-[#12151B] outline-none transition-all focus:border-[#0E6E55] sm:w-64"
        />
      </div>

      {productosFiltrados.length === 0 ? (
        <p className="mt-4 text-xs text-[#6B675F]">
          {busqueda ? "No se encontraron productos que coincidan." : "No hay productos registrados aún."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {productosFiltrados.map((p) => {
            const estaPausado = p.activo === false;

            return (
              <div
                key={p.id}
                className={`flex flex-col justify-between rounded-xl border border-[#E7E5E0] p-4 transition-all ${
                  estaPausado ? "bg-[#E7E5E0]/30 opacity-75" : "bg-[#F7F7F5]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#6B675F]">
                      {p.categoria || "General"}
                    </span>
                    
                    {/* Botón de Pausa / Activar */}
                    <button
                      onClick={() => onToggleActivo && onToggleActivo(p.id, estaPausado)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                        estaPausado
                          ? "bg-[#FEF2F2] text-[#C84343] hover:bg-[#FEE2E2]"
                          : "bg-[#E6F4F1] text-[#0E6E55] hover:bg-[#D1EBE6]"
                      }`}
                    >
                      {estaPausado ? "⏸️ Pausado" : "🟢 Activo"}
                    </button>
                  </div>

                  <h3 className="m-0 mt-3 text-base font-bold text-[#12151B]">
                    {p.nombre}
                  </h3>
                  <p className="m-0 mt-1 text-xs text-[#6B675F] line-clamp-2">
                    {p.descripcion}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-[#12151B]">
                        ${p.precio}
                      </span>
                      {p.precio_original && (
                        <span className="text-xs text-[#A6A29B] line-through">
                          ${p.precio_original}
                        </span>
                      )}
                    </div>

                    {/* Stock + Botón Restock */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0E6E55]">
                        Stock: {p.stock || 0}
                      </span>
                      <button
                        onClick={() => setModalRestockId(p.id)}
                        title="Sumar stock"
                        className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#0E6E55] border border-[#E7E5E0] hover:bg-[#E7E5E0]"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="mt-4 flex gap-2 border-t border-[#E7E5E0] pt-3">
                  <button
                    onClick={() => onEditar(p)}
                    className="flex-1 rounded-lg border border-[#E7E5E0] bg-white py-2 text-xs font-semibold text-[#12151B] transition-colors hover:bg-[#E7E5E0]"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => onEliminar(p.id)}
                    className="rounded-lg border border-[#F87171]/20 bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#C84343] transition-colors hover:bg-[#FEE2E2]"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Re-stock */}
      {modalRestockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl border border-[#E7E5E0] bg-white p-5 shadow-lg">
            <h3 className="m-0 text-sm font-bold text-[#12151B]">
              ➕ Sumar Unidades de Stock
            </h3>
            <p className="mt-1 text-xs text-[#6B675F]">
              Ingresá cuántas unidades vas a **sumar** al stock remanente:
            </p>
            <input
              type="number"
              min="1"
              value={cantidadRestock}
              onChange={(e) => setCantidadRestock(Number(e.target.value))}
              className="mt-3 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-2 text-sm font-bold text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalRestockId(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#6B675F] hover:bg-[#F7F7F5]"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmarRestock(modalRestockId)}
                className="rounded-lg bg-[#0E6E55] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0B5743]"
              >
                Sumar Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}