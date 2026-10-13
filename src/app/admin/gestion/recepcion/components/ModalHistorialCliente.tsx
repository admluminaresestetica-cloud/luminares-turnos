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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl shadow-emerald-950/20 overflow-hidden my-8 flex flex-col max-h-[90vh] text-slate-100">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Historial de Sesiones
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Paciente: <strong className="text-emerald-400">{nombreCliente}</strong> (📱 {celular})
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Cargando historial de sesiones pasadas...
            </div>
          ) : historial.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-white">
                Sin historial previo registrado
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No se encontraron sesiones guardadas para el número de celular <span className="font-mono text-emerald-400">{celular}</span>.
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
                    className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 transition-all shadow-sm hover:border-slate-700"
                  >
                    {/* CABECERA DE LA SESIÓN */}
                    <button
                      type="button"
                      onClick={() => toggleDesplegarSesion(sesion.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                          #{historial.length - index}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{fechaTexto} - {horaTexto} hs</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">
                            {sesion.detalle_zonas_texto || 'Zonas no especificadas'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sesion.operadora && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                            Atendió: {sesion.operadora}
                          </span>
                        )}

                        {/* ⏱️ Badge de Duración del Cronómetro */}
                        {sesion.duracion_sesion_texto && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1 hidden sm:inline-flex">
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
                      <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3 text-xs">
                        {/* PARAMETROS Y NOTAS GABINETE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-amber-400" />
                              <span>Parámetros / Potencia:</span>
                            </span>
                            <p className="text-slate-300 font-mono text-[11px]">
                              {sesion.parametros_potencia || 'Sin registrar'}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Notas de Gabinete:</span>
                            </span>
                            <p className="text-slate-300 italic">
                              {sesion.notas_gabinete || 'Sin notas de gabinete'}
                            </p>
                          </div>
                        </div>

                        {/* NOTAS DE RECEPCIÓN SI EXISTEN */}
                        {sesion.notas_recepcion && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            <strong className="font-semibold">Nota de Recepción:</strong> {sesion.notas_recepcion}
                          </div>
                        )}

                        {/* ANAMNESIS DE ESA SESIÓN */}
                        {Array.isArray(sesion.checklist_anamnesis_respuestas) && sesion.checklist_anamnesis_respuestas.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="font-bold text-slate-200 block">
                              Respuestas Anamnesis de esta fecha:
                            </span>
                            <div className="grid grid-cols-1 gap-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                              {sesion.checklist_anamnesis_respuestas.map((ans: any, idx: number) => (
                                <div key={idx} className="flex items-start justify-between text-[11px] gap-2">
                                  <span className="text-slate-300">
                                    • {ans.pregunta}
                                  </span>
                                  <span className={`font-bold shrink-0 ${
                                    ans.respuesta === 'si' ? 'text-amber-400' : 'text-slate-500'
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
        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all cursor-pointer text-xs"
          >
            Cerrar Historial
          </button>
        </div>

      </div>
    </div>
  )
}