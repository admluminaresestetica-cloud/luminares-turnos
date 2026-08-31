'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Phone, CheckCircle2, History, Loader2 } from 'lucide-react'

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
    <div className="w-full rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
      <form onSubmit={handleBuscar} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o código..."
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-6 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition-all hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
        >
          {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {resultados.length > 0 && (
        <div className="mt-4 max-h-80 divide-y divide-slate-100 overflow-y-auto border-t border-slate-100 sm:max-h-96">
          {resultados.map((item, idx) => (
            <div
              key={item.pacienteFicha?.id || item.reservaHoy?.id || idx}
              className="flex flex-col gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-rose-50/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{item.nombre}</span>
                  <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {item.detalleZona}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {item.celular && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {item.celular}
                    </span>
                  )}
                  {item.origen === 'reserva' && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-amber-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Turno sin ficha guardada
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.pacienteFicha?.id && (
                  <button
                    type="button"
                    onClick={() => onVerHistorialDirecto(item.pacienteFicha.id)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <History className="h-3.5 w-3.5" />
                    Historial
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => seleccionar(item)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Seleccionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}