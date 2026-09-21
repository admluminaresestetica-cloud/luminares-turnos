'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';
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

export default function LaserPage() {
  const router = useRouter();

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
    <main className="min-h-screen bg-slate-100/70 flex flex-col items-center justify-start p-4 sm:p-6 pb-32 font-sans">
      <div className="max-w-md sm:max-w-2xl w-full space-y-4">
        
        {/* Volver */}
        <div className="w-full flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al menú principal</span>
          </Link>
        </div>

        {/* Header */}
        <header className="text-center space-y-1 my-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs mb-1">
            <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-[10px] font-black tracking-[0.18em] uppercase text-slate-700">
              Reserva Online
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Depilación Láser
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {!genero
              ? 'Paso 1: Seleccioná tu perfil'
              : 'Paso 2: Elegí combos o zonas individuales'}
          </p>
        </header>

        {/* Paso 1: Género */}
        <section className="bg-white border border-slate-200/80 rounded-[22px] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Seleccioná tu perfil
            </h2>
          </div>
          <SelectorGenero genero={genero} onSelect={handleGenero} />
        </section>

        {/* Paso 2: Selección de servicios */}
        {genero && (
          <section className="space-y-4 animate-in fade-in duration-200">
            {cargando ? (
              <div className="bg-white border border-slate-200/80 rounded-[22px] p-8 text-center shadow-xs">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">Cargando opciones disponibles...</p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-slate-200/80 rounded-[22px] p-3 shadow-xs">
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