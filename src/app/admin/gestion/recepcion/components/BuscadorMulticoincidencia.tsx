'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Phone, CheckCircle2 } from 'lucide-react'

function obtenerTextoDetalle(reserva: Record<string, any>): string {
  if (!reserva) return 'Sin detalle'

  let detalle = reserva.detalle_reserva

  // 1. Si detalle_reserva es un string (Ej: "promo M1 (axilas + espalda completa)")
  if (typeof detalle === 'string' && detalle.trim()) {
    try {
      const parsed = JSON.parse(detalle)
      if (typeof parsed === 'object' && parsed !== null) {
        detalle = parsed
      } else {
        return detalle
      }
    } catch (e) {
      return detalle
    }
  }

  // 2. Si detalle_reserva es un objeto JSONB
  if (typeof detalle === 'object' && detalle !== null) {
    if (detalle.nombre_promo) return detalle.nombre_promo
    if (detalle.nombre_zona) return detalle.nombre_zona
    if (detalle.nombre) return detalle.nombre
    if (detalle.titulo) return detalle.titulo
    if (detalle.descripcion) return detalle.descripcion
    if (Array.isArray(detalle.zonas)) {
      return detalle.zonas.map((z: any) => (typeof z === 'string' ? z : z.nombre || z.nombre_zona)).join(', ')
    }
  }

  // 3. Si detalle_reserva es un Array
  if (Array.isArray(detalle)) {
    return detalle
      .map((z: any) => (typeof z === 'string' ? z : z.nombre_promo || z.nombre_zona || z.nombre || z.zona))
      .filter(Boolean)
      .join(', ')
  }

  // Fallbacks de compatibilidad
  if (Array.isArray(reserva.zonas_seleccionadas) && reserva.zonas_seleccionadas.length > 0) {
    return reserva.zonas_seleccionadas.join(', ')
  }

  if (typeof reserva.zonas_seleccionadas === 'string' && reserva.zonas_seleccionadas) {
    return reserva.zonas_seleccionadas
  }

  return reserva.servicio_tipo || 'Sin especificar'
}

interface BuscadorProps {
  onClienteSeleccionado: (data: { pacienteFicha: any; reservaHoy: any }) => void
  onVerHistorialDirecto: (pacienteId: string) => void
}

export default function BuscadorMulticoincidencia({
  onClienteSeleccionado,
  onVerHistorialDirecto,
}: BuscadorProps) {
  const [termino, setTermino] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resultados, setResultados] = useState<any[]>([])

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termino.trim()) return

    setCargando(true)
    const q = termino.trim().toLowerCase()

    try {
      // 1. Buscar en pacientes_ficha por nombre o celular
      const { data: pacientes } = await supabase
        .from('pacientes_ficha')
        .select('*')
        .or(`nombre_completo.ilike.%${q}%,celular.ilike.%${q}%`)
        .limit(10)

      // 2. Buscar en reservas usando la columna correcta: fecha_hora_inicio
      const { data: reservas } = await supabase
        .from('reservas')
        .select('*')
        .or(`cliente_nombre.ilike.%${q}%,cliente_celular.ilike.%${q}%,codigo_unico.ilike.%${q}%`)
        .order('fecha_hora_inicio', { ascending: false })
        .limit(10)

      const listaCombinada: any[] = []
      const idsProcesados = new Set()

      // Insertar los pacientes que ya tienen ficha clínica creada
      if (pacientes) {
        pacientes.forEach((p: Record<string, any>) => {
          const clave = p.celular || p.nombre_completo
          idsProcesados.add(clave)

          const reservaRelacionada = reservas?.find(
            (r: Record<string, any>) =>
              r.cliente_celular === p.celular ||
              r.cliente_nombre?.toLowerCase() === p.nombre_completo?.toLowerCase()
          )

          listaCombinada.push({
            pacienteFicha: p,
            reservaHoy: reservaRelacionada || null,
            nombre: p.nombre_completo,
            celular: p.celular,
            detalleZona: reservaRelacionada ? obtenerTextoDetalle(reservaRelacionada) : 'Ficha clínica registrada',
            origen: 'ficha',
          })
        })
      }

      // Insertar reservas que aún no tienen ficha registrada
      if (reservas) {
        reservas.forEach((r: Record<string, any>) => {
          const clave = r.cliente_celular || r.cliente_nombre
          if (!idsProcesados.has(clave)) {
            idsProcesados.add(clave)
            listaCombinada.push({
              pacienteFicha: null,
              reservaHoy: r,
              nombre: r.cliente_nombre || 'Sin nombre',
              celular: r.cliente_celular || '',
              detalleZona: obtenerTextoDetalle(r),
              origen: 'reserva',
            })
          }
        })
      }

      setResultados(listaCombinada)
    } catch (err) {
      console.error('Error al realizar la búsqueda:', err)
    } finally {
      setCargando(false)
    }
  }

  const seleccionar = (item: any) => {
    onClienteSeleccionado({
      pacienteFicha: item.pacienteFicha,
      reservaHoy: item.reservaHoy,
    })
    setResultados([])
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <form onSubmit={handleBuscar} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Teléfono o Código..."
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {resultados.length > 0 && (
        <div className="mt-3 divide-y divide-gray-100 border-t border-gray-100 max-h-60 overflow-y-auto">
          {resultados.map((item, idx) => (
            <div
              key={item.pacienteFicha?.id || item.reservaHoy?.id || idx}
              className="py-2.5 px-2 flex items-center justify-between hover:bg-rose-50/50 rounded-xl transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-800">{item.nombre}</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium border border-gray-200">
                    {item.detalleZona}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  {item.celular && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {item.celular}
                    </span>
                  )}
                  {item.origen === 'reserva' && (
                    <span className="text-amber-600 font-medium">Turno sin ficha guardada</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.pacienteFicha?.id && (
                  <button
                    type="button"
                    onClick={() => onVerHistorialDirecto(item.pacienteFicha.id)}
                    className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    🔍 Ver Historial
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => seleccionar(item)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Seleccionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}