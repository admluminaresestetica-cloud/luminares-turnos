'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import { X, FileText, Save, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react'

interface PreguntaAnamnesis {
  id: string
  pregunta: string
  categoria: string
  activo: boolean
  orden: number
}

interface RespuestaItem {
  pregunta_id: string
  pregunta: string
  categoria: string
  respuesta: 'si' | 'no'
  observacion: string
}

interface ModalAnamnesisRecepcionProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  turno: Reserva | null
}

export default function ModalAnamnesisRecepcion({
  isOpen,
  onClose,
  onSuccess,
  turno
}: ModalAnamnesisRecepcionProps) {
  const [preguntas, setPreguntas] = useState<PreguntaAnamnesis[]>([])
  const [respuestas, setRespuestas] = useState<{ [key: string]: RespuestaItem }>({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!isOpen || !turno) return

    const cargarDatos = async () => {
      setLoading(true)

      // 1. Cargar preguntas activas desde checklist_anamnesis
      const { data: dataPreguntas, error: errorPreguntas } = await supabase
        .from('checklist_anamnesis')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })

      if (errorPreguntas) {
        console.error('Error al cargar preguntas de anamnesis:', errorPreguntas)
        setLoading(false)
        return
      }

      const listaPreguntas: PreguntaAnamnesis[] = dataPreguntas || []
      setPreguntas(listaPreguntas)

      // 2. Revisar si el turno ya tiene anamnesis guardada en detalle_reserva
      let detalleObj = typeof turno.detalle_reserva === 'string'
        ? JSON.parse(turno.detalle_reserva || '{}')
        : turno.detalle_reserva || {}

      const respuestasPrevias: RespuestaItem[] = detalleObj.anamnesis?.respuestas || []

      // Mapa inicial de respuestas (por defecto todas 'no')
      const mapaInicial: { [key: string]: RespuestaItem } = {}
      listaPreguntas.forEach((p) => {
        const previa = respuestasPrevias.find((r) => r.pregunta_id === p.id)
        mapaInicial[p.id] = {
          pregunta_id: p.id,
          pregunta: p.pregunta,
          categoria: p.categoria || 'General',
          respuesta: previa ? previa.respuesta : 'no',
          observacion: previa ? previa.observacion : ''
        }
      })

      setRespuestas(mapaInicial)
      setLoading(false)
    }

    cargarDatos()
  }, [isOpen, turno])

  if (!isOpen || !turno) return null

  const handleToggleRespuesta = (id: string, nuevaRespuesta: 'si' | 'no') => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        respuesta: nuevaRespuesta,
        observacion: nuevaRespuesta === 'no' ? '' : prev[id]?.observacion || ''
      }
    }))
  }

  const handleObservacionChange = (id: string, texto: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        observacion: texto
      }
    }))
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      let detalleObj = typeof turno.detalle_reserva === 'string'
        ? JSON.parse(turno.detalle_reserva || '{}')
        : turno.detalle_reserva || {}

      const listaRespuestas = Object.values(respuestas)

      detalleObj = {
        ...detalleObj,
        anamnesis: {
          completado: true,
          fecha_completado: new Date().toISOString(),
          respuestas: listaRespuestas
        }
      }

      const { error } = await supabase
        .from('reservas')
        .update({ detalle_reserva: detalleObj, modificado_por_admin: true })
        .eq('id', turno.id)

      if (error) throw error

      alert('Checklist de anamnesis guardado correctamente.')
      onSuccess()
      onClose()
    } catch (err: any) {
      alert('Error al guardar anamnesis: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  // Agrupar preguntas por categoría
  const categoriasUnicas = Array.from(new Set(preguntas.map((p) => p.categoria || 'General')))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700/80 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8 flex flex-col max-h-[90vh] text-slate-800 dark:text-zinc-100">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-zinc-700/60 bg-slate-50/80 dark:bg-zinc-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-xl text-purple-600 dark:text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                Anamnesis / Ficha Clínica
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                  <User className="w-3 h-3" />
                  {turno.cliente_nombre}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3" />
                  {turno.cliente_celular || 'Sin celular'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-all active:scale-95 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
            title="Cerrar ventana"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleGuardar} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 gap-2">
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Cargando checklist de preguntas...</span>
            </div>
          ) : preguntas.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
              No hay preguntas activas configuradas en la sección de Ajustes.
            </div>
          ) : (
            categoriasUnicas.map((cat) => {
              const preguntasCat = preguntas.filter((p) => (p.categoria || 'General') === cat)
              return (
                <div key={cat} className="space-y-3">
                  {/* Etiqueta de Categoría estilo Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
                      {cat}
                    </span>
                    <div className="h-px flex-1 bg-slate-200/60 dark:bg-zinc-800" />
                  </div>

                  <div className="space-y-2.5">
                    {preguntasCat.map((p) => {
                      const itemResp = respuestas[p.id] || { respuesta: 'no', observacion: '' }
                      const esSi = itemResp.respuesta === 'si'

                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            esSi
                              ? 'border-amber-300/80 bg-amber-50/40 dark:border-amber-800/50 dark:bg-amber-950/20'
                              : 'border-slate-200/80 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-slate-700 dark:text-zinc-200 flex-1 leading-snug">
                              {p.pregunta}
                            </span>

                            {/* SELECTOR NO / SÍ */}
                            <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-lg border border-slate-200/80 dark:border-zinc-700 shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleRespuesta(p.id, 'no')}
                                className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all active:scale-95 cursor-pointer ${
                                  !esSi
                                    ? 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 shadow-2xs'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                                }`}
                              >
                                NO
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleRespuesta(p.id, 'si')}
                                className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all active:scale-95 cursor-pointer ${
                                  esSi
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                                }`}
                              >
                                SÍ
                              </button>
                            </div>
                          </div>

                          {/* OBSERVACIÓN / ACLARACIÓN EN CASO DE SÍ */}
                          {esSi && (
                            <div className="mt-2.5 pt-2.5 border-t border-amber-200/60 dark:border-amber-900/40">
                              <input
                                type="text"
                                placeholder="Aclaración / Detalle (ej. qué medicación, antecedentes, etc.)..."
                                value={itemResp.observacion}
                                onChange={(e) => handleObservacionChange(p.id, e.target.value)}
                                className="w-full text-xs bg-white dark:bg-zinc-900 border border-amber-300/80 dark:border-amber-900/60 rounded-lg px-3 py-2 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}

          {/* FOOTER ACCIONES */}
          <div className="pt-4 flex gap-2.5 shrink-0 border-t border-slate-200/80 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-medium border border-slate-200/80 dark:border-zinc-700 rounded-lg transition-all active:scale-95 cursor-pointer text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || loading}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-all shadow-2xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{guardando ? 'Guardando...' : 'Guardar Anamnesis'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}