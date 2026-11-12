'use client';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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

/* ------------------------------------------------------------------ */
/* UI auxiliar (respeta los tokens dinámicos del tema/admin)          */
/* ------------------------------------------------------------------ */

function IndicadorPasos({ paso }: { paso: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Paso ${paso} de 2`}>
      {[1, 2].map((n) => (
        <motion.span
          key={n}
          animate={{
            width: n === paso ? 24 : 6,
            opacity: n <= paso ? 1 : 0.4,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="h-1.5 rounded-full bg-primary"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                             */
/* ------------------------------------------------------------------ */

function LaserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducirMovimiento = useReducedMotion();

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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start px-4 pt-4 sm:px-6 sm:pt-6 pb-44 font-sans transition-colors relative overflow-hidden">
      
      {/* 🌫️ Orbes de luz en tonos grises neutros que otorgan profundidad y combinan con cualquier color */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-slate-400/10 dark:bg-zinc-700/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-slate-500/10 dark:bg-zinc-600/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md sm:max-w-2xl space-y-6 relative z-10">

        {/* Barra superior: volver + progreso con diseño bento/glass */}
        <div className="flex w-full items-center justify-between">
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={reducirMovimiento ? undefined : { scale: 1.02, y: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-card/80 backdrop-blur-xl px-4 text-xs font-bold text-muted-foreground shadow-xs hover:text-foreground transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Link>
          </motion.div>
          <IndicadorPasos paso={genero ? 2 : 1} />
        </div>

        {/* Encabezado / Título principal */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 px-1"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Zap className="h-6 w-6 fill-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Depilación láser
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-muted-foreground">
              {!genero ? '¿Para quién es el turno?' : 'Elegí tu promo o armá tu combo'}
            </p>
          </div>
        </motion.header>

        {/* Paso 1: tarjetas bento de género */}
        <AnimatePresence mode="wait">
          {!genero && (
            <motion.div
              key="genero"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <SelectorGenero genero={genero} onSelect={handleGenero} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paso 2: selección de servicios con contenedores de vidrio moderno */}
        <AnimatePresence mode="wait">
          {genero && (
            <motion.div
              key="servicios"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-5"
            >
              {/* Cambio rápido de perfil */}
              <SelectorGenero genero={genero} onSelect={handleGenero} compacto />

              {cargando ? (
                <div className="rounded-[28px] border border-border bg-card/85 backdrop-blur-xl p-12 text-center shadow-xl">
                  <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-xs font-bold text-muted-foreground">Cargando opciones…</p>
                </div>
              ) : (
                <>
                  <SelectorModoLaser modo={modo} onChange={handleModoChange} />

                  <div className="space-y-4">
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
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <PanelZonasExtra
                              zonas={zonas}
                              zonasPromoIds={zonasPromoActivas}
                              zonasExtraIds={zonasExtraIds}
                              onToggleExtra={toggleZonaExtra}
                            />
                          </motion.div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal swap con animaciones fluidas */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Barra flotante estilo app nativa */}
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LaserContent />
    </Suspense>
  );
}