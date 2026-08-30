'use client';

import { useState } from 'react';
import type { ConfiguracionCalendario, Reserva } from '@/lib/types';
import { validarSlotDisponible, horaDeReserva, fechaDeReserva } from '@/lib/admin/validacion';
import { actualizarReservaAdmin } from '@/lib/supabase/admin/reservas';
import { ESTADOS_ASISTENCIA, ESTADOS_RESERVA, MEDIOS_PAGO } from '@/lib/admin/constants';

interface Props {
  reserva: Reserva;
  reservas: Reserva[];
  configCalendario: ConfiguracionCalendario;
  readonly?: boolean;
  onClose: () => void;
  onSaved: (r: Reserva) => void;
}

export default function ModalEditarReserva({
  reserva,
  reservas,
  configCalendario,
  readonly,
  onClose,
  onSaved,
}: Props) {
  const [nombre, setNombre] = useState(reserva.cliente_nombre);
  const [celular, setCelular] = useState(reserva.cliente_celular);
  const [fecha, setFecha] = useState(fechaDeReserva(reserva.fecha_hora_inicio));
  const [hora, setHora] = useState(horaDeReserva(reserva.fecha_hora_inicio));
  const [estado, setEstado] = useState(reserva.estado);
  const [asistencia, setAsistencia] = useState(reserva.estado_asistencia || 'pendiente');
  const [medioPago, setMedioPago] = useState(reserva.medio_pago || '');
  const [precio, setPrecio] = useState(Number(reserva.precio_total));
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;

    const validacion = validarSlotDisponible(
      fecha,
      hora,
      reserva.duracion_total,
      reserva.id,
      reservas,
      configCalendario
    );

    if (!validacion.ok) {
      setError(validacion.mensaje ?? 'Horario no disponible');
      return;
    }

    setGuardando(true);
    setError(null);

    const fechaHoraInicio = new Date(`${fecha}T${hora}:00`).toISOString();
    const updated = await actualizarReservaAdmin({
      id: reserva.id,
      cliente_nombre: nombre.trim(),
      cliente_celular: celular.trim(),
      fecha_hora_inicio: fechaHoraInicio,
      estado,
      estado_asistencia: asistencia,
      medio_pago: medioPago || null,
      precio_total: precio,
    });

    setGuardando(false);

    if (!updated) {
      setError('No se pudo guardar la reserva.');
      return;
    }

    onSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Editar reserva</h2>
            <p className="text-xs text-slate-500 font-mono">{reserva.codigo_unico}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ×
          </button>
        </div>

        {readonly && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
            Esta jornada está cerrada. Solo lectura. Desbloqueá la jornada para editar.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={readonly}
                required
                className="w-full border border-slate-200 rounded-lg p-2 text-sm disabled:bg-slate-50"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Celular</label>
              <input
                type="tel"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                disabled={readonly}
                required
                className="w-full border border-slate-200 rounded-lg p-2 text-sm disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                disabled={readonly}
                required
                className="w-full border border-slate-200 rounded-lg p-2 text-sm disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hora</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                disabled={readonly}
                required
                className="w-full border border-slate-200 rounded-lg p-2 text-sm disabled:bg-slate-50"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Duración del turno: {reserva.duracion_total} min · Tipo: {reserva.servicio_tipo}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Estado reserva</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as typeof estado)}
                disabled={readonly}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm disabled:bg-slate-50"
              >
                {ESTADOS_RESERVA.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Asistencia</label>
              <select
                value={asistencia}
                onChange={(e) => setAsistencia(e.target.value as typeof asistencia)}
                disabled={readonly}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm disabled:bg-slate-50"
              >
                {ESTADOS_ASISTENCIA.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Medio de pago</label>
              <select
                value={medioPago}
                onChange={(e) => setMedioPago(e.target.value)}
                disabled={readonly}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm disabled:bg-slate-50"
              >
                <option value="">Sin asignar</option>
                {MEDIOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Precio total ($)</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                disabled={readonly}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm disabled:bg-slate-50"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {readonly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!readonly && (
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 text-sm bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
