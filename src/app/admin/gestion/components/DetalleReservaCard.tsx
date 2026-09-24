'use client'

import React from 'react'
import { Phone, Sparkles, History, CheckCircle2, UserCheck, Clock, DollarSign } from 'lucide-react'
import BadgeModificado from './BadgeModificado'
import { verificarSiFueModificado } from '@/utils/turnoHelpers'

interface DetalleReservaCardProps {
  turno: any | null;
  onCambiarEstado: (nuevoEstado: string) => void;
  onAbrirEdicion: () => void;
}

export default function DetalleReservaCard({ 
  turno, 
  onCambiarEstado, 
  onAbrirEdicion 
}: DetalleReservaCardProps) {
  if (!turno) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm text-center text-gray-400 dark:text-zinc-500 text-xs">
        Selecciona un turno de la agenda a la izquierda para ver sus detalles completos y opciones de gestión.
      </div>
    )
  }

  const modificado = verificarSiFueModificado(turno)
  const horaTurno = turno.fecha_hora_inicio 
    ? new Date(turno.fecha_hora_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : ''

  // Extracción robusta de detalle original y actual desde la BD o JSONB
  const detalleObj = typeof turno.detalle_reserva === 'object' && turno.detalle_reserva !== null ? turno.detalle_reserva : {};
  
  const originalTexto = 
    turno.detalle_original || 
    detalleObj.detalle_original || 
    turno.detalle_texto || 
    detalleObj.detalle_texto || 
    (typeof turno.detalle_reserva === 'string' ? turno.detalle_reserva : null) || 
    'No especificado';

  const actualTexto = 
    turno.detalle_texto || 
    detalleObj.detalle_texto || 
    originalTexto;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
      {/* Cabecera con Nombre y Badge */}
      <div className="flex items-center justify-between">
        <div>
          {horaTurno && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Turno de las {horaTurno} hs
            </span>
          )}
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 capitalize">
            {turno.cliente_nombre || turno.nombre || 'Cliente'}
          </h3>
        </div>
        <BadgeModificado fueModificado={modificado} />
      </div>

      {/* Teléfono y Estado actual */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-zinc-800/80">
        {(turno.cliente_celular || turno.celular) && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>{turno.cliente_celular || turno.celular}</span>
          </div>
        )}
        <div className="font-semibold px-2.5 py-0.5 rounded-full text-[10px] uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
          Estado: {turno.estado || 'pendiente'}
        </div>
      </div>

      {/* Duración y Precio */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{turno.duracion_total || 30} min</span>
        </div>
        <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{turno.precio_total ? Number(turno.precio_total).toLocaleString('es-AR') : '0'}</span>
        </div>
      </div>

      {/* Detalle Original de la Reserva Web */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
          <History className="w-3 h-3" />
          <span>Servicio Original (Web):</span>
        </div>
        <p className="text-xs font-medium text-gray-700 dark:text-zinc-300 pl-4">
          {originalTexto}
        </p>
      </div>

      {/* Detalle Actual / Modificado en Recepción (si cambió) */}
      {modificado && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Servicio Actual (Recepción):</span>
          </div>
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 pl-4 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-100 dark:border-rose-900/40">
            {actualTexto}
          </p>
        </div>
      )}

      {/* Botones de Acción de Estado y Edición */}
      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onCambiarEstado('en_gabinete')}
            className="py-2 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-xl text-[11px] font-semibold transition-all border border-amber-200/60 flex items-center justify-center gap-1"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>En Gabinete</span>
          </button>
          <button
            type="button"
            onClick={() => onCambiarEstado('atendido')}
            className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-semibold transition-all border border-emerald-200/60 flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Atendido</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onAbrirEdicion}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all border border-rose-200/60 dark:border-zinc-700 shadow-xs"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Modificar Zonas / Promos de este Turno</span>
        </button>
      </div>
    </div>
  )
}