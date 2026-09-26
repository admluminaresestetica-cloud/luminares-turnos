'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useConfig } from '@/context/ConfigContext';
import { Sparkles, ShieldCheck, Clock, HelpCircle, ChevronRight } from 'lucide-react';

import HeaderBusqueda from '@/components/Home/HeaderBusqueda';
import AccionesRapidas from '@/components/Home/AccionesRapidas';
import CategoriasRapidas from '@/components/Home/CategoriasRapidas';
import BannersCarousel from '@/components/Home/BannersCarousel';
import GuiaReservaCard from '@/components/Home/GuiaReservaCard';
import ServiciosDestacados from '@/components/Home/ServiciosDestacados';

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
    <div className="min-h-screen bg-gradient-to-b from-[#2d4030]/15 via-[#f4f6f4] to-[#eef2ee] dark:from-zinc-950 dark:via-[#1a261d]/30 dark:to-zinc-950 transition-colors relative">
      <main className="relative z-10 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto min-h-screen pb-28 md:pb-12 pt-0 md:pt-4 px-0 sm:px-6 text-stone-800 dark:text-zinc-100 transition-all duration-300 space-y-6">

        {/* 1. Bloque Superior Unificado (Buscador + Accesos Directos Arriba estilo Despegar) */}
        <section className="bg-[#2d4030] dark:bg-zinc-900 px-4 pt-4 pb-6 rounded-b-[2.5rem] md:rounded-3xl shadow-xl shadow-[#2d4030]/10 space-y-4">
          <HeaderBusqueda nombreEmpresa={nombreEmpresa} />
          <AccionesRapidas />
        </section>

        {/* Contenedor con padding lateral para el resto del contenido */}
        <div className="px-4 sm:px-0 space-y-6">

          {/* 2. Grilla Principal Responsiva */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Columna Izquierda */}
            <div className="lg:col-span-7 space-y-6">
              <section className="space-y-2">
                <CategoriasRapidas />
              </section>

              <ServiciosDestacados />

              {/* Banners Promocionales */}
              <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black tracking-wider text-stone-500 uppercase dark:text-zinc-400">
                    Novedades & Ofertas
                  </h2>
                </div>

                <BannersCarousel banners={banners} isLoading={loadingBanners} />
              </section>
            </div>

            {/* Columna Derecha */}
            <div className="lg:col-span-5 space-y-6">
              <section className="space-y-2">
                <GuiaReservaCard />
              </section>

              {/* Bloque de Beneficios */}
              <section className="bg-white/90 dark:bg-zinc-900/60 backdrop-blur-md border border-[#2d4030]/10 dark:border-zinc-800 rounded-3xl p-4 space-y-3 shadow-xl shadow-[#2d4030]/5">
                <h3 className="text-[11px] font-black text-stone-400 dark:text-zinc-400 uppercase tracking-wider px-1">
                  ¿Por qué elegirnos?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 text-xs text-stone-600 dark:text-zinc-400">
                  <div className="flex items-center gap-3 bg-stone-50/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-[#2d4030]/5 dark:border-zinc-700/50 hover:bg-white transition-colors">
                    <div className="p-2.5 rounded-xl bg-[#2d4030]/10 text-[#3b533f] dark:text-[#a3be8c] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Reserva 24/7</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Elegí tu turno en cualquier momento.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-stone-50/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-[#2d4030]/5 dark:border-zinc-700/50 hover:bg-white transition-colors">
                    <div className="p-2.5 rounded-xl bg-[#2d4030]/10 text-[#3b533f] dark:text-[#a3be8c] shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Confirmación Inmediata</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Gestión directa sin esperas.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-stone-50/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-[#2d4030]/5 dark:border-zinc-700/50 hover:bg-white transition-colors">
                    <div className="p-2.5 rounded-xl bg-[#2d4030]/10 text-[#3b533f] dark:text-[#a3be8c] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Atención Garantizada</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Profesionales calificados.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tarjeta de acceso a FAQ */}
              <section className="pt-1">
                <Link
                  href="/faq"
                  className="w-full bg-white/90 dark:bg-zinc-900/80 border border-[#2d4030]/10 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:bg-white dark:hover:bg-zinc-900 transition-all text-left shadow-lg shadow-[#2d4030]/5 active:scale-[0.99] group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#2d4030]/10 text-[#3b533f] dark:text-[#a3be8c]">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-zinc-200">¿Tenés alguna duda sobre tu turno?</p>
                      <p className="text-[10px] text-stone-500 dark:text-zinc-400">Consultá las preguntas frecuentes</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </section>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

