'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, Video, Save, CheckCircle2, Upload } from 'lucide-react'
import { getBannerConfig, guardarBannerConfig, subirArchivoBanner, BannerConfig } from '@/lib/supabase/banner'

export default function BannerTab() {
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  
  const [banner, setBanner] = useState<BannerConfig>({
    tipo: 'imagen',
    url_media: '',
    activo: true,
    titulo: '',
    enlace: ''
  })

  useEffect(() => {
    async function cargarBanner() {
      setLoading(true)
      const data = await getBannerConfig()
      if (data) {
        setBanner(data)
      }
      setLoading(false)
    }
    cargarBanner()
  }, [])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')
    try {
      let urlFinal = banner.url_media

      // Si seleccionó un archivo nuevo de la PC, lo subimos primero al bucket
      if (archivoSeleccionado) {
        urlFinal = await subirArchivoBanner(archivoSeleccionado)
      }

      const bannerAActualizar = {
        ...banner,
        url_media: urlFinal
      }

      await guardarBannerConfig(bannerAActualizar)
      setBanner(bannerAActualizar)
      setArchivoSeleccionado(null)
      setMensaje('¡Banner guardado con éxito!')
      setTimeout(() => setMensaje(''), 4000)
    } catch (error) {
      console.error(error)
      setMensaje('Error al guardar el banner.')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-400 text-xs font-medium">Cargando configuración del banner...</div>
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all max-w-2xl">
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-900">Gestión del Banner Principal</h2>
        <p className="text-xs text-gray-500 mt-1">Sube la imagen o video que aparecerá al ingresar a la página principal.</p>
      </div>

      {mensaje && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {mensaje}
        </div>
      )}

      <form onSubmit={handleGuardar} className="space-y-4 text-xs">
        {/* Tipo de Media */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">Tipo de contenido</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setBanner({ ...banner, tipo: 'imagen' })}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                banner.tipo === 'imagen'
                  ? 'bg-black text-white border-black'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Imagen
            </button>
            <button
              type="button"
              onClick={() => setBanner({ ...banner, tipo: 'video' })}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                banner.tipo === 'video'
                  ? 'bg-black text-white border-black'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Video className="w-4 h-4" /> Video
            </button>
          </div>
        </div>

        {/* Subir archivo desde la PC */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">Archivo de Imagen o Video</label>
          
          {banner.url_media && !archivoSeleccionado && (
            <div className="mb-2 text-gray-500 flex items-center gap-2">
              <span>Archivo actual cargado correctamente.</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-black cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all text-gray-600 font-bold">
              <Upload className="w-4 h-4" />
              <span>{archivoSeleccionado ? archivoSeleccionado.name : 'Seleccionar archivo de la PC'}</span>
              <input
                type="file"
                accept={banner.tipo === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setArchivoSeleccionado(e.target.files[0])
                  }
                }}
              />
            </label>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Se subirá automáticamente al bucket "imagenes-banner" al guardar.</span>
        </div>

        {/* Título opcional */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">Título o Mensaje (Opcional)</label>
          <input
            type="text"
            placeholder="Ej: ¡Descuento de temporada!"
            value={banner.titulo || ''}
            onChange={(e) => setBanner({ ...banner, titulo: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        {/* Estado Activo */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="activo"
            checked={banner.activo}
            onChange={(e) => setBanner({ ...banner, activo: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="activo" className="font-bold text-gray-700 cursor-pointer">
            Mostrar banner activo en la página principal
          </label>
        </div>

        {/* Botón Guardar */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={guardando}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Subiendo y guardando...' : 'Guardar Cambios del Banner'}
          </button>
        </div>
      </form>
    </div>
  )
}