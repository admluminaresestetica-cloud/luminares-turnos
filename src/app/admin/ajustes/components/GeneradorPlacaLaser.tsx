'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Calendar, Download, Layers, Plus, X } from 'lucide-react';
import { ETIQUETA_CATEGORIA } from '@/lib/laser/calculos';
import type { PromoLaser, ServicioLaser } from '@/app/admin/turnos/components/types';

type GeneroPlaca = 'femenino' | 'masculino';
type CategoriaPlaca = 'chica' | 'media' | 'grande';

interface GeneradorPlacaLaserProps {
  promos: PromoLaser[];
  zonas: ServicioLaser[];
  tituloMarca?: string;
}

interface ContactoPlaca {
  label: string;
  valor: string;
}

const CATEGORIAS_POR_GENERO: Record<GeneroPlaca, CategoriaPlaca[]> = {
  femenino: ['chica', 'grande'],
  masculino: ['chica', 'media', 'grande'],
};

/**
 * Ancho de diseño de la placa (px). El PNG final mide
 * PLACA_ANCHO * EXPORT_PIXEL_RATIO de ancho (1680 px). El alto es automático.
 */
const PLACA_ANCHO = 840;
const EXPORT_PIXEL_RATIO = 2;

const MAX_CONTACTOS = 4;

const CONTACTO_INICIAL: ContactoPlaca[] = [
  { label: 'INSTAGRAM', valor: '@luminares.estetica' },
  { label: 'WHATSAPP', valor: '341 3 954355' },
  { label: 'WEB', valor: 'mireservalumin.com.ar' },
];

interface TemaPlaca {
  placa: string;
  header: string;
  marca: string;
  titulo: string;
  subtitulo: string;
  badge: string;
  fecha: string;
  barra: string;
  seccion: string;
  icono: string;
  card: string;
  nombrePromo: string;
  precio: string;
  precioEtiqueta: string;
  zonasIncluidas: string;
  porZona: string;
  ahorro: string;
  catHeader: string;
  catCard: string;
  itemBorde: string;
  itemNombre: string;
  itemPrecio: string;
  vacio: string;
  footer: string;
  footerLabel: string;
  footerValor: string;
  footerDivisor: string;
}

// Las clases van completas (sin concatenar) para que Tailwind las detecte.
const TEMAS: Record<GeneroPlaca, TemaPlaca> = {
  femenino: {
    placa: 'bg-rose-50',
    header: 'bg-rose-100 border-b-2 border-rose-200',
    marca: 'text-rose-700',
    titulo: 'text-rose-950',
    subtitulo: 'text-rose-600',
    badge: 'bg-white text-rose-700 border-2 border-rose-300',
    fecha: 'bg-rose-600 text-white',
    barra: 'bg-rose-500',
    seccion: 'text-rose-900',
    icono: 'text-rose-700',
    card: 'border-rose-200 bg-white',
    nombrePromo: 'text-rose-950',
    precio: 'text-rose-700',
    precioEtiqueta: 'text-rose-600',
    zonasIncluidas: 'text-slate-600',
    porZona: 'text-slate-500',
    ahorro: 'bg-rose-600 text-white',
    catHeader: 'bg-rose-200 text-rose-900',
    catCard: 'border-rose-200 bg-white',
    itemBorde: 'border-rose-100',
    itemNombre: 'text-slate-700',
    itemPrecio: 'text-rose-900',
    vacio: 'border-rose-300 text-rose-700',
    footer: 'bg-rose-100 border-t-2 border-rose-200',
    footerLabel: 'text-rose-600',
    footerValor: 'text-rose-950',
    footerDivisor: 'border-rose-300',
  },
  masculino: {
    placa: 'bg-white',
    header: 'bg-slate-900',
    marca: 'text-slate-300',
    titulo: 'text-white',
    subtitulo: 'text-slate-400',
    badge: 'bg-white text-slate-900',
    fecha: 'bg-emerald-400 text-slate-900',
    barra: 'bg-slate-900',
    seccion: 'text-slate-900',
    icono: 'text-slate-900',
    card: 'border-slate-200 bg-slate-50',
    nombrePromo: 'text-slate-900',
    precio: 'text-slate-900',
    precioEtiqueta: 'text-slate-500',
    zonasIncluidas: 'text-slate-600',
    porZona: 'text-slate-500',
    ahorro: 'bg-emerald-100 text-emerald-800',
    catHeader: 'bg-slate-900 text-white',
    catCard: 'border-slate-200 bg-white',
    itemBorde: 'border-slate-100',
    itemNombre: 'text-slate-700',
    itemPrecio: 'text-slate-900',
    vacio: 'border-slate-300 text-slate-500',
    footer: 'bg-slate-900',
    footerLabel: 'text-slate-400',
    footerValor: 'text-white',
    footerDivisor: 'border-slate-700',
  },
};

function formatearPrecio(monto: number): string {
  return `$${Math.round(monto).toLocaleString('es-AR')}`;
}

function formatearFechaCorta(fechaIso: string): string {
  if (!fechaIso) return '';
  const [, mes, dia] = fechaIso.split('-');
  return dia && mes ? `${dia}/${mes}` : fechaIso;
}

const INPUT_CLASE =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground';
const LABEL_CLASE = 'mb-1 block text-[11px] font-bold text-muted-foreground uppercase';
const BOTON_SECUNDARIO_CLASE =
  'inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground disabled:opacity-50';
const BOTON_QUITAR_CLASE =
  'inline-flex shrink-0 items-center justify-center rounded-xl bg-muted p-2 text-muted-foreground transition hover:text-foreground';

export default function GeneradorPlacaLaser({
  promos,
  zonas,
  tituloMarca = 'LUMINARES · DEPILACIÓN LÁSER',
}: GeneradorPlacaLaserProps) {
  const placaRef = useRef<HTMLDivElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [genero, setGenero] = useState<GeneroPlaca>('femenino');
  const [fechas, setFechas] = useState<string[]>(['']);
  const [textoLibreFecha, setTextoLibreFecha] = useState('');
  const [incluirZonas, setIncluirZonas] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [marca, setMarca] = useState(tituloMarca);
  const [contactos, setContactos] = useState<ContactoPlaca[]>(CONTACTO_INICIAL);

  // Escala solo para la vista previa en pantalla (la exportación siempre es a tamaño real).
  const [escala, setEscala] = useState(0.8);
  const [altoPlaca, setAltoPlaca] = useState(0);

  const tema = TEMAS[genero];

  useEffect(() => {
    const contenedor = contenedorRef.current;
    const placa = placaRef.current;
    if (!contenedor || !placa) return;

    const medir = () => {
      const anchoDisponible = contenedor.clientWidth;
      if (anchoDisponible > 0) {
        setEscala(Math.min(1, anchoDisponible / PLACA_ANCHO));
      }
      setAltoPlaca(placa.offsetHeight);
    };

    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(contenedor);
    observer.observe(placa);
    return () => observer.disconnect();
  }, []);

  // Fechas cargadas (sin vacías, ordenadas de menor a mayor).
  const fechasValidas = useMemo(() => fechas.filter(Boolean).slice().sort(), [fechas]);

  const etiquetaFecha = useMemo(() => {
    if (textoLibreFecha.trim()) return textoLibreFecha.trim();
    if (fechasValidas.length === 0) return '';
    const prefijo = fechasValidas.length > 1 ? 'Próximas fechas' : 'Próxima fecha';
    return `${prefijo}: ${fechasValidas.map(formatearFechaCorta).join(' · ')}`;
  }, [fechasValidas, textoLibreFecha]);

  const contactosVisibles = useMemo(
    () => contactos.filter((c) => c.valor.trim() !== ''),
    [contactos],
  );

  const promosArmadas = useMemo(() => {
    const mapaZonas = new Map(zonas.map((z) => [z.id, z]));

    return promos
      .filter((p) => p.activo && p.genero?.toLowerCase() === genero)
      .sort((a, b) => {
        const ordenA = (a as { orden?: number }).orden ?? 9999;
        const ordenB = (b as { orden?: number }).orden ?? 9999;
        return ordenA - ordenB;
      })
      .map((promo) => {
        const zonasResueltas = (promo.zonas_incluidas ?? [])
          .map((id) => mapaZonas.get(id))
          .filter((z): z is ServicioLaser => z !== undefined);

        const sumaZonas = zonasResueltas.reduce((acc, z) => acc + Number(z.precio_lista ?? 0), 0);
        const ahorro = sumaZonas - Number(promo.precio_promo ?? 0);

        return { promo, zonasResueltas, sumaZonas, ahorro };
      });
  }, [promos, genero, zonas]);

  const zonasPorCategoria = useMemo(() => {
    const activas = zonas.filter((z) => z.activo && z.genero?.toLowerCase() === genero);
    return CATEGORIAS_POR_GENERO[genero].map((categoria) => ({
      categoria,
      etiqueta: ETIQUETA_CATEGORIA[categoria] ?? categoria,
      items: activas.filter((z) => z.categoria_zona?.toLowerCase() === categoria),
    }));
  }, [zonas, genero]);

  // ───────── Handlers de edición ─────────
  const actualizarFecha = (indice: number, valor: string) => {
    setFechas((prev) => prev.map((f, i) => (i === indice ? valor : f)));
    setTextoLibreFecha('');
  };

  const agregarFecha = () => setFechas((prev) => [...prev, '']);

  const quitarFecha = (indice: number) => {
    setFechas((prev) => (prev.length <= 1 ? [''] : prev.filter((_, i) => i !== indice)));
  };

  const actualizarContacto = (indice: number, campo: keyof ContactoPlaca, valor: string) => {
    setContactos((prev) => prev.map((c, i) => (i === indice ? { ...c, [campo]: valor } : c)));
  };

  const agregarContacto = () => {
    setContactos((prev) =>
      prev.length >= MAX_CONTACTOS ? prev : [...prev, { label: '', valor: '' }],
    );
  };

  const quitarContacto = (indice: number) => {
    setContactos((prev) => prev.filter((_, i) => i !== indice));
  };

  const handleDescargarPng = async () => {
    const placa = placaRef.current;
    if (!placa) return;
    try {
      setDescargando(true);

      // Esperar a que las fuentes estén listas para que el texto no cambie de ancho al capturar.
      await document.fonts?.ready;

      const dataUrl = await toPng(placa, {
        cacheBust: true,
        pixelRatio: EXPORT_PIXEL_RATIO,
        backgroundColor: '#ffffff',
        // Dimensiones explícitas: captura el 100% del ancho y alto reales de la placa.
        width: PLACA_ANCHO,
        height: placa.offsetHeight,
        // Se aplica solo al clon exportado: anula cualquier escala/margen del preview.
        style: {
          transform: 'none',
          margin: '0',
        },
      });

      const link = document.createElement('a');
      link.download = `placa-laser-${genero}${
        fechasValidas.length > 0 ? `-${fechasValidas.join('_')}` : ''
      }.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al exportar PNG:', err);
    } finally {
      setDescargando(false);
    }
  };

  const totalPromos = promosArmadas.length;
  // Sin zonas: las promos van en 2 columnas. Si la cantidad es impar, la última ocupa todo el ancho.
  const promosEnDosColumnas = !incluirZonas;

  return (
    <div className="space-y-5">
      {/* ───────── Controles ───────── */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGenero('femenino')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                genero === 'femenino'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Femenino
            </button>
            <button
              type="button"
              onClick={() => setGenero('masculino')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                genero === 'masculino'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Masculino
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
              <input
                type="checkbox"
                checked={incluirZonas}
                onChange={(e) => setIncluirZonas(e.target.checked)}
                className="rounded border-border"
              />
              Incluir zonas por categoría
            </label>

            <button
              type="button"
              onClick={handleDescargarPng}
              disabled={descargando}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {descargando ? 'Generando...' : 'Descargar PNG'}
            </button>
          </div>
        </div>

        {/* Título de marca */}
        <div className="border-t border-border pt-3">
          <label className={LABEL_CLASE}>Título de la placa (marca)</label>
          <input
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Ej: LUMINARES · DEPILACIÓN LÁSER"
            className={INPUT_CLASE}
          />
        </div>

        {/* Fechas */}
        <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASE}>Fechas puntuales de sesión</label>
            <div className="space-y-2">
              {fechas.map((fecha, indice) => (
                <div key={indice} className="flex items-center gap-2">
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => actualizarFecha(indice, e.target.value)}
                    className={INPUT_CLASE}
                  />
                  {(fechas.length > 1 || fecha !== '') && (
                    <button
                      type="button"
                      onClick={() => quitarFecha(indice)}
                      aria-label="Quitar fecha"
                      className={BOTON_QUITAR_CLASE}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={agregarFecha} className={`${BOTON_SECUNDARIO_CLASE} mt-2`}>
              <Plus className="h-4 w-4" />
              Agregar fecha
            </button>
          </div>

          <div>
            <label className={LABEL_CLASE}>
              Fecha o texto libre (ej: Sábado 12/12 o 12 y 26/12)
            </label>
            <input
              type="text"
              value={textoLibreFecha}
              onChange={(e) => setTextoLibreFecha(e.target.value)}
              placeholder="Ej: Próxima fecha: Sábado 12/12"
              className={INPUT_CLASE}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Si escribís un texto libre, se muestra en lugar de las fechas del calendario.
            </p>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="border-t border-border pt-3">
          <label className={LABEL_CLASE}>Datos de contacto (pie de la placa)</label>
          <div className="space-y-2">
            {contactos.map((contacto, indice) => (
              <div key={indice} className="flex items-center gap-2">
                <input
                  type="text"
                  value={contacto.label}
                  onChange={(e) => actualizarContacto(indice, 'label', e.target.value)}
                  placeholder="Etiqueta (ej: INSTAGRAM)"
                  className={`${INPUT_CLASE} sm:w-44 sm:shrink-0`}
                />
                <input
                  type="text"
                  value={contacto.valor}
                  onChange={(e) => actualizarContacto(indice, 'valor', e.target.value)}
                  placeholder="Dato (ej: @luminares.estetica)"
                  className={INPUT_CLASE}
                />
                <button
                  type="button"
                  onClick={() => quitarContacto(indice)}
                  aria-label="Quitar dato de contacto"
                  className={BOTON_QUITAR_CLASE}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={agregarContacto}
            disabled={contactos.length >= MAX_CONTACTOS}
            className={`${BOTON_SECUNDARIO_CLASE} mt-2`}
          >
            <Plus className="h-4 w-4" />
            Agregar dato
          </button>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Los datos sin contenido no se muestran en la placa. Máximo {MAX_CONTACTOS}.
          </p>
        </div>
      </div>

      {/* ───────── Vista previa (escalada) ─────────
          La placa se diseña a PLACA_ANCHO px y acá solo se achica visualmente con
          transform. Lo que se exporta es SIEMPRE el nodo a tamaño real. */}
      <div ref={contenedorRef} className="w-full">
        <div
          className="relative mx-auto overflow-hidden rounded-2xl border border-border"
          style={{
            width: PLACA_ANCHO * escala,
            height: altoPlaca * escala,
          }}
        >
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: PLACA_ANCHO,
              transform: `scale(${escala})`,
            }}
          >
            {/* ───────── PLACA (nodo exportado) ───────── */}
            <div
              ref={placaRef}
              className={`text-slate-900 ${tema.placa}`}
              style={{ width: PLACA_ANCHO }}
            >
              {/* Header */}
              <div className={`px-9 pt-8 pb-7 ${tema.header}`}>
                <div className="flex items-center justify-between gap-5">
                  <p
                    className={`min-w-0 text-[16px] font-extrabold tracking-[0.18em] uppercase ${tema.marca}`}
                  >
                    {marca.trim()}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-4 py-1.5 text-[15px] font-black tracking-wider uppercase ${tema.badge}`}
                  >
                    {genero}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                  <h2
                    className={`text-[46px] leading-[1.05] font-black tracking-tight ${tema.titulo}`}
                  >
                    Promos y Tarifas
                    <span className={`ml-3 text-[28px] font-bold ${tema.subtitulo}`}>
                      {genero === 'femenino' ? 'Femenino' : 'Masculino'}
                    </span>
                  </h2>

                  {etiquetaFecha && (
                    <div
                      className={`inline-flex max-w-full items-center gap-2.5 rounded-3xl px-5 py-2 text-[20px] leading-tight font-black ${tema.fecha}`}
                    >
                      <Calendar className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                      <span className="min-w-0">{etiquetaFecha}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cuerpo: promos (izq.) + zonas (der.) */}
              <div
                className={`grid items-start gap-6 px-9 pt-8 pb-9 ${
                  incluirZonas ? 'grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]' : 'grid-cols-1'
                }`}
              >
                {/* Promociones */}
                <div className="min-w-0">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`h-6 w-1.5 rounded-full ${tema.barra}`} />
                    <span
                      className={`text-[20px] font-black tracking-wider uppercase ${tema.seccion}`}
                    >
                      Promociones
                    </span>
                  </div>

                  {totalPromos === 0 ? (
                    <p
                      className={`rounded-2xl border-2 border-dashed p-5 text-[18px] ${tema.vacio}`}
                    >
                      No hay promos activas para {genero}.
                    </p>
                  ) : (
                    <div
                      className={`grid items-stretch gap-3.5 ${
                        promosEnDosColumnas ? 'grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {promosArmadas.map(({ promo, zonasResueltas, sumaZonas, ahorro }, idx) => {
                        const ocupaAncho =
                          promosEnDosColumnas && totalPromos % 2 === 1 && idx === totalPromos - 1;
                        // En 2 columnas (tarjeta angosta) el precio va debajo del nombre.
                        const compacta = promosEnDosColumnas && !ocupaAncho;

                        return (
                          <div
                            key={promo.id}
                            className={`rounded-2xl border-2 px-5 py-4 ${tema.card} ${
                              ocupaAncho ? 'col-span-2' : ''
                            }`}
                          >
                            <div
                              className={
                                compacta
                                  ? 'flex flex-col gap-2'
                                  : 'flex items-start justify-between gap-4'
                              }
                            >
                              <p
                                className={`min-w-0 flex-1 text-[24px] leading-tight font-black ${tema.nombrePromo}`}
                              >
                                {promo.nombre_promo}
                              </p>
                              <div className={`shrink-0 ${compacta ? 'text-left' : 'text-right'}`}>
                                <p
                                  className={`text-[32px] leading-none font-black whitespace-nowrap ${tema.precio}`}
                                >
                                  {formatearPrecio(Number(promo.precio_promo))}
                                </p>
                                <p
                                  className={`mt-1 text-[13px] font-extrabold tracking-widest uppercase ${tema.precioEtiqueta}`}
                                >
                                  Promo
                                </p>
                              </div>
                            </div>

                            <p
                              className={`mt-1.5 text-[17px] leading-snug font-medium ${tema.zonasIncluidas}`}
                            >
                              {zonasResueltas.length > 0
                                ? zonasResueltas.map((z) => z.nombre_zona).join(' + ')
                                : 'Zonas según promo'}
                            </p>

                            {zonasResueltas.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                <span className={`text-[16px] font-semibold ${tema.porZona}`}>
                                  Por zona:{' '}
                                  <span className="line-through">{formatearPrecio(sumaZonas)}</span>
                                </span>
                                {ahorro > 0 && (
                                  <span
                                    className={`rounded-lg px-2.5 py-0.5 text-[16px] font-black ${tema.ahorro}`}
                                  >
                                    Ahorrás {formatearPrecio(ahorro)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Zonas por categoría */}
                {incluirZonas && (
                  <div className="min-w-0">
                    <div className="mb-4 flex items-center gap-3">
                      <Layers
                        className={`h-6 w-6 shrink-0 ${tema.icono}`}
                        strokeWidth={2.5}
                      />
                      <span
                        className={`text-[20px] font-black tracking-wider uppercase ${tema.seccion}`}
                      >
                        Zonas
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {zonasPorCategoria.map(({ categoria, etiqueta, items }) => (
                        <div
                          key={categoria}
                          className={`overflow-hidden rounded-2xl border-2 ${tema.catCard}`}
                        >
                          <div className={`px-4 py-2 ${tema.catHeader}`}>
                            <p className="text-[16px] font-black tracking-wider uppercase">
                              {etiqueta}
                            </p>
                          </div>

                          <div className="px-4 py-3">
                            {items.length === 0 ? (
                              <p className="text-[16px] text-slate-400">Sin zonas</p>
                            ) : (
                              <ul className="space-y-2">
                                {items.map((z) => (
                                  <li
                                    key={z.id}
                                    className={`flex items-baseline justify-between gap-3 border-b pb-1.5 text-[17px] last:border-b-0 last:pb-0 ${tema.itemBorde}`}
                                  >
                                    <span
                                      className={`min-w-0 flex-1 font-semibold ${tema.itemNombre}`}
                                    >
                                      {z.nombre_zona}
                                    </span>
                                    <span
                                      className={`shrink-0 font-black whitespace-nowrap ${tema.itemPrecio}`}
                                    >
                                      {formatearPrecio(Number(z.precio_lista))}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pie de placa: contacto (editable) */}
              {contactosVisibles.length > 0 && (
                <div className={`px-9 py-6 ${tema.footer}`}>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${contactosVisibles.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {contactosVisibles.map((c, indice) => (
                      <div
                        key={indice}
                        className={`min-w-0 border-l-2 px-4 first:border-l-0 first:pl-0 ${tema.footerDivisor}`}
                      >
                        {c.label.trim() !== '' && (
                          <p
                            className={`text-[13px] font-extrabold tracking-[0.18em] uppercase ${tema.footerLabel}`}
                          >
                            {c.label.trim()}
                          </p>
                        )}
                        <p
                          className={`mt-1 text-[19px] leading-tight font-black break-words ${tema.footerValor}`}
                        >
                          {c.valor.trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}