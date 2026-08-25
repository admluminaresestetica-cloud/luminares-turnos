'use client';

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Banner {
  id: string;
  imagen_url: string;
  titulo?: string;
  link?: string;
}

export default function BannerPrincipal() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [actual, setActual] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      setCargando(true);
      
      // Opción A: Obtener imágenes directamente del Bucket
      const { data: archivos, error } = await supabase.storage
        .from("banners")
        .list("", { sortBy: { column: "created_at", order: "desc" } });

      if (error) {
        console.error("Error al obtener banners del bucket:", error);
        setCargando(false);
        return;
      }

      if (archivos && archivos.length > 0) {
        const listaBanners = archivos
          .filter((file) => file.name !== ".emptyFolderPlaceholder")
          .map((file) => {
            const { data } = supabase.storage.from("banners").getPublicUrl(file.name);
            return {
              id: file.id || file.name,
              imagen_url: data.publicUrl,
            };
          });

        setBanners(listaBanners);
      }
      setCargando(false);
    };

    fetchBanners();
  }, []);

  // Autoplay del carrusel
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActual((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const anterior = () => {
    setActual((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const siguiente = () => {
    setActual((prev) => (prev + 1) % banners.length);
  };

  if (cargando) {
    return (
      <div className="w-full h-[180px] sm:h-[280px] bg-[#E7E5E0] animate-pulse rounded-2xl mb-6" />
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[180px] sm:h-[280px] overflow-hidden rounded-2xl mb-6 shadow-sm group bg-[#12151B]">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === actual ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={banner.imagen_url}
            alt={`Promoción ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Flechas de navegación (Solo si hay más de 1 banner) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={anterior}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#12151B] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            ❮
          </button>
          <button
            onClick={siguiente}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#12151B] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            ❯
          </button>

          {/* Indicadores / Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActual(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === actual
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
