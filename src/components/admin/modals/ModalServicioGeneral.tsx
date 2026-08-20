// src/components/admin/modals/ModalServicioGeneral.tsx
'use client'

import { Folder, Layers, DollarSign, Clock, CheckCircle2, X, Scissors } from 'lucide-react'
import { ServicioGeneral } from '../types'

interface ModalServicioGeneralProps {
  servicioGeneralEdit: Partial<ServicioGeneral>
  setServicioGeneralEdit: (s: Partial<ServicioGeneral>) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalServicioGeneral({
  servicioGeneralEdit,
  setServicioGeneralEdit,
  onSubmit,
  onClose
}: ModalServicioGeneralProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {servicioGeneralEdit.id ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Configura las categorías y tarifas generales</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-gray-400" />
              Categoría
            </label>
            <input
              type="text"
              required
              value={servicioGeneralEdit.categoria || ''}
              onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, categoria: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              placeholder="Ej: Masajes, Pestañas, Cosmiatría"
            />
          </div>

          {/* Subtipo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              Subtipo
            </label>
            <input
              type="text"
              value={servicioGeneralEdit.subtipo || ''}
              onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, subtipo: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              placeholder="Ej: Descontracturantes, Lifting"
            />
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              Para agregar múltiples subtipos en un mismo servicio, sepáralos por coma (ej: <span className="font-medium text-gray-600">"Relax, Descontracturante"</span>).
            </p>
          </div>

          {/* Precio y Duración */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                Precio ($)
              </label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={servicioGeneralEdit.precio ?? 0}
                onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, precio: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Duración (min)
              </label>
              <input
                type="number"
                required
                min={0}
                value={servicioGeneralEdit.duracion_minutos ?? 0}
                onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, duracion_minutos: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Estado del Servicio Checkbox */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <label htmlFor="servicioGeneralActivo" className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                id="servicioGeneralActivo"
                checked={servicioGeneralEdit.activo ?? true}
                onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, activo: e.target.checked })}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Servicio Activo (visible en reservas)
              </span>
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm active:scale-95"
            >
              Guardar Servicio
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}