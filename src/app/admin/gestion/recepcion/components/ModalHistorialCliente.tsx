'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, History, Calendar, Zap, FileText, ChevronDown, ChevronUp, Phone, Scissors } from 'lucide-react'

interface SesionHistorial {
  id: string
  tipo: 'laser' | 'general'
  cliente_nombre: string
  cliente_celular: string
  fecha_sesion: string
  operadora: string
  detalle_texto: string
  notas_gabinete: string
  notas_recepcion: string
  duracion_sesion_texto?: string
  parametros_potencia?: string
  checklist_anamnesis_respuestas?: any
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
  const [sesionesLaser, setSesionesLaser] = useState<SesionHistorial[]>([])
  const [sesionesGenerales, setSesionesGenerales] = useState<SesionHistorial[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [pestanaActiva, setPestanaActiva] = useState<'laser' | 'general'>('laser')
  const [sesionAbiertaId, setSesionAbiertaId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !celular) return

    const fetchHistorial = async () => {
      setLoading(true)
      try {
        const [resLaser, resGeneral] = await Promise.all([
          supabase
            .from('historial_sesiones_laser')
            .select('*')
            .eq('cliente_celular', celular)
            .order('fecha_sesion', { ascending: false }),
          supabase
            .from('historial_sesiones_generales')
            .select('*')
            .eq('cliente_celular', celular)
            .order('fecha_sesion', { ascending: false })
        ])

        const listaLaser: SesionHistorial[] = (resLaser.data || []).map((item: any) => ({
          id: item.id,
          tipo: 'laser',
          cliente_nombre: item.cliente_nombre,
          cliente_celular: item.cliente_celular,
          fecha_sesion: item.fecha_sesion,
          operadora: item.operadora,
          detalle_texto: item.detalle_zonas_texto || 'Tratamiento Láser',
          notas_gabinete: item.notas_gabinete,
          notas_recepcion: item.notas_recepcion,
          duracion_sesion_texto: item.duracion_sesion_texto,
          parametros_potencia: item.parametros_potencia,
          checklist_anamnesis_respuestas: item.checklist_anamnesis_respuestas
        }))

        const listaGeneral: SesionHistorial[] = (resGeneral.data || []).map((item: any) => ({
          id: item.id,
          tipo: 'general',
          cliente_nombre: item.cliente_nombre,
          cliente_celular: item.cliente_celular,
          fecha_sesion: item.fecha_sesion,
          operadora: item.profesional,
          detalle_texto: item.detalle_trabajo || 'Servicio General',
          notas_gabinete: item.notas_gabinete,
          notas_recepcion: item.notas_recepcion
        }))

        setSesionesLaser(listaLaser)
        setSesionesGenerales(listaGeneral)

        // Si la pestaña actual no tiene registros pero la otra sí, cambiar de pestaña por defecto
        if (listaLaser.length === 0 && listaGeneral.length > 0) {
          setPestanaActiva('general')
          setSesionAbiertaId(listaGeneral[0].id)
        } else if (listaLaser.length > 0) {
          setPestanaActiva('laser')
          setSesionAbiertaId(listaLaser[0].id)
        }

      } catch (err: any) {
        console.error('Error al cargar historial separado:', err.message)
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

  const listaActual = pestanaActiva === 'laser' ? sesionesLaser : sesionesGenerales

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-0 sm:p-4 transition-all">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 w-full max-w-2xl rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] text-slate-900 dark:text-zinc-100 my-0 sm:my-auto overflow-hidden animate-in slide-in-from-bottom duration-300 sm:duration-200 pb-[env(safe-area-inset-bottom)] sm:pb-0">
        
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700/80 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400 shrink-0">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Historial Clínico de Sesiones
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Expediente técnico y evoluciones del paciente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all cursor-pointer active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* TARJETA INFORMATIVA DEL PACIENTE */}
        <div className="px-6 py-3.5 bg-slate-100/60 dark:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {nombreCliente ? nombreCliente.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 truncate">
                {nombreCliente}
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400 inline" />
                {celular}
              </p>
            </div>
          </div>

          {/* PESTAÑAS / TABS SUPERIORES */}
          <div className="flex items-center bg-white dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-700 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPestanaActiva('laser')
                if (sesionesLaser.length > 0) setSesionAbiertaId(sesionesLaser[0].id)
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                pestanaActiva === 'laser'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Láser ({sesionesLaser.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPestanaActiva('general')
                if (sesionesGenerales.length > 0) setSesionAbiertaId(sesionesGenerales[0].id)
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                pestanaActiva === 'general'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Scissors className="w-3 h-3" />
              <span>Generales ({sesionesGenerales.length})</span>
            </button>
          </div>
        </div>

        {/* BODY CON SCROLL Y LISTA SEGÚN PESTAÑA */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Cargando historial de sesiones...
            </div>
          ) : listaActual.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2 text-slate-400 dark:text-zinc-500">
                {pestanaActiva === 'laser' ? <Zap className="w-6 h-6 text-blue-500" /> : <Scissors className="w-6 h-6 text-purple-500" />}
              </div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">
                Sin registros en {pestanaActiva === 'laser' ? 'Tratamientos Láser' : 'Servicios Generales'}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto font-medium">
                Este cliente no posee historial guardado para esta categoría.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {listaActual.map((sesion, index) => {
                const estaAbierta = sesionAbiertaId === sesion.id;
                const fechaObj = new Date(sesion.fecha_sesion);
                const fechaTexto = fechaObj.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const horaTexto = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const esLaser = pestanaActiva === 'laser';

                return (
                  <div
                    key={sesion.id}
                    className={`border rounded-2xl overflow-hidden transition-all shadow-xs ${
                      estaAbierta
                        ? esLaser ? 'border-blue-500/30 bg-white dark:bg-zinc-900 ring-2 ring-blue-500/10' : 'border-purple-500/30 bg-white dark:bg-zinc-900 ring-2 ring-purple-500/10'
                        : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {/* CABECERA DE LA SESIÓN */}
                    <button
                      type="button"
                      onClick={() => toggleDesplegarSesion(sesion.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className={`text-xs font-extrabold font-mono px-2.5 py-1 rounded-xl border shrink-0 flex items-center gap-1 ${
                          esLaser 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' 
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        }`}>
                          {esLaser ? <Zap className="w-3 h-3" /> : <Scissors className="w-3 h-3" />}
                          #{listaActual.length - index}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{fechaTexto} · {horaTexto} hs</span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium truncate">
                            {sesion.detalle_texto || 'Servicio realizado'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sesion.operadora && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700 hidden sm:inline-block">
                            Atendió: {sesion.operadora}
                          </span>
                        )}

                        {sesion.duracion_sesion_texto && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hidden sm:inline-flex items-center gap-1">
                            <span>⏱️ {sesion.duracion_sesion_texto}</span>
                          </span>
                        )}

                        <div className="p-1 rounded-lg text-slate-400 dark:text-zinc-500">
                          {estaAbierta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </button>

                    {/* DETALLE DESPLEGABLE */}
                    {estaAbierta && (
                      <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 space-y-3.5 text-xs">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {esLaser && (
                            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-1">
                              <span className="font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                <span>Parámetros / Potencia:</span>
                              </span>
                              <p className="text-slate-700 dark:text-zinc-300 font-mono text-[11px] pt-0.5">
                                {sesion.parametros_potencia || 'Sin registrar'}
                              </p>
                            </div>
                          )}

                          <div className={`p-3.5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-1 ${!esLaser ? 'sm:col-span-2' : ''}`}>
                            <span className="font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Notas de Gabinete:</span>
                            </span>
                            <p className="text-slate-600 dark:text-zinc-300 italic pt-0.5">
                              {sesion.notas_gabinete || 'Sin notas de gabinete'}
                            </p>
                          </div>
                        </div>

                        {sesion.notas_recepcion && (
                          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
                            <strong className="font-bold">Nota de Recepción:</strong> {sesion.notas_recepcion}
                          </div>
                        )}

                        {esLaser && Array.isArray(sesion.checklist_anamnesis_respuestas) && sesion.checklist_anamnesis_respuestas.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="font-extrabold text-slate-800 dark:text-zinc-200 block">
                              Respuestas Anamnesis de esta fecha:
                            </span>
                            <div className="grid grid-cols-1 gap-1.5 bg-slate-50/80 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60">
                              {sesion.checklist_anamnesis_respuestas.map((ans: any, idx: number) => (
                                <div key={idx} className="flex items-start justify-between text-[11px] gap-2">
                                  <span className="text-slate-600 dark:text-zinc-300 font-medium">• {ans.pregunta}</span>
                                  <span className={`font-bold shrink-0 ${ans.respuesta === 'si' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
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
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded-2xl transition-all cursor-pointer text-xs active:scale-95"
          >
            Cerrar Historial
          </button>
        </div>

      </div>
    </div>
  );
}