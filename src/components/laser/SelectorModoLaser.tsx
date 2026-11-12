'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Star, Layers } from 'lucide-react';
import type { ModoLaser } from '@/lib/laser/calculos';

interface Props {
  modo: ModoLaser;
  onChange: (modo: ModoLaser) => void;
}

const OPCIONES: { valor: ModoLaser; label: string; Icono: typeof Star }[] = [
  { valor: 'promo', label: 'Promos fijas', Icono: Star },
  { valor: 'zonas', label: 'Zonas individuales', Icono: Layers },
];

export default function SelectorModoLaser({ modo, onChange }: Props) {
  const reducirMovimiento = useReducedMotion();

  return (
    <div
      role="group"
      aria-label="Modo de selección"
      className="grid grid-cols-2 gap-2.5 rounded-[24px] border border-border bg-card/80 backdrop-blur-xl p-1.5 shadow-lg shadow-black/5 dark:shadow-black/20"
    >
      {OPCIONES.map(({ valor, label, Icono }) => {
        const activo = modo === valor;
        return (
          <button
            key={valor}
            type="button"
            onClick={() => onChange(valor)}
            aria-pressed={activo}
            className="relative flex h-12 items-center justify-center gap-2.5 rounded-[18px] px-4 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {/* Fondo deslizante con Framer Motion (layoutId) para la píldora activa */}
            {activo && (
              <motion.div
                layoutId="pestanaActivaLaser"
                transition={
                  reducirMovimiento
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 450, damping: 32 }
                }
                className="absolute inset-0 rounded-[18px] bg-primary text-primary-foreground shadow-md shadow-primary/30 border border-white/20 dark:border-white/10"
              />
            )}

            {/* Contenido del botón (icono y texto con z-index para sobresalir del fondo deslizante) */}
            <span
              className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                activo
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icono className={`h-4 w-4 shrink-0 ${activo ? 'fill-primary-foreground/20' : ''}`} />
              <span className="truncate tracking-tight">{label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}