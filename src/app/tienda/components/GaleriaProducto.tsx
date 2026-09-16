"use client";

import Image from "next/image";
import { Producto } from "@/types/tienda";

interface GaleriaProductoProps {
  producto: Producto;
  imagenSeleccionada: string;
  setImagenSeleccionada: (img: string) => void;
  imagenesTotales: string[];
  tieneDescuento: boolean;
  porcentajeDescuento: number;
  sinStock: boolean;
  onFiltrarPorTag?: (tag: string) => void;
  onClose?: () => void;
}

export default function GaleriaProducto({
  producto,
  imagenSeleccionada,
  setImagenSeleccionada,
  imagenesTotales,
  tieneDescuento,
  porcentajeDescuento,
  sinStock,
  onFiltrarPorTag,
  onClose,
}: GaleriaProductoProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* VISTA PREVIA PRINCIPAL */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group">
        {imagenSeleccionada ? (
          <Image
            src={imagenSeleccionada}
            alt={producto.nombre}
            fill
            className="object-cover transition-all duration-200"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            Sin Imagen
          </div>
        )}

        {/* ETIQUETAS/TAGS SUPERPUESTAS ARRIBA A LA IZQUIERDA */}
        {producto.etiquetas && producto.etiquetas.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 max-w-[80%]">
            {producto.etiquetas.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onFiltrarPorTag) onFiltrarPorTag(tag);
                  if (onClose) onClose();
                }}
                className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md border border-emerald-200/60 px-2.5 py-1 text-[11px] font-bold text-[#0E6E55] shadow-sm hover:bg-[#0E6E55] hover:text-white transition-all cursor-pointer"
                title={`Filtrar por #${tag}`}
              >
                🏷️ {tag}
              </button>
            ))}
          </div>
        )}

        {/* BADGE DESCUENTO ARRIBA A LA DERECHA */}
        {tieneDescuento && !sinStock && (
          <span className="absolute top-3 right-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm z-10">
            -{porcentajeDescuento}% OFF
          </span>
        )}

        {sinStock && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-bold text-[#12151B]">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* MINIATURAS INTERACTIVAS */}
      {imagenesTotales.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {imagenesTotales.map((img: string, index: number) => (
            <button
              key={index}
              onClick={() => setImagenSeleccionada(img)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                imagenSeleccionada === img
                  ? "border-[#0E6E55] scale-95 shadow-sm"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${producto.nombre} - ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}