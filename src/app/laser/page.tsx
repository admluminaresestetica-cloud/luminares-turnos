'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Mars, Venus, Zap } from 'lucide-react';
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
/* UI auxiliar (solo presentación, usa únicamente tokens del tema)     */
/* ------------------------------------------------------------------ */

const OPCIONES_GENERO: {
  valor: GeneroLaser;
  titulo: string;
  detalle: string;
  Icono: typeof Venus;
}[] = [
  { valor: 'femenino', titulo: 'Femenino', detalle: 'Promos y zonas para mujeres', Icono: Venus },
  { valor: 'masculino', titulo: 'Masculino', detalle: 'Promos y zonas para hombres', Icono: Mars },
];

function TarjetaGenero({
  titulo,
  detalle,
  Icono,
  activa,
  onClick,
}: {
  titulo: string;
  detalle: string;
  Icono: typeof Venus;
  activa: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`group relative flex w-full items-center gap-4 rounded-[28px] border p-5 text-left shadow-xs transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-col sm:items-start sm:gap-6 sm:p-6 ${
        activa
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${
          activa ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        }`}
      >
        <Icono className="h-7 w-7" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-lg font-extrabold tracking-tight text-foreground">{titulo}</span>
        <span className="mt-0.5 block text-xs font-medium text-muted-foreground">{detalle}</span>
      </span>

      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors sm:absolute sm:right-5 sm:top-5 ${
          activa
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background text-transparent'
        }`}
        aria-hidden
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}

function IndicadorPasos({ paso }: { paso: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Paso ${paso} de 2`}>
      {[1, 2].map((n) => (
        <span
          key={n}
          className={`h-1.5 rounded-full transition-all ${
            n === paso ? 'w-6 bg-primary' : n < paso ? 'w-1.5 bg-primary' : 'w-1.5 bg-border'
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start px-4 pt-4 sm:px-6 sm:pt-6 pb-36 font-sans">
      <div className="w-full max-w-md sm:max-w-2xl space-y-5">

        {/* Barra superior: volver + progreso */}
        <div className="flex w-full items-center justify-between">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card pl-3 pr-4 text-xs font-bold text-muted-foreground shadow-xs transition-all hover:text-foreground active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Link>
          <IndicadorPasos paso={genero ? 2 : 1} />
        </div>

        {/* Título */}
        <header className="flex items-center gap-4 px-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-md">
            <Zap className="h-6 w-6 fill-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Depilación láser
            </h1>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              {!genero ? '¿Para quién es el turno?' : 'Elegí tu promo o armá tu combo'}
            </p>
          </div>
        </header>

        {/* Paso 1: pantalla limpia con tarjetas de género */}
        {!genero && (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 animate-in fade-in duration-200">
            {OPCIONES_GENERO.map((op) => (
              <TarjetaGenero
                key={op.valor}
                titulo={op.titulo}
                detalle={op.detalle}
                Icono={op.Icono}
                activa={genero === op.valor}
                onClick={() => handleGenero(op.valor)}
              />
            ))}
          </section>
        )}

        {/* Paso 2: selección de servicios */}
        {genero && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Cambio rápido de perfil (misma lógica que el paso 1) */}
            <div
              role="group"
              aria-label="Perfil"
              className="grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 shadow-xs"
            >
              {OPCIONES_GENERO.map(({ valor, titulo, Icono }) => {
                const activo = genero === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => handleGenero(valor)}
                    aria-pressed={activo}
                    className={`flex h-10 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-[0.98] ${
                      activo
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icono className="h-4 w-4" />
                    {titulo}
                  </button>
                );
              })}
            </div>

            {cargando ? (
              <div className="rounded-[28px] border border-border bg-card p-10 text-center shadow-xs">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm font-semibold text-muted-foreground">Cargando opciones…</p>
              </div>
            ) : (
              <>
                <div className="rounded-full border border-border bg-card p-1.5 shadow-xs">
                  <SelectorModoLaser modo={modo} onChange={handleModoChange} />
                </div>

                <div className="space-y-4">
                  {modo === 'promo' ? (
                    <>
                      {/* Cada promo se muestra como tarjeta independiente dentro de este contenedor */}
                      <div className="space-y-3 [&>*]:rounded-[28px]">
                        <PanelPromos
                          promos={promos}
                          zonas={zonas}
                          promoSeleccionada={promoSeleccionada}
                          swaps={swaps}
                          onSelectPromo={handleSelectPromo}
                          onSwapClick={setSwapModalZonaId}
                        />
                      </div>
                      {promoSeleccionada && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <PanelZonasExtra
                            zonas={zonas}
                            zonasPromoIds={zonasPromoActivas}
                            zonasExtraIds={zonasExtraIds}
                            onToggleExtra={toggleZonaExtra}
                          />
                        </div>
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LaserContent />
    </Suspense>
  );
}
