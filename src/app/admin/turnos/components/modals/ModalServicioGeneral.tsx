'use client'

import { useState } from 'react'
import { Folder, Layers, DollarSign, Clock, CheckCircle2, X, Scissors, FileText, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export interface ServicioGeneral {
  id?: string
  categoria?: string
  subtipo?: string
  precio?: number
  duracion_minutos?: number
  activo?: boolean
  descripcion?: string
  imagen_url?: string
}

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
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('servicios-imagenes')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('servicios-imagenes')
        .getPublicUrl(filePath)

      setServicioGeneralEdit({
        ...servicioGeneralEdit,
        imagen_url: data.publicUrl
      })
    } catch (error) {
      console.error('Error al subir imagen:', error)
      alert('Ocurrió un error al subir la imagen. Revisa los permisos del Bucket.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto dark:bg-zinc-900 dark:border-zinc-800">

        <div className="sm:hidden w-10 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        <button
          type="button"
          disabled={uploading}
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shrink-0 dark:bg-purple-950/60 dark:text-purple-400">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight dark:text-zinc-100">
              {servicioGeneralEdit.id ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 dark:text-zinc-400">Configura las categorías, tarifa e imagen</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <Folder className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Categoría
            </label>
            <input
              type="text"
              required
              value={servicioGeneralEdit.categoria || ''}
              onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, categoria: e.target.value })}
              className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              placeholder="Ej: Masajes, Pestañas, Cosmiatría"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <Layers className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Subtipo
            </label>
            <input
              type="text"
              value={servicioGeneralEdit.subtipo || ''}
              onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, subtipo: e.target.value })}
              className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              placeholder="Ej: Descontracturantes, Lifting"
            />
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed dark:text-zinc-500">
              Para agregar múltiples subtipos en un mismo servicio, sepáralos por coma (ej: <span className="font-medium text-gray-600 dark:text-zinc-300">"Relax, Descontracturante"</span>).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Descripción del Subtipo / Servicio
            </label>
            <textarea
              rows={3}
              value={servicioGeneralEdit.descripcion || ''}
              onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, descripcion: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm resize-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              placeholder="Escribe un breve detalle de lo que incluye este tratamiento..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
              <ImageIcon className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              Imagen representativa
            </label>
            
            <div className="flex items-center gap-3">
              {servicioGeneralEdit.imagen_url ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 dark:border-zinc-700">
                  <img 
                    src={servicioGeneralEdit.imagen_url} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 shrink-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}

              <label className={`cursor-pointer flex-1 ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                <div className="flex items-center justify-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-700 text-xs font-medium transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                      Subiendo a Supabase...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                      {servicioGeneralEdit.imagen_url ? 'Cambiar Imagen' : 'Subir Imagen'}
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Precio ($)
              </label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={servicioGeneralEdit.precio ?? 0}
                onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, precio: Number(e.target.value) })}
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
                value={servicioGeneralEdit.duracion_minutos ?? 0}
                onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, duracion_minutos: Number(e.target.value) })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 dark:bg-zinc-800/50 dark:border-zinc-800">
            <label htmlFor="servicioGeneralActivo" className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer dark:text-zinc-300">
              <input
                type="checkbox"
                id="servicioGeneralActivo"
                checked={servicioGeneralEdit.activo ?? true}
                onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, activo: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-emerald-600"
              />
              <span className="flex items-center gap-1 text-emerald-700 font-semibold dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Servicio Activo (visible en reservas)
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 sm:static sm:bg-transparent -mx-5 sm:mx-0 px-5 sm:px-0 pb-1 sm:pb-0">
            <button
              type="button"
              disabled={uploading}
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 rounded-xl transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl transition-all shadow-sm active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Guardar Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}