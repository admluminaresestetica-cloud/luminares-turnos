"use client";

interface ListaProductosProps {
  productos: any[];
  onEliminar: (id: number) => void;
  onEditar: (producto: any) => void;
}

export default function ListaProductos({ productos, onEliminar, onEditar }: ListaProductosProps) {
  return (
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
      <h2 className="m-0 text-lg font-bold text-[#12151B]">
        📦 Listado de Productos
      </h2>

      {productos.length === 0 ? (
        <p className="mt-4 text-xs text-[#6B675F]">No hay productos registrados aún.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {productos.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#6B675F]">
                    {p.categoria || "General"}
                  </span>
                  <span className="text-xs font-bold text-[#0E6E55]">
                    Stock: {p.stock || 0}
                  </span>
                </div>
                <h3 className="m-0 mt-3 text-base font-bold text-[#12151B]">
                  {p.nombre}
                </h3>
                <p className="m-0 mt-1 text-xs text-[#6B675F] line-clamp-2">
                  {p.descripcion}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-[#12151B]">
                    ${p.precio}
                  </span>
                  {p.precio_original && (
                    <span className="text-xs text-[#A6A29B] line-through">
                      ${p.precio_original}
                    </span>
                  )}
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
          ))}
        </div>
      )}
    </div>
  );
}
