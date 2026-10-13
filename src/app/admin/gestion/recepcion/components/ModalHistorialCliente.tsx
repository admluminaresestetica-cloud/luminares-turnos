'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, History, Calendar, User, Zap, FileText, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface SesionHistorial {
  id: string
  cliente_nombre: string
  cliente_celular: string
  fecha_sesion: string
  operadora: string
  zonas_realizadas: any
  detalle_zonas_texto: string
  checklist_anamnesis_respuestas: any
  parametros_potencia: string
  notas_gabinete: string
  notas_recepcion: string
  duracion_sesion_texto?: string
}

interface ModalHistorialClienteProps {
  isOpen: boolean
  onClose: () => void
  celular: string
  nombreCliente: string
}

export default function ModalHistorialCliente({
  isOpen,
  onClose,
  celular,
  nombreCliente
}: ModalHistorialClienteProps) {
  const [historial, setHistorial] = useState<SesionHistorial[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [sesionAbiertaId, setSesionAbiertaId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !celular) return

    const fetchHistorial = async () => {
      setLoading(true)
      try {
        // Buscar todas las sesiones que coincidan con el celular del paciente
        const { data, error } = await supabase
          .from('historial_sesiones_laser')
          .select('*')
          .eq('cliente_celular', celular)
          .order('fecha_sesion', { ascending: false })

        if (error) throw error
        const lista = (data as SesionHistorial[]) || []
        setHistorial(lista)
        
        // Abrir por defecto la primera sesión (la más reciente) si existe
        if (lista.length > 0) {
          setSesionAbiertaId(lista[0].id)
        }
      } catch (err: any) {
        console.error('Error al cargar historial del cliente:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHistorial()
  }, [isOpen, celular])

  if (!isOpen) return null

  const toggleDesplegarSesion = (id: string) => {
    setSesionAbiertaId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-900">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Historial de Sesiones
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Paciente: <strong className="text-slate-800 dark:text-zinc-200">{nombreCliente}</strong> (📱 {celular})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Cargando historial de sesiones pasadas...
            </div>
          ) : historial.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                Sin historial previo registrado
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No se encontraron sesiones guardadas para el número de celular <span className="font-mono">{celular}</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historial.map((sesion, index) => {
                const estaAbierta = sesionAbiertaId === sesion.id
                const fechaObj = new Date(sesion.fecha_sesion)
                const fechaTexto = fechaObj.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
                const horaTexto = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                  <div
                    key={sesion.id}
                    className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-zinc-800/30 transition-all"
                  >
                    {/* CABECERA DE LA SESIÓN */}
                    <button
                      onClick={() => toggleDesplegarSesion(sesion.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                          #{historial.length - index}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{fechaTexto} - {horaTexto} hs</span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                            {sesion.detalle_zonas_texto || 'Zonas no especificadas'}
                          </p>
                        </div>
                      </div>

<div className="flex items-center gap-2">
                        {sesion.operadora && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hidden sm:inline-block">
                            Atendió: {sesion.operadora}
                          </span>
                        )}

                        {/* ⏱️ Badge de Duración del Cronómetro */}
                        {sesion.duracion_sesion_texto && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1 hidden sm:inline-flex">
                            <span>⏱️ {sesion.duracion_sesion_texto}</span>
                          </span>
                        )}

                        {estaAbierta ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* DETALLE DESPLEGABLE */}
                    {estaAbierta && (
                      <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs">
                        {/* PARAMETROS Y NOTAS GABINETE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1">
                            <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                              <span>Parámetros / Potencia:</span>
                            </span>
                            <p className="text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                              {sesion.parametros_potencia || 'Sin registrar'}
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1">
                            <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                              <span>Notas de Gabinete:</span>
                            </span>
                            <p className="text-slate-600 dark:text-zinc-400 italic">
                              {sesion.notas_gabinete || 'Sin notas de gabinete'}
                            </p>
                          </div>
                        </div>

                        {/* NOTAS DE RECEPCIÓN SI EXISTEN */}
                        {sesion.notas_recepcion && (
                          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
                            <strong>Nota de Recepción:</strong> {sesion.notas_recepcion}
                          </div>
                        )}

                        {/* ANAMNESIS DE ESA SESIÓN */}
                        {Array.isArray(sesion.checklist_anamnesis_respuestas) && sesion.checklist_anamnesis_respuestas.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="font-bold text-slate-700 dark:text-zinc-300 block">
                              Respuestas Anamnesis de esta fecha:
                            </span>
                            <div className="grid grid-cols-1 gap-1.5 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                              {sesion.checklist_anamnesis_respuestas.map((ans: any, idx: number) => (
                                <div key={idx} className="flex items-start justify-between text-[11px] gap-2">
                                  <span className="text-slate-600 dark:text-zinc-400">
                                    • {ans.pregunta}
                                  </span>
                                  <span className={`font-bold shrink-0 ${
                                    ans.respuesta === 'si' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                                  }`}>
                                    {ans.respuesta?.toUpperCase()} {ans.observacion ? `(${ans.observacion})` : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all"
          >
            Cerrar Historial
          </button>
        </div>

      </div>
    </div>
  )
}