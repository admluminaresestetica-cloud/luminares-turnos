'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import HeaderBusqueda from '@/components/home/HeaderBusqueda';
import AccionesRapidas from '@/components/home/AccionesRapidas';
import CategoriasRapidas from '@/components/home/CategoriasRapidas';
import BannersCarousel from '@/components/home/BannersCarousel';
import GuiaReservaCard from '@/components/home/GuiaReservaCard';

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
      <main className="max-w-md md:max-w-3xl lg:max-w-6xl mx-auto min-h-screen pb-28 md:pb-12 pt-3 md:pt-8 px-4 sm:px-6 text-stone-800 dark:text-zinc-100 transition-all duration-300">
        
        {/* 1. Header y Búsqueda (Ancho completo) */}
        <section className="mb-6 md:mb-8">
          <HeaderBusqueda nombreEmpresa="Luminares Estética" />
        </section>

        {/* Layout en Escritorio: 2 Columnas (lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Columna Izquierda (Acciones principales + Categorías) */}
          <div className="lg:col-span-7 space-y-6">
            <section className="relative">
              <AccionesRapidas />
            </section>

            <section className="space-y-2">
              <CategoriasRapidas />
            </section>
          </div>

          {/* Columna Derecha (Promociones + Guías) */}
          <div className="lg:col-span-5 space-y-6">
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black tracking-wider text-stone-600 uppercase dark:text-zinc-400">
                  Novedades & Ofertas
                </h2>
              </div>
              <BannersCarousel banners={banners} isLoading={loadingBanners} />
            </section>

            <section className="space-y-2">
              <GuiaReservaCard />
            </section>
          </div>

        </div>

      </main>
    </div>
  );
}
