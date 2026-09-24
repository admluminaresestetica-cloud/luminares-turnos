'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface BadgeModificadoProps {
  fueModificado: boolean
  textoTooltip?: string
}

export default function BadgeModificado({ fueModificado, textoTooltip = 'Modificado en recepción' }: BadgeModificadoProps) {
  if (!fueModificado) return null

  return (
    <span 
      title={textoTooltip}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-xs shrink-0"
    >
      <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
      <span>Modificado</span>
    </span>
  )
}