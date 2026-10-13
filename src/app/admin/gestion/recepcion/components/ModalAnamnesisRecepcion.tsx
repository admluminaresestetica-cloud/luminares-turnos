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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl shadow-emerald-950/20 overflow-hidden my-8 flex flex-col max-h-[90vh] text-slate-100">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Anamnesis / Check Clínico
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Paciente: <strong className="text-emerald-400">{turno.cliente_nombre}</strong> ({turno.cliente_celular || 'Sin celular'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleGuardar} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs custom-scrollbar">
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
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide">
                    {cat}
                  </span>

                  <div className="space-y-2.5">
                    {preguntasCat.map((p) => {
                      const itemResp = respuestas[p.id] || { respuesta: 'no', observacion: '' }
                      const esSi = itemResp.respuesta === 'si'

                      return (
                        <div
                          key={p.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            esSi
                              ? 'border-amber-500/40 bg-amber-500/5'
                              : 'border-slate-800 bg-slate-950/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-slate-200 flex-1">
                              {p.pregunta}
                            </span>

                            {/* SELECTOR NO / SÍ */}
                            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleRespuesta(p.id, 'no')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  !esSi
                                    ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                NO
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleRespuesta(p.id, 'si')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  esSi
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                SÍ
                              </button>
                            </div>
                          </div>

                          {/* OBSERVACIÓN / ACLARACIÓN EN CASO DE SÍ */}
                          {esSi && (
                            <div className="mt-3 pt-3 border-t border-amber-500/20">
                              <input
                                type="text"
                                placeholder="Aclaración / Detalle (ej. qué medicación, antecedentes, etc.)..."
                                value={itemResp.observacion}
                                onChange={(e) => handleObservacionChange(p.id, e.target.value)}
                                className="w-full text-xs bg-slate-900 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
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
          <div className="pt-4 flex gap-3 shrink-0 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all cursor-pointer text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || loading}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/40 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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