'use client';

import HeaderBusqueda from '@/components/Home/HeaderBusqueda';
import AccionesRapidas from '@/components/Home/AccionesRapidas';
import CategoriasRapidas from '@/components/Home/CategoriasRapidas';
import BannersCarousel from '@/components/Home/BannersCarousel';
import BottomNav from '@/components/Home/BottomNav';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white pb-24 pt-4 px-4 font-sans selection:bg-emerald-100">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header con Logo y Buscador */}
        <HeaderBusqueda />

        {/* Fila de Accesos Redondos */}
        <AccionesRapidas />

        {/* Tarjetas de Guía e Información */}
        <CategoriasRapidas />

        {/* Carrusel de Banners Dinámicos */}
        <BannersCarousel />
      </div>

      {/* Menú de Navegación Inferior Limpio */}
      <BottomNav />
    </main>
  );
}
