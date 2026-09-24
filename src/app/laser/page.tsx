'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Zap } from 'lucide-react';
import SelectorGenero from '@/components/laser/SelectorGenero';
import SelectorModoLaser from '@/components/laser/SelectorModoLaser';
import PanelPromos from '@/components/laser/PanelPromos';
import PanelZonasIndividuales from '@/components/laser/PanelZonasIndividuales';
import PanelZonasExtra from '@/components/laser/PanelZonasExtra';
import BannerSugerenciaPromo from '@/components/laser/BannerSugerenciaPromo';
import ModalSwapZona from '@/components/laser/ModalSwapZona';
import BarraFlotanteLaser from '@/components/laser/BarraFlotanteLaser';
import {
  calcularTotalesPromo,
  calcularTotalesZonasIndividuales,
  detectarPromoConAhorro,
  getZonaById,
  getZonasPromoResueltas,
  getZonasSwapDisponibles,
  type ModoLaser,
  type SwapsMap,
} from '@/lib/laser/calculos';
import { getPromosLaser, getServiciosLaser } from '@/lib/supabase/laser';
import type { GeneroLaser, PromoLaser, ServicioLaser } from '@/lib/types';

const STORAGE_KEY = 'laser-seleccion';

function LaserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parámetros opcionales enviados desde el buscador o links directos
  const generoQuery = searchParams.get('genero');
  const promoQuery = searchParams.get('promo');
  const zonaQuery = searchParams.get('zona');

  const [genero, setGenero] = useState<GeneroLaser | null>(null);
  const [modo, setModo] = useState<ModoLaser>('promo');
  const [zonas, setZonas] = useState<ServicioLaser[]>([]);
  const [promos, setPromos] = useState<PromoLaser[]>([]);
  const [cargando, setCargando] = useState(false);

  const [promoSeleccionada, setPromoSeleccionada] = useState<PromoLaser | null>(null);
  const [swaps, setSwaps] = useState<SwapsMap>({});
  const [zonasExtraIds, setZonasExtraIds] = useState<string[]>([]);
  const [zonasIndividualesIds, setZonasIndividualesIds] = useState<string[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [swapModalZonaId, setSwapModalZonaId] = useState<string | null>(null);

  const resetSeleccion = useCallback(() => {
    setPromoSeleccionada(null);
    setSwaps({});
    setZonasExtraIds([]);
    setZonasIndividualesIds([]);
    setBannerDismissed(false);
    setSwapModalZonaId(null);
  }, []);

  const handleGenero = (g: GeneroLaser) => {
    if (g !== genero) {
      setGenero(g);
      resetSeleccion();
      setModo('promo');
    }
  };

  // 🎯 1. Auto-selección inicial de género si viene indicado por la URL o si se busca zona/promo
  useEffect(() => {
    if (generoQuery) {
      const g = generoQuery.toLowerCase().trim();
      if (g === 'femenino' || g === 'masculino') {
        setGenero(g as GeneroLaser);
        return;
      }
    }
    if ((promoQuery || zonaQuery) && !genero) {
      setGenero('femenino');
    }
  }, [generoQuery, promoQuery, zonaQuery, genero]);

  // Carga las zonas y promos cuando se define el género
  useEffect(() => {
    if (!genero) return;

    async function cargar() {
      setCargando(true);
      const [z, p] = await Promise.all([getServiciosLaser(genero!), getPromosLaser(genero!)]);
      setZonas(z);
      setPromos(p);
      setCargando(false);
    }
    cargar();
  }, [genero]);

  // 🎯 2. Auto-selección inteligente de Promo o Zona Individual una vez cargados los datos
  useEffect(() => {
    if (!cargando && genero) {
      if (promoQuery && promos.length > 0) {
        const pq = promoQuery.toLowerCase().trim();
        const promoEncontrada = promos.find(
          (p) =>
            p.nombre_promo.toLowerCase().trim() === pq ||
            p.nombre_promo.toLowerCase().includes(pq)
        );

        if (promoEncontrada) {
          setModo('promo');
          setPromoSeleccionada(promoEncontrada);
          return;
        }
      }

      if (zonaQuery && zonas.length > 0) {
        const zq = zonaQuery.toLowerCase().trim();
        const zonaEncontrada = zonas.find(
          (z) =>
            z.nombre_zona.toLowerCase().trim() === zq ||
            z.nombre_zona.toLowerCase().includes(zq)
        );

        if (zonaEncontrada) {
          setModo('zonas');
          setZonasIndividualesIds([zonaEncontrada.id]);
        }
      }
    }
  }, [cargando, genero, promos, zonas, promoQuery, zonaQuery]);

  const handleModoChange = (nuevoModo: ModoLaser) => {
    setModo(nuevoModo);
    resetSeleccion();
  };

  const toggleZonaIndividual = (zonaId: string) => {
    setZonasIndividualesIds((prev) =>
      prev.includes(zonaId) ? prev.filter((id) => id !== zonaId) : [...prev, zonaId]
    );
    setBannerDismissed(false);
  };

  const toggleZonaExtra = (zonaId: string) => {
    setZonasExtraIds((prev) =>
      prev.includes(zonaId) ? prev.filter((id) => id !== zonaId) : [...prev, zonaId]
    );
  };

  const handleSelectPromo = (promo: PromoLaser | null) => {
    setPromoSeleccionada(promo);
    setSwaps({});
    setZonasExtraIds([]);
  };

  const sugerenciaPromo = useMemo(() => {
    if (modo !== 'zonas' || bannerDismissed || zonasIndividualesIds.length === 0) return null;
    return detectarPromoConAhorro(zonasIndividualesIds, zonas, promos);
  }, [modo, bannerDismissed, zonasIndividualesIds, zonas, promos]);

  const totales = useMemo(() => {
    if (modo === 'promo' && promoSeleccionada) {
      return calcularTotalesPromo(promoSeleccionada, zonas, swaps, zonasExtraIds);
    }
    if (modo === 'zonas' && zonasIndividualesIds.length > 0) {
      return calcularTotalesZonasIndividuales(zonasIndividualesIds, zonas);
    }
    return { precio: 0, duracion: 0, modo: 'zonas_individuales' as const };
  }, [modo, promoSeleccionada, zonas, swaps, zonasExtraIds, zonasIndividualesIds]);

  const detalleBarra = useMemo(() => {
    if (modo === 'promo' && promoSeleccionada) {
      const zonasNombres = getZonasPromoResueltas(promoSeleccionada, zonas, swaps)
        .map((z) => z.nombre_zona);

      const extras = zonasExtraIds
        .map((id) => getZonaById(zonas, id)?.nombre_zona)
        .filter((n): n is string => Boolean(n));

      const zonasTexto = zonasNombres.length > 0 ? ` (${zonasNombres.join(' + ')})` : '';
      const extrasTexto = extras.length > 0 ? ` + ${extras.join(', ')}` : '';

      return `${promoSeleccionada.nombre_promo}${zonasTexto}${extrasTexto}`;
    }
    if (modo === 'zonas') {
      return zonasIndividualesIds
        .map((id) => getZonaById(zonas, id)?.nombre_zona)
        .filter(Boolean)
        .join(' · ');
    }
    return '';
  }, [modo, promoSeleccionada, zonas, swaps, zonasExtraIds, zonasIndividualesIds]);

  const puedeContinuar =
    (modo === 'promo' && promoSeleccionada !== null) ||
    (modo === 'zonas' && zonasIndividualesIds.length > 0);

  const zonasPromoActivas = useMemo(() => {
    if (!promoSeleccionada) return [];
    return getZonasPromoResueltas(promoSeleccionada, zonas, swaps).map((z) => z.id);
  }, [promoSeleccionada, zonas, swaps]);

  const zonaSwapOriginal = swapModalZonaId ? getZonaById(zonas, swapModalZonaId) : undefined;
  const opcionesSwap =
    zonaSwapOriginal && promoSeleccionada
      ? getZonasSwapDisponibles(zonaSwapOriginal, zonas, [
          ...promoSeleccionada.zonas_incluidas,
          ...Object.values(swaps),
          ...zonasExtraIds,
        ])
      : [];

  const handleContinuar = () => {
    if (!genero || !puedeContinuar) return;

    const payload = {
      genero,
      modo: totales.modo,
      promo_id: promoSeleccionada?.id,
      swaps,
      zonas_ids:
        modo === 'promo' && promoSeleccionada
          ? [...zonasPromoActivas, ...zonasExtraIds]
          : zonasIndividualesIds,
      zonas_extra_ids: zonasExtraIds,
      precio_total: totales.precio,
      duracion_total: totales.duracion,
      detalle_texto: detalleBarra,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    router.push('/laser/agenda');
  };

  const handleAplicarPromo = () => {
    if (!sugerenciaPromo) return;
    setModo('promo');
    setPromoSeleccionada(sugerenciaPromo.promo);
    setZonasIndividualesIds([]);
    setBannerDismissed(true);
  };

  return (
    <main className="min-h-screen bg-[#edf0ec] dark:bg-zinc-950 flex flex-col items-center justify-start p-4 sm:p-6 pb-36 font-sans">
      <div className="max-w-md sm:max-w-2xl w-full space-y-4">

        {/* Volver */}
        <div className="w-full flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 px-3.5 py-2 rounded-2xl shadow-xs hover:text-stone-900 dark:hover:text-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Header estilo Card Verde del Inicio */}
        <header className="bg-[#1c352a] text-white rounded-[26px] p-5 sm:p-6 shadow-md relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span className="text-[10px] font-black tracking-[0.18em] uppercase text-emerald-200">
                Reserva Online
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Depilación Láser
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium mt-1">
              {!genero
                ? 'Paso 1: Seleccioná tu perfil (Femenino o Masculino)'
                : 'Paso 2: Elegí combos en promo o zonas individuales'}
            </p>
          </div>
        </header>

        {/* Paso 1: Género */}
        <section className="bg-white/90 dark:bg-zinc-900 backdrop-blur-sm border border-stone-200/80 dark:border-zinc-800 rounded-[24px] p-4 sm:p-5 shadow-xs space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-zinc-400">
            ¿Para quién es el turno?
          </h2>
          <SelectorGenero genero={genero} onSelect={handleGenero} />
        </section>

        {/* Paso 2: Selección de servicios */}
        {genero && (
          <section className="space-y-4 animate-in fade-in duration-200">
            {cargando ? (
              <div className="bg-white/90 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 rounded-[24px] p-8 text-center shadow-xs">
                <div className="w-6 h-6 border-2 border-[#1c352a] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-500 dark:text-zinc-400">Cargando opciones disponibles...</p>
              </div>
            ) : (
              <>
                <div className="bg-white/90 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 rounded-[24px] p-3 shadow-xs">
                  <SelectorModoLaser modo={modo} onChange={handleModoChange} />
                </div>

                <div className="space-y-3">
                  {modo === 'promo' ? (
                    <>
                      <PanelPromos
                        promos={promos}
                        zonas={zonas}
                        promoSeleccionada={promoSeleccionada}
                        swaps={swaps}
                        onSelectPromo={handleSelectPromo}
                        onSwapClick={setSwapModalZonaId}
                      />
                      {promoSeleccionada && (
                        <PanelZonasExtra
                          zonas={zonas}
                          zonasPromoIds={zonasPromoActivas}
                          zonasExtraIds={zonasExtraIds}
                          onToggleExtra={toggleZonaExtra}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {sugerenciaPromo && (
                        <BannerSugerenciaPromo
                          promo={sugerenciaPromo.promo}
                          ahorro={sugerenciaPromo.ahorro}
                          precioIndividual={sugerenciaPromo.precioIndividual}
                          onAplicarPromo={handleAplicarPromo}
                          onDismiss={() => setBannerDismissed(true)}
                        />
                      )}
                      <PanelZonasIndividuales
                        zonas={zonas}
                        seleccionadas={zonasIndividualesIds}
                        onToggle={toggleZonaIndividual}
                      />
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {/* Modal swap */}
      {swapModalZonaId && zonaSwapOriginal && (
        <ModalSwapZona
          zonaOriginal={zonaSwapOriginal}
          opciones={opcionesSwap}
          onSelect={(nuevaId) => {
            setSwaps((prev) => ({ ...prev, [swapModalZonaId]: nuevaId }));
            setSwapModalZonaId(null);
          }}
          onClose={() => setSwapModalZonaId(null)}
        />
      )}

      {/* Barra flotante */}
      {genero && (
        <BarraFlotanteLaser
          precio={totales.precio}
          duracion={totales.duracion}
          puedeContinuar={puedeContinuar}
          onContinuar={handleContinuar}
          detalle={detalleBarra}
        />
      )}
    </main>
  );
}

export default function LaserPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#edf0ec] dark:bg-zinc-950 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#1c352a] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LaserContent />
    </Suspense>
  );
}