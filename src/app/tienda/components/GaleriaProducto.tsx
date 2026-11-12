"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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

const springTap = { type: "spring" as const, stiffness: 420, damping: 20 };

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
    <div className="flex w-full flex-col gap-3">
      {/* VISTA PREVIA PRINCIPAL */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="group relative flex aspect-square w-full select-none items-center justify-center overflow-hidden rounded-3xl border border-border bg-slate-50 shadow-lg shadow-black/5 dark:bg-zinc-900 dark:shadow-black/20"
      >
        {imagenSeleccionada && !errorCarga ? (
          <motion.div
            key={imagenSeleccionada}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={imagenSeleccionada}
              alt={producto.nombre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover"
              priority
              onError={() => setErrorCarga(true)}
            />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8 stroke-[1.5]" />
            <span className="text-xs font-medium">Imagen no disponible</span>
          </div>
        )}

        {/* FLECHAS DE NAVEGACIÓN EN IMAGEN PRINCIPAL (Visible en Hover o si hay varias fotos) */}
        {totalImagenes > 1 && (
          <>
            <motion.button
              onClick={irAAnterior}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              transition={springTap}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-white/80 text-foreground shadow-lg shadow-black/5 backdrop-blur-xl transition-opacity dark:bg-zinc-800/80 dark:shadow-black/20 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <motion.button
              onClick={irASiguiente}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              transition={springTap}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-white/80 text-foreground shadow-lg shadow-black/5 backdrop-blur-xl transition-opacity dark:bg-zinc-800/80 dark:shadow-black/20 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </>
        )}

        {/* BADGE DESCUENTO */}
        {tieneDescuento && !sinStock && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary-foreground shadow-lg shadow-primary/20">
            -{porcentajeDescuento}% OFF
          </span>
        )}

        {/* CARTEL SIN STOCK */}
        {sinStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] dark:bg-zinc-950/60">
            <span className="rounded-2xl border border-border bg-white/95 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 shadow-lg shadow-black/10 dark:bg-zinc-900 dark:text-zinc-100">
              Sin Stock
            </span>
          </div>
        )}

        {/* INDICADOR PUNTOS MOBILE (DOTS) */}
        {totalImagenes > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2 py-1.5 backdrop-blur-xl dark:bg-black/40 sm:hidden">
            {imagenesTotales.map((_, idx) => (
              <motion.span
                key={idx}
                initial={false}
                animate={{
                  width: indiceActual === idx ? 16 : 6,
                  opacity: indiceActual === idx ? 1 : 0.5,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="h-1.5 rounded-full bg-white"
              />
            ))}
          </div>
        )}
      </div>

      {/* MINIATURAS INTERACTIVAS */}
      {totalImagenes > 1 && (
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-0.5 pb-1 pt-1">
          {imagenesTotales.map((img: string, index: number) => {
            const esSeleccionada = imagenSeleccionada === img;
            return (
              <motion.button
                key={index}
                onClick={() => setImagenSeleccionada(img)}
                aria-label={`Ver foto ${index + 1}`}
                initial={false}
                animate={{ scale: esSeleccionada ? 0.95 : 1 }}
                whileTap={{ scale: 0.88 }}
                transition={springTap}
                className={`relative h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border transition-opacity sm:h-16 sm:w-16 ${
                  esSeleccionada ? "opacity-100" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`${producto.nombre} vista ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />

                {/* Marco activo que se desliza entre miniaturas */}
                {esSeleccionada && (
                  <motion.span
                    layoutId="galeria-miniatura-activa"
                    transition={{ type: "spring", stiffness: 450, damping: 34 }}
                    className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-primary ring-2 ring-primary/20"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}