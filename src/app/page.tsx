'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useConfig } from '@/context/ConfigContext';

import HeaderBusqueda from '@/components/Home/HeaderBusqueda';
import AccionesRapidas from '@/components/Home/AccionesRapidas';
import CategoriasRapidas from '@/components/Home/CategoriasRapidas';
import BannersCarousel from '@/components/Home/BannersCarousel';
import GuiaReservaCard from '@/components/Home/GuiaReservaCard';

interface Banner {
  id: string;
  titulo?: string;
  subtitulo?: string;
  imagen_url: string;
  link_destino?: string;
  activo: boolean;
  orden?: number;
}

export default function HomePage() {
  const { config } = useConfig();
  const nombreEmpresa = config?.nombre_empresa || 'Nuestro Centro';

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const { data, error } = await supabase
          .from('banners_home')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (error) {
          console.error('Error al cargar banners desde Supabase:', error);
        } else if (data) {
          setBanners(data);
        }
      } catch (err) {
        console.error('Error inesperado cargando banners:', err);
      } finally {
        setLoadingBanners(false);
      }
    }

    fetchBanners();
  }, []);

  return (
    <div className="min-h-screen bg-[#e8eee9] dark:bg-zinc-950 transition-colors">
      <main className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto min-h-screen pb-28 md:pb-12 pt-3 md:pt-8 px-4 sm:px-6 text-stone-800 dark:text-zinc-100 transition-all duration-300 space-y-6">
        
        {/* 1. Header y Búsqueda */}
        <section>
          <HeaderBusqueda nombreEmpresa={nombreEmpresa} />
        </section>

        {/* 2. Grilla Principal Responsiva */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Columna Izquierda: Botón principal, Categorías y Banners */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Acciones Rápidas (Agendar Turno) */}
            <section className="relative">
              <AccionesRapidas />
            </section>

            {/* Categorías Rápidas */}
            <section className="space-y-2">
              <CategoriasRapidas />
            </section>

            {/* Banners Promocionales (Debajo de Categorías) */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black tracking-wider text-stone-600 uppercase dark:text-zinc-400">
                  Novedades & Ofertas
                </h2>
              </div>
              <BannersCarousel banners={banners} isLoading={loadingBanners} />
            </section>

            {/* Bloque Neutro de Beneficios de Reserva (Sello Marca Blanca) */}
            <section className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-stone-200/80 dark:border-zinc-800 rounded-3xl p-5 space-y-3 shadow-sm hidden md:block">
              <h3 className="text-xs font-bold text-stone-600 dark:text-zinc-300 uppercase tracking-wider">
                ¿Por qué elegirnos?
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs text-stone-600 dark:text-zinc-400">
                <div className="bg-white/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-stone-100 dark:border-zinc-700/50">
                  <p className="font-semibold text-stone-800 dark:text-zinc-100">Reserva 24/7</p>
                  <p className="text-[11px] text-stone-500 mt-1">Elegí tu turno en cualquier momento.</p>
                </div>
                <div className="bg-white/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-stone-100 dark:border-zinc-700/50">
                  <p className="font-semibold text-stone-800 dark:text-zinc-100">Confirmación Inmediata</p>
                  <p className="text-[11px] text-stone-500 mt-1">Gestión directa de tu cita.</p>
                </div>
                <div className="bg-white/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-stone-100 dark:border-zinc-700/50">
                  <p className="font-semibold text-stone-800 dark:text-zinc-100">Atención Garantizada</p>
                  <p className="text-[11px] text-stone-500 mt-1">Profesionales calificados a tu disposición.</p>
                </div>
              </div>
            </section>

          </div>

          {/* Columna Derecha: Guías y Consultas de Turno */}
          <div className="lg:col-span-5 space-y-6">
            <section className="space-y-2">
              <GuiaReservaCard />
            </section>
          </div>

        </div>

      </main>
    </div>
  );
}
