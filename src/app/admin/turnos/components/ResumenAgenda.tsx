// src/components/admin/ResumenAgenda.tsx
'use client'

import { DollarSign, Clock } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

interface ReservaResumen {
  estado?: string
  precio_total?: number
}

interface ResumenAgendaProps {
  turnos: ReservaResumen[]
  esFechaPasada: boolean
}

const seccionVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
}

export default function ResumenAgenda({ turnos, esFechaPasada }: ResumenAgendaProps) {
  const reducirMovimiento = useReducedMotion()

  const recaudacionReal = turnos
    .filter((t) => t.estado?.toLowerCase() === 'completado')
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)

  const recaudacionPendiente = turnos
    .filter((t) => {
      const est = t.estado?.toLowerCase()
      return est !== 'completado' && est !== 'cancelado'
    })
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)

  return (
    <motion.div
      variants={seccionVariants}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 mb-6 rounded-[28px] shadow-xl transition-colors"
    >
      <div className={`grid gap-3.5 ${esFechaPasada ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>

        {/* Recaudación Real */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={reducirMovimiento ? undefined : { y: -3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              {esFechaPasada ? 'Recaudación Real del Período' : 'Recaudación Real (Completados)'}
            </span>
            <motion.p
              key={recaudacionReal}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums tracking-tight"
            >
              ${recaudacionReal.toLocaleString('es-AR')}
            </motion.p>
          </div>
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:-rotate-3 transition-transform shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Pendiente / Estimado */}
        {!esFechaPasada && (
          <motion.div
            whileTap={{ scale: 0.97 }}
            whileHover={reducirMovimiento ? undefined : { y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                Pendiente / Estimado
              </span>
              <motion.p
                key={recaudacionPendiente}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 tabular-nums tracking-tight"
              >
                ${recaudacionPendiente.toLocaleString('es-AR')}
              </motion.p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:-rotate-3 transition-transform shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  )
}