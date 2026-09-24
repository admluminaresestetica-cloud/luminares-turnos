'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
    <div className="min-h-screen bg-[#f4f7f5] dark:bg-zinc-950 transition-colors">
      <main className="max-w-md mx-auto min-h-screen pb-28 pt-3 px-4 space-y-6 text-stone-800 dark:text-zinc-100">
        
        {/* 1. Saludo y Búsqueda */}
        <section className="space-y-1">
          <HeaderBusqueda
            nombreEmpresa="Luminares Estética"
            onSearchChange={() => {}}
          />
        </section>

        {/* 2. Botón Principal (Agendar Turno) */}
        <section className="relative">
          <AccionesRapidas />
        </section>

        {/* 3. Categorías Rápidas */}
        <section className="space-y-2">
          <CategoriasRapidas />
        </section>

        {/* 4. Banners Promocionales */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black tracking-wider text-stone-500 uppercase dark:text-zinc-400">
              Novedades & Ofertas
            </h2>
          </div>
          <BannersCarousel banners={banners} isLoading={loadingBanners} />
        </section>

        {/* 5. Guías de Reserva y Consulta */}
        <section className="space-y-2">
          <GuiaReservaCard />
        </section>

      </main>
    </div>
  );
}
