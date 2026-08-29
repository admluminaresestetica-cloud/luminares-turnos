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
  Loader2,
  Gift,
  Copy,
  Check
} from 'lucide-react';
import SelectorFecha from '@/components/booking/SelectorFecha';
import SelectorHorario from '@/components/booking/SelectorHorario';
import FormConfirmacion from '@/components/booking/FormConfirmacion';
import { calcularSlotsDisponibles } from '@/lib/calendario/slots';
import { getConfiguracionCalendario, getConfiguracionSistema } from '@/lib/supabase/configuracion';
import { crearReserva, getReservasPorFecha } from '@/lib/supabase/reservas';
import { supabase } from '@/lib/supabase';
import { generarCodigoReferido } from '@/lib/admin/helpers';
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
  codigoReferidoPropio: string;
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
  const [codigoReferidoUsado, setCodigoReferidoUsado] = useState('');
  
  // Estados para validación de referido
  const [descuentoMonto, setDescuentoMonto] = useState(0);
  const [referidoValido, setReferidoValido] = useState<boolean | null>(null);
  const [mensajeReferido, setMensajeReferido] = useState<string | null>(null);

  const [confirmando, setConfirmando] = useState(false);
  const [cargandoMP, setCargandoMP] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

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

  // Carga inicial de datos de configuración
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

  // Si el usuario regresa a la pantalla mediante el botón "Atrás" del navegador descongela los botones
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      setCargandoMP(false);
      setConfirmando(false);
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Validar el código de referido en tiempo real
  useEffect(() => {
    async function validarCodigo() {
      const cod = codigoReferidoUsado.trim().toUpperCase();

      if (!cod) {
        setReferidoValido(null);
        setMensajeReferido(null);
        setDescuentoMonto(0);
        return;
      }

      if (!configSistema?.referidos_activo) {
        setReferidoValido(false);
        setMensajeReferido('El programa de referidos no está activo en este momento.');
        setDescuentoMonto(0);
        return;
      }

      const valorDescuento = configSistema.referidos_valor_descuento ?? 0;

      const { data: dueno } = await supabase
        .from('clientes')
        .select('id, nombre')
        .eq('codigo_referido', cod)
        .maybeSingle();

      if (!dueno) {
        setReferidoValido(false);
        setMensajeReferido('Código no encontrado. Verificalo e intentá de nuevo.');
        setDescuentoMonto(0);
        return;
      }

      let desc = 0;
      if (configSistema.referidos_tipo_descuento === 'porcentaje') {
        desc = Math.round((precioTotal * valorDescuento) / 100);
      } else {
        desc = valorDescuento;
      }

      setReferidoValido(true);
      setMensajeReferido(`¡Código válido de ${dueno.nombre}! Se aplicó un descuento de $${desc.toLocaleString('es-AR')}.`);
      setDescuentoMonto(desc);
    }

    validarCodigo();
  }, [codigoReferidoUsado, configSistema, precioTotal]);

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

  // Función auxiliar para registrar cliente y referidos en DB
  const prepararReservaBase = async () => {
    if (!fecha || !hora || !configSistema) return null;

    const celularLimpio = celular.replace(/\D/g, '');
    const nombreLimpio = nombre.trim();
    let codigoReferidoPropio = '';

    // 1. Gestión de cliente
    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('codigo_referido')
      .eq('celular', celularLimpio)
      .maybeSingle();

    if (clienteExistente) {
      codigoReferidoPropio = clienteExistente.codigo_referido;
    } else {
      codigoReferidoPropio = generarCodigoReferido(nombreLimpio);
      await supabase.from('clientes').insert([
        {
          celular: celularLimpio,
          nombre: nombreLimpio,
          codigo_referido: codigoReferidoPropio,
          descuentos_disponibles: 0,
        },
      ]);
    }

    // 2. Beneficio de referidos
    const codigoUsadoLimpio = codigoReferidoUsado.trim().toUpperCase();
    if (codigoUsadoLimpio && referidoValido) {
      const { data: duenoCodigo } = await supabase
        .from('clientes')
        .select('id, descuentos_disponibles')
        .eq('codigo_referido', codigoUsadoLimpio)
        .maybeSingle();

      if (duenoCodigo) {
        await supabase
          .from('clientes')
          .update({ descuentos_disponibles: (duenoCodigo.descuentos_disponibles || 0) + 1 })
          .eq('id', duenoCodigo.id);
      }
    }

    const precioFinal = Math.max(0, precioTotal - descuentoMonto);
    const fechaHoraInicio = new Date(`${fecha}T${hora}:00`).toISOString();

    // 3. Crear reserva en DB
    const reserva = await crearReserva({
      cliente_nombre: nombreLimpio,
      cliente_celular: celularLimpio,
      codigo_referido_usado: (referidoValido && codigoUsadoLimpio) ? codigoUsadoLimpio : null,
      servicio_tipo: tipo,
      detalle_reserva: { ...detalleReserva, detalle_texto: detalleTexto },
      precio_total: precioFinal,
      duracion_total: duracionTotal,
      fecha_hora_inicio: fechaHoraInicio,
    });

    return {
      reserva,
      nombreLimpio,
      celularLimpio,
      precioFinal,
      codigoReferidoPropio,
      codigoUsadoLimpio,
    };
  };

  // CONFIRMAR POR WHATSAPP
  const handleConfirmar = async () => {
    setConfirmando(true);
    setError(null);

    try {
      const base = await prepararReservaBase();
      setConfirmando(false);

      if (!base || !base.reserva) {
        setError('No pudimos crear la reserva. Intentá de nuevo.');
        return;
      }

      const { reserva, nombreLimpio, precioFinal, codigoReferidoPropio, codigoUsadoLimpio } = base;

      const datosExito: DatosReservaExitosa = {
        codigo: reserva.codigo_unico,
        codigoReferidoPropio,
        detalle: detalleTexto,
        fecha: fecha!,
        hora: hora!,
      };

      sessionStorage.setItem('reserva-exitosa', JSON.stringify(datosExito));
      setReservaExitosa(datosExito);

      const montoSena = calcularMontoSena(precioFinal, configSistema!.porcentaje_sena);
      let mensaje = buildMensajeReserva({
        codigo: reserva.codigo_unico,
        clienteNombre: nombreLimpio,
        servicioDetalle: detalleTexto,
        fecha: fecha!,
        hora: hora!,
        precioTotal: precioFinal,
        montoSena,
      });

      if (descuentoMonto > 0) {
        mensaje += `\n🎟️ *Descuento aplicado:* -$${descuentoMonto.toLocaleString('es-AR')} (Ref: ${codigoUsadoLimpio})`;
      }

      mensaje += `\n\n🎁 *Tu código de recomendada:* ${codigoReferidoPropio}`;

      const urlWhatsapp = buildWhatsAppUrl('5493413954355', mensaje);
      window.open(urlWhatsapp, '_blank') || (window.location.href = urlWhatsapp);

    } catch (e) {
      console.error(e);
      setConfirmando(false);
      setError('Ocurrió un error al procesar la reserva.');
    }
  };

  // PAGAR CON MERCADO PAGO
  const handlePagarMercadoPago = async (montoAPagar: number) => {
    setCargandoMP(true);
    setError(null);

    try {
      const base = await prepararReservaBase();

      if (!base || !base.reserva) {
        setCargandoMP(false);
        setError('No pudimos registrar la reserva antes del pago. Intentá de nuevo.');
        return;
      }

      const { reserva, nombreLimpio } = base;

      // Llamada a la API de checkout de reserva
      const response = await fetch('/api/checkout-reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservaId: reserva.id,
          clienteNombre: nombreLimpio,
          servicioDetalle: detalleTexto,
          montoAPagar,
          tipoPago: 'sena',
        }),
      });

      const data = await response.json();

      if (response.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        setCargandoMP(false);
        setError(data.error || 'No se pudo generar la preferencia de pago.');
      }
    } catch (e) {
      console.error(e);
      setCargandoMP(false);
      setError('Ocurrió un error de conexión con Mercado Pago.');
    }
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (cargandoConfig) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
        <p className="text-slate-500 text-xs font-medium">Cargando disponibilidad...</p>
      </main>
    );
  }

  if (!configCalendario || !configSistema) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm max-w-sm w-full text-center">
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
    <main className="min-h-screen bg-slate-50 px-3 py-4 sm:p-6 md:p-12 pb-20 sm:pb-24 relative">
      <div className="max-w-lg mx-auto">
        {/* Botón Volver */}
        <div className="mb-3 sm:mb-4">
          {volverHref ? (
            <Link
              href={volverHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{volverLabel}</span>
            </Link>
          ) : onVolver ? (
            <button
              type="button"
              onClick={onVolver}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{volverLabel}</span>
            </button>
          ) : null}
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-7 shadow-xs">
          {/* Indicador de Pasos */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 no-scrollbar">
            <span
              className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 rounded-full transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                paso === 'agenda' ? styles.stepActive : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Calendar className="w-3 h-3" />
              1. Fecha y hora
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span
              className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 rounded-full transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                paso === 'confirmacion' ? styles.stepActive : 'bg-slate-100 text-slate-500'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              2. Confirmación
            </span>
          </div>

          {/* Header del Servicio */}
          <div className="mb-5 sm:mb-6">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {titulo}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-normal line-clamp-2 sm:line-clamp-none">
              {detalleTexto}
            </p>
          </div>

          {/* PASO 1: AGENDA */}
          {paso === 'agenda' && (
            <div className="space-y-5 sm:space-y-6">
              <section>
                <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3">
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
                  <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3">
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
                className={`border rounded-xl p-3.5 sm:p-4 flex justify-between items-center transition-colors ${styles.summaryBg}`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs font-medium">
                  <Sparkles className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Resumen</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                    ${precioTotal.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium ml-1.5 sm:ml-2">
                    ({duracionTotal} min)
                  </span>
                </div>
              </div>

              {/* Botón Siguiente */}
              <button
                type="button"
                disabled={!fecha || !hora}
                onClick={() => setPaso('confirmacion')}
                className={`w-full font-bold py-3.5 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 ${styles.button}`}
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
                className={`inline-flex items-center gap-1 text-xs font-semibold mb-4 transition-colors p-1 -ml-1 ${styles.link}`}
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
                codigoReferidoUsado={codigoReferidoUsado}
                descuentoMonto={descuentoMonto}
                referidoValido={referidoValido}
                mensajeReferido={mensajeReferido}
                onNombreChange={setNombre}
                onCelularChange={setCelular}
                onCodigoReferidoChange={setCodigoReferidoUsado}
                onConfirmar={handleConfirmar}
                confirmando={confirmando}
                error={error}
                colorAccent={colorAccent}
                onPagarMercadoPago={handlePagarMercadoPago}
                cargandoMP={cargandoMP}
                onCancelarMP={() => setCargandoMP(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL POP-UP DE RESERVA EXITOSA */}
      {reservaExitosa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-base sm:text-lg font-bold text-slate-900">¡Turno Reservado!</h3>
            
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Código de reserva: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{reservaExitosa.codigo}</span>
            </p>
            
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-100 text-left space-y-2 mb-3">
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

            {/* CAJA DEL CÓDIGO DE RECOMENDADA */}
            {reservaExitosa.codigoReferidoPropio && (
              <div className="bg-violet-50/70 border border-violet-100 p-3 rounded-xl mb-4 text-left">
                <div className="flex items-center gap-1.5 text-violet-800 mb-1">
                  <Gift className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] font-bold">¡Sumá descuentos!</span>
                </div>
                <p className="text-[10px] text-violet-600 mb-2 leading-tight">
                  Compartí tu código con tus amigas. Si lo usan al reservar, ¡sumás un beneficio para tu próxima sesión!
                </p>
                <div className="flex items-center justify-between bg-white border border-violet-200/80 rounded-lg p-2">
                  <span className="font-mono text-xs font-black text-violet-900 tracking-wide">
                    {reservaExitosa.codigoReferidoPropio}
                  </span>
                  <button
                    type="button"
                    onClick={() => copiarCodigo(reservaExitosa.codigoReferidoPropio)}
                    className="text-[10px] font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-md transition-colors"
                  >
                    {copiado ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] sm:text-[11px] text-slate-400 mb-4 sm:mb-5 leading-tight">
              Si fuiste redirigido a WhatsApp, asegurate de enviar el mensaje para finalizar la coordinación.
            </p>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('reserva-exitosa');
                window.location.href = '/';
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-xs"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </main>
  );
}