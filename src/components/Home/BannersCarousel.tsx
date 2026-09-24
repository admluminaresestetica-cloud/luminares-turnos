'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  imagen_url: string;
  boton_texto?: string;
  link_url?: string;
  cupon_codigo?: string;
}

export default function BannersCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarBanners() {
      try {
        const { data, error } = await supabase
          .from('banners_home')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setBanners(data);
        } else {
          // Banner por defecto si aún no hay registros cargados en Supabase
          setBanners([
            {
              id: 'demo-1',
              titulo: '15% OFF en Tratamientos Laser',
              subtitulo: 'Aprovechá la promoción de este mes',
              imagen_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
              cupon_codigo: 'LUMINARES15',
              link_url: '/turnos',
            },
          ]);
        }
      } catch (err) {
        console.error('Error al cargar banners:', err);
        // Fallback en caso de error de conexión
        setBanners([
          {
            id: 'demo-1',
            titulo: '15% OFF en Tratamientos Laser',
            subtitulo: 'Aprovechá la promoción de este mes',
            imagen_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
            cupon_codigo: 'LUMINARES15',
            link_url: '/turnos',
          },
        ]);
      } finally {
        setCargando(false);
      }
    }

    cargarBanners();
  }, []);

  if (cargando) {
    return (
      <div className="w-full h-44 rounded-3xl bg-slate-100 animate-pulse flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-400">Cargando promociones...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="relative w-full overflow-hidden rounded-3xl bg-slate-900 text-white shadow-md"
        >
          {/* Tag img nativo de HTML para evitar restricciones de dominios/peso en celular */}
          <img
            src={banner.imagen_url}
            alt={banner.titulo}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />

          <div className="relative z-10 p-5 flex flex-col justify-between min-h-[170px]">
            <div className="space-y-1">
              {banner.cupon_codigo && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
                  <Sparkles className="w-3 h-3" /> Cupón: {banner.cupon_codigo}
                </span>
              )}
              <h3 className="text-lg font-black leading-tight max-w-[220px] pt-1">
                {banner.titulo}
              </h3>
              {banner.subtitulo && (
                <p className="text-xs text-slate-200 font-medium max-w-[220px]">
                  {banner.subtitulo}
                </p>
              )}
            </div>

            {banner.link_url && (
              <a
                href={banner.link_url}
                className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-full shadow-sm hover:bg-slate-100 active:scale-95 transition-all mt-2"
              >
                Ver Promos
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
