'use client';

import {
  CalendarRange,
  CheckCircle2,
  Copy,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useDisponibilidadMensualGeneral } from '@/hooks/admin/useDisponibilidadMensualGeneral';
import { DisponibilidadMensualGeneral } from '@/lib/types';

const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function DisponibilidadMensualGeneralCard() {
  const {
    mesSeleccionado,
    setMesSeleccionado,
    filtroEmpleado,
    setFiltroEmpleado,
    empleados,
    registrosMes,
    loadingMes,
    guardando,
    mensaje,
    diaSeleccionado,
    setDiaSeleccionado,
    registroDiaActual,
    activoDia,
    setActivoDia,
    bloquesDia,
    agregarBloque,
    quitarBloque,
    actualizarBloque,
    guardarDiaActual,
    copiarAMismosDiasDelMes,
    limpiarOverrideDia,
  } = useDisponibilidadMensualGeneral();

  const [yearStr, monthStr] = mesSeleccionado.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  const primerDiaSemana = year && month ? new Date(year, month - 1, 1).getDay() : 1;
  const offsetInicio = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
  const totalDiasMes = year && month ? new Date(year, month, 0).getDate() : 30;

  const mapaRegistros = new Map<string, DisponibilidadMensualGeneral>();
  for (const r of registrosMes) {
    mapaRegistros.set(r.fecha, r);
  }

  const celdasVacias = Array.from({ length: offsetInicio }, (_, i) => i);
  const diasMes = Array.from({ length: totalDiasMes }, (_, i) => i + 1);

  const fechaFormateada = diaSeleccionado
    ? new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';

  const nombreDiaSemana = diaSeleccionado
    ? new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long',
      })
    : '';

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all dark:bg-zinc-900 dark:border-zinc-800">
      {/* Encabezado y filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-950/60 dark:text-indigo-400">
              <CalendarRange className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">
              Horas Mensuales — Servicios Generales
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 dark:text-zinc-400">
            Definí horarios variables mes a mes. Los días cargados acá reemplazan el horario semanal base.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 dark:bg-zinc-800/80 dark:border-zinc-700">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={filtroEmpleado}
              onChange={(e) => setFiltroEmpleado(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-800 outline-none dark:text-zinc-100"
            >
              <option value="general">General (Todo el servicio)</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>

          <input
            type="month"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-black transition-all [color-scheme:light] dark:[color-scheme:dark] dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div
          className={`mb-4 px-3.5 py-2.5 rounded-xl text-xs font-bold border ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {loadingMes ? (
        <div className="p-8 text-center text-xs font-medium text-gray-400 animate-pulse">
          Cargando calendario del mes...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Grilla mensual */}
          <div className="lg:col-span-7 bg-gray-50/60 p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:bg-zinc-950/50 dark:border-zinc-800/80">
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
              {DIAS_CORTOS.map((d) => (
                <div
                  key={d}
                  className="text-[11px] font-bold uppercase tracking-wider text-gray-400 py-1 dark:text-zinc-500"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {celdasVacias.map((idx) => (
                <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-xl" />
              ))}

              {diasMes.map((dia) => {
                const fechaISO = `${yearStr}-${monthStr}-${String(dia).padStart(2, '0')}`;
                const registro = mapaRegistros.get(fechaISO);
                const seleccionado = diaSeleccionado === fechaISO;

                let estadoBadge = 'Base';
                let estiloCelda =
                  'bg-white border-gray-200/80 text-gray-700 hover:border-gray-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600';

                if (registro) {
                  if (!registro.activo || registro.bloques.length === 0) {
                    estadoBadge = 'Cerrado';
                    estiloCelda =
                      'bg-rose-50/70 border-rose-200 text-rose-800 hover:border-rose-400 dark:bg-rose-950/40 dark:border-rose-900/70 dark:text-rose-300';
                  } else {
                    estadoBadge = `${registro.bloques.length} franja${registro.bloques.length > 1 ? 's' : ''}`;
                    estiloCelda =
                      'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/70 dark:text-emerald-300';
                  }
                }

                return (
                  <button
                    key={fechaISO}
                    type="button"
                    onClick={() => setDiaSeleccionado(fechaISO)}
                    className={`h-14 sm:h-16 rounded-xl border p-1.5 sm:p-2 flex flex-col justify-between text-left transition-all active:scale-95 ${estiloCelda} ${
                      seleccionado
                        ? 'ring-2 ring-black border-black dark:ring-zinc-100 dark:border-zinc-100'
                        : ''
                    }`}
                  >
                    <span className="text-xs font-extrabold leading-none">{dia}</span>
                    <span className="text-[10px] font-semibold truncate opacity-85">{estadoBadge}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Con horario mensual
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                Cerrado en el mes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-zinc-700 inline-block" />
                Usa regla semanal base
              </span>
            </div>
          </div>

          {/* Editor del día seleccionado */}
          <div className="lg:col-span-5 bg-gray-50/60 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between dark:bg-zinc-950/50 dark:border-zinc-800/80">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    Día seleccionado
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 capitalize dark:text-zinc-100">
                    {fechaFormateada}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActivoDia(!activoDia)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 ${
                    activoDia
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}
                >
                  {activoDia ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Abierto
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      Cerrado
                    </>
                  )}
                </button>
              </div>

              {!activoDia ? (
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-rose-700 font-medium mb-4 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                  Este día quedará cerrado para Servicios Generales al guardar.
                </div>
              ) : (
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                      Franjas horarias del día
                    </label>
                    <button
                      type="button"
                      onClick={agregarBloque}
                      className="text-[11px] font-bold text-gray-700 hover:text-black flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-200/60 transition-all dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar franja
                    </button>
                  </div>

                  {bloquesDia.map((bloque, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={bloque.inicio}
                        onChange={(e) => actualizarBloque(idx, 'inicio', e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-800 outline-none focus:border-black transition-all [color-scheme:light] dark:[color-scheme:dark] dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-100"
                      />
                      <span className="text-gray-400 font-bold text-xs">—</span>
                      <input
                        type="time"
                        value={bloque.fin}
                        onChange={(e) => actualizarBloque(idx, 'fin', e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-800 outline-none focus:border-black transition-all [color-scheme:light] dark:[color-scheme:dark] dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-100"
                      />
                      {bloquesDia.length > 1 && (
                        <button
                          type="button"
                          onClick={() => quitarBloque(idx)}
                          title="Quitar franja"
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all dark:text-rose-400 dark:hover:bg-rose-950/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={guardarDiaActual}
                disabled={guardando}
                className="w-full justify-center px-3.5 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Save className="w-3.5 h-3.5" />
                {guardando ? 'Guardando...' : 'Guardar este día'}
              </button>

              <button
                type="button"
                onClick={copiarAMismosDiasDelMes}
                disabled={guardando}
                className="w-full justify-center px-3.5 py-2 text-xs font-bold bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Copy className="w-3.5 h-3.5" />
                Aplicar a todos los {nombreDiaSemana} del mes
              </button>

              {registroDiaActual && (
                <button
                  type="button"
                  onClick={limpiarOverrideDia}
                  disabled={guardando}
                  className="w-full justify-center px-3.5 py-2 text-[11px] font-semibold text-gray-500 hover:text-rose-600 rounded-xl hover:bg-rose-50/60 transition-all flex items-center gap-1.5 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <RotateCcw className="w-3 h-3" />
                  Volver a horario semanal base en este día
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}