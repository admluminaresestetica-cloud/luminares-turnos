'use client';

import Link from 'next/link';

export interface Banner {
  id: string;
  titulo?: string;
  subtitulo?: string;
  imagen_url: string;
  link_destino?: string;
  activo: boolean;
}

interface BannersCarouselProps {
  banners: Banner[];
  isLoading?: boolean;
}

export default function BannersCarousel({ banners, isLoading }: BannersCarouselProps) {
  if (isLoading) {
    return (
      <div className="w-full h-36 rounded-3xl bg-[hsl(var(--muted))] animate-pulse" />
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      {/* Contenedor con desplazamiento horizontal fluido hacia la derecha y soporte táctil */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 -mx-4 px-4 pb-2 pt-1 touch-pan-x">
        {banners.map((banner) => {
          const Content = (
            <div className="w-full h-full relative group">
              {/* Imagen base */}
              <img
                src={banner.imagen_url}
                alt={banner.titulo || 'Banner promocional'}
                className="w-full h-full object-cover"
              />

              {/* CAPA TRANSLÚCIDA CON EL TONO DE LA APP */}
              {/* 1. Tinte uniforme con el color primario activo */}
              <div className="absolute inset-0 bg-[hsl(var(--primary))]/25 pointer-events-none transition-colors duration-300" />

              {/* 2. Degradado sutil para dar elegancia y legibilidad a los textos */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

              {/* Elementos flotantes alineados a tu sistema de diseño con variables CSS */}
              <div className="absolute inset-0 p-3.5 flex flex-col justify-between pointer-events-none z-10">
                {banner.titulo && (
                  <div className="self-start">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[hsl(var(--card))/0.85] backdrop-blur-md text-[hsl(var(--primary))] text-[10px] font-black tracking-wider uppercase shadow-md border border-[hsl(var(--primary))/0.2]">
                      {banner.titulo}
                    </span>
                  </div>
                )}

                <div className="self-start mt-auto">
                  <span className="inline-block text-[11px] font-extrabold text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] backdrop-blur-md px-3.5 py-1 rounded-xl shadow-md">
                    {banner.subtitulo || 'Ver promo'}
                  </span>
                </div>
              </div>
            </div>
          );

          return banner.link_destino ? (
            <Link
              key={banner.id}
              href={banner.link_destino}
              className="snap-center shrink-0 w-[88%] first:ml-0 rounded-3xl overflow-hidden relative shadow-md border border-[hsl(var(--border))] aspect-[21/9] block active:scale-[0.98] transition-transform cursor-pointer"
            >
              {Content}
            </Link>
          ) : (
            <div
              key={banner.id}
              className="snap-center shrink-0 w-[88%] first:ml-0 rounded-3xl overflow-hidden relative shadow-md border border-[hsl(var(--border))] aspect-[21/9]"
            >
              {Content}
            </div>
          );
        })}
      </div>
    </div>
  );
}