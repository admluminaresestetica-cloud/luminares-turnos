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
  Plus 
} from 'lucide-react'
import { 
  getZonaById, 
  getZonasPromoResueltas, 
  getZonasSwapDisponibles, 
  precioZonaExtraConDescuento 
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
  // Instanciamos el cliente del navegador para leer cookies de sesión activas
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

// Búsqueda inteligente de promo por ID, por nombre_promo o texto guardado
    const promoEncontrada = promos.find(p => 
      p.id === detalleObj.promo_id || 
      p.nombre_promo === detalleObj.nombre_promo || 
      p.nombre_promo === detalleObj.nombre ||
      (detalleObj.detalle_texto && detalleObj.detalle_texto.toLowerCase().includes(p.nombre_promo.toLowerCase()))
    )

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
      const textoDetalle = detalleObj.detalle_texto || ''

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
      } else if (textoDetalle.includes('+')) {
        // Si el texto tiene partes separadas por '+', intentamos buscar cada zona individual en el catálogo
        const partes = textoDetalle.split('+').map((p: string) => p.trim().toLowerCase())
        partes.forEach((parte: string) => {
          const zonaEncontrada = servicios.find(s => s.nombre_zona.toLowerCase() === parte)
          if (zonaEncontrada) {
            itemsIniciales.push({
              id: zonaEncontrada.id,
              nombre: zonaEncontrada.nombre_zona,
              categoria: zonaEncontrada.categoria_zona,
              precio: Number(zonaEncontrada.precio_lista),
              frecuencia: '',
              energia: '',
              pasadas: ''
            })
          }
        })
      }

      // Si aun así no se pudo desglosar nada, aplicamos el fallback genérico
      if (itemsIniciales.length === 0) {
        itemsIniciales.push({
          id: 'generico',
          nombre: textoDetalle || t.servicio_tipo || 'Tratamiento Láser',
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

    const mins = Math.floor(segundosSesion / 60)
    const segs = segundosSesion % 60
    const duracionTexto = mins > 0 ? `${mins} min ${segs} seg` : `${segs} seg`

    try {
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

      const resumenParametros = zonasSesion
        .map(z => `${z.nombre}: Frec: ${z.frecuencia || '--'} | En: ${z.energia || '--'} | Pas: ${z.pasadas || '--'}`)
        .join(' // ')

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

const { error: errorReserva } = await supabase
      .from('reservas')
      .update({
        estado: 'completado', // 👈 ¡Acá está la clave exacta permitida por el CHECK!
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

  const zonaOriginalSwap = swapTargetIndex !== null ? getZonaById(serviciosLaser, zonasSesion[swapTargetIndex]?.id) : null
  const idsOcupados = zonasSesion.map(z => z.id)
  const opcionesSwap = zonaOriginalSwap ? getZonasSwapDisponibles(zonaOriginalSwap, serviciosLaser, idsOcupados) : []

  return (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-0 sm:p-4 transition-all">
    {/* Contenedor Principal Fintech */}
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 w-full max-w-4xl rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] text-slate-900 dark:text-zinc-100 my-0 sm:my-auto overflow-hidden animate-in slide-in-from-bottom duration-300 sm:duration-200 pb-[env(safe-area-inset-bottom)] sm:pb-0">
      
      {/* Handle visual solo mobile */}
      <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700/80 rounded-full mx-auto my-2.5 sm:hidden" />

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Cierre de Sesión Láser
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                Grilla Técnica
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Paciente: <strong className="text-blue-600 dark:text-blue-400 font-bold">{turno.cliente_nombre}</strong>
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

      {/* BODY */}
      <form onSubmit={handleGuardar} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

        {/* CRONÓMETRO INTEGRADO */}
        <div className="bg-slate-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60">
          <RelojCronometroGabinete
            onTiempoActualizado={(seg) => setSegundosSesion(seg)}
          />
        </div>

        {/* ZONAS Y PARÁMETROS */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <label className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm tracking-tight block">
                Zonas y Parámetros
              </label>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Configura la frecuencia, energía y pasadas por zona
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMostrarSelectorExtra(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Agregar Zona Extra</span>
            </button>
          </div>

          {/* CONTENEDOR DE ZONAS */}
          <div className="space-y-2.5">
            {zonasSesion.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 hover:border-slate-300 dark:hover:border-zinc-600 rounded-2xl p-3.5 transition-all space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
              >
                <div className="sm:w-1/4 flex items-center justify-between sm:justify-start gap-2 min-w-0">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate">{item.nombre}</span>
                  </span>
                  {item.esExtra && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg font-bold shrink-0">
                      Extra
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 sm:flex-1">
                  <div>
                    <label className="block sm:hidden text-[10px] text-slate-400 mb-1 font-semibold">Frecuencia</label>
                    <input
                      type="text"
                      placeholder="Ej. 10 Hz"
                      value={item.frecuencia}
                      onChange={(e) => actualizarFila(idx, 'frecuencia', e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-2.5 py-1.5 text-center text-slate-800 dark:text-zinc-100 font-mono text-xs focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block sm:hidden text-[10px] text-slate-400 mb-1 font-semibold">Energía</label>
                    <input
                      type="text"
                      placeholder="Ej. 14 J"
                      value={item.energia}
                      onChange={(e) => actualizarFila(idx, 'energia', e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-2.5 py-1.5 text-center text-slate-800 dark:text-zinc-100 font-mono text-xs focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block sm:hidden text-[10px] text-slate-400 mb-1 font-semibold">Pasadas</label>
                    <input
                      type="text"
                      placeholder="Ej. 3"
                      value={item.pasadas}
                      onChange={(e) => actualizarFila(idx, 'pasadas', e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-2.5 py-1.5 text-center text-slate-800 dark:text-zinc-100 font-mono text-xs focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t border-slate-200/60 dark:border-zinc-700/60 sm:border-t-0 shrink-0">
                  {item.id !== 'generico' && (
                    <button
                      type="button"
                      onClick={() => abrirSwap(idx)}
                      className="p-2 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-zinc-700 active:scale-95"
                      title="Intercambiar zona"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => eliminarZona(idx)}
                    className="p-2 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-zinc-700 active:scale-95"
                    title="Eliminar zona"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CAMPOS GENERALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-zinc-300">
              Especialista / Operadora <span className="text-blue-600 dark:text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Ana Belén"
              value={operadora}
              onChange={(e) => setOperadora(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-3.5 py-2.5 text-slate-800 dark:text-zinc-100 font-medium focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-zinc-300">
              Notas de Gabinete / Evolución Piel
            </label>
            <input
              type="text"
              placeholder="Ej. Buena tolerancia al tratamiento..."
              value={notasGabinete}
              onChange={(e) => setNotasGabinete(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-3.5 py-2.5 text-slate-800 dark:text-zinc-100 font-medium focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* FOOTER ACCIONES */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded-2xl transition-all cursor-pointer active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="px-5 py-2.5 min-h-[42px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl transition-all shadow-md shadow-blue-500/10 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl text-xs animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 tracking-tight">
                Seleccionar Zona Extra
              </h3>
              <button 
                type="button"
                onClick={() => setMostrarSelectorExtra(false)} 
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {serviciosLaser
                .filter(s => !idsOcupados.includes(s.id))
                .map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => agregarZonaExtra(s)}
                    className="w-full flex justify-between items-center p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 hover:border-blue-500 text-left transition-all cursor-pointer active:scale-95 group"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {s.nombre_zona}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize mt-0.5 font-medium">
                        Categoría: {s.categoria_zona}
                      </p>
                    </div>
                    <span className="font-extrabold font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
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
);
}