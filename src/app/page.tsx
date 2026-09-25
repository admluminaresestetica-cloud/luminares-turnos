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
    <div className="min-h-screen bg-[#e8eee9] dark:bg-zinc-950 transition-colors">
      <main className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto min-h-screen pb-28 md:pb-12 pt-3 md:pt-8 px-4 sm:px-6 text-stone-800 dark:text-zinc-100 transition-all duration-300 space-y-6">
        
        {/* 1. Header y Búsqueda */}
        <section>
          <HeaderBusqueda nombreEmpresa={nombreEmpresa} />
        </section>

        {/* 2. Grilla Principal Responsiva */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Columna Izquierda */}
          <div className="lg:col-span-7 space-y-6">
            <section className="relative">
              <AccionesRapidas />
            </section>

            <section className="space-y-2">
              <CategoriasRapidas />
            </section>

            <ServiciosDestacados />

            {/* Banners Promocionales (sin enlace redundante arriba) */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black tracking-wider text-stone-600 uppercase dark:text-zinc-400">
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
            <section className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-stone-200/80 dark:border-zinc-800 rounded-3xl p-4 space-y-3 shadow-2xs">
              <h3 className="text-[11px] font-black text-stone-500 dark:text-zinc-400 uppercase tracking-wider px-1">
                ¿Por qué elegirnos?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 text-xs text-stone-600 dark:text-zinc-400">
                <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-stone-100 dark:border-zinc-700/50">
                  <div className="p-2 rounded-xl bg-[#a3c9b8]/20 text-[#2d5747] dark:text-[#a3c9b8] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Reserva 24/7</p>
                    <p className="text-[10px] text-stone-500 leading-tight">Elegí tu turno en cualquier momento.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-stone-100 dark:border-zinc-700/50">
                  <div className="p-2 rounded-xl bg-[#a3c9b8]/20 text-[#2d5747] dark:text-[#a3c9b8] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Confirmación Inmediata</p>
                    <p className="text-[10px] text-stone-500 leading-tight">Gestión directa sin esperas.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-stone-100 dark:border-zinc-700/50">
                  <div className="p-2 rounded-xl bg-[#a3c9b8]/20 text-[#2d5747] dark:text-[#a3c9b8] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Atención Garantizada</p>
                    <p className="text-[10px] text-stone-500 leading-tight">Profesionales calificados.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tarjeta única de acceso a FAQ (Visible en Celular y PC) */}
            <section className="pt-1">
              <Link
                href="/faq"
                className="w-full bg-white/80 dark:bg-zinc-900/80 border border-stone-200/90 dark:border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between hover:bg-white dark:hover:bg-zinc-900 transition-all text-left shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800 dark:text-zinc-200">¿Tenés alguna duda sobre tu turno?</p>
                    <p className="text-[10px] text-stone-500 dark:text-zinc-400">Consultá las preguntas frecuentes</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </section>

          </div>

        </div>

      </main>
    </div>
  );
}