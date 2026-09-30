'use client';

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Banner {
  id: string;
  imagen_url: string;
  titulo?: string;
  activo?: boolean;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Estados para gestionar el gesto de arrastre (touch / mouse)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Umbral mínimo en píxeles para considerar que fue un gesto de deslizamiento
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from("banners_tienda")
        .select("id, imagen_url, titulo, activo")
        .eq("activo", true);

      if (!error && data) {
        setBanners(data);
      } else if (error) {
        console.error("Error al cargar banners de la tienda:", error.message);
      }
    };

    fetchBanners();
  }, []);

  // Intervalo de cambio automático
  useEffect(() => {
    if (banners.length <= 1 || isDragging) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length, isDragging]);

  const irAlAnterior = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const irAlSiguiente = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Manejadores de eventos de Touch (Móviles)
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      irAlSiguiente();
    } else if (isRightSwipe) {
      irAlAnterior();
    }
  };

  // Manejadores de eventos de Mouse (Escritorio)
  const onMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      irAlSiguiente();
    } else if (isRightSwipe) {
      irAlAnterior();
    }
  };

  if (banners.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-border shadow-xs my-4 bg-slate-100 dark:bg-zinc-900 select-none group touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Contenedor de Banners */}
      <div
        className="flex transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="min-w-full flex-shrink-0">
            <img
              src={b.imagen_url}
              alt={b.titulo || "Banner promocional"}
              draggable={false}
              className="w-full h-44 sm:h-64 md:h-80 object-cover object-center rounded-3xl pointer-events-none"
            />
          </div>
        ))}
      </div>

      {/* Botones de navegación lateral (visibles en hover o móvil) */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={irAlAnterior}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-200 shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={irAlSiguiente}
            aria-label="Siguiente banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-200 shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicadores / Puntos de la parte inferior */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al banner ${idx + 1}`}
              className="flex items-center justify-center h-4 -my-1 px-0.5 active:scale-90 transition-transform cursor-pointer"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-6 bg-white dark:bg-zinc-100 shadow-md"
                    : "w-2 bg-white/60 dark:bg-white/40 hover:bg-white/80 dark:hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}