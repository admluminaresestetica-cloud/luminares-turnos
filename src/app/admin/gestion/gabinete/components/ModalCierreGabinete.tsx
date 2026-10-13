'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
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

import RelojCronometroGabinete from './RelojCronometroGabinete'

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
  // 👈 Instanciamos el cliente del navegador para leer cookies de sesión activas
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

  // Estado local para los segundos del cronómetro integrado
  const [segundosSesion, setSegundosSesion] = useState<number>(duracionSegundos || 0)


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

        // Autocompletar operadora desde el perfil del usuario activo o usar la guardada
        if (det.operadora) {
          setOperadora(det.operadora)
        } else {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: perfil } = await supabase
              .from('perfiles')
              .select('nombre')
              .eq('user_id', user.id)
              .maybeSingle()
            
            setOperadora(perfil?.nombre || '')
          } else {
            setOperadora('')
          }
        }

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

    // ⏱️ Calculamos el texto usando los segundos del cronómetro interno
    const mins = Math.floor(segundosSesion / 60)
    const segs = segundosSesion % 60
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
    <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-[28px] shadow-2xl shadow-emerald-950/20 overflow-hidden my-auto flex flex-col max-h-[94vh] text-slate-100">
      
      {/* HEADER PREMIUM */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-inner">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Cierre de Sesión Láser
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Grilla Técnica
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paciente: <span className="text-emerald-400 font-semibold">{turno.cliente_nombre}</span>
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
      <form onSubmit={handleGuardar} className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs custom-scrollbar">

        {/* CRONÓMETRO INTEGRADO */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-inner">
          <RelojCronometroGabinete
            onTiempoActualizado={(seg) => setSegundosSesion(seg)}
          />
        </div>

        {/* ZONAS Y PARÁMETROS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-bold text-white text-sm tracking-wide">
                Zonas y Parámetros
              </label>
              <p className="text-[11px] text-slate-400">Configura la frecuencia, energía y pasadas por zona</p>
            </div>
            <button
              type="button"
              onClick={() => setMostrarSelectorExtra(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30 active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Zona Extra</span>
            </button>
          </div>

          {/* CONTENEDOR DE ZONAS (Responsive: Cards en mobile, Tabla elegante en Desktop) */}
          <div className="space-y-3">
            {zonasSesion.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 transition-all space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4 shadow-sm"
              >
                {/* Nombre de la zona */}
                <div className="sm:w-1/4 flex items-center justify-between sm:justify-start gap-2">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {item.nombre}
                  </span>
                  {item.esExtra && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold">
                      Extra
                    </span>
                  )}
                </div>

                {/* Inputs de parámetros (Grid interno) */}
                <div className="grid grid-cols-3 gap-2 sm:flex-1">
                  <div>
                    <label className="block sm:hidden text-[10px] text-slate-400 mb-1">Frecuencia</label>
                    <input
                      type="text"
                      placeholder="Ej. 10 Hz"
                      value={item.frecuencia}
                      onChange={(e) => actualizarFila(idx, 'frecuencia', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-3 py-2 text-center text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block sm:hidden text-[10px] text-slate-400 mb-1">Energía</label>
                    <input
                      type="text"
                      placeholder="Ej. 14 J"
                      value={item.energia}
                      onChange={(e) => actualizarFila(idx, 'energia', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-3 py-2 text-center text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block sm:hidden text-[10px] text-slate-400 mb-1">Pasadas</label>
                    <input
                      type="text"
                      placeholder="Ej. 3"
                      value={item.pasadas}
                      onChange={(e) => actualizarFila(idx, 'pasadas', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 focus:border-emerald-500 rounded-xl px-3 py-2 text-center text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Acciones por fila */}
                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-t-0">
                  {item.id !== 'generico' && (
                    <button
                      type="button"
                      onClick={() => abrirSwap(idx)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl transition-all cursor-pointer border border-slate-800"
                      title="Intercambiar zona"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => eliminarZona(idx)}
                    className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 rounded-xl transition-all cursor-pointer border border-slate-800 hover:border-rose-900/50"
                    title="Eliminar zona"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CAMPOS GENERALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              Especialista / Operadora <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Ana Belén"
              value={operadora}
              onChange={(e) => setOperadora(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              Notas de Gabinete / Evolución Piel
            </label>
            <input
              type="text"
              placeholder="Ej. Buena tolerancia al tratamiento..."
              value={notasGabinete}
              onChange={(e) => setNotasGabinete(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
            />
          </div>
        </div>

        {/* FOOTER ACCIONES */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/50 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{guardando ? 'Guardando...' : 'Finalizar y Guardar Sesión'}</span>
          </button>
        </div>

      </form>

      {/* MODAL SWAP INTERNO */}
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Seleccionar Zona Extra</h3>
              <button 
                type="button"
                onClick={() => setMostrarSelectorExtra(false)} 
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {serviciosLaser
                .filter(s => !idsOcupados.includes(s.id))
                .map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => agregarZonaExtra(s)}
                    className="w-full flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-left transition-all cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">{s.nombre_zona}</p>
                      <p className="text-[11px] text-slate-400 capitalize mt-0.5">Categoría: {s.categoria_zona}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      ${Number(s.precio_lista).toLocaleString('es-AR')}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
)
}