'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BannerModalItem {
  id: string;
  imagen_url: string;
  titulo?: string;
  subtitulo?: string;
  link_destino?: string;
  activo: boolean;
  orden?: number;
}

const MAX_VISITAS = 5; // Límite de veces que se mostrará por usuario

export default function BannerModal() {
  const [banners, setBanners] = useState<BannerModalItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarBannersModal() {
      try {
        // Controlar cuántas veces vio el modal usando localStorage
        const vecesVistoStr = localStorage.getItem('banner_modal_contador');
        const vecesVisto = vecesVistoStr ? parseInt(vecesVistoStr, 10) : 0;

        if (vecesVisto >= MAX_VISITAS) {
          setLoading(false);
          return;
        }

        // Consultar TODOS los banners activos ordenados
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (!error && data && data.length > 0) {
          setBanners(data);
          setVisible(true);

          // Incrementar el contador en localStorage
          localStorage.setItem('banner_modal_contador', (vecesVisto + 1).toString());
        }
      } catch (err) {
        console.error('Error cargando banners modales:', err);
      } finally {
        setLoading(false);
      }
    }

    cargarBannersModal();
  }, []);

  const cerrarModal = () => {
    setVisible(false);
  };

  const siguienteBanner = () => {
    if (currentIndex < banners.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Volver al primero si llega al final
    }
  };

  const anteriorBanner = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(banners.length - 1); // Ir al último si está en el primero
    }
  };

  if (loading || !visible || banners.length === 0) return null;

  const bannerActual = banners[currentIndex];

  const esVideo = (url: string) => {
    if (!url) return false;
    const urlLimpia = url.split('?')[0].toLowerCase();
    return urlLimpia.endsWith('.mp4') || urlLimpia.endsWith('.webm') || urlLimpia.endsWith('.mov');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      {/* Contenedor principal adaptado para celulares y con espacio para la barra inferior */}
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[75vh] sm:max-h-[85vh] overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl border border-zinc-800 transition-all flex flex-col mb-20 sm:mb-0">
        
        {/* Botón de cierre superior */}
        <button
          onClick={cerrarModal}
          className="absolute top-3 right-3 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Zona multimedia con controles de carrusel (si hay más de 1 banner) */}
        <div className="relative w-full max-h-[45vh] sm:max-h-[60vh] flex items-center justify-center bg-black overflow-hidden group">
          {esVideo(bannerActual.imagen_url) ? (
            <video
              key={bannerActual.id}
              src={bannerActual.imagen_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto max-h-[45vh] sm:max-h-[60vh] object-contain"
            />
          ) : (
            <img
              key={bannerActual.id}
              src={bannerActual.imagen_url}
              alt={bannerActual.titulo || 'Promoción destacado'}
              className="w-full h-auto max-h-[45vh] sm:max-h-[60vh] object-contain"
            />
          )}

          {/* Flechas de navegación (solo se muestran si hay más de 1 banner) */}
          {banners.length > 1 && (
            <>
              <button
                onClick={anteriorBanner}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={siguienteBanner}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicadores de puntos (Paginación) */}
          {banners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              {banners.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-4 bg-rose-500' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Franja inferior con textos y botón */}
        <div className="bg-zinc-900 p-3 sm:p-4 flex flex-col space-y-2 border-t border-zinc-800 shrink-0">
          {bannerActual.titulo && (
            <h3 className="text-sm sm:text-base font-black text-white leading-tight">
              {bannerActual.titulo}
            </h3>
          )}
          
          {bannerActual.subtitulo && (
            <p className="text-[11px] text-zinc-400 font-medium">
              {bannerActual.subtitulo}
            </p>
          )}

          {bannerActual.link_destino ? (
            <a
              href={bannerActual.link_destino}
              onClick={cerrarModal}
              className="w-full text-center rounded-xl bg-rose-500 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              Ver Promoción
            </a>
          ) : (
            <button
              onClick={cerrarModal}
              className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2 text-xs font-bold text-white transition-colors cursor-pointer border border-zinc-700/60"
            >
              Entendido
            </button>
          )}
        </div>

      </div>
    </div>
  );
}