'use client'

import { useState } from 'react'

// Nota: replica el estado local original de page.tsx tal cual estaba —
// incluye el mismo comportamiento (no persiste en Supabase salvo que
// conectes onGuardarReferidos, tal como discutimos antes).
export function useReferidosConfig() {
  const [referidosActivo, setReferidosActivo] = useState<boolean>(true)
  const [referidosTipoDescuento, setReferidosTipoDescuento] = useState<'porcentaje' | 'monto_fijo'>('porcentaje')
  const [referidosValorDescuento, setReferidosValorDescuento] = useState<number>(10)

  return {
    referidosActivo, setReferidosActivo,
    referidosTipoDescuento, setReferidosTipoDescuento,
    referidosValorDescuento, setReferidosValorDescuento
  }
}