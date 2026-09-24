'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Componentes modulares de la Etapa 2
import HeaderBusqueda from '@/components/Home/HeaderBusqueda';
import BannersCarousel from '@/components/Home/BannersCarousel';
import AccionesRapidas from '@/components/Home/AccionesRapidas';
import CategoriasRapidas from '@/components/Home/CategoriasRapidas';
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
  const [searchTerm, setSearchTerm] = useState('');

  // Consulta dinámica a Supabase para cargar Banners activos
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
      {/* 1. Header de Búsqueda y Saludo */}
      <HeaderBusqueda
        nombreEmpresa="Luminares Estética"
        onSearchChange={(term) => setSearchTerm(term)}
      />

      {/* 2. Banners Dinámicos de Supabase */}
      <BannersCarousel banners={banners} isLoading={loadingBanners} />

      {/* 3. Acción Principal (Agendar Turno) */}
      <AccionesRapidas />

      {/* 4. Categorías Rápidas */}
      <CategoriasRapidas />

      {/* 5. Guías de Reserva y Consulta */}
      <GuiaReservaCard />
    </main>
  );
}
