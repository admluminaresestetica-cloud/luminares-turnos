'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { HelpCircle, Pencil, Trash2, X, Loader2, ChevronDown } from 'lucide-react'

export default function FaqTab() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Estado para controlar qué pregunta está desplegada (null = ninguna)
  const [openId, setOpenId] = useState<number | null>(null)

  const toggleFaq = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

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
    <div className="w-full max-w-6xl mx-auto text-slate-900 dark:text-zinc-100">
      
      {/* LAYOUT RESPONSIVO: 1 columna en Móvil · 2 columnas en PC (lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* COLUMNA 1: FORMULARIO (Móvil: Arriba · PC: Izquierda 5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl transition-all lg:sticky lg:top-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 shrink-0 shadow-2xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span>{editingId !== null ? 'Editar Pregunta' : 'Nueva Pregunta'}</span>
            </h3>
            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                Pregunta
              </label>
              <input
                type="text"
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                placeholder="Ej: ¿Duele la depilación láser?"
                className="w-full bg-slate-50/50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                Respuesta
              </label>
              <textarea
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Ej: No, el tratamiento es prácticamente indoloro..."
                className="w-full bg-slate-50/50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all shadow-2xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{editingId !== null ? 'Actualizar Pregunta' : 'Guardar Pregunta'}</span>
              )}
            </button>
          </form>
        </div>

        {/* COLUMNA 2: LISTA DE PREGUNTAS (Móvil: Abajo · PC: Derecha 7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
            Preguntas Existentes {faqs.length > 0 && <span className="text-slate-400 dark:text-zinc-500 font-bold">({faqs.length})</span>}
          </h3>

          {faqs.length === 0 ? (
            <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 text-center transition-colors shadow-xl">
              No hay preguntas cargadas en el panel todavía.
            </p>
          ) : (
            faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-md overflow-hidden transition-all duration-200"
                >
                  {/* Cabecera desplegable */}
                  <div
                    onClick={() => toggleFaq(faq.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 flex-1 leading-snug">
                      {faq.pregunta}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(faq);
                        }}
                        title="Editar"
                        className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all cursor-pointer active:scale-90"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(faq.id);
                        }}
                        title="Eliminar"
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 rounded-xl transition-all cursor-pointer active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Indicador Desplegar / Plegar */}
                      <div className="p-1.5 text-slate-400 dark:text-zinc-500">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contenido Desplegable (Respuesta) */}
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-900/40 animate-in fade-in duration-150">
                      <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-medium">
                        {faq.respuesta}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  )
}