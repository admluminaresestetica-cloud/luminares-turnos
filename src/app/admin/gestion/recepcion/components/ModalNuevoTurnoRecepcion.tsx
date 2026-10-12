'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import { X, CheckCircle2, AlertCircle, FileText, Save } from 'lucide-react'

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
        // Limpiar observación si pasa a "no"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <span>Anamnesis / Check Clínico</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Paciente: <strong className="text-slate-800 dark:text-zinc-200">{turno.cliente_nombre}</strong> ({turno.cliente_celular || 'Sin celular'})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleGuardar} className="p-5 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Cargando checklist de preguntas...
            </div>
          ) : preguntas.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No hay preguntas activas configuradas en la sección de Ajustes.
            </div>
          ) : (
            categoriasUnicas.map((cat) => {
              const preguntasCat = preguntas.filter((p) => (p.categoria || 'General') === cat)
              return (
                <div key={cat} className="space-y-3">
                  <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
                    {cat}
                  </span>

                  <div className="space-y-2">
                    {preguntasCat.map((p) => {
                      const itemResp = respuestas[p.id] || { respuesta: 'no', observacion: '' }
                      const esSi = itemResp.respuesta === 'si'

                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            esSi
                              ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                              : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex-1">
                              {p.pregunta}
                            </span>

                            <div className="flex bg-slate-200/80 dark:bg-zinc-800 p-0.5 rounded-lg shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleRespuesta(p.id, 'no')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                  !esSi
                                    ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-xs'
                                    : 'text-slate-500'
                                }`}
                              >
                                NO
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleRespuesta(p.id, 'si')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                  esSi
                                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                                    : 'text-slate-500'
                                }`}
                              >
                                SÍ
                              </button>
                            </div>
                          </div>

                          {esSi && (
                            <div className="mt-2.5">
                              <input
                                type="text"
                                placeholder="Aclaración / Detalle (ej. qué medicación, antecedentes, etc.)..."
                                value={itemResp.observacion}
                                onChange={(e) => handleObservacionChange(p.id, e.target.value)}
                                className="w-full text-xs bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
          <div className="pt-2 flex gap-2 shrink-0 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || loading}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{guardando ? 'Guardando...' : 'Guardar Anamnesis'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
