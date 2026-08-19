'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
      const extras = zonasExtraIds
        .map((id) => getZonaById(zonas, id)?.nombre_zona)
        .filter((n): n is string => Boolean(n));
      return extras.length > 0
        ? `${promoSeleccionada.nombre_promo} + ${extras.join(', ')}`
        : promoSeleccionada.nombre_promo;
    }
    if (modo === 'zonas') {
      return zonasIndividualesIds
        .map((id) => getZonaById(zonas, id)?.nombre_zona)
        .filter(Boolean)
        .join(' · ');
    }
    return '';
  }, [modo, promoSeleccionada, zonas, zonasExtraIds, zonasIndividualesIds]);

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
    <main className="min-h-screen bg-slate-50 pb-32">
      <div className="max-w-3xl mx-auto p-6 md:p-10">
        {/* Botón Volver Minimalista */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Depilación Láser
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {!genero
              ? 'Paso 1: Seleccioná tu perfil'
              : 'Paso 2: Elegí promos o zonas individuales'}
          </p>
        </header>

        {/* Paso 1: Género */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Género
          </h2>
          <SelectorGenero genero={genero} onSelect={handleGenero} />
        </section>

        {/* Paso 2: Selección de servicios */}
        {genero && (
          <section>
            {cargando ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm font-medium">
                Cargando servicios...
              </div>
            ) : (
              <>
                <SelectorModoLaser modo={modo} onChange={handleModoChange} />

                <div className="mt-6">
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