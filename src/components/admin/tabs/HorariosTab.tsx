// src/components/admin/tabs/HorariosTab.tsx
'use client'

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        Cargando configuración de horarios...
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* DEPILACIÓN LÁSER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold">Depilación Láser</h2>
            <p className="text-xs text-gray-500">
              Fechas puntuales habilitadas para turnos y rango horario de atención
            </p>
          </div>
          <button
            onClick={onGuardarConfigLaser}
            disabled={guardandoLaser}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {guardandoLaser ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Rango Horario de Atención
            </label>
            <div className="flex items-end gap-3">
              <div>
                <span className="block text-[11px] text-gray-500 mb-1">Desde</span>
                <input
                  type="time"
                  value={configLaser.horarios_atencion?.inicio || '09:00'}
                  onChange={(e) => onActualizarRangoLaser('inicio', e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                />
              </div>
              <span className="text-gray-400 pb-2">—</span>
              <div>
                <span className="block text-[11px] text-gray-500 mb-1">Hasta</span>
                <input
                  type="time"
                  value={configLaser.horarios_atencion?.fin || '18:00'}
                  onChange={(e) => onActualizarRangoLaser('fin', e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              Este rango aplica a todas las fechas habilitadas para láser. Las duraciones de cada turno
              se calculan automáticamente según las zonas o promos elegidas por el cliente.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Fechas Habilitadas para Turnos
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="date"
                value={nuevaFechaLaser}
                onChange={(e) => setNuevaFechaLaser(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black flex-1"
              />
              <button
                onClick={onAgregarFechaLaser}
                className="px-3 py-2 text-xs bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                + Agregar
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {(configLaser.fechas_habilitadas_laser || []).length === 0 ? (
                <div className="p-3 text-xs text-gray-400 text-center">
                  No hay fechas habilitadas todavía.
                </div>
              ) : (
                (configLaser.fechas_habilitadas_laser || []).map((fecha) => (
                  <div key={fecha} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="capitalize">{formatFecha(fecha)}</span>
                    <button
                      onClick={() => onQuitarFechaLaser(fecha)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SERVICIOS GENERALES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold">Servicios Generales</h2>
            <p className="text-xs text-gray-500">
              Horario semanal de apertura y días de excepción (feriados / vacaciones)
            </p>
          </div>
          <button
            onClick={onGuardarConfigGeneral}
            disabled={guardandoGeneral}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {guardandoGeneral ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Día</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Desde</th>
                <th className="px-4 py-3">Hasta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DIAS_SEMANA.map(({ key, label }) => {
                const horario: HorarioDia =
                  configGeneral.horarios_atencion?.[key] || horarioDiaDefault()
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{label}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleDiaGeneral(key)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          horario.abierto
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {horario.abierto ? 'Abierto' : 'Cerrado'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        disabled={!horario.abierto}
                        value={horario.inicio}
                        onChange={(e) => onActualizarHorarioGeneral(key, 'inicio', e.target.value)}
                        className="border border-gray-300 rounded-lg p-1.5 text-xs outline-none focus:border-black disabled:bg-gray-50 disabled:text-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        disabled={!horario.abierto}
                        value={horario.fin}
                        onChange={(e) => onActualizarHorarioGeneral(key, 'fin', e.target.value)}
                        className="border border-gray-300 rounded-lg p-1.5 text-xs outline-none focus:border-black disabled:bg-gray-50 disabled:text-gray-300"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Días de Excepción / Bloqueados (feriados, vacaciones, etc.)
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="date"
              value={nuevaExcepcionGeneral}
              onChange={(e) => setNuevaExcepcionGeneral(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
            <button
              onClick={onAgregarExcepcionGeneral}
              className="px-3 py-2 text-xs bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700"
            >
              + Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(configGeneral.horarios_atencion?.excepciones || []).length === 0 ? (
              <span className="text-xs text-gray-400">No hay días de excepción cargados.</span>
            ) : (
              (configGeneral.horarios_atencion?.excepciones || []).map((fecha: string) => (
                <span
                  key={fecha}
                  className="flex items-center gap-2 bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full"
                >
                  {new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                  })}
                  <button
                    onClick={() => onQuitarExcepcionGeneral(fecha)}
                    className="text-red-400 hover:text-red-600 font-bold"
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