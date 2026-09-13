'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { HelpCircle, Pencil, Trash2, X } from 'lucide-react'

export default function FaqTab() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('preguntas_frecuentes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setFaqs(data)
    } catch (err: any) {
      console.error('Error al obtener FAQs:', err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId !== null) {
        const { error } = await supabase
          .from('preguntas_frecuentes')
          .update({ pregunta, respuesta })
          .eq('id', editingId)

        if (error) throw error

        setEditingId(null)
        setPregunta('')
        setRespuesta('')
        await fetchFaqs()
      } else {
        const { error } = await supabase
          .from('preguntas_frecuentes')
          .insert([{ pregunta, respuesta }])

        if (error) throw error

        setPregunta('')
        setRespuesta('')
        await fetchFaqs()
      }
    } catch (err: any) {
      console.error('Error en Supabase:', err)
      alert(`Error al guardar: ${err.message || 'Verificá los permisos o la conexión'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (faq: any) => {
    setEditingId(faq.id)
    setPregunta(faq.pregunta)
    setRespuesta(faq.respuesta)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setPregunta('')
    setRespuesta('')
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás segura de eliminar esta pregunta?')) {
      try {
        const { error } = await supabase
          .from('preguntas_frecuentes')
          .delete()
          .eq('id', id)

        if (error) throw error
        await fetchFaqs()
      } catch (err: any) {
        console.error('Error al eliminar FAQ:', err)
        alert(`Error al eliminar: ${err.message}`)
      }
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-slate-800 dark:text-zinc-100">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            {editingId !== null ? 'Editar Pregunta Frecuente' : 'Agregar Nueva Pregunta Frecuente'}
          </h3>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancelar edición
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
              Pregunta
            </label>
            <input
              type="text"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Ej: ¿Duele la depilación láser?"
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-400/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
              Respuesta
            </label>
            <textarea
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Ej: No, el tratamiento es prácticamente indoloro..."
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-400/20 h-24 resize-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm py-2.5 px-4 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? 'Guardando...' : editingId !== null ? 'Actualizar Pregunta' : 'Guardar Pregunta'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
          Preguntas Existentes {faqs.length > 0 && <span className="text-slate-400 dark:text-zinc-500 font-normal">({faqs.length})</span>}
        </h3>
        {faqs.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center transition-colors">
            No hay preguntas cargadas en el panel todavía.
          </p>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex justify-between items-start gap-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-1">
                <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100">{faq.pregunta}</p>
                <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">{faq.respuesta}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEditClick(faq)}
                  title="Editar"
                  className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(faq.id)}
                  title="Eliminar"
                  className="text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}