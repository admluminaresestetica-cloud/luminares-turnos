// src/components/admin/modals/ModalPromo.tsx
'use client'

import { Tag, X, Clock, DollarSign, Users, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react'
import { PromoLaser, ServicioLaser } from '../types'

interface ModalPromoProps {
  promoEdit: Partial<PromoLaser>
  setPromoEdit: (p: Partial<PromoLaser>) => void
  servicios: ServicioLaser[]
  onToggleZona: (zonaId: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalPromo({
  promoEdit,
  setPromoEdit,
  servicios,
  onToggleZona,
  onSubmit,
  onClose
}: ModalPromoProps) {
  const generoActual = promoEdit.genero || 'femenino'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        
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
          <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
            generoActual === 'femenino' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {promoEdit.id ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Define los parámetros del paquete o descuento</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* Nombre Promoción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              Nombre de la Promoción
            </label>
            <input
              type="text"
              required
              value={promoEdit.nombre_promo || ''}
              onChange={(e) => setPromoEdit({ ...promoEdit, nombre_promo: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              placeholder="Ej: Promo Full Axilas + Cavado"
            />
          </div>

          {/* Selección de Género (Solo Femenino / Masculino) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              Público Objetivo (Género)
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Opción Femenino */}
              <button
                type="button"
                onClick={() => setPromoEdit({ ...promoEdit, genero: 'femenino' })}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  generoActual === 'femenino'
                    ? 'bg-rose-500 border-rose-600 text-white shadow-sm ring-2 ring-rose-300 ring-offset-1'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50/50 hover:border-rose-200'
                }`}
              >
                <span>♀ Femenino</span>
              </button>

              {/* Opción Masculino */}
              <button
                type="button"
                onClick={() => setPromoEdit({ ...promoEdit, genero: 'masculino' })}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  generoActual === 'masculino'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm ring-2 ring-blue-300 ring-offset-1'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50/50 hover:border-blue-200'
                }`}
              >
                <span>♂ Masculino</span>
              </button>

            </div>
          </div>

          {/* Precio y Duración */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                Precio Promo ($)
              </label>
              <input
                type="number"
                required
                min={0}
                value={promoEdit.precio_promo || 0}
                onChange={(e) => setPromoEdit({ ...promoEdit, precio_promo: Number(e.target.value) })}
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
                value={promoEdit.duracion_total_min || 0}
                onChange={(e) => setPromoEdit({ ...promoEdit, duracion_total_min: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Lista de Zonas Incluidas con badges distintivos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Zonas Incluidas en la Promo
            </label>
            <div className="border border-gray-200 rounded-2xl p-2.5 max-h-48 overflow-y-auto space-y-1.5 bg-gray-50/50">
              {servicios.map((s) => {
                const estaSeleccionada = (promoEdit.zonas_incluidas || []).includes(s.id)
                const esFem = s.genero?.toLowerCase() === 'femenino'
                
                return (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      estaSeleccionada
                        ? 'bg-white border border-gray-300 shadow-sm font-semibold'
                        : 'hover:bg-white/80 border border-transparent text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={estaSeleccionada}
                        onChange={() => onToggleZona(s.id)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-gray-800">{s.nombre_zona}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      esFem
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {esFem ? 'Fem' : 'Masc'}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Opciones adicionales / Swaps y Estado */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <label htmlFor="promoSwap" className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                id="promoSwap"
                checked={promoEdit.permite_swap ?? false}
                onChange={(e) => setPromoEdit({ ...promoEdit, permite_swap: e.target.checked })}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                Permite Swap
              </span>
            </label>

            <label htmlFor="promoActiva" className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                id="promoActiva"
                checked={promoEdit.activo ?? true}
                onChange={(e) => setPromoEdit({ ...promoEdit, activo: e.target.checked })}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Promo Activa
              </span>
            </label>
          </div>

          {/* Acciones */}
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
              Guardar Promoción
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}