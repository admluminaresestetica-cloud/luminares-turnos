'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
      // Modo Edición
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
      // Modo Creación
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
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-stone-900">
            {editingId !== null ? 'Editar Pregunta Frecuente' : 'Agregar Nueva Pregunta Frecuente'}
          </h3>
          {editingId !== null && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Cancelar edición
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Pregunta</label>
            <input 
              type="text"
              value={pregunta} 
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Ej: ¿Duele la depilación láser?" 
              className="w-full p-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Respuesta</label>
            <textarea 
              value={respuesta} 
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Ej: No, el tratamiento es prácticamente indoloro..." 
              className="w-full p-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 h-24 resize-none" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : editingId !== null ? 'Actualizar Pregunta' : 'Guardar Pregunta'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-700">Preguntas Existentes ({faqs.length})</h3>
        {faqs.length === 0 ? (
          <p className="text-xs text-stone-400 bg-white p-6 rounded-2xl border border-stone-200 text-center">
            No hay preguntas cargadas en el panel todavía.
          </p>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex justify-between items-start gap-4 shadow-xs">
              <div className="space-y-1">
                <p className="font-semibold text-sm text-stone-900">{faq.pregunta}</p>
                <p className="text-stone-600 text-xs leading-relaxed">{faq.respuesta}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleEditClick(faq)} 
                  className="text-stone-600 hover:text-stone-900 text-xs font-medium px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(faq.id)} 
                  className="text-red-500 hover:text-red-700 text-xs font-medium px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}