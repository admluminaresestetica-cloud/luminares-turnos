"use client";

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  precio_original?: number;
  stock: number;
  descripcion: string;
}

interface ListaProductosProps {
  productos: Producto[];
  onEliminar: (id: number) => void;
}

const BADGE_ESTILOS: Record<string, string> = {
  Cremas: "bg-[#0E6E55]/10 text-[#0E6E55]",
  Pañales: "bg-[#B8873D]/10 text-[#B8873D]",
  Perfumes: "bg-[#6B5B95]/10 text-[#6B5B95]",
  Otros: "bg-[#6B675F]/10 text-[#6B675F]",
};

export default function ListaProductos({ productos, onEliminar }: ListaProductosProps) {
  return (
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-[0_4px_16px_-8px_rgba(11,15,20,0.08)] sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h2
          className="m-0 text-lg font-bold text-[#12151B]"
          style={{ fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" }}
        >
          Productos en stock
        </h2>
        <span className="rounded-full bg-[#F7F7F5] px-3 py-1 text-xs font-semibold text-[#6B675F]">
          {productos.length} {productos.length === 1 ? "producto" : "productos"}
        </span>
      </div>

      {productos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E7E5E0] py-14 text-center">
          <span className="text-3xl">📭</span>
          <p className="mt-3 text-sm text-[#6B675F]">Todavía no cargaste ningún producto.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E7E5E0] text-xs uppercase tracking-wide text-[#A6A29B]">
                <th className="py-2.5 pr-3 font-semibold">Producto</th>
                <th className="py-2.5 pr-3 font-semibold">Categoría</th>
                <th className="py-2.5 pr-3 font-semibold">Precio</th>
                <th className="py-2.5 pr-3 font-semibold">Stock</th>
                <th className="py-2.5 pr-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id} className="border-b border-[#F1F0EC] align-top hover:bg-[#F7F7F5]/70">
                  <td className="py-3.5 pr-3">
                    <p className="m-0 font-semibold text-[#12151B]">{prod.nombre}</p>
                    {prod.descripcion && (
                      <p className="m-0 mt-0.5 max-w-[280px] text-[12px] text-[#6B675F] line-clamp-1">
                        {prod.descripcion}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        BADGE_ESTILOS[prod.categoria] || BADGE_ESTILOS.Otros
                      }`}
                    >
                      {prod.categoria}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="font-bold text-[#12151B]">${prod.precio}</span>
                    {prod.precio_original && (
                      <span className="ml-2 text-[12px] text-[#A6A29B] line-through">
                        ${prod.precio_original}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`font-semibold ${
                        prod.stock === 0 ? "text-[#D14343]" : "text-[#12151B]"
                      }`}
                    >
                      {prod.stock}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-right">
                    <button
                      onClick={() => onEliminar(prod.id)}
                      className="rounded-lg bg-[#FBE7E7] px-3 py-1.5 text-[12px] font-semibold text-[#D14343] transition-colors hover:bg-[#F5D0D0]"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}