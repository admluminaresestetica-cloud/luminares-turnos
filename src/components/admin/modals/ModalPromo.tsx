// src/components/admin/modals/ModalPromo.tsx
'use client'

import { PromoLaser, ServicioLaser } from '../types'

interface ModalPromoProps {
  promoEdit: Partial<PromoLaser>
  setPromoEdit: (p: Partial<PromoLaser>) => void
  servicios: ServicioLaser[]
  onToggleZona: (zonaId: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalPromo({ promoEdit, setPromoEdit, servicios, onToggleZona, onSubmit, onClose }: ModalPromoProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">
          {promoEdit.id ? 'Editar Promoción' : 'Nueva Promoción'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Promoción</label>
            <input
              type="text"
              required
              value={promoEdit.nombre_promo || ''}
              onChange={(e) => setPromoEdit({ ...promoEdit, nombre_promo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Género</label>
              <select
                value={promoEdit.genero || 'femenino'}
                onChange={(e) => setPromoEdit({ ...promoEdit, genero: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
              >
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Precio Promo ($)</label>
              <input
                type="number"
                required
                value={promoEdit.precio_promo || 0}
                onChange={(e) => setPromoEdit({ ...promoEdit, precio_promo: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
              <input
                type="number"
                required
                value={promoEdit.duracion_total_min || 0}
                onChange={(e) => setPromoEdit({ ...promoEdit, duracion_total_min: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Zonas Incluidas en la Promo
            </label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {servicios.map((s) => {
                const estaSeleccionada = (promoEdit.zonas_incluidas || []).includes(s.id)
                return (
                  <label key={s.id} className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={estaSeleccionada}
                      onChange={() => onToggleZona(s.id)}
                    />
                    <span className="font-medium text-gray-800">{s.nombre_zona}</span>
                    <span className="text-gray-400">({s.genero})</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="promoSwap"
                checked={promoEdit.permite_swap ?? false}
                onChange={(e) => setPromoEdit({ ...promoEdit, permite_swap: e.target.checked })}
              />
              <label htmlFor="promoSwap" className="text-xs font-medium">Permite Swap de zonas</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="promoActiva"
                checked={promoEdit.activo ?? true}
                onChange={(e) => setPromoEdit({ ...promoEdit, activo: e.target.checked })}
              />
              <label htmlFor="promoActiva" className="text-xs font-medium">Promo Activa</label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800"
            >
              Guardar Promoción
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}