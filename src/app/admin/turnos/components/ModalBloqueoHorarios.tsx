'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Calendar,
  Lock,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getConfiguracionCalendario } from '@/lib/supabase/configuracion';
import { getReservasPorFecha } from '@/lib/supabase/reservas';
import { generarSlotsIntervalo } from '@/lib/calendario/slots';
import { crearBloqueosMasivos, eliminarBloqueo } from '@/lib/supabase/admin/reservas';
import type { Reserva } from '@/app/admin/turnos/components/types';

interface ModalBloqueoHorariosProps {
  onClose: () => void;
  onExito?: () => void;
}

export default function ModalBloqueoHorarios({
  onClose,
  onExito,
}: ModalBloqueoHorariosProps) {
  const hoy = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState<string>(hoy);
  const [tipoServicio, setTipoServicio] = useState<'laser' | 'general'>('general');

  const [slotsGrid, setSlotsGrid] = useState<string[]>([]);
  const [reservasExistentes, setReservasExistentes] = useState<Reserva[]>([]);
  const [slotsSeleccionados, setSlotsSeleccionados] = useState<string[]>([]);

  const [nota, setNota] = useState<string>('Reservado VIP');
  const [cargandoSlots, setCargandoSlots] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar slots del día y reservas existentes
  const cargarSlotsYReservas = useCallback(async () => {
    if (!fecha) return;
    setCargandoSlots(true);
    setErrorMsg(null);
    setSlotsSeleccionados([]);

    try {
      const [configCal, reservas] = await Promise.all([
        getConfiguracionCalendario(tipoServicio),
        getReservasPorFecha(fecha),
      ]);

      setReservasExistentes((reservas as Reserva[]) || []);

      // Generar grilla de 15 minutos según horario de atención
      if (configCal && configCal.horarios_atencion) {
        const [y, m, d] = fecha.split('-').map(Number);
        const fechaObj = new Date(y, m - 1, d);
        const diaSemanaIndex = fechaObj.getDay();

        const diasClave = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const claveDia = diasClave[diaSemanaIndex];
        const configDia = configCal.horarios_atencion[claveDia];

        let slotsGenerados: string[] = [];

        if (configDia && typeof configDia === 'object' && 'abierto' in configDia && configDia.abierto) {
          if ('rangos' in configDia && Array.isArray(configDia.rangos) && configDia.rangos.length > 0) {
            configDia.rangos.forEach((rango: { desde: string; hasta: string }) => {
              slotsGenerados = slotsGenerados.concat(generarSlotsIntervalo(rango.desde, rango.hasta, 15));
            });
          } else if ('desde' in configDia && 'hasta' in configDia && configDia.desde && configDia.hasta) {
            slotsGenerados = generarSlotsIntervalo(String(configDia.desde), String(configDia.hasta), 15);
          }
        }

        // Fallback genérico de 08:00 a 20:00 si no hay rangos configurados para la fecha
        if (slotsGenerados.length === 0) {
          slotsGenerados = generarSlotsIntervalo('08:00', '20:00', 15);
        }

        setSlotsGrid(slotsGenerados);
      } else {
        setSlotsGrid(generarSlotsIntervalo('08:00', '20:00', 15));
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('No se pudieron cargar los horarios para la fecha.');
    } finally {
      setCargandoSlots(false);
    }
  }, [fecha, tipoServicio]);

  useEffect(() => {
    cargarSlotsYReservas();
  }, [cargarSlotsYReservas]);

  // Manejar clic en un slot
  const toggleSlotSeleccion = (hora: string) => {
    setSlotsSeleccionados((prev) =>
      prev.includes(hora) ? prev.filter((h) => h !== hora) : [...prev, hora]
    );
  };

  // Buscar si una hora ya tiene reserva/bloqueo en la BD
  const obtenerReservaPorHora = (hora: string) => {
    return reservasExistentes.find((r) => {
      if (!r.fecha_hora_inicio) return false;
      const dateRes = new Date(r.fecha_hora_inicio);
      const hStr = dateRes.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return hStr === hora && r.estado !== 'cancelado';
    });
  };

  // Guardar nuevos bloqueos
  const handleGuardarBloqueos = async () => {
    if (slotsSeleccionados.length === 0) return;
    setGuardando(true);
    setErrorMsg(null);

    const ok = await crearBloqueosMasivos({
      fecha,
      horas: slotsSeleccionados,
      duracionMinutos: 15,
      nota: nota.trim() || 'Bloqueo VIP',
      servicioTipo: tipoServicio,
    });

    setGuardando(false);

    if (ok) {
      setSlotsSeleccionados([]);
      await cargarSlotsYReservas();
      if (onExito) onExito();
    } else {
      setErrorMsg('Ocurrió un error al guardar los bloqueos.');
    }
  };

  // Eliminar un bloqueo existente
  const handleEliminarBloqueo = async (reservaId: string) => {
    if (!window.confirm('¿Deseas desbloquear este horario y liberarlo para la agenda pública?')) return;
    setEliminandoId(reservaId);
    const ok = await eliminarBloqueo(reservaId);
    setEliminandoId(null);

    if (ok) {
      await cargarSlotsYReservas();
      if (onExito) onExito();
    } else {
      setErrorMsg('No se pudo eliminar el bloqueo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 rounded-2xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100 leading-tight">
                Bloqueo Interactivo de Horarios
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Seleccioná los slots de 15 min a bloquear o asignales notas VIP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Filtros */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Selección de Fecha y Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Fecha a configurar
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white dark:bg-zinc-800 dark:border-zinc-700 text-xs font-medium text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                Tipo de Agenda
              </label>
              <select
                value={tipoServicio}
                onChange={(e) => setTipoServicio(e.target.value as 'laser' | 'general')}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white dark:bg-zinc-800 dark:border-zinc-700 text-xs font-medium text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="general">✂️ Servicios Generales</option>
                <option value="laser">⚡ Jornada Láser</option>
              </select>
            </div>
          </div>

          {/* Input de la Notita */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Nota o Cliente VIP (Aplica a los seleccionados)
            </label>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Reservado para Juan, Mantenimiento, etc."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white dark:bg-zinc-800 dark:border-zinc-700 text-xs font-medium text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Referencia de Colores */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500 dark:text-zinc-400 pt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Libre
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Seleccionado a bloquear
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-200 inline-block" /> Bloqueado / VIP en BD
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Reserva Confirmada
            </span>
          </div>

          {/* Grilla de Slots */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-zinc-900/50 max-h-72 overflow-y-auto">
            {cargandoSlots ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs font-semibold">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                <span>Cargando slots del {fecha}...</span>
              </div>
            ) : slotsGrid.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">
                No hay horarios disponibles para esta fecha.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {slotsGrid.map((hora) => {
                  const reservaExistente = obtenerReservaPorHora(hora);
                  const estaSeleccionado = slotsSeleccionados.includes(hora);

                  let bgClase = 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400 dark:bg-zinc-800 dark:text-emerald-300 dark:border-zinc-700';
                  let statusTexto = '';
                  let esBloqueadoBD = false;

                  if (reservaExistente) {
                    if (reservaExistente.estado === 'bloqueado') {
                      esBloqueadoBD = true;
                      bgClase = 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 font-bold';
                      statusTexto = reservaExistente.cliente_nombre || 'Bloqueado';
                    } else {
                      bgClase = 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800 cursor-not-allowed opacity-80';
                      statusTexto = reservaExistente.cliente_nombre || 'Reservado';
                    }
                  } else if (estaSeleccionado) {
                    bgClase = 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs';
                  }

                  return (
                    <div key={hora} className="relative group">
                      <button
                        type="button"
                        disabled={!!reservaExistente && !esBloqueadoBD}
                        onClick={() => {
                          if (!reservaExistente) {
                            toggleSlotSeleccion(hora);
                          }
                        }}
                        className={`w-full py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 min-h-[48px] active:scale-95 ${bgClase}`}
                      >
                        <span className="flex items-center gap-1">
                          {esBloqueadoBD ? (
                            <Lock className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                          ) : estaSeleccionado ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <Clock className="w-3 h-3 opacity-50 shrink-0" />
                          )}
                          <span>{hora}</span>
                        </span>

                        {statusTexto && (
                          <span className="text-[9px] font-medium truncate max-w-[70px] block opacity-90">
                            {statusTexto}
                          </span>
                        )}
                      </button>

                      {/* Botón rápido para eliminar un bloqueo existente en BD */}
                      {esBloqueadoBD && reservaExistente && (
                        <button
                          type="button"
                          disabled={eliminandoId === reservaExistente.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarBloqueo(reservaExistente.id);
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition-all opacity-0 group-hover:opacity-100"
                          title="Eliminar bloqueo y liberar horario"
                        >
                          {eliminandoId === reservaExistente.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer con Acciones */}
        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-zinc-900">
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
            {slotsSeleccionados.length} slot(s) seleccionado(s)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-xl transition-all"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={slotsSeleccionados.length === 0 || guardando}
              onClick={handleGuardarBloqueos}
              className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Bloquear ({slotsSeleccionados.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
