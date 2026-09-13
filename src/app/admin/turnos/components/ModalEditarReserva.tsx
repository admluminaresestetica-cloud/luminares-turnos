// src/components/admin/ModalEditarReserva.tsx
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-gray-100 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-colors">
        {/* Handle visual estilo bottom sheet, solo mobile */}
        <div className="sm:hidden w-10 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Editar reserva</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{reserva.codigo_unico}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-90 w-8 h-8 flex items-center justify-center rounded-full text-xl leading-none transition-all -mt-1 -mr-1"
          >
            ×
          </button>
        </div>

        {readonly && (
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-xl p-3 mb-4">
            Esta jornada está cerrada. Solo lectura. Desbloqueá la jornada para editar.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={readonly}
                required
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Celular</label>
              <input
                type="tel"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                disabled={readonly}
                required
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                disabled={readonly}
                required
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Hora</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                disabled={readonly}
                required
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium bg-slate-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg">
            Duración del turno: {reserva.duracion_total} min · Tipo: {reserva.servicio_tipo}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Estado reserva</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as typeof estado)}
                disabled={readonly}
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              >
                {ESTADOS_RESERVA.map((e) => (
                  <option key={e.value} value={e.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Asistencia</label>
              <select
                value={asistencia}
                onChange={(e) => setAsistencia(e.target.value as typeof asistencia)}
                disabled={readonly}
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              >
                {ESTADOS_ASISTENCIA.map((e) => (
                  <option key={e.value} value={e.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Medio de pago</label>
              <select
                value={medioPago}
                onChange={(e) => setMedioPago(e.target.value)}
                disabled={readonly}
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              >
                <option value="" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Sin asignar</option>
                {MEDIOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Precio total ($)</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                disabled={readonly}
                className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl p-3">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2 sticky bottom-0 bg-white dark:bg-zinc-900 sm:static sm:bg-transparent -mx-5 sm:mx-0 px-5 sm:px-0 pb-1 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 rounded-xl transition-all font-medium"
            >
              {readonly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!readonly && (
              <button
                type="submit"
                disabled={guardando}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all shadow-sm"
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