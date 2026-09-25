'use client';

import Link from 'next/link';

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
      {/* Contenedor con desplazamiento horizontal fluido hacia la derecha y soporte táctil */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 -mx-4 px-4 pb-2 pt-1 touch-pan-x">
        {banners.map((banner) => {
          const Content = (
            <div className="w-full h-full relative group">
              {/* Imagen limpia sin filtros */}
              <img
                src={banner.imagen_url}
                alt={banner.titulo || 'Banner promocional'}
                className="w-full h-full object-cover"
              />

              {/* Elementos flotantes con acento rojo/coral elegante */}
              <div className="absolute inset-0 p-3.5 flex flex-col justify-between pointer-events-none">
                {banner.titulo && (
                  <div className="self-start">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-stone-900/85 backdrop-blur-md text-rose-400 text-[10px] font-black tracking-wider uppercase shadow-md border border-rose-500/20">
                      {banner.titulo}
                    </span>
                  </div>
                )}

                <div className="self-start mt-auto">
                  <span className="inline-block text-[11px] font-extrabold text-white bg-rose-600 backdrop-blur-md px-3.5 py-1 rounded-xl shadow-md">
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
              className="snap-center shrink-0 w-[88%] first:ml-0 rounded-3xl overflow-hidden relative shadow-md shadow-rose-950/5 border border-stone-200/80 dark:border-zinc-800 aspect-[21/9] block active:scale-[0.98] transition-transform cursor-pointer"
            >
              {Content}
            </Link>
          ) : (
            <div
              key={banner.id}
              className="snap-center shrink-0 w-[88%] first:ml-0 rounded-3xl overflow-hidden relative shadow-md shadow-rose-950/5 border border-stone-200/80 dark:border-zinc-800 aspect-[21/9]"
            >
              {Content}
            </div>
          );
        })}
      </div>
    </div>
  );
}