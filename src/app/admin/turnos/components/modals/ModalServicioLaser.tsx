// src/components/admin/modals/ModalServicioLaser.tsx
'use client'

import { Sparkles, X, Clock, DollarSign, Users, Folder, CheckCircle2 } from 'lucide-react'
import { ServicioLaser } from '../types'

interface ModalServicioLaserProps {
  servicioEdit: Partial<ServicioLaser>
  setServicioEdit: (s: Partial<ServicioLaser>) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalServicioLaser({
  servicioEdit,
  setServicioEdit,
  onSubmit,
  onClose
}: ModalServicioLaserProps) {
  const generoActual = servicioEdit.genero || 'femenino'

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all">
      {/* MOBILE: bottom sheet · DESKTOP (sm:): modal flotante centrado */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 w-full bg-white dark:bg-zinc-900 rounded-t-[28px] shadow-2xl border border-gray-100 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-colors animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]
          sm:inset-x-0 sm:mx-auto sm:max-w-md sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:fade-in sm:zoom-in-95 sm:duration-200 sm:pb-0"
      >
        {/* Handle visual, solo mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto my-2 sm:hidden" />

        <div className="relative px-5 pb-5 pt-1 sm:p-6">
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-600 w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 select-none transition-all dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cabecera del Modal */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
              generoActual === 'femenino' 
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' 
                : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight dark:text-zinc-100">
                {servicioEdit.id ? 'Editar Zona' : 'Nueva Zona'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 dark:text-zinc-400">Configura los detalles de la zona de depilación</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            
            {/* Nombre de la Zona */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Nombre de la Zona
              </label>
              <input
                type="text"
                required
                value={servicioEdit.nombre_zona || ''}
                onChange={(e) => setServicioEdit({ ...servicioEdit, nombre_zona: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                placeholder="Ej: Axilas, Rostro Completo, Pierna Entera"
              />
            </div>

            {/* Selección de Género (Femenino / Masculino) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5 dark:text-zinc-400">
                <Users className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Público Objetivo (Género)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setServicioEdit({ ...servicioEdit, genero: 'femenino' })}
                  className={`min-h-[44px] py-3 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-2 ${
                    generoActual === 'femenino'
                      ? 'bg-rose-500 border-rose-600 text-white shadow-sm ring-2 ring-rose-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50/50 hover:border-rose-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-rose-950/30 dark:hover:border-rose-900/50'
                  }`}
                >
                  <span>♀ Femenino</span>
                </button>

                <button
                  type="button"
                  onClick={() => setServicioEdit({ ...servicioEdit, genero: 'masculino' })}
                  className={`min-h-[44px] py-3 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-2 ${
                    generoActual === 'masculino'
                      ? 'bg-blue-600 border-blue-700 text-white shadow-sm ring-2 ring-blue-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50/50 hover:border-blue-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-blue-950/30 dark:hover:border-blue-900/50'
                  }`}
                >
                  <span>♂ Masculino</span>
                </button>
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <Folder className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Tamaño
              </label>
              <input
                type="text"
                value={servicioEdit.categoria_zona || ''}
                onChange={(e) => setServicioEdit({ ...servicioEdit, categoria_zona: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                placeholder="Ej: Chico, Mediano, Grande"
              />
            </div>

            {/* Precio Lista y Duración */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  Precio Lista ($)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={servicioEdit.precio_lista || 0}
                  onChange={(e) => setServicioEdit({ ...servicioEdit, precio_lista: Number(e.target.value) })}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  Duración (min)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={servicioEdit.duracion_minutos || 0}
                  onChange={(e) => setServicioEdit({ ...servicioEdit, duracion_minutos: Number(e.target.value) })}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Zona Activa Checkbox */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 dark:bg-zinc-800/50 dark:border-zinc-800">
              <label htmlFor="servicioActivo" className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none min-h-[44px] dark:text-zinc-300">
                <input
                  type="checkbox"
                  id="servicioActivo"
                  checked={servicioEdit.activo ?? true}
                  onChange={(e) => setServicioEdit({ ...servicioEdit, activo: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-emerald-600"
                />
                <span className="flex items-center gap-1 text-emerald-700 font-semibold dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Zona Activa (visible en reservas)
                </span>
              </label>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 sm:static sm:bg-transparent -mx-5 sm:mx-0 px-5 sm:px-0 pb-1 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 select-none rounded-xl transition-all dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto min-h-[44px] px-5 py-3 sm:py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm active:scale-95 select-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Guardar Zona
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}