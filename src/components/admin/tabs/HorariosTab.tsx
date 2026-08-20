// src/components/admin/tabs/HorariosTab.tsx
'use client'

import { Plus, Calendar, Clock, Sparkles, CheckCircle2, XCircle, Trash2, CalendarX, Save } from 'lucide-react'
import { ConfigCalendario, DIAS_SEMANA, HorarioDia, HorariosSemana, formatFecha, horarioDiaDefault } from '../types'

interface HorariosTabProps {
  loadingHorarios: boolean

  configLaser: ConfigCalendario
  guardandoLaser: boolean
  nuevaFechaLaser: string
  setNuevaFechaLaser: (v: string) => void
  onActualizarRangoLaser: (campo: 'inicio' | 'fin', valor: string) => void
  onAgregarFechaLaser: () => void
  onQuitarFechaLaser: (fecha: string) => void
  onGuardarConfigLaser: () => void

  configGeneral: ConfigCalendario
  guardandoGeneral: boolean
  nuevaExcepcionGeneral: string
  setNuevaExcepcionGeneral: (v: string) => void
  onToggleDiaGeneral: (dia: keyof HorariosSemana) => void
  onActualizarHorarioGeneral: (dia: keyof HorariosSemana, campo: 'inicio' | 'fin', valor: string) => void
  onAgregarExcepcionGeneral: () => void
  onQuitarExcepcionGeneral: (fecha: string) => void
  onGuardarConfigGeneral: () => void
}

export default function HorariosTab({
  loadingHorarios,
  configLaser,
  guardandoLaser,
  nuevaFechaLaser,
  setNuevaFechaLaser,
  onActualizarRangoLaser,
  onAgregarFechaLaser,
  onQuitarFechaLaser,
  onGuardarConfigLaser,
  configGeneral,
  guardandoGeneral,
  nuevaExcepcionGeneral,
  setNuevaExcepcionGeneral,
  onToggleDiaGeneral,
  onActualizarHorarioGeneral,
  onAgregarExcepcionGeneral,
  onQuitarExcepcionGeneral,
  onGuardarConfigGeneral
}: HorariosTabProps) {
  if (loadingHorarios) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center text-xs font-medium text-gray-400 animate-pulse">
        Cargando configuración de horarios...
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* DEPILACIÓN LÁSER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Depilación Láser</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Fechas puntuales habilitadas para turnos y rango horario de atención
            </p>
          </div>
          <button
            onClick={onGuardarConfigLaser}
            disabled={guardandoLaser}
            className="px-4 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            {guardandoLaser ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rango Horario */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <label className="block text-xs font-bold text-gray-800 mb-3">
              Rango Horario de Atención
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="block text-[11px] font-semibold text-gray-400 mb-1">Desde</span>
                <input
                  type="time"
                  value={configLaser.horarios_atencion?.inicio || '09:00'}
                  onChange={(e) => onActualizarRangoLaser('inicio', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-800 outline-none focus:border-black transition-all"
                />
              </div>
              <span className="text-gray-300 font-bold mt-4">—</span>
              <div className="flex-1">
                <span className="block text-[11px] font-semibold text-gray-400 mb-1">Hasta</span>
                <input
                  type="time"
                  value={configLaser.horarios_atencion?.fin || '18:00'}
                  onChange={(e) => onActualizarRangoLaser('fin', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-800 outline-none focus:border-black transition-all"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
              Este rango aplica a todas las fechas habilitadas para láser. Las duraciones de cada turno
              se calculan automáticamente según las zonas o promos elegidas por el cliente.
            </p>
          </div>

          {/* Fechas Habilitadas */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col">
            <label className="block text-xs font-bold text-gray-800 mb-3">
              Fechas Habilitadas para Turnos
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="date"
                value={nuevaFechaLaser}
                onChange={(e) => setNuevaFechaLaser(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-800 outline-none focus:border-black flex-1 transition-all"
              />
              <button
                onClick={onAgregarFechaLaser}
                className="px-3 py-2 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition-all flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>
            
            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl bg-white divide-y divide-gray-50 flex-1">
              {(configLaser.fechas_habilitadas_laser || []).length === 0 ? (
                <div className="p-4 text-xs text-gray-400 text-center font-medium">
                  No hay fechas habilitadas todavía.
                </div>
              ) : (
                (configLaser.fechas_habilitadas_laser || []).map((fecha) => (
                  <div key={fecha} className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-gray-50/60 transition-colors">
                    <span className="capitalize font-bold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatFecha(fecha)}
                    </span>
                    <button
                      onClick={() => onQuitarFechaLaser(fecha)}
                      className="text-rose-500 hover:text-rose-700 font-bold p-1 rounded-lg hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SERVICIOS GENERALES */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Servicios Generales</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Horario semanal de apertura y días de excepción (feriados / vacaciones)
            </p>
          </div>
          <button
            onClick={onGuardarConfigGeneral}
            disabled={guardandoGeneral}
            className="px-4 py-2.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            {guardandoGeneral ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        {/* Tabla Semanal */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3.5 rounded-l-xl">Día</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5">Desde</th>
                <th className="px-4 py-3.5 rounded-r-xl">Hasta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DIAS_SEMANA.map(({ key, label }) => {
                const horario: HorarioDia =
                  configGeneral.horarios_atencion?.[key] || horarioDiaDefault()
                return (
                  <tr key={key} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-800">{label}</td>
                    
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onToggleDiaGeneral(key)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                          horario.abierto
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {horario.abierto ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Abierto
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            Cerrado
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3.5">
                      <input
                        type="time"
                        disabled={!horario.abierto}
                        value={horario.inicio}
                        onChange={(e) => onActualizarHorarioGeneral(key, 'inicio', e.target.value)}
                        className="border border-gray-200 rounded-xl p-1.5 text-xs font-bold text-gray-800 outline-none focus:border-black disabled:bg-gray-50 disabled:text-gray-300 transition-all"
                      />
                    </td>

                    <td className="px-4 py-3.5">
                      <input
                        type="time"
                        disabled={!horario.abierto}
                        value={horario.fin}
                        onChange={(e) => onActualizarHorarioGeneral(key, 'fin', e.target.value)}
                        className="border border-gray-200 rounded-xl p-1.5 text-xs font-bold text-gray-800 outline-none focus:border-black disabled:bg-gray-50 disabled:text-gray-300 transition-all"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Excepciones */}
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          <label className="block text-xs font-bold text-gray-800 mb-3">
            Días de Excepción / Bloqueados (feriados, vacaciones, etc.)
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="date"
              value={nuevaExcepcionGeneral}
              onChange={(e) => setNuevaExcepcionGeneral(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-800 outline-none focus:border-black transition-all"
            />
            <button
              onClick={onAgregarExcepcionGeneral}
              className="px-3 py-2 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition-all flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Excepción
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(configGeneral.horarios_atencion?.excepciones || []).length === 0 ? (
              <span className="text-xs text-gray-400 font-medium">No hay días de excepción cargados.</span>
            ) : (
              (configGeneral.horarios_atencion?.excepciones || []).map((fecha: string) => (
                <span
                  key={fecha}
                  className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-100"
                >
                  <CalendarX className="w-3.5 h-3.5 text-rose-500" />
                  {new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                  })}
                  <button
                    onClick={() => onQuitarExcepcionGeneral(fecha)}
                    className="text-rose-400 hover:text-rose-700 font-bold ml-1 p-0.5 rounded transition-all"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}