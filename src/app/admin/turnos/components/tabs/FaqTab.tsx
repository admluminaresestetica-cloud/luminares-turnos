// src/components/admin/tabs/FaqTab.tsx
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
    const { data } = await supabase
      .from('preguntas_frecuentes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setFaqs(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (editingId !== null) {
      const { error } = await supabase
        .from('preguntas_frecuentes')
        .update({ pregunta, respuesta })
        .eq('id', editingId)

      if (!error) {
        setEditingId(null)
        setPregunta('')
        setRespuesta('')
        fetchFaqs()
      } else {
        alert('Error al actualizar la pregunta')
      }
    } else {
      const { error } = await supabase
        .from('preguntas_frecuentes')
        .insert([{ pregunta, respuesta }])

      if (!error) {
        setPregunta('')
        setRespuesta('')
        fetchFaqs()
      } else {
        alert('Error al guardar la pregunta')
      }
    }
    setLoading(false)
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
      await supabase.from('preguntas_frecuentes').delete().eq('id', id)
      fetchFaqs()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-500" />
            {editingId !== null ? 'Editar Pregunta Frecuente' : 'Agregar Nueva Pregunta Frecuente'}
          </h3>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-3 h-3" />
              Cancelar edición
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pregunta</label>
            <input
              type="text"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Ej: ¿Duele la depilación láser?"
              className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-300 transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Respuesta</label>
            <textarea
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Ej: No, el tratamiento es prácticamente indoloro..."
              className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-300 h-24 resize-none transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Guardando...' : editingId !== null ? 'Actualizar Pregunta' : 'Guardar Pregunta'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Preguntas Existentes {faqs.length > 0 && <span className="text-gray-400 font-normal">({faqs.length})</span>}
        </h3>
        {faqs.length === 0 ? (
          <p className="text-xs text-gray-400 bg-white p-6 rounded-2xl border border-gray-100 text-center">
            No hay preguntas cargadas en el panel todavía.
          </p>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <p className="font-semibold text-sm text-gray-900">{faq.pregunta}</p>
                <p className="text-gray-600 text-xs leading-relaxed">{faq.respuesta}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleEditClick(faq)}
                  title="Editar"
                  className="text-gray-600 hover:text-gray-900 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  title="Eliminar"
                  className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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