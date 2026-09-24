'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Upload, Trash2, Eye, Video, Image as ImageIcon, Plus, Check, Loader2 } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Guia {
  id: string
  titulo: string
  subtitulo: string
  tipo_contenido: 'imagen' | 'video'
  media_url: string
  activo: boolean
  orden: number
}

export default function GuiasAjustesTab() {
  const [guias, setGuias] = useState<Guia[]>([])
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)

  // Formulario
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [tipoContenido, setTipoContenido] = useState<'imagen' | 'video'>('video')
  const [archivo, setArchivo] = useState<File | null>(null)

  useEffect(() => {
    cargarGuias()
  }, [])

  const cargarGuias = async () => {
    setCargando(true)
    try {
      const { data, error } = await supabase
        .from('guias_app')
        .select('*')
        .order('orden', { ascending: true })

      if (error) throw error
      if (data) setGuias(data)
    } catch (err) {
      console.error('Error al cargar guías:', err)
    } finally {
      setCargando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !archivo) {
      alert('Por favor completá el título y selecciona un archivo (Video o Imagen).')
      return
    }

    setSubiendo(true)
    try {
      // 1. Subir archivo a Supabase Storage
      const fileExt = archivo.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('guias-instructivos')
        .upload(filePath, archivo)

      if (uploadError) throw uploadError

      // 2. Obtener la URL pública del archivo subido
      const { data: urlData } = supabase.storage
        .from('guias-instructivos')
        .getPublicUrl(filePath)

      const mediaUrl = urlData.publicUrl

      // 3. Guardar registro en la tabla guias_app
      const { error: insertError } = await supabase.from('guias_app').insert([
        {
          titulo,
          subtitulo,
          tipo_contenido: tipoContenido,
          media_url: mediaUrl,
          orden: guias.length + 1,
          activo: true,
        },
      ])

      if (insertError) throw insertError

      // Resetear formulario y recargar
      setTitulo('')
      setSubtitulo('')
      setArchivo(null)
      await cargarGuias()
      alert('¡Guía/Instructivo guardado con éxito!')
    } catch (err: any) {
      console.error('Error al guardar guía:', err)
      alert('Ocurrió un error al guardar: ' + (err.message || 'Error desconocido'))
    } finally {
      setSubiendo(false)
    }
  }

  const toggleActivo = async (id: string, activoActual: boolean) => {
    try {
      const { error } = await supabase
        .from('guias_app')
        .update({ activo: !activoActual })
        .eq('id', id)

      if (error) throw error
      cargarGuias()
    } catch (err) {
      console.error('Error al cambiar estado:', err)
    }
  }

  const eliminarGuia = async (id: string, mediaUrl: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta guía?')) return

    try {
      // 1. Borrar de la tabla
      const { error: deleteDbError } = await supabase
        .from('guias_app')
        .delete()
        .eq('id', id)

      if (deleteDbError) throw deleteDbError

      // 2. Intentar borrar el archivo del Storage si es posible extraer la ruta
      if (mediaUrl.includes('guias-instructivos/')) {
        const filePath = mediaUrl.split('guias-instructivos/').pop()
        if (filePath) {
          await supabase.storage.from('guias-instructivos').remove([filePath])
        }
      }

      cargarGuias()
    } catch (err) {
      console.error('Error al eliminar guía:', err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Creador de Guía */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600" />
            Cargar Nueva Guía o Instructivo
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Subí un video explícito (MP4) o una imagen infográfica que tus clientes podrán ver al tocar la tarjeta interactiva en el inicio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Título de la Tarjeta *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Guía de Reserva"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Subtítulo o Breve Descripción
              </label>
              <input
                type="text"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                placeholder="Ej: Cómo reservar en 3 simples pasos"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Tipo de Contenido Explicativo
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipoContenido('video')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    tipoContenido === 'video'
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Video className="w-4 h-4" /> Video (MP4)
                </button>
                <button
                  type="button"
                  onClick={() => setTipoContenido('imagen')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    tipoContenido === 'imagen'
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> Imagen / Afiche
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Seleccionar Archivo {tipoContenido === 'video' ? '(Video MP4)' : '(JPG, PNG, WEBP)'} *
              </label>
              <input
                type="file"
                accept={tipoContenido === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={subiendo}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {subiendo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Subiendo archivo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Guardar e Inserter Guía
              </>
            )}
          </button>
        </form>
      </div>

      {/* Lista de Guías Cargadas */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
          Guías e Instructivos Actuales
        </h3>

        {cargando ? (
          <p className="text-xs text-slate-400">Cargando instructivos...</p>
        ) : guias.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No hay ninguna guía cargada aún.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guias.map((g) => (
              <div
                key={g.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  g.activo
                    ? 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30'
                    : 'border-slate-200/50 dark:border-zinc-800/50 bg-slate-100/30 dark:bg-zinc-900/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center shrink-0 text-teal-700 dark:text-teal-300">
                    {g.tipo_contenido === 'video' ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 truncate">
                      {g.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {g.subtitulo || 'Sin subtítulo'}
                    </p>
                    <a
                      href={g.media_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-teal-600 font-bold underline inline-flex items-center gap-0.5 mt-0.5"
                    >
                      <Eye className="w-3 h-3" /> Ver archivo subido
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActivo(g.id, g.activo)}
                    className={`p-2 rounded-xl border transition-colors ${
                      g.activo
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 text-slate-400'
                    }`}
                    title={g.activo ? 'Desactivar' : 'Activar'}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => eliminarGuia(g.id, g.media_url)}
                    className="p-2 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
