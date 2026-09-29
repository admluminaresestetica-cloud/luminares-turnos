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
import InstallPrompt from '@/components/Home/InstallPrompt';

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

  // Estado: solo true si está bien arriba
  const [isAtTop, setIsAtTop] = useState(true);

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

  // Control estricto: Desplegado SOLO si está en el tope superior (<= 10px)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY <= 10) {
        setIsAtTop(true);
      } else {
        setIsAtTop(false);
      }
    };

    // Ejecutar al inicio para verificar la posición inicial
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--primary))]/5 via-stone-50 to-stone-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 transition-colors relative">
      <main className="relative z-10 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto min-h-screen pb-28 md:pb-12 pt-0 md:pt-4 px-0 sm:px-6 text-stone-800 dark:text-zinc-100 space-y-6">

        {/* ENCABEZADO FIJO DE ALTURA DINÁMICA SUAVE */}
        <div className="sticky top-0 z-30 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-md pt-2 pb-1">
          <div className="shadow-xl shadow-stone-900/10 rounded-3xl overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary))]/90 to-[hsl(var(--primary))]/80 dark:from-[hsl(var(--primary))]/90 dark:to-zinc-900 transition-all duration-300">
            
            {/* 1. Buscador: Siempre visible */}
            <div className="px-4 pt-4 pb-3">
              <HeaderBusqueda nombreEmpresa={nombreEmpresa} />
            </div>

            {/* 2. Botón y Acciones Rápidas: Solo se despliega bien arriba */}
            <div
              className={`grid transition-all duration-300 ease-in-out px-4 ${
                isAtTop
                  ? 'grid-rows-[1fr] opacity-100 pb-5 pointer-events-auto'
                  : 'grid-rows-[0fr] opacity-0 pb-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <AccionesRapidas />
              </div>
            </div>

          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="px-4 sm:px-0 space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            <div className="lg:col-span-7 space-y-6">
              <section className="space-y-2">
                <CategoriasRapidas />
              </section>

              <ServiciosDestacados />

              <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black tracking-wider text-stone-500 uppercase dark:text-zinc-400">
                    Novedades & Ofertas
                  </h2>
                </div>

                <BannersCarousel banners={banners} isLoading={loadingBanners} />
              </section>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <section className="space-y-2">
                <GuiaReservaCard />
              </section>

              <section className="bg-white/90 dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200/60 dark:border-zinc-800 rounded-3xl p-4 space-y-3 shadow-xl shadow-stone-900/5">
                <h3 className="text-[11px] font-black text-stone-400 dark:text-zinc-400 uppercase tracking-wider px-1">
                  ¿Por qué elegirnos?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 text-xs text-stone-600 dark:text-zinc-400">
                  <div className="flex items-center gap-3 bg-stone-50/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-stone-200/40 dark:border-zinc-700/50 hover:bg-white transition-colors">
                    <div className="p-2.5 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Reserva 24/7</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Elegí tu turno en cualquier momento.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-stone-50/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-stone-200/40 dark:border-zinc-700/50 hover:bg-white transition-colors">
                    <div className="p-2.5 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Confirmación Inmediata</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Gestión directa sin esperas.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-stone-50/80 dark:bg-zinc-800/80 p-3 rounded-2xl border border-stone-200/40 dark:border-zinc-700/50 hover:bg-white transition-colors">
                    <div className="p-2.5 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 dark:text-zinc-100 text-xs">Atención Garantizada</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Profesionales calificados.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-1">
                <Link
                  href="/faq"
                  className="w-full bg-white/90 dark:bg-zinc-900/80 border border-stone-200/60 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:bg-white dark:hover:bg-zinc-900 transition-all text-left shadow-lg shadow-stone-900/5 active:scale-[0.99] group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20">
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

      <InstallPrompt />
    </div>
  );
}