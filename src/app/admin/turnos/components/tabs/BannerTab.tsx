// src/components/admin/tabs/BannerTab.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ImagePlus, Trash2, Pause, Play } from 'lucide-react'

interface Banner {
  id: string
  imagen_url: string
  titulo?: string
  activo: boolean
  orden: number
}

export default function BannerTab() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)

  const cargarBanners = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('banners_tienda')
      .select('*')
      .order('orden', { ascending: true })

    if (error) {
      console.error('Error al obtener banners:', error)
    } else {
      setBanners(data || [])
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarBanners()
  }, [])

  const handleSubirBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!archivo) return alert('Por favor seleccioná una imagen.')

    setSubiendo(true)

    try {
      const fileExt = archivo.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('bannersprincipaltienda')
        .upload(fileName, archivo)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('bannersprincipaltienda')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('banners_tienda').insert([
        {
          imagen_url: publicUrlData.publicUrl,
          titulo: titulo || 'Banner Promocional',
          activo: true,
          orden: banners.length + 1,
        },
      ])

      if (dbError) throw dbError

      setTitulo('')
      setArchivo(null)
      await cargarBanners()
    } catch (err: any) {
      console.error('Error al subir el banner:', err)
      alert('Hubo un error al guardar el banner.')
    } finally {
      setSubiendo(false)
    }
  }

  const toggleEstado = async (id: string, estadoActual: boolean) => {
    const { error } = await supabase
      .from('banners_tienda')
      .update({ activo: !estadoActual })
      .eq('id', id)

    if (!error) {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, activo: !estadoActual } : b))
      )
    }
  }

  const eliminarBanner = async (id: string, imagenUrl: string) => {
    if (!confirm('¿Seguro que querés eliminar este banner?')) return

    try {
      const fileName = imagenUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('bannersprincipaltienda').remove([fileName])
      }

      const { error } = await supabase
        .from('banners_tienda')
        .delete()
        .eq('id', id)

      if (!error) {
        setBanners((prev) => prev.filter((b) => b.id !== id))
      }
    } catch (err) {
      console.error('Error al eliminar banner:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario de Carga */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-rose-500" />
          Añadir Nuevo Banner
        </h3>

        <form onSubmit={handleSubirBanner} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Título Promocional (Opcional)
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 20% OFF en Cremas"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-300 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Imagen del Banner
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-black file:transition-colors file:cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={subiendo || !archivo}
            className="w-full sm:w-auto rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subiendo ? 'Subiendo...' : 'Guardar Banner'}
          </button>
        </form>
      </div>

      {/* Lista de Banners */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Banners Registrados {banners.length > 0 && <span className="text-gray-400 font-normal">({banners.length})</span>}
        </h3>

        {cargando ? (
          <p className="text-sm text-gray-500">Cargando banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No hay banners configurados todavía.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60 p-3 hover:shadow-sm transition-shadow"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gray-200">
                  <img
                    src={b.imagen_url}
                    alt={b.titulo}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                      b.activo ? 'bg-emerald-500' : 'bg-gray-500'
                    }`}
                  >
                    {b.activo ? 'ACTIVO' : 'PAUSADO'}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {b.titulo || 'Sin título'}
                  </span>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleEstado(b.id, b.activo)}
                      title={b.activo ? 'Pausar' : 'Activar'}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {b.activo ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => eliminarBanner(b.id, b.imagen_url)}
                      title="Eliminar"
                      className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}