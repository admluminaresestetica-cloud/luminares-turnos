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
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm text-center text-slate-400 dark:text-zinc-500 text-sm font-medium">
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
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-zinc-800 shadow-md space-y-4">
      
      {/* Cabecera con Nombre y Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {horaTurno && (
            <span className="inline-block text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
              TURNO DE LAS {horaTurno} HS
            </span>
          )}
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-50 capitalize tracking-tight leading-snug">
            {turno.cliente_nombre || turno.nombre || 'Cliente'}
          </h3>
        </div>
        <div className="shrink-0 pt-1">
          <BadgeModificado fueModificado={modificado} />
        </div>
      </div>

      {/* Teléfono y Estado actual */}
      <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        {(turno.cliente_celular || turno.celular) ? (
          <a 
            href={`tel:${turno.cliente_celular || turno.celular}`}
            className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 font-semibold hover:text-emerald-600 transition-colors"
          >
            <div className="p-1.5 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Phone className="w-4 h-4" />
            </div>
            <span>{turno.cliente_celular || turno.celular}</span>
          </a>
        ) : <div />}
        
        <div className="font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wide bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700">
          {turno.estado || 'pendiente'}
        </div>
      </div>

      {/* Duración y Precio destallados con tarjetas de contraste */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">Duración</p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">{turno.duracion_total || 30} min</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
          <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-600/80 dark:text-emerald-400">Monto Total</p>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
              ${turno.precio_total ? Number(turno.precio_total).toLocaleString('es-AR') : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Detalle Original de la Reserva Web */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>Servicio Original (Web):</span>
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 pl-3 border-l-2 border-slate-200 dark:border-zinc-700">
          {originalTexto}
        </p>
      </div>

      {/* Detalle Actual / Modificado en Recepción (si cambió) */}
      {modificado && (
        <div className="space-y-1.5 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Servicio Modificado (Recepción):</span>
          </div>
          <p className="text-sm font-semibold text-rose-950 dark:text-rose-200">
            {actualTexto}
          </p>
        </div>
      )}

      {/* Botones de Acción Táctiles */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onCambiarEstado('en_gabinete')}
            className="py-3 px-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white rounded-2xl text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>En Gabinete</span>
          </button>
          <button
            type="button"
            onClick={() => onCambiarEstado('atendido')}
            className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Atendido</span>
          </button>
        </div>

        {/* Botón Principal CTA destacado con degradado */}
        <button
          type="button"
          onClick={onAbrirEdicion}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-98 text-white rounded-2xl text-sm font-extrabold transition-all shadow-md shadow-rose-500/20"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Modificar Zonas / Promos de este Turno</span>
        </button>
      </div>

    </div>
  )
}
