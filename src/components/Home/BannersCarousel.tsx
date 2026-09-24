'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowRight, Tag } from 'lucide-react';

interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  imagen_url: string;
  cupon_codigo?: string;
  link_destino: string;
  orden: number;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BannersCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cargando, setCargando] = useState(true);
  const [indiceActivo, setIndiceActivo] = useState(0);

  useEffect(() => {
    const obtenerBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('banners_home')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (error) throw error;
        if (data) setBanners(data);
      } catch (err) {
        console.error('Error cargando banners:', err);
      } finally {
        setCargando(false);
      }
    };

    obtenerBanners();
  }, []);

  // Rotación automática cada 5 segundos si hay más de 1 banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setIndiceActivo((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (cargando) {
    return (
      <div className="w-full h-44 rounded-3xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full space-y-2">
      <div className="relative w-full h-44 rounded-3xl overflow-hidden bg-slate-900 shadow-md">
        {banners.map((banner, index) => {
          const esActivo = index === indiceActivo;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                esActivo ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Imagen de fondo del banner */}
              <Image
                src={banner.imagen_url}
                alt={banner.titulo}
                fill
                className="object-cover opacity-80"
                priority={index === 0}
              />

              {/* Overlay con degradado para legibilidad del texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end text-white space-y-1.5">
                {banner.cupon_codigo && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black w-max uppercase tracking-wider">
                    <Tag className="w-3 h-3" /> Cupón: {banner.cupon_codigo}
                  </span>
                )}
                
                <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                  {banner.titulo}
                </h3>
                
                {banner.subtitulo && (
                  <p className="text-xs text-slate-200 font-medium line-clamp-1">
                    {banner.subtitulo}
                  </p>
                )}

                <Link
                  href={banner.link_destino || '/laser'}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/30 hover:bg-white/30 transition-all w-max mt-1"
                >
                  <span>Ver Promoción</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicadores de Puntos (Dots) */}
      {banners.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndiceActivo(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === indiceActivo
                  ? 'w-6 bg-slate-900 dark:bg-zinc-100'
                  : 'w-1.5 bg-slate-300 dark:bg-zinc-700'
              }`}
              aria-label={`Ir al banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
