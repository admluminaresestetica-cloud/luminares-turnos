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
  activo?: boolean;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      // Consulta exclusivamente a la tabla de la tienda
      const { data, error } = await supabase
        .from("banners_tienda")
        .select("id, imagen_url, titulo, activo")
        .eq("activo", true);

      if (!error && data) {
        setBanners(data);
      } else if (error) {
        console.error("Error al cargar los banners de la tienda:", error.message);
      }
    };

    fetchBanners();
  }, []);

  // Autoplay cada 5 segundos si hay más de 1 banner activo
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm my-4 bg-slate-100">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="min-w-full flex-shrink-0">
            <img
              src={b.imagen_url}
              alt={b.titulo || "Banner promocional"}
              className="w-full h-auto aspect-[1080/450] object-contain rounded-2xl"
            />
          </div>
        ))}
      </div>

      {/* Indicadores / Puntos */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al banner ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? "w-6 bg-white shadow-sm" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
