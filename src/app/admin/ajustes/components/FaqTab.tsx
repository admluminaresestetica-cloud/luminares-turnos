'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { HelpCircle, Pencil, Trash2, X, Loader2, ChevronDown, Tag, ArrowUp, ArrowDown, Globe } from 'lucide-react'

interface FaqItem {
  id: number;
  pregunta: string;
  respuesta: string;
  badge: string;
  ubicacion?: string; // Nuevo campo para filtrar dónde se muestra
  orden: number;
}

const BADGES_DISPONIBLES = [
  { id: 'general', label: 'General / Común', color: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300' },
  { id: 'laser', label: 'Depilación Láser', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' },
  { id: 'servicios', label: 'Servicios Generales', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' },
  { id: 'pagos', label: 'Pagos y Finanzas', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' },
  { id: 'envios', label: 'Envíos y Tienda', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300' },
  { id: 'legales', label: 'Legales / Arrepentimiento', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' },
  { id: 'Terminos', label: 'Términos y Condiciones', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' },
];

export default function FaqTab() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [badge, setBadge] = useState('general')
  const [ubicacion, setUbicacion] = useState('ambos') // Estado para la ubicación
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
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
        .order('orden', { ascending: true })

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
          .update({ pregunta, respuesta, badge, ubicacion })
          .eq('id', editingId)

        if (error) throw error
        handleCancelEdit()
        await fetchFaqs()
      } else {
        const siguienteOrden = faqs.length > 0 ? Math.max(...faqs.map((f) => f.orden || 0)) + 1 : 0;

        const { error } = await supabase
          .from('preguntas_frecuentes')
          .insert([{ pregunta, respuesta, badge, ubicacion, orden: siguienteOrden }])

        if (error) throw error

        setPregunta('')
        setRespuesta('')
        setBadge('general')
        setUbicacion('ambos')
        await fetchFaqs()
      }
    } catch (err: any) {
      console.error('Error en Supabase:', err)
      alert(`Error al guardar: ${err.message || 'Verificá los permisos o la conexión'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (faq: FaqItem) => {
    setEditingId(faq.id)
    setPregunta(faq.pregunta)
    setRespuesta(faq.respuesta)
    setBadge(faq.badge || 'general')
    setUbicacion(faq.ubicacion || 'ambos')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setPregunta('')
    setRespuesta('')
    setBadge('general')
    setUbicacion('ambos')
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

  const cambiarOrden = async (index: number, direccion: 'arriba' | 'abajo') => {
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (nuevoIndex < 0 || nuevoIndex >= faqs.length) return;

    const faqsCopia = [...faqs];
    const actual = faqsCopia[index];
    const intercambio = faqsCopia[nuevoIndex];

    const ordenTemp = actual.orden ?? index;
    actual.orden = intercambio.orden ?? nuevoIndex;
    intercambio.orden = ordenTemp;

    if (actual.orden === intercambio.orden) {
      actual.orden = nuevoIndex;
      intercambio.orden = index;
    }

    try {
      await supabase.from('preguntas_frecuentes').update({ orden: actual.orden }).eq('id', actual.id);
      await supabase.from('preguntas_frecuentes').update({ orden: intercambio.orden }).eq('id', intercambio.id);
      await fetchFaqs();
    } catch (err) {
      console.error('Error al reordenar:', err);
    }
  }

  const getBadgeInfo = (badgeId: string) => {
    return BADGES_DISPONIBLES.find(b => b.id === badgeId) || BADGES_DISPONIBLES[0];
  }

  return (
    <div className="w-full max-w-6xl mx-auto text-slate-900 dark:text-zinc-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* COLUMNA 1: FORMULARIO */}
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
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                Pregunta / Título
              </label>
              <input
                type="text"
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                placeholder="Ej: ¿Cuáles son los medios de pago?"
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
                placeholder="Detalle de la respuesta..."
                className="w-full bg-slate-50/50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all shadow-2xs"
                required
              />
            </div>

            {/* Selector de Dónde se Muestra (Ubicación) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> ¿Dónde mostrar esta pregunta?
              </label>
              <select
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs cursor-pointer"
              >
                <option value="ambos">🌐 En todos lados (Tienda y Centro de Ayuda)</option>
                <option value="tienda">🛍️ Solo en la Tienda (Productos / Checkout)</option>
                <option value="turnos">📅 Solo en Turnos / Centro de Ayuda General</option>
              </select>
            </div>

            {/* Selector de Etiqueta / Categoria */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Etiqueta / Categoría Visual
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs cursor-pointer"
              >
                {BADGES_DISPONIBLES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
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

        {/* COLUMNA 2: LISTA */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
            Preguntas Existentes {faqs.length > 0 && <span className="text-slate-400 dark:text-zinc-500 font-bold">({faqs.length})</span>}
          </h3>

          {faqs.length === 0 ? (
            <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 text-center transition-colors shadow-xl">
              No hay preguntas cargadas en el panel todavía.
            </p>
          ) : (
            faqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              const badgeInfo = getBadgeInfo(faq.badge);
              return (
                <div
                  key={faq.id}
                  className="bg-white border-slate-200/80 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl border transition-all duration-200 overflow-hidden shadow-md"
                >
                  <div
                    onClick={() => toggleFaq(faq.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => cambiarOrden(index, 'arriba')}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-400 disabled:opacity-20 cursor-pointer"
                        title="Subir"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === faqs.length - 1}
                        onClick={() => cambiarOrden(index, 'abajo')}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-400 disabled:opacity-20 cursor-pointer"
                        title="Bajar"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 leading-snug">
                        {faq.pregunta}
                      </p>
                      
                      {/* Indicador visual de ubicación */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wide ${
                        faq.ubicacion === 'tienda' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : faq.ubicacion === 'turnos' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {faq.ubicacion === 'tienda' ? '🛍️ Tienda' : faq.ubicacion === 'turnos' ? '📅 Turnos' : '🌐 Ambos'}
                      </span>

                      {faq.badge && faq.badge !== 'general' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeInfo.color}`}>
                          {badgeInfo.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(faq);
                        }}
                        title="Editar"
                        className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl transition-all cursor-pointer active:scale-90"
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
                        className="text-rose-600 dark:text-rose-400 p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl transition-all cursor-pointer active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="p-1.5 text-400 dark:text-zinc-500">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-900/40">
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