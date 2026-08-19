'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import SelectorFecha from '@/components/booking/SelectorFecha';
import SelectorHorario from '@/components/booking/SelectorHorario';
import FormConfirmacion from '@/components/booking/FormConfirmacion';
import { calcularSlotsDisponibles } from '@/lib/calendario/slots';
import { getConfiguracionCalendario, getConfiguracionSistema } from '@/lib/supabase/configuracion';
import { crearReserva, getReservasPorFecha } from '@/lib/supabase/reservas';
import {
  buildMensajeReserva,
  buildWhatsAppUrl,
  calcularMontoSena,
} from '@/lib/whatsapp';
import type { ConfiguracionCalendario, ConfiguracionSistema, TipoServicio } from '@/lib/types';
import type { DetalleReservaGeneral, DetalleReservaLaser } from '@/lib/types';

type Paso = 'agenda' | 'confirmacion';

interface Props {
  tipo: TipoServicio;
  precioTotal: number;
  duracionTotal: number;
  detalleTexto: string;
  detalleReserva: DetalleReservaLaser | DetalleReservaGeneral;
  volverHref?: string;
  onVolver?: () => void;
  volverLabel?: string;
  colorAccent?: 'violet' | 'indigo' | 'rose';
  titulo?: string;
}

interface DatosReservaExitosa {
  codigo: string;
  detalle: string;
  fecha: string;
  hora: string;
}

const COLOR_ACCENTS = {
  violet: {
    stepActive: 'bg-violet-600 text-white shadow-sm',
    badge: 'bg-violet-50 text-violet-700 border-violet-200/80',
    button: 'bg-violet-600 hover:bg-violet-500 text-white',
    link: 'text-violet-600 hover:text-violet-700',
    summaryBg: 'bg-violet-50/50 border-violet-100',
  },
  indigo: {
    stepActive: 'bg-indigo-600 text-white shadow-sm',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    button: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    link: 'text-indigo-600 hover:text-indigo-700',
    summaryBg: 'bg-indigo-50/50 border-indigo-100',
  },
  rose: {
    stepActive: 'bg-rose-500 text-white shadow-sm',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    button: 'bg-rose-500 hover:bg-rose-400 text-white',
    link: 'text-rose-600 hover:text-rose-700',
    summaryBg: 'bg-rose-50/50 border-rose-100',
  },
};

export default function FlujoAgendaConfirmacion({
  tipo,
  precioTotal,
  duracionTotal,
  detalleTexto,
  detalleReserva,
  volverHref,
  onVolver,
  volverLabel = 'Modificar selección',
  colorAccent = 'violet',
  titulo = 'Agenda tu turno',
}: Props) {
  const [paso, setPaso] = useState<Paso>('agenda');
  const [configCalendario, setConfigCalendario] = useState<ConfiguracionCalendario | null>(null);
  const [configSistema, setConfigSistema] = useState<ConfiguracionSistema | null>(null);
  const [cargandoConfig, setCargandoConfig] = useState(true);

  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);

  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado que lee sessionStorage de inmediato si existe
  const [reservaExitosa, setReservaExitosa] = useState<DatosReservaExitosa | null>(() => {
    if (typeof window !== 'undefined') {
      const guardado = sessionStorage.getItem('reserva-exitosa');
      if (guardado) {
        try {
          return JSON.parse(guardado);
        } catch (e) {
          sessionStorage.removeItem('reserva-exitosa');
        }
      }
    }
    return null;
  });

  const styles = COLOR_ACCENTS[colorAccent] || COLOR_ACCENTS.violet;

  useEffect(() => {
    async function cargar() {
      setCargandoConfig(true);
      const [cal, sys] = await Promise.all([
        getConfiguracionCalendario(tipo),
        getConfiguracionSistema(),
      ]);
      setConfigCalendario(cal);
      setConfigSistema(sys);
      setCargandoConfig(false);
    }
    cargar();
  }, [tipo]);

  const cargarSlots = useCallback(async (fechaSel: string) => {
    if (!configCalendario) return;
    setCargandoSlots(true);
    setHora(null);
    const reservas = await getReservasPorFecha(fechaSel);
    const disponibles = calcularSlotsDisponibles(
      fechaSel,
      duracionTotal,
      configCalendario.horarios_atencion,
      reservas
    );
    setSlots(disponibles);
    setCargandoSlots(false);
  }, [configCalendario, duracionTotal]);

  useEffect(() => {
    if (fecha && configCalendario) {
      cargarSlots(fecha);
    }
  }, [fecha, configCalendario, cargarSlots]);

  const handleConfirmar = async () => {
    if (!fecha || !hora || !configSistema) return;
    setConfirmando(true);
    setError(null);

    const fechaHoraInicio = new Date(`${fecha}T${hora}:00`).toISOString();
    const reserva = await crearReserva({
      cliente_nombre: nombre.trim(),
      cliente_celular: celular.trim(),
      servicio_tipo: tipo,
      detalle_reserva: { ...detalleReserva, detalle_texto: detalleTexto },
      precio_total: precioTotal,
      duracion_total: duracionTotal,
      fecha_hora_inicio: fechaHoraInicio,
    });

    setConfirmando(false);

    if (!reserva) {
      setError('No pudimos crear la reserva. Intentá de nuevo.');
      return;
    }

    const datosExito: DatosReservaExitosa = {
      codigo: reserva.codigo_unico,
      detalle: detalleTexto,
      fecha,
      hora,
    };

    // 1. Guardar en memoria de sesión
    sessionStorage.setItem('reserva-exitosa', JSON.stringify(datosExito));

    // 2. Activar modal inmediatamente en el cliente sin depender del reload
    setReservaExitosa(datosExito);

    const montoSena = calcularMontoSena(precioTotal, configSistema.porcentaje_sena);
    const mensaje = buildMensajeReserva({
      codigo: reserva.codigo_unico,
      clienteNombre: nombre.trim(),
      servicioDetalle: detalleTexto,
      fecha,
      hora,
      precioTotal,
      montoSena,
    });

    // 3. Redirigir a WhatsApp
    const urlWhatsapp = buildWhatsAppUrl('5493413954355', mensaje);
    window.open(urlWhatsapp, '_blank') || (window.location.href = urlWhatsapp);
  };

  if (cargandoConfig) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
        <p className="text-slate-500 text-xs font-medium">Cargando disponibilidad...</p>
      </main>
    );
  }

  if (!configCalendario || !configSistema) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm max-w-sm text-center">
          <p className="text-slate-700 text-sm font-medium mb-4">
            No se pudo cargar la configuración del calendario.
          </p>
          {volverHref ? (
            <Link href={volverHref} className={`text-xs font-bold ${styles.link}`}>
              Volver al inicio
            </Link>
          ) : onVolver ? (
            <button type="button" onClick={onVolver} className={`text-xs font-bold ${styles.link}`}>
              Volver al inicio
            </button>
          ) : null}
        </div>
      </main>
    );
  }

  const fechasLaser = (configCalendario.fechas_habilitadas_laser ?? []).map((f) =>
    String(f).slice(0, 10)
  );
  const diasSemana = configCalendario.horarios_atencion.dias_semana;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-12 pb-24 relative">
      <div className="max-w-lg mx-auto">
        {/* Botón Volver */}
        <div className="mb-4">
          {volverHref ? (
            <Link
              href={volverHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{volverLabel}</span>
            </Link>
          ) : onVolver ? (
            <button
              type="button"
              onClick={onVolver}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{volverLabel}</span>
            </button>
          ) : null}
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-sm">
          {/* Indicador de Pasos */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                paso === 'agenda' ? styles.stepActive : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Calendar className="w-3 h-3" />
              1. Fecha y hora
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                paso === 'confirmacion' ? styles.stepActive : 'bg-slate-100 text-slate-500'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              2. Confirmación
            </span>
          </div>

          {/* Header del Servicio */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {titulo}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed truncate">
              {detalleTexto}
            </p>
          </div>

          {/* PASO 1: AGENDA */}
          {paso === 'agenda' && (
            <div className="space-y-6">
              <section>
                <div className="flex items-center gap-1.5 mb-3">
                  <Calendar className="w-4 h-4 text-slate-700" />
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Elegí la fecha
                  </h2>
                </div>
                <SelectorFecha
                  tipo={tipo}
                  fechasLaser={fechasLaser}
                  diasSemana={diasSemana}
                  fechaSeleccionada={fecha}
                  onSelect={setFecha}
                />
              </section>

              {fecha && (
                <section className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Elegí el horario
                    </h2>
                  </div>
                  <SelectorHorario
                    slots={slots}
                    horaSeleccionada={hora}
                    onSelect={setHora}
                    cargando={cargandoSlots}
                  />
                </section>
              )}

              {/* Resumen Total */}
              <div
                className={`border rounded-xl p-4 flex justify-between items-center transition-colors ${styles.summaryBg}`}
              >
                <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                  <Sparkles className="w-4 h-4 text-slate-700" />
                  <span>Resumen</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                    ${precioTotal.toLocaleString('es-AR')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-2">
                    ({duracionTotal} min)
                  </span>
                </div>
              </div>

              {/* Botón Siguiente */}
              <button
                type="button"
                disabled={!fecha || !hora}
                onClick={() => setPaso('confirmacion')}
                className={`w-full font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-xs disabled:bg-slate-100 disabled:text-slate-400 ${styles.button}`}
              >
                <span>Continuar a confirmación</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 2: CONFIRMACIÓN */}
          {paso === 'confirmacion' && fecha && hora && (
            <div>
              <button
                type="button"
                onClick={() => setPaso('agenda')}
                className={`inline-flex items-center gap-1 text-xs font-semibold mb-4 transition-colors ${styles.link}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cambiar fecha u hora</span>
              </button>

              <FormConfirmacion
                servicioDetalle={detalleTexto}
                precioTotal={precioTotal}
                duracionTotal={duracionTotal}
                fecha={fecha}
                hora={hora}
                porcentajeSena={configSistema.porcentaje_sena}
                nombre={nombre}
                celular={celular}
                onNombreChange={setNombre}
                onCelularChange={setCelular}
                onConfirmar={handleConfirmar}
                confirmando={confirmando}
                error={error}
                colorAccent={colorAccent}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL POP-UP DE RESERVA EXITOSA */}
      {reservaExitosa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">¡Turno Reservado!</h3>
            
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Código único: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{reservaExitosa.codigo}</span>
            </p>
            
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-left space-y-2 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Servicio / Selección</span>
                <p className="text-xs text-slate-700 font-semibold">{reservaExitosa.detalle}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Fecha</span>
                  <p className="text-xs text-slate-700 font-medium">{reservaExitosa.fecha}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Horario</span>
                  <p className="text-xs text-slate-700 font-medium">{reservaExitosa.hora} hs</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-5 leading-tight">
              Si fuiste redirigido a WhatsApp, asegurate de enviar el mensaje para finalizar la coordinación.
            </p>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('reserva-exitosa');
                window.location.href = '/';
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
