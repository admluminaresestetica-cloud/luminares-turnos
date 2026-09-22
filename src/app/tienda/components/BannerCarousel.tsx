'use client';

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Banner {
  id: string;
  imagen_url: string;
  titulo?: string;
  link_url?: string;
  activo?: boolean;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cargando, setCargando] = useState(true);

  // Estados para manejo de gestos Touch / Arrastre
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch de Supabase
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("banners_tienda")
          .select("id, imagen_url, titulo, link_url, activo")
          .eq("activo", true);

        if (!error && data) {
          setBanners(data);
        } else if (error) {
          console.error("Error al cargar banners de la tienda:", error.message);
        }
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchBanners();
  }, []);

  // Rotación Automática (se pausa si el usuario está arrastrando)
  useEffect(() => {
    if (banners.length <= 1 || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isDragging]);

  // Manejadores de Gestos (Touch y Mouse)
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const minSwipeDistance = 50; // Umbral mínimo en píxeles para cambiar de slide

    if (dragOffset < -minSwipeDistance) {
      // Siguiente banner
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } else if (dragOffset > minSwipeDistance) {
      // Banner anterior
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // Skeleton Loader mientras carga Supabase
  if (cargando) {
    return (
      <div className="w-full h-44 sm:h-64 md:h-80 my-4 bg-slate-200/80 rounded-3xl animate-pulse" />
    );
  }

  if (banners.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-3xl shadow-xs my-4 bg-slate-100 select-none touch-pan-y"
      // Eventos táctiles (Mobile)
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      // Eventos de mouse (Desktop)
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => {
        if (isDragging) handleDragEnd();
      }}
    >
      <div
        className={`flex ${
          isDragging ? 'transition-none' : 'transition-transform duration-500 ease-out'
        }`}
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
        }}
      >
        {banners.map((b) => {
          const content = (
            <img
              src={b.imagen_url}
              alt={b.titulo || "Banner promocional"}
              draggable={false}
              className="w-full h-44 sm:h-64 md:h-80 object-cover object-center rounded-3xl pointer-events-none"
            />
          );

          return (
            <div key={b.id} className="min-w-full flex-shrink-0">
              {b.link_url ? (
                <a
                  href={b.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {/* Indicadores / Puntos de navegación */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al banner ${idx + 1}`}
              className="flex items-center justify-center h-4 -my-1 px-0.5 active:scale-90 transition-transform cursor-pointer"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-6 bg-white shadow-xs" : "w-2 bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}