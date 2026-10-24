// src/components/admin/ModalEditarReserva.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { ConfiguracionCalendario, Reserva, ServicioGeneral } from '@/lib/types';
import { validarSlotDisponible, horaDeReserva, fechaDeReserva } from '@/lib/admin/validacion';
import { actualizarReservaAdmin } from '@/lib/supabase/admin/reservas';
import { ESTADOS_ASISTENCIA, ESTADOS_RESERVA, MEDIOS_PAGO } from '@/lib/admin/constants';
import { Scissors } from 'lucide-react';

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

  const detalleObj = typeof reserva.detalle_reserva === 'string'
    ? (() => { try { return JSON.parse(reserva.detalle_reserva); } catch { return {}; } })()
    : (reserva.detalle_reserva || {});

  const [notaRecepcion, setNotaRecepcion] = useState<string>(detalleObj.nota_recepcion || '');
  const [detalleGabinete, setDetalleGabinete] = useState<string>(detalleObj.detalle_gabinete || '');

  // Estados para Servicios Generales (Etapa 3)
  const esGeneral = reserva.servicio_tipo === 'general';
  const [catGenerales, setCatGenerales] = useState<ServicioGeneral[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>(() => {
    if (!esGeneral) return [];
    if (Array.isArray(detalleObj.servicios)) {
      return detalleObj.servicios.map((s: any) => s.id);
    }
    return [];
  });
  const [duracionTotal, setDuracionTotal] = useState<number>(reserva.duracion_total || 30);

  useEffect(() => {
    if (!esGeneral) return;

    const fetchGenerales = async () => {
      const { data, error } = await supabase
        .from('servicios_generales')
        .select('*')
        .eq('activo', true);

      if (!error && data) {
        setCatGenerales(data as ServicioGeneral[]);
      }
    };

    fetchGenerales();
  }, [esGeneral]);

  const toggleServicioGeneral = (sg: ServicioGeneral) => {
    if (readonly) return;

    const yaSeleccionado = serviciosSeleccionados.includes(sg.id);
    const nuevaSeleccion = yaSeleccionado
      ? serviciosSeleccionados.filter((id) => id !== sg.id)
      : [...serviciosSeleccionados, sg.id];

    setServiciosSeleccionados(nuevaSeleccion);

    const seleccionadosObj = catGenerales.filter((item) => nuevaSeleccion.includes(item.id));
    const nuevoPrecio = seleccionadosObj.reduce((acc, item) => acc + Number(item.precio || 0), 0);
    const nuevaDuracion = seleccionadosObj.reduce((acc, item) => acc + Number(item.duracion_minutos || 0), 0) || 30;

    setPrecio(nuevoPrecio);
    setDuracionTotal(nuevaDuracion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;

    const validacion = validarSlotDisponible(
      fecha,
      hora,
      esGeneral ? duracionTotal : reserva.duracion_total,
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
    
    const seleccionadosObj = catGenerales.filter((item) => serviciosSeleccionados.includes(item.id));
    const nuevoDetalleTexto = esGeneral && seleccionadosObj.length > 0
      ? seleccionadosObj.map((s) => s.subtipo).join(' + ')
      : detalleObj.detalle_texto;

    const nuevoDetalle = {
      ...detalleObj,
      nota_recepcion: notaRecepcion.trim(),
      detalle_gabinete: detalleGabinete.trim(),
      ...(esGeneral && {
        servicios: seleccionadosObj.map((s) => ({
          id: s.id,
          subtipo: s.subtipo,
          precio: s.precio,
          duracion_minutos: s.duracion_minutos,
        })),
        detalle_texto: nuevoDetalleTexto,
      }),
    };

    const updated = await actualizarReservaAdmin({
      id: reserva.id,
      cliente_nombre: nombre.trim(),
      cliente_celular: celular.trim(),
      fecha_hora_inicio: fechaHoraInicio,
      duracion_total: esGeneral ? duracionTotal : reserva.duracion_total,
      estado,
      estado_asistencia: asistencia,
      medio_pago: medioPago || null,
      precio_total: precio,
      detalle_reserva: nuevoDetalle,
    } as any);

    setGuardando(false);

    if (!updated) {
      setError('No se pudo guardar la reserva.');
      return;
    }

    onSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-all">
      <div
        className="fixed inset-x-0 bottom-0 z-50 w-full bg-white dark:bg-zinc-900 rounded-t-[28px] shadow-xl border border-gray-100 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-colors animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]
          sm:inset-x-0 sm:mx-auto sm:max-w-lg sm:rounded-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:fade-in sm:zoom-in-95 sm:duration-200 sm:pb-0"
      >
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto my-2 sm:hidden" />

        <div className="px-5 pb-5 pt-1 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Editar reserva</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{reserva.codigo_unico}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-90 select-none w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-2xl leading-none transition-all -mt-1"
              aria-label="Cerrar"
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
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 sm:p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
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
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 sm:p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
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
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 sm:p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all [color-scheme:light] dark:[color-scheme:dark]"
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
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 sm:p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {/* SELECTOR DE SERVICIOS GENERALES */}
            {esGeneral && (
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  ✂️ Servicios Generales Incluidos
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-zinc-700 rounded-xl p-2 space-y-1.5 bg-slate-50/50 dark:bg-zinc-800/40">
                  {catGenerales.length === 0 ? (
                    <p className="text-xs text-slate-400 p-2 text-center">Cargando servicios...</p>
                  ) : (
                    catGenerales.map((sg) => {
                      const checked = serviciosSeleccionados.includes(sg.id);
                      return (
                        <button
                          type="button"
                          key={sg.id}
                          disabled={readonly}
                          onClick={() => toggleServicioGeneral(sg)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all border cursor-pointer ${
                            checked
                              ? 'bg-purple-600 text-white font-semibold border-transparent'
                              : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                          }`}
                        >
                          <div className="text-left">
                            <span className="font-bold">{sg.subtipo}</span>
                            <span className="text-[10px] opacity-75 ml-2">({sg.categoria})</span>
                          </div>
                          <span className="font-bold">${Number(sg.precio).toLocaleString('es-AR')}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium bg-slate-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg">
              <span>Duración: {esGeneral ? duracionTotal : reserva.duracion_total} min</span>
              <span className={`font-bold px-2 py-0.5 rounded ${
                reserva.servicio_tipo === 'general'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {reserva.servicio_tipo === 'general' ? '✂️ Servicio General' : '⚡ Jornada Láser'}
              </span>
            </div>

            {reserva.servicio_tipo === 'general' && (
              <p className="text-[11px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/50 p-2.5 rounded-xl font-medium">
                ℹ️ Los servicios generales no requieren ficha de Anamnesis. Utiliza los campos de notas inferiores para registrar observaciones.
              </p>
            )}

            {/* SECCIÓN DE NOTAS DE RECEPCIÓN Y GABINETE */}
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  📝 Nota de Recepción
                </label>
                <textarea
                  rows={2}
                  value={notaRecepcion}
                  onChange={(e) => setNotaRecepcion(e.target.value)}
                  disabled={readonly}
                  placeholder="Observaciones de recepción (llegada, pagos, comentarios)..."
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  🩺 Detalle / Evolución de Gabinete
                </label>
                <textarea
                  rows={2}
                  value={detalleGabinete}
                  onChange={(e) => setDetalleGabinete(e.target.value)}
                  disabled={readonly}
                  placeholder="Anotaciones de gabinete (tonos, productos, observaciones del servicio)..."
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Estado reserva</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as typeof estado)}
                  disabled={readonly}
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 sm:p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
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
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 sm:p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
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
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 sm:p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
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
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 sm:p-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 disabled:bg-slate-50 dark:disabled:bg-zinc-800/50 disabled:text-slate-400 dark:disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
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
                className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2 text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 select-none rounded-xl transition-all font-medium"
              >
                {readonly ? 'Cerrar' : 'Cancelar'}
              </button>
              {!readonly && (
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2 text-sm bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 disabled:active:scale-100 active:scale-95 select-none transition-all shadow-sm"
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}