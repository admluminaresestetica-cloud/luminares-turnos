'use client';

import { Sparkles } from 'lucide-react';

interface Banner {
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
      <div className="w-full h-36 rounded-3xl bg-stone-100 dark:bg-zinc-900 animate-pulse" />
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 -mx-4 px-4 pb-1">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="snap-center shrink-0 w-[88%] first:ml-0 rounded-3xl overflow-hidden relative shadow-xs border border-stone-200/80 dark:border-zinc-800 aspect-[21/9] group"
          >
            {/* Imagen Limpia sin capas o filtros verdes por encima */}
            <img
              src={banner.imagen_url}
              alt={banner.titulo || 'Banner promocional'}
              className="w-full h-full object-cover"
            />

            {/* Elementos flotantes recuperados sin opacar la foto */}
            <div className="absolute inset-0 p-3.5 flex flex-col justify-between pointer-events-none">
              {/* Badge superior (ej: CUPÓN o PROMO) */}
              {banner.titulo && (
                <div className="self-start">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-[#a3c9b8] text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#a3c9b8]" />
                    {banner.titulo}
                  </span>
                </div>
              )}

              {/* Botón inferior "Ver promo" con pildorita sutil */}
              <div className="self-start mt-auto">
                <span className="inline-block text-[11px] font-extrabold text-white bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-xl shadow-xs">
                  {banner.subtitulo || 'Ver promo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
