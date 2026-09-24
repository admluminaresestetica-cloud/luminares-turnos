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
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-stone-800 dark:text-zinc-100 pb-24 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* 1. Saludo y Búsqueda */}
      <HeaderBusqueda
        nombreEmpresa="Luminares Estética"
        onSearchChange={() => {}}
      />

      {/* 2. Botón Principal (Agendar Turno) */}
      <AccionesRapidas />

      {/* 3. Categorías Rápidas */}
      <CategoriasRapidas />

      {/* 4. Banners Promocionales (Ubicados abajo) */}
      <BannersCarousel banners={banners} isLoading={loadingBanners} />

      {/* 5. Guías de Reserva y Consulta */}
      <GuiaReservaCard />
    </main>
  );
}
