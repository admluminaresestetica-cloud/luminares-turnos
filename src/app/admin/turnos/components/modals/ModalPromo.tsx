'use client'

import { useState } from 'react'
import { Tag, X, Clock, DollarSign, Users, RefreshCw, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { PromoLaser, ServicioLaser } from '../types'
import { supabase } from '@/lib/supabase'

interface ModalPromoProps {
  promoEdit: Partial<PromoLaser>
  setPromoEdit: (p: Partial<PromoLaser>) => void
  servicios: ServicioLaser[]
  onToggleZona: (zonaId: string) => void
  onClose: () => void
  onSaveSuccess: () => void // Callback para recargar la lista y cerrar
}

export default function ModalPromo({
  promoEdit,
  setPromoEdit,
  servicios,
  onToggleZona,
  onClose,
  onSaveSuccess
}: ModalPromoProps) {
  const [guardando, setGuardando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const generoActual = promoEdit.genero || 'femenino'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setErrorMensaje(null)

    try {
      const payload = {
        nombre_promo: promoEdit.nombre_promo,
        genero: promoEdit.genero || 'femenino',
        zonas_incluidas: promoEdit.zonas_incluidas || [],
        precio_promo: Number(promoEdit.precio_promo ?? 0),
        duracion_total_min: Number(promoEdit.duracion_total_min ?? 0),
        permite_swap: promoEdit.permite_swap ?? false,
        activo: promoEdit.activo ?? true
      }

      if (promoEdit.id) {
        // Actualizar promo existente
        const { error } = await supabase
          .from('promos_laser')
          .update(payload)
          .eq('id', promoEdit.id)

        if (error) throw error
      } else {
        // Insertar nueva promo
        const { error } = await supabase
          .from('promos_laser')
          .insert([payload])

        if (error) throw error
      }

      onSaveSuccess()
    } catch (error: any) {
      console.error('Error al guardar promoción:', error)
      setErrorMensaje(error.message || 'Ocurrió un error al guardar la promoción.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all">
      {/* MOBILE: bottom sheet · DESKTOP (sm:): modal flotante centrado */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 w-full bg-white dark:bg-zinc-900 rounded-t-[28px] shadow-2xl border border-gray-100 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-colors animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]
          sm:inset-x-0 sm:mx-auto sm:max-w-lg sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:fade-in sm:zoom-in-95 sm:duration-200 sm:pb-0"
      >
        {/* Handle visual, solo mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto my-2 sm:hidden" />

        <div className="relative px-5 pb-5 pt-1 sm:p-6">
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="absolute top-2 right-2 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-600 w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 select-none transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
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
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight dark:text-zinc-100">
                {promoEdit.id ? 'Editar Promoción' : 'Nueva Promoción'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 dark:text-zinc-400">Define los parámetros del paquete o descuento</p>
            </div>
          </div>

          {/* Alerta de Error si ocurre */}
          {errorMensaje && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
              {errorMensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nombre Promoción */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Nombre de la Promoción
              </label>
              <input
                type="text"
                required
                disabled={guardando}
                value={promoEdit.nombre_promo || ''}
                onChange={(e) => setPromoEdit({ ...promoEdit, nombre_promo: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400 disabled:opacity-50"
                placeholder="Ej: Promo Full Axilas + Cavado"
              />
            </div>

            {/* Selección de Género (Solo Femenino / Masculino) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5 dark:text-zinc-400">
                <Users className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Público Objetivo (Género)
              </label>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Opción Femenino */}
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setPromoEdit({ ...promoEdit, genero: 'femenino' })}
                  className={`min-h-[44px] py-3.5 sm:py-3 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-2 ${
                    generoActual === 'femenino'
                      ? 'bg-rose-500 border-rose-600 text-white shadow-sm ring-2 ring-rose-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50/50 hover:border-rose-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-rose-950/30 dark:hover:border-rose-900/50'
                  }`}
                >
                  <span>♀ Femenino</span>
                </button>

                {/* Opción Masculino */}
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setPromoEdit({ ...promoEdit, genero: 'masculino' })}
                  className={`min-h-[44px] py-3.5 sm:py-3 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-2 ${
                    generoActual === 'masculino'
                      ? 'bg-blue-600 border-blue-700 text-white shadow-sm ring-2 ring-blue-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50/50 hover:border-blue-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-blue-950/30 dark:hover:border-blue-900/50'
                  }`}
                >
                  <span>♂ Masculino</span>
                </button>

              </div>
            </div>

            {/* Precio y Duración */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  Precio Promo ($)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  disabled={guardando}
                  value={promoEdit.precio_promo || 0}
                  onChange={(e) => setPromoEdit({ ...promoEdit, precio_promo: Number(e.target.value) })}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400 disabled:opacity-50"
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
                  disabled={guardando}
                  value={promoEdit.duracion_total_min || 0}
                  onChange={(e) => setPromoEdit({ ...promoEdit, duracion_total_min: Number(e.target.value) })}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Lista de Zonas Incluidas con badges distintivos */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 dark:text-zinc-400">
                Zonas Incluidas en la Promo
              </label>
              <div className="border border-gray-200 rounded-2xl p-2.5 max-h-48 overflow-y-auto scroll-smooth space-y-1.5 bg-gray-50/50 dark:bg-zinc-800/50 dark:border-zinc-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {servicios.map((s) => {
                  const estaSeleccionada = (promoEdit.zonas_incluidas || []).includes(s.id)
                  const esFem = s.genero?.toLowerCase() === 'femenino'
                  
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer select-none transition-all min-h-[44px] ${
                        estaSeleccionada
                          ? 'bg-white border border-gray-300 shadow-sm font-semibold dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100'
                          : 'hover:bg-white/80 border border-transparent text-gray-600 dark:text-zinc-400 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={guardando}
                          checked={estaSeleccionada}
                          onChange={() => onToggleZona(s.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-zinc-100"
                        />
                        <span className="text-gray-800 dark:text-zinc-200">{s.nombre_zona}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        esFem
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        {esFem ? 'Fem' : 'Masc'}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Opciones adicionales / Swaps y Estado */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 dark:bg-zinc-800/50 dark:border-zinc-800">
              <label htmlFor="promoSwap" className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none min-h-[44px] dark:text-zinc-300">
                <input
                  type="checkbox"
                  id="promoSwap"
                  disabled={guardando}
                  checked={promoEdit.permite_swap ?? false}
                  onChange={(e) => setPromoEdit({ ...promoEdit, permite_swap: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-zinc-100"
                />
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  Permite Swap
                </span>
              </label>

              <label htmlFor="promoActiva" className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none min-h-[44px] dark:text-zinc-300">
                <input
                  type="checkbox"
                  id="promoActiva"
                  disabled={guardando}
                  checked={promoEdit.activo ?? true}
                  onChange={(e) => setPromoEdit({ ...promoEdit, activo: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-emerald-600"
                />
                <span className="flex items-center gap-1 text-emerald-700 font-semibold dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Promo Activa
                </span>
              </label>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 sm:static sm:bg-transparent -mx-5 sm:mx-0 px-5 sm:px-0 pb-1 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 select-none rounded-xl transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="w-full sm:w-auto min-h-[44px] px-5 py-3 sm:py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm active:scale-95 select-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                {guardando ? 'Guardando...' : 'Guardar Promoción'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}