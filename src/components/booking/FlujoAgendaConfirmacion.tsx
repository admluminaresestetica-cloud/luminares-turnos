'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function FlujoAgendaConfirmacion({
  tipo,
  precioTotal,
  duracionTotal,
  detalleTexto,
  detalleReserva,
  volverHref,
  onVolver,
  volverLabel = '← Modificar selección',
  colorAccent = 'violet',
  titulo = 'Agenda',
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

    window.location.href = buildWhatsAppUrl(configSistema.whatsapp_numero, mensaje);
  };

  if (cargandoConfig) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-400 text-sm">Cargando calendario...</p>
      </main>
    );
  }

  if (!configCalendario || !configSistema) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No se pudo cargar la configuración del calendario.</p>
          {volverHref ? (
            <Link href={volverHref} className="text-violet-600 font-semibold hover:underline">
              Volver
            </Link>
          ) : onVolver ? (
            <button type="button" onClick={onVolver} className="text-violet-600 font-semibold hover:underline">
              Volver
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
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 pb-24">
      <div className="max-w-lg mx-auto">
        {volverHref ? (
          <Link href={volverHref} className="text-sm text-violet-600 font-semibold hover:underline inline-block mb-6">
            {volverLabel}
          </Link>
        ) : onVolver ? (
          <button
            type="button"
            onClick={onVolver}
            className="text-sm text-violet-600 font-semibold hover:underline inline-block mb-6"
          >
            {volverLabel}
          </button>
        ) : null}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paso === 'agenda' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
              1. Fecha y hora
            </span>
            <span className="text-slate-300">→</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paso === 'confirmacion' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
              2. Confirmación
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-1">{titulo}</h1>
          <p className="text-sm text-slate-500 mb-6 truncate">{detalleTexto}</p>

          {paso === 'agenda' && (
            <div className="space-y-6">
              <section>
                <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                  Elegí la fecha
                </h2>
                <SelectorFecha
                  tipo={tipo}
                  fechasLaser={fechasLaser}
                  diasSemana={diasSemana}
                  fechaSeleccionada={fecha}
                  onSelect={setFecha}
                />
              </section>

              {fecha && (
                <section>
                  <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    Elegí el horario
                  </h2>
                  <SelectorHorario
                    slots={slots}
                    horaSeleccionada={hora}
                    onSelect={setHora}
                    cargando={cargandoSlots}
                  />
                </section>
              )}

              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm flex justify-between">
                <span className="text-slate-600">Total</span>
                <span className="font-bold text-slate-800">
                  ${precioTotal.toLocaleString('es-AR')} · {duracionTotal} min
                </span>
              </div>

              <button
                type="button"
                disabled={!fecha || !hora}
                onClick={() => setPaso('confirmacion')}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Continuar a confirmación
              </button>
            </div>
          )}

          {paso === 'confirmacion' && fecha && hora && (
            <div>
              <button
                type="button"
                onClick={() => setPaso('agenda')}
                className="text-sm text-violet-600 font-semibold hover:underline mb-4"
              >
                ← Cambiar fecha u hora
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
    </main>
  );
}
