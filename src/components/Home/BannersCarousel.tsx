'use client';

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
            className="snap-center shrink-0 w-[88%] first:ml-0 rounded-3xl overflow-hidden relative shadow-xs border border-stone-200/80 dark:border-zinc-800 aspect-[21/9]"
          >
            {/* Imagen 100% limpia sin capas verdes ni sombreados por encima */}
            <img
              src={banner.imagen_url}
              alt={banner.titulo || 'Banner promocional'}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
