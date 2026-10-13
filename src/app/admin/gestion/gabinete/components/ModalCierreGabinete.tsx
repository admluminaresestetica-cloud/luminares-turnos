'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import { ServicioLaser, PromoLaser } from '@/lib/types'
import { 
  X, 
  Zap, 
  Save, 
  ArrowRightLeft, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { 
  getZonaById, 
  getZonasPromoResueltas, 
  getZonasSwapDisponibles, 
  precioZonaExtraConDescuento,
  SwapsMap 
} from '@/lib/laser/calculos'
import ModalSwapZona from '@/components/laser/ModalSwapZona'

interface ModalCierreGabineteProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  turno: Reserva | null
  duracionSegundos?: number
}

interface ZonaItemSesion {
  id: string // ID del servicio láser
  nombre: string
  categoria: string
  precio: number
  frecuencia: string
  energia: string
  pasadas: string
  esExtra?: boolean
  zonaOriginalId?: string // Si vino de una promo y fue swappeada
}

export default function ModalCierreGabinete({
  isOpen,
  onClose,
  onSuccess,
  turno,
  duracionSegundos = 0
}: ModalCierreGabineteProps) {
  const [serviciosLaser, setServiciosLaser] = useState<ServicioLaser[]>([])
  const [promosLaser, setPromosLaser] = useState<PromoLaser[]>([])
  
  const [operadora, setOperadora] = useState<string>('')
  const [notasGabinete, setNotasGabinete] = useState<string>('')
  
  // Grilla de zonas activas en la sesión
  const [zonasSesion, setZonasSesion] = useState<ZonaItemSesion[]>([])
  
  // Estado para el Modal Swap interno
  const [swapTargetIndex, setSwapTargetIndex] = useState<number | null>(null)
  
  // Selector de zona extra
  const [mostrarSelectorExtra, setMostrarSelectorExtra] = useState<boolean>(false)

  const [guardando, setGuardando] = useState<boolean>(false)

  // Cargar catálogo láser al abrir
  useEffect(() => {
    if (!isOpen || !turno) return

    const fetchCatalogo = async () => {
      try {
        const [resServicios, resPromos] = await Promise.all([
          supabase.from('servicios_laser').select('*'),
          supabase.from('promos_laser').select('*')
        ])

        const servicios = (resServicios.data as ServicioLaser[]) || []
        const promos = (resPromos.data as PromoLaser[]) || []

        setServiciosLaser(servicios)
        setPromosLaser(promos)

        // Inicializar datos del turno
        let det = typeof turno.detalle_reserva === 'string'
          ? JSON.parse(turno.detalle_reserva || '{}')
          : turno.detalle_reserva || {}

        setOperadora(det.operadora || '')
        setNotasGabinete(det.notas_gabinete || '')

        // Construir la grilla inicial de zonas
        inicializarGrillaZonas(turno, servicios, promos, det)

      } catch (err: any) {
        console.error('Error al cargar catálogo en gabinete:', err.message)
      }
    }

    fetchCatalogo()
  }, [isOpen, turno])

  const inicializarGrillaZonas = (
    t: Reserva, 
    servicios: ServicioLaser[], 
    promos: PromoLaser[], 
    detalleObj: any
  ) => {
    // Si ya existen parámetros previos guardados en la sesión, los restauramos
    if (detalleObj.zonas_sesion && Array.isArray(detalleObj.zonas_sesion)) {
      setZonasSesion(detalleObj.zonas_sesion)
      return
    }

    let itemsIniciales: ZonaItemSesion[] = []

    // Verificar si es una promo o zonas individuales
    const promoEncontrada = promos.find(p => p.nombre_promo === detalleObj.nombre || t.servicio_tipo?.includes('Promo'))

    if (promoEncontrada) {
      const zonasResueltas = getZonasPromoResueltas(promoEncontrada, servicios, detalleObj.swaps || {})
      itemsIniciales = zonasResueltas.map(z => ({
        id: z.id,
        nombre: z.nombre_zona,
        categoria: z.categoria_zona,
        precio: Number(z.precio_lista),
        frecuencia: '',
        energia: '',
        pasadas: ''
      }))
    } else {
      // Zonas individuales o texto plano
      const idsZonas = detalleObj.zona_ids || detalleObj.zonas_ids || []
      if (idsZonas.length > 0) {
        idsZonas.forEach((id: string) => {
          const z = getZonaById(servicios, id)
          if (z) {
            itemsIniciales.push({
              id: z.id,
              nombre: z.nombre_zona,
              categoria: z.categoria_zona,
              precio: Number(z.precio_lista),
              frecuencia: '',
              energia: '',
              pasadas: ''
            })
          }
        })
      } else {
        // Fallback genérico si no hay IDs mapeados
        itemsIniciales.push({
          id: 'generico',
          nombre: detalleObj.detalle_texto || t.servicio_tipo || 'Tratamiento Láser',
          categoria: 'media',
          precio: Number(t.precio_total || 0),
          frecuencia: '',
          energia: '',
          pasadas: ''
        })
      }
    }

    setZonasSesion(itemsIniciales)
  }

  if (!isOpen || !turno) return null

  const actualizarFila = (index: number, campo: 'frecuencia' | 'energia' | 'pasadas', valor: string) => {
    setZonasSesion(prev => {
      const copia = [...prev]
      copia[index] = { ...copia[index], [campo]: valor }
      return copia
    })
  }

  const eliminarZona = (index: number) => {
    if (zonasSesion.length <= 1) {
      alert('La sesión debe tener al menos una zona.')
      return
    }
    setZonasSesion(prev => prev.filter((_, i) => i !== index))
  }

  const agregarZonaExtra = (servicio: ServicioLaser) => {
    setZonasSesion(prev => [
      ...prev,
      {
        id: servicio.id,
        nombre: servicio.nombre_zona + ' (Extra)',
        categoria: servicio.categoria_zona,
        precio: precioZonaExtraConDescuento(servicio),
        frecuencia: '',
        energia: '',
        pasadas: '',
        esExtra: true
      }
    ])
    setMostrarSelectorExtra(false)
  }

  const abrirSwap = (index: number) => {
    setSwapTargetIndex(index)
  }

  const ejecutarSwap = (nuevoServicioId: string) => {
    if (swapTargetIndex === null) return
    const nuevoServicio = getZonaById(serviciosLaser, nuevoServicioId)
    if (!nuevoServicio) return

    setZonasSesion(prev => {
      const copia = [...prev]
      copia[swapTargetIndex] = {
        ...copia[swapTargetIndex],
        id: nuevoServicio.id,
        nombre: nuevoServicio.nombre_zona,
        categoria: nuevoServicio.categoria_zona,
        precio: Number(nuevoServicio.precio_lista)
      }
      return copia
    })
    setSwapTargetIndex(null)
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    // ⏱️ Calculamos el texto de duración aquí para que esté disponible en toda la función
  const mins = Math.floor(duracionSegundos / 60)
  const segs = duracionSegundos % 60
  const duracionTexto = mins > 0 ? `${mins} min ${segs} seg` : `${segs} seg`

    try {
      // 1. Recalcular precio total actualizado según las zonas finales en la grilla
      const nuevoPrecioTotal = zonasSesion.reduce((acc, z) => acc + z.precio, 0)
      const nuevoDetalleTexto = zonasSesion.map(z => z.nombre).join(' + ')

      let detalleObj = typeof turno.detalle_reserva === 'string'
        ? JSON.parse(turno.detalle_reserva || '{}')
        : turno.detalle_reserva || {}

      const detalleActualizado = {
        ...detalleObj,
        operadora,
        notas_gabinete: notasGabinete,
        detalle_texto: nuevoDetalleTexto,
        zonas_sesion: zonasSesion,
        fecha_atencion_gabinete: new Date().toISOString()
      }

      // 2. Consolidar texto resumido de parámetros para el historial
      const resumenParametros = zonasSesion
        .map(z => `${z.nombre}: Frec: ${z.frecuencia || '--'} | En: ${z.energia || '--'} | Pas: ${z.pasadas || '--'}`)
        .join(' // ')

      // 3. Insertar registro en historial_sesiones_laser
      const { error: errorHistorial } = await supabase
        .from('historial_sesiones_laser')
        .insert({
          cliente_nombre: turno.cliente_nombre || 'Cliente',
          cliente_celular: turno.cliente_celular || '',
          reserva_id: turno.id,
          fecha_sesion: new Date().toISOString(),
          operadora: operadora || 'Especialista',
          zonas_realizadas: detalleActualizado,
          detalle_zonas_texto: nuevoDetalleTexto,
          checklist_anamnesis_respuestas: detalleObj.anamnesis?.respuestas || [],
          parametros_potencia: resumenParametros,
          notas_gabinete: notasGabinete,
          notas_recepcion: detalleObj.nota_recepcion || '',
          duracion_sesion_texto: duracionTexto
        })

      if (errorHistorial) throw errorHistorial

      // 4. Actualizar la reserva principal (para que refleje cambios en Recepción y Turnos)
      const { error: errorReserva } = await supabase
        .from('reservas')
        .update({
          estado: 'completado',
          precio_total: nuevoPrecioTotal,
          detalle_reserva: detalleActualizado,
          modificado_por_admin: true
        })
        .eq('id', turno.id)

      if (errorReserva) throw errorReserva

      alert('Sesión finalizada y actualizada correctamente en reservas y gabinete.')
      onSuccess()
      onClose()

    } catch (err: any) {
      alert('Error al guardar la sesión: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  // Zona objetivo para el modal de swap interno
  const zonaOriginalSwap = swapTargetIndex !== null ? getZonaById(serviciosLaser, zonasSesion[swapTargetIndex]?.id) : null
  const idsOcupados = zonasSesion.map(z => z.id)
  const opcionesSwap = zonaOriginalSwap ? getZonasSwapDisponibles(zonaOriginalSwap, serviciosLaser, idsOcupados) : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-900">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Cierre de Sesión Láser - Grilla Técnica
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Paciente: <strong className="text-slate-800 dark:text-zinc-200">{turno.cliente_nombre}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleGuardar} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* GRILLA DE ZONAS (IMAGEN 1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
                Zonas y Parámetros por Zona
              </label>
              <button
                type="button"
                onClick={() => setMostrarSelectorExtra(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold rounded-xl border border-blue-200 dark:border-blue-900 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar Zona Extra</span>
              </button>
            </div>

            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-12 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold p-3 gap-2 text-center">
                <div className="col-span-4 text-left">ZONA</div>
                <div className="col-span-3">AFLUENCIA / FREC.</div>
                <div className="col-span-2">ENERGY</div>
                <div className="col-span-2">PASADAS</div>
                <div className="col-span-1">ACCIONES</div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {zonasSesion.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-3 gap-2 items-center">
                    <div className="col-span-4 font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{item.nombre}</span>
                      {item.esExtra && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded-md font-bold">
                          Extra
                        </span>
                      )}
                    </div>

                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Ej. 10 Hz"
                        value={item.frecuencia}
                        onChange={(e) => actualizarFila(idx, 'frecuencia', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Ej. 14 J"
                        value={item.energia}
                        onChange={(e) => actualizarFila(idx, 'energia', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Ej. 3"
                        value={item.pasadas}
                        onChange={(e) => actualizarFila(idx, 'pasadas', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div className="col-span-1 flex items-center justify-center gap-1">
                      {item.id !== 'generico' && (
                        <button
                          type="button"
                          onClick={() => abrirSwap(idx)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-blue-950 text-slate-600 dark:text-zinc-300 dark:hover:text-blue-300 rounded-lg transition-all cursor-pointer"
                          title="Intercambiar zona por otra de igual categoría"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => eliminarZona(idx)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-rose-950 text-slate-600 dark:text-zinc-300 dark:hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                        title="Eliminar zona"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CAMPOS GENERALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Especialista / Operadora
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Ana Belén"
                value={operadora}
                onChange={(e) => setOperadora(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Notas de Gabinete / Evolución Piel
              </label>
              <input
                type="text"
                placeholder="Ej. Buena tolerancia al tratamiento..."
                value={notasGabinete}
                onChange={(e) => setNotasGabinete(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* FOOTER ACCIONES */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>{guardando ? 'Guardando...' : 'Finalizar y Guardar Sesión'}</span>
            </button>
          </div>

        </form>

      </div>

      {/* MODAL SWAP INTERNO (Usa tu ModalSwapZona existente) */}
      {swapTargetIndex !== null && zonaOriginalSwap && (
        <ModalSwapZona
          zonaOriginal={zonaOriginalSwap}
          opciones={opcionesSwap}
          onSelect={ejecutarSwap}
          onClose={() => setSwapTargetIndex(null)}
        />
      )}

      {/* MODAL SELECCIONAR ZONA EXTRA */}
      {mostrarSelectorExtra && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Seleccionar Zona Extra</h3>
              <button onClick={() => setMostrarSelectorExtra(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {serviciosLaser
                .filter(s => !idsOcupados.includes(s.id))
                .map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => agregarZonaExtra(s)}
                    className="w-full flex justify-between items-center p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-blue-500 text-left transition-all cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-xs">{s.nombre_zona}</p>
                      <p className="text-[11px] text-slate-400 capitalize">Categoría: {s.categoria_zona}</p>
                    </div>
                    <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                      ${Number(s.precio_lista).toLocaleString('es-AR')}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}