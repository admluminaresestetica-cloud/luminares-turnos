'use client';

import { ejecutarAccionAdmin } from '@/lib/admin/api';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  UserRound,
  UserPlus,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Clock,
  UserCheck,
  Ban,
  FileHeart,
  ClipboardCheck,
  IdCard,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import BuscadorMulticoincidencia from './components/BuscadorMulticoincidencia';
import Link from 'next/link';
import ResumenReservaCobro from './components/ResumenReservaCobro';
import ChecklistAnamnesis from './components/ChecklistAnamnesis';
import SelectorZonasBotones from './components/SelectorZonasBotones';

import BannerAlertasClinicas from '../components/BannerAlertasClinicas';
import ModalHistorialSesiones from '../components/ModalHistorialSesiones';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ESTADOS_ATENCION = [
  { key: 'en_espera', label: 'En espera', icon: Clock },
  { key: 'en_atencion', label: 'Atendiendo', icon: UserCheck },
  { key: 'atendido', label: 'Completado', icon: CheckCircle2 },
  { key: 'cancelado', label: 'Cancelado', icon: Ban },
] as const;

type PestañaMovil = 'paciente' | 'anamnesis' | 'operacion';

export default function RecepcionPage() {
  const [pacienteFicha, setPacienteFicha] = useState<any>(null);
  const [reservaHoy, setReservaHoy] = useState<any>(null);
  const [esNuevo, setEsNuevo] = useState(false);

  // Navegación por pestañas optimizada para Celular (App Experience)
  const [pestanaActiva, setPestanaActiva] = useState<PestañaMovil>('paciente');

  // Campos del Paciente
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [fototipo, setFototipo] = useState('Fototipo III');
  const [observacionesFijas, setObservacionesFijas] = useState('');
  const [antecedentes, setAntecedentes] = useState<Record<string, boolean>>({});

  // Operación del Día
  const [cobradoEnPuerta, setCobradoEnPuerta] = useState(false);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  const [observacionesHoy, setObservacionesHoy] = useState('');

  // Modales y Estados de UI
  const [pacienteIdModal, setPacienteIdModal] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const extraerZonasDeReserva = (reserva: any): string[] => {
    if (!reserva) return [];

    let detalle = reserva.detalle_reserva;

    if (!detalle) {
      if (reserva.servicio_tipo) return [reserva.servicio_tipo];
      return [];
    }

    if (typeof detalle === 'string') {
      try {
        detalle = JSON.parse(detalle);
      } catch (e) {
        return detalle.split(/[,+\-/]/).map((z: string) => z.trim()).filter(Boolean);
      }
    }

    if (Array.isArray(detalle)) {
      return detalle
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item.nombre_zona || item.nombre || item.zona || item.titulo || '';
        })
        .filter(Boolean);
    }

    if (typeof detalle === 'object') {
      if (Array.isArray(detalle.zonas)) {
        return detalle.zonas.map((z: any) => (typeof z === 'string' ? z : z.nombre_zona || z.nombre));
      }
      if (Array.isArray(detalle.zonas_seleccionadas)) {
        return detalle.zonas_seleccionadas;
      }
      if (detalle.nombre_zona) return [detalle.nombre_zona];
      if (detalle.nombre) return [detalle.nombre];
      if (detalle.servicio) return [detalle.servicio];
    }

    return [];
  };

  const handleClienteSeleccionado = (data: { pacienteFicha: any; reservaHoy: any }) => {
    setMensaje(null);
    setReservaHoy(data.reservaHoy);

    const zonasPrecalculadas = extraerZonasDeReserva(data.reservaHoy);
    setZonasSeleccionadas(zonasPrecalculadas);

    if (data.pacienteFicha) {
      setPacienteFicha(data.pacienteFicha);
      setEsNuevo(false);
      setNombre(data.pacienteFicha.nombre_completo || '');
      setCelular(data.pacienteFicha.celular || '');
      setFototipo(data.pacienteFicha.fototipo || 'Fototipo III');
      setObservacionesFijas(data.pacienteFicha.observaciones_fijas || '');
      setAntecedentes(data.pacienteFicha.antecedentes_medicos || {});
    } else {
      setPacienteFicha(null);
      setEsNuevo(true);
      setNombre(data.reservaHoy?.cliente_nombre || '');
      setCelular(data.reservaHoy?.cliente_celular || '');
      setFototipo('Fototipo III');
      setObservacionesFijas('');
      setAntecedentes({});
    }

    // Al seleccionar un cliente, por comodidad lo llevamos directo al flujo de operación o anamnesis
    setPestanaActiva('operacion');
  };

  const handleEnviarAGabinete = async () => {
    if (zonasSeleccionadas.length === 0) {
      setMensaje('⚠️ Seleccioná al menos una zona para realizar hoy.');
      setPestanaActiva('operacion'); // Auto-redirigir a la pestaña donde está el error
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      let pacienteId = pacienteFicha?.id;

      const inicioHoy = new Date();
      inicioHoy.setHours(0, 0, 0, 0);

      let query = supabase
        .from('pacientes_ficha')
        .select('id, estado_atencion, updated_at')
        .gte('updated_at', inicioHoy.toISOString());

      if (pacienteId) {
        query = query.eq('id', pacienteId);
      } else if (celular) {
        query = query.eq('celular', celular);
      }

      const { data: existente } = await query;

      if (existente && existente.length > 0) {
        const estadoActual = existente[0].estado_atencion;
        if (['en_espera', 'en_atencion', 'atendido'].includes(estadoActual)) {
          setMensaje(`⚠️ El paciente ya fue derivado a Gabinete el día de hoy (Estado: ${estadoActual}).`);
          setGuardando(false);
          return;
        }
      }

      const payload = {
        nombre_completo: nombre,
        celular: celular,
        fototipo: fototipo,
        antecedentes_medicos: antecedentes,
        observaciones_fijas: observacionesFijas,
        estado_atencion: 'en_espera',
        zonas_realizadas: zonasSeleccionadas,
        observaciones_recepcion: observacionesHoy,
        anamnesis_sesion: antecedentes,
        updated_at: new Date().toISOString(),
      };

      if (esNuevo || !pacienteId) {
        const resultado = await ejecutarAccionAdmin({
          tabla: 'pacientes_ficha',
          accion: 'INSERT',
          datos: payload,
        });

        if (resultado && resultado.length > 0) {
          pacienteId = resultado[0].id;
        }
      } else {
        await ejecutarAccionAdmin({
          tabla: 'pacientes_ficha',
          accion: 'UPDATE',
          id: pacienteId,
          datos: payload,
        });
      }

      setMensaje('✅ ¡Paciente derivado a Gabinete (En Espera)!');
      limpiar();
    } catch (err: any) {
      console.error(err);
      setMensaje(`❌ Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const limpiar = () => {
    setPacienteFicha(null);
    setReservaHoy(null);
    setEsNuevo(false);
    setNombre('');
    setCelular('');
    setZonasSeleccionadas([]);
    setObservacionesHoy('');
    setCobradoEnPuerta(false);
    setAntecedentes({});
    setPestanaActiva('paciente');
  };

  const hayPacienteActivo = pacienteFicha || esNuevo;

  const configMensaje = mensaje?.startsWith('✅')
    ? {
        wrap: 'border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300',
        icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />,
      }
    : mensaje?.startsWith('❌')
    ? {
        wrap: 'border-rose-200/80 bg-rose-50 text-rose-800 ring-1 ring-rose-200 dark:border-rose-800/80 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900',
        icon: <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />,
      }
    : mensaje?.startsWith('⚠️')
    ? {
        wrap: 'border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/60 dark:text-amber-300',
        icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />,
      }
    : {
        wrap: 'border-slate-200/80 bg-slate-50 text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
        icon: null,
      };

  const textoBoton = guardando
    ? 'Enviando...'
    : `Derivar a Gabinete${zonasSeleccionadas.length ? ` (${zonasSeleccionadas.length})` : ''}`;

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-zinc-950">
      <div
        className={`mx-auto max-w-7xl space-y-5 px-3 py-3 sm:px-6 sm:py-6 lg:px-8 ${
          hayPacienteActivo ? 'pb-36 lg:pb-12' : 'pb-10'
        }`}
      >
        {/* Encabezado Principal */}
        <header className="flex flex-col gap-3 border-b border-slate-200/80 pb-3 transition-colors dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-600/20 sm:h-11 sm:w-11">
              <IdCard className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-2xl">
                Recepción
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 sm:text-sm">
                Búsqueda, evaluación clínica y derivación a gabinete
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:h-11 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              <span>Menú Admin</span>
            </Link>
          </div>
        </header>

        {/* Buscador Multicoincidencia (Siempre visible para cambiar o buscar rápido) */}
        <BuscadorMulticoincidencia
          onClienteSeleccionado={handleClienteSeleccionado}
          onVerHistorialDirecto={(id) => setPacienteIdModal(id)}
        />

        {mensaje && !hayPacienteActivo && (
          <div className={`flex items-start gap-2 rounded-xl border p-3.5 text-xs font-semibold shadow-sm sm:text-sm ${configMensaje.wrap}`}>
            {configMensaje.icon}
            <span>{mensaje}</span>
          </div>
        )}

        {hayPacienteActivo && (
          <div className="space-y-4">
{/* ──────────────────────────────────────────────────────────────
                SELECTOR DE PESTAÑAS MÓVILES (Optimizado tipo App App Store/Native)
                En PC grande (lg) se oculta y muestra todo en grid de 3 columnas.
               ────────────────────────────────────────────────────────────── */}
            <div className="flex rounded-2xl bg-slate-200/70 p-1 dark:bg-zinc-900 lg:hidden">
              <button
                type="button"
                onClick={() => setPestanaActiva('paciente')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  pestanaActiva === 'paciente'
                    , 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                }`}
              >
                <UserRound className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Paciente</span>
              </button>

              <button
                type="button"
                onClick={() => setPestanaActiva('anamnesis')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  pestanaActiva === 'anamnesis'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                }`}
              >
                <FileHeart className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Anamnesis</span>
              </button>

              <button
                type="button"
                onClick={() => setPestanaActiva('operacion')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  pestanaActiva === 'operacion'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                }`}
              >
                <ClipboardCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Gabinete</span>
                {zonasSeleccionadas.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                    {zonasSeleccionadas.length}
                  </span>
                )}
              </button>
            </div>

            {/* ──────────────────────────────────────────────────────────────
                CONTENEDOR DE SECCIONES (En celular se muestra solo la pestaña activa.
                En escritorio 'lg' se despliegan las 3 columnas completas lado a lado).
               ────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
              
              {/* SECCIÓN 1 · DATOS DEL PACIENTE */}
              <div className={`space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 sm:p-5 ${pestanaActiva === 'paciente' ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <IdCard className="h-3.5 w-3.5" />
                    Datos del paciente
                  </span>
                  <button
                    type="button"
                    onClick={limpiar}
                    title="Quitar paciente seleccionado"
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200/70 bg-rose-50/70 px-2.5 text-[11px] font-semibold text-rose-600 transition-all hover:bg-rose-100 active:scale-95 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-900/70"
                  >
                    <X className="h-3.5 w-3.5" />
                    Quitar
                  </button>
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100 dark:bg-teal-950/60 dark:text-teal-400 dark:ring-teal-900">
                    {esNuevo ? <UserPlus className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900 dark:text-zinc-100">
                      {esNuevo ? 'Nuevo paciente' : nombre || 'Paciente'}
                    </p>
                    {esNuevo ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                        Se creará ficha nueva hoy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Ficha clínica registrada
                      </span>
                    )}
                  </div>
                </div>

                <dl className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/70 px-3.5 py-2.5 dark:bg-zinc-800/60">
                    <dt className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Celular</dt>
                    <dd className="truncate font-medium text-slate-800 dark:text-zinc-200">{celular || '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/70 px-3.5 py-2.5 dark:bg-zinc-800/60">
                    <dt className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Fototipo</dt>
                    <dd className="truncate font-medium text-slate-800 dark:text-zinc-200">{fototipo}</dd>
                  </div>
                </dl>

                {pacienteFicha && (
                  <button
                    type="button"
                    onClick={() => setPacienteIdModal(pacienteFicha.id)}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    <ClipboardList className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    Ver historial completo
                  </button>
                )}

                {/* Botón táctil para pasar rápido de pestaña en móvil */}
                <div className="pt-2 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setPestanaActiva('anamnesis')}
                    className="flex h-11 w-full items-center justify-between rounded-xl bg-teal-50 px-4 text-xs font-bold text-teal-800 transition-all active:scale-[0.98] dark:bg-teal-950/60 dark:text-teal-300"
                  >
                    <span>Siguiente: Anamnesis clínica</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* SECCIÓN 2 · INFORMACIÓN MÉDICA / ANAMNESIS */}
              <div className={`space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 sm:p-5 ${pestanaActiva === 'anamnesis' ? 'block' : 'hidden lg:block'}`}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  <FileHeart className="h-3.5 w-3.5" />
                  Historial e información médica
                </span>

                <div className="border-b border-slate-100 pb-4 dark:border-zinc-800">
                  <BannerAlertasClinicas
                    antecedentes={antecedentes}
                    observacionesFijas={observacionesFijas}
                  />
                </div>

                <ChecklistAnamnesis
                  fototipo={fototipo}
                  setFototipo={setFototipo}
                  antecedentes={antecedentes}
                  setAntecedentes={setAntecedentes}
                  observacionesFijas={observacionesFijas}
                  setObservacionesFijas={setObservacionesFijas}
                />

                {/* Botón táctil para pasar a la última pestaña en móvil */}
                <div className="pt-2 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setPestanaActiva('operacion')}
                    className="flex h-11 w-full items-center justify-between rounded-xl bg-teal-50 px-4 text-xs font-bold text-teal-800 transition-all active:scale-[0.98] dark:bg-teal-950/60 dark:text-teal-300"
                  >
                    <span>Siguiente: Gabinete y Zonas</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* SECCIÓN 3 · ESTADO DE ATENCIÓN / ZONAS Y COBRO */}
              <div className={`space-y-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 sm:p-5 lg:sticky lg:top-6 ${pestanaActiva === 'operacion' ? 'block' : 'hidden lg:block'}`}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Estado de atención
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {ESTADOS_ATENCION.map(({ key, label, icon: Icon }) => {
                    const activo = key === 'en_espera';
                    return (
                      <div
                        key={key}
                        className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                          activo
                            ? 'border-teal-300 bg-teal-50 text-teal-800 ring-1 ring-teal-200 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300 dark:ring-teal-900'
                            : 'border-slate-200/70 bg-slate-50/60 text-slate-400 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-500'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${activo ? 'text-teal-600 dark:text-teal-400' : 'text-slate-300 dark:text-zinc-600'}`} />
                        {label}
                      </div>
                    );
                  })}
                </div>
                <p className="-mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-600" />
                  Al enviar, el paciente pasa automáticamente a "En espera" en Gabinete.
                </p>

                <div className="border-t border-slate-100 pt-4 dark:border-zinc-800">
                  <ResumenReservaCobro
                    reserva={reservaHoy}
                    cobradoEnPuerta={cobradoEnPuerta}
                    onToggleCobrado={setCobradoEnPuerta}
                  />
                </div>

                <div className="border-t border-slate-100 pt-4 dark:border-zinc-800">
                  <SelectorZonasBotones
                    zonasSeleccionadas={zonasSeleccionadas}
                    setZonasSeleccionadas={setZonasSeleccionadas}
                  />
                </div>

                <div className="border-t border-slate-100 pt-4 dark:border-zinc-800">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Notas para gabinete
                  </label>
                  <input
                    type="text"
                    value={observacionesHoy}
                    onChange={(e) => setObservacionesHoy(e.target.value)}
                    placeholder="Ej: Sensibilidad leve en axilas..."
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                  />
                </div>

                {mensaje && (
                  <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold ${configMensaje.wrap}`}>
                    {configMensaje.icon}
                    <span>{mensaje}</span>
                  </div>
                )}

                <button
                  onClick={handleEnviarAGabinete}
                  disabled={guardando}
                  className="hidden h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none lg:flex"
                >
                  {textoBoton}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
{/* ──────────────────────────────────────────────────────────────
          BARRA INFERIOR FIJA (STICKY FOOTER MÓVIL)
          Diseñada con altura de toque cómoda y espacio de seguridad inferior (pb-safe)
         ────────────────────────────────────────────────────────────── */}
      {hayPacienteActivo && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 lg:hidden shadow-2xl">
          <div className="mx-auto flex max-w-7xl items-center gap-2.5">
            <button
              type="button"
              onClick={limpiar}
              title="Quitar paciente seleccionado"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-200/70 bg-rose-50/70 text-rose-600 transition-all active:scale-95 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400 shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={handleEnviarAGabinete}
              disabled={guardando}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{textoBoton}</span>
            </button>
          </div>
        </div>
      )}

      <ModalHistorialSesiones
        pacienteId={pacienteIdModal || ''}
        celularPaciente={pacienteFicha?.celular || celular}
        isOpen={!!pacienteIdModal}
        onClose={() => setPacienteIdModal(null)}
      />
    </div>
  );
}