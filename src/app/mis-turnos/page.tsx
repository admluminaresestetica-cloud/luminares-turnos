'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDetalleReservaDisplay, formatEstadoReserva } from '@/lib/booking/detalle';
import { formatFechaDisplay, puedeCancelarReserva } from '@/lib/calendario/slots';
import { getConfiguracionSistema } from '@/lib/supabase/configuracion';
import { buscarReserva, cancelarReserva } from '@/lib/supabase/reservas';
import type { Reserva } from '@/lib/types';

export default function MisTurnosPage() {
  const [celular, setCelular] = useState('');
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ventanaHoras, setVentanaHoras] = useState(24);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setReserva(null);
    setBuscando(true);

    const [found, config] = await Promise.all([
      buscarReserva(celular, codigo),
      getConfiguracionSistema(),
    ]);

    if (config) setVentanaHoras(config.ventana_horas_cancelacion);

    setBuscando(false);

    if (!found) {
      setError('No encontramos una reserva con esos datos. Verificá el celular y el código.');
      return;
    }

    setReserva(found);
  };

  const handleCancelar = async () => {
    if (!reserva) return;
    setCancelando(true);
    setError(null);
    setMensaje(null);

    const ok = await cancelarReserva(reserva.id);
    setCancelando(false);

    if (!ok) {
      setError('No pudimos cancelar la reserva. Intentá de nuevo.');
      return;
    }

    setReserva({ ...reserva, estado: 'cancelado' });
    setMensaje('Tu reserva fue cancelada correctamente.');
  };

  const fechaReserva = reserva
    ? new Date(reserva.fecha_hora_inicio)
    : null;

  const fechaStr = fechaReserva
    ? `${fechaReserva.getFullYear()}-${String(fechaReserva.getMonth() + 1).padStart(2, '0')}-${String(fechaReserva.getDate()).padStart(2, '0')}`
    : '';

  const horaStr = fechaReserva
    ? `${String(fechaReserva.getHours()).padStart(2, '0')}:${String(fechaReserva.getMinutes()).padStart(2, '0')}`
    : '';

  const estadoInfo = reserva ? formatEstadoReserva(reserva.estado) : null;
  const puedeCancelar = reserva
    ? puedeCancelarReserva(reserva.fecha_hora_inicio, ventanaHoras, reserva.estado)
    : false;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-indigo-600 font-semibold hover:underline inline-block mb-8">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 mb-3 text-center">Mis Turnos</h1>
        <p className="text-slate-600 mb-8 text-center text-sm">
          Ingresá tu celular y código de reserva (#7842) para ver o cancelar tu turno.
        </p>

        <form onSubmit={handleBuscar} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4 mb-6">
          <div>
            <label htmlFor="celular" className="block text-sm font-semibold text-slate-700 mb-2">
              Celular
            </label>
            <input
              id="celular"
              type="tel"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="Ej: 11 2345-6789"
              required
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label htmlFor="codigo" className="block text-sm font-semibold text-slate-700 mb-2">
              Código de reserva
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="#7842"
              required
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button
            type="submit"
            disabled={buscando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {buscando ? 'Buscando...' : 'Buscar turno'}
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 mb-4">{error}</p>
        )}

        {mensaje && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">{mensaje}</p>
        )}

        {reserva && estadoInfo && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-800">{reserva.codigo_unico}</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estadoInfo.className}`}>
                {estadoInfo.label}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Cliente:</span>{' '}
                <strong>{reserva.cliente_nombre}</strong>
              </p>
              <p>
                <span className="text-slate-500">Servicio:</span>{' '}
                <strong>{formatDetalleReservaDisplay(reserva)}</strong>
              </p>
              <p>
                <span className="text-slate-500">Tipo:</span>{' '}
                <strong>{reserva.servicio_tipo === 'laser' ? 'Depilación láser' : 'Servicio general'}</strong>
              </p>
              <p>
                <span className="text-slate-500">Fecha:</span>{' '}
                <strong>{formatFechaDisplay(fechaStr)}</strong>
              </p>
              <p>
                <span className="text-slate-500">Hora:</span>{' '}
                <strong>{horaStr}</strong>
              </p>
              <p>
                <span className="text-slate-500">Duración:</span>{' '}
                <strong>{reserva.duracion_total} min</strong>
              </p>
              <p>
                <span className="text-slate-500">Total:</span>{' '}
                <strong>${Number(reserva.precio_total).toLocaleString('es-AR')}</strong>
              </p>
            </div>

            {reserva.estado !== 'cancelado' && (
              <div className="pt-2">
                {puedeCancelar ? (
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={cancelando}
                    className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {cancelando ? 'Cancelando...' : 'Cancelar reserva'}
                  </button>
                ) : (
                  <p className="text-xs text-slate-500 text-center bg-slate-50 rounded-xl p-3">
                    No podés cancelar: faltan menos de {ventanaHoras} horas para el turno.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
