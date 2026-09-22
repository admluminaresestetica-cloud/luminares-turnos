"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Producto } from "@/types/tienda";

interface GaleriaProductoProps {
  producto: Producto;
  imagenSeleccionada: string;
  setImagenSeleccionada: (img: string) => void;
  imagenesTotales: string[];
  tieneDescuento: boolean;
  porcentajeDescuento: number;
  sinStock: boolean;
}

export default function GaleriaProducto({
  producto,
  imagenSeleccionada,
  setImagenSeleccionada,
  imagenesTotales,
  tieneDescuento,
  porcentajeDescuento,
  sinStock,
}: GaleriaProductoProps) {
  const [errorCarga, setErrorCarga] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const totalImagenes = imagenesTotales.length;
  const indiceActual = imagenesTotales.indexOf(imagenSeleccionada);

  useEffect(() => {
    setErrorCarga(false);
  }, [imagenSeleccionada]);

  // Navegación siguiente / anterior
  const irAAnterior = () => {
    if (totalImagenes <= 1) return;
    const nuevoIndice = indiceActual > 0 ? indiceActual - 1 : totalImagenes - 1;
    setImagenSeleccionada(imagenesTotales[nuevoIndice]);
  };

  const irASiguiente = () => {
    if (totalImagenes <= 1) return;
    const nuevoIndice = indiceActual < totalImagenes - 1 ? indiceActual + 1 : 0;
    setImagenSeleccionada(imagenesTotales[nuevoIndice]);
  };

  // Soporte para teclas de flechas izquierda y derecha
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") irAAnterior();
      if (e.key === "ArrowRight") irASiguiente();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [indiceActual, totalImagenes]);

  // Gestos Swipe táctiles en la imagen principal
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;

    if (deltaX > 40) {
      irASiguiente(); // Swipe hacia la izquierda -> Siguiente
    } else if (deltaX < -40) {
      irAAnterior(); // Swipe hacia la derecha -> Anterior
    }
    setTouchStartX(null);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* VISTA PREVIA PRINCIPAL */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group select-none"
      >
        {imagenSeleccionada && !errorCarga ? (
          <Image
            src={imagenSeleccionada}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-all duration-300"
            priority
            onError={() => setErrorCarga(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
            <ImageOff className="h-8 w-8 stroke-[1.5]" />
            <span className="text-xs font-medium">Imagen no disponible</span>
          </div>
        )}

        {/* FLECHAS DE NAVEGACIÓN EN IMAGEN PRINCIPAL (Visible en Hover o si hay varias fotos) */}
        {totalImagenes > 1 && (
          <>
            <button
              onClick={irAAnterior}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 backdrop-blur-md shadow-sm transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={irASiguiente}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 backdrop-blur-md shadow-sm transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* BADGE DESCUENTO */}
        {tieneDescuento && !sinStock && (
          <span className="absolute top-3 right-3 rounded-full bg-[#0E6E55] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-md z-10">
            -{porcentajeDescuento}% OFF
          </span>
        )}

        {/* CARTEL SIN STOCK */}
        {sinStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
            <span className="rounded-xl bg-white/95 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 shadow-lg">
              Sin Stock
            </span>
          </div>
        )}

        {/* INDICADOR PUNTOS MOBILE (DOTS) */}
        {totalImagenes > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-md px-2 py-1 sm:hidden">
            {imagenesTotales.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  indiceActual === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* MINIATURAS INTERACTIVAS */}
      {totalImagenes > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {imagenesTotales.map((img: string, index: number) => {
            const esSeleccionada = imagenSeleccionada === img;
            return (
              <button
                key={index}
                onClick={() => setImagenSeleccionada(img)}
                aria-label={`Ver foto ${index + 1}`}
                className={`relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                  esSeleccionada
                    ? "border-[#0E6E55] ring-2 ring-[#0E6E55]/20 scale-95 shadow-sm"
                    : "border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <Image
                  src={img}
                  alt={`${producto.nombre} - vista ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}