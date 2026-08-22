"use client";
export default function ProductoCard({ producto, onAgregar }: { producto: any; onAgregar: (p: any) => void }) {
  const tieneOferta = producto.precio_original && producto.precio_original > producto.precio;
  const descuento = tieneOferta
    ? Math.round(100 - (Number(producto.precio) / Number(producto.precio_original)) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(11,15,20,0.15)]">
      {/* Imagen */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1F0EC]">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🛍️</div>
        )}

        {/* Ribbon de descuento estilo ticket */}
        {tieneOferta && (
          <div className="absolute left-0 top-4 flex items-center">
            <div
              className="relative bg-[#D14343] px-3 py-1 text-xs font-bold tracking-wide text-white shadow-md"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 4px 85%, 8px 70%, 4px 55%, 8px 40%, 4px 25%, 8px 10%, 0 0)",
              }}
            >
              -{descuento}%
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className="m-0 text-[15px] font-semibold leading-snug text-[#12151B]"
          style={{ fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" }}
        >
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="m-0 line-clamp-2 text-[13px] leading-relaxed text-[#6B675F]">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span
            className="text-xl font-bold text-[#12151B]"
            style={{ fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" }}
          >
            ${producto.precio}
          </span>
          {tieneOferta && (
            <span className="text-[13px] font-medium text-[#A6A29B] line-through">
              ${producto.precio_original}
            </span>
          )}
        </div>

        <button
          onClick={() => onAgregar(producto)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E6E55] py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0B5A45] active:scale-[0.98]"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}