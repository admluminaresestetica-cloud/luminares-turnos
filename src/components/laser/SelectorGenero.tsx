'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Mars, Venus, ArrowUpRight } from 'lucide-react';
import type { GeneroLaser } from '@/lib/types';

interface Props {
  genero: GeneroLaser | null;
  onSelect: (genero: GeneroLaser) => void;
  /** Versión reducida tipo interruptor, para cambiar de perfil en el paso 2 */
  compacto?: boolean;
}

const OPCIONES: {
  valor: GeneroLaser;
  label: string;
  descripcion: string;
  Icono: typeof Venus;
}[] = [
  {
    valor: 'femenino',
    label: 'Femenino',
    descripcion: 'Promos y zonas para cuerpo y rostro femenino',
    Icono: Venus,
  },
  {
    valor: 'masculino',
    label: 'Masculino',
    descripcion: 'Promos y zonas para cuerpo y rostro masculino',
    Icono: Mars,
  },
];

const contenedorVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
};

const tarjetaVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 26 },
  },
};

export default function SelectorGenero({ genero, onSelect, compacto = false }: Props) {
  const reducirMovimiento = useReducedMotion();

  if (compacto) {
    return (
      <div
        role="group"
        aria-label="Perfil"
        className="grid grid-cols-2 gap-2 rounded-[24px] border border-border bg-card/80 backdrop-blur-xl p-1.5 shadow-lg shadow-black/5 dark:shadow-black/20"
      >
        {OPCIONES.map(({ valor, label, Icono }) => {
          const activo = genero === valor;
          return (
            <button
              key={valor}
              type="button"
              onClick={() => onSelect(valor)}
              aria-pressed={activo}
              className="relative flex h-12 items-center justify-center gap-2 rounded-[18px] px-4 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {activo && (
                <motion.div
                  layoutId="pestanaGeneroActivo"
                  transition={
                    reducirMovimiento
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 450, damping: 32 }
                  }
                  className="absolute inset-0 rounded-[18px] bg-primary text-primary-foreground shadow-md shadow-primary/30 border border-white/20 dark:border-white/10"
                />
              )}

              <span
                className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                  activo
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icono className="h-4 w-4 shrink-0" />
                <span className="truncate tracking-tight">{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div
      variants={reducirMovimiento ? undefined : contenedorVariants}
      initial={reducirMovimiento ? undefined : 'hidden'}
      animate={reducirMovimiento ? undefined : 'show'}
      className="grid w-full grid-cols-1 gap-4"
    >
      {OPCIONES.map(({ valor, label, descripcion, Icono }) => {
        const activo = genero === valor;

        return (
          <motion.button
            key={valor}
            type="button"
            variants={reducirMovimiento ? undefined : tarjetaVariants}
            whileHover={reducirMovimiento ? undefined : { y: -2, scale: 1.01 }}
            whileTap={reducirMovimiento ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            onClick={() => onSelect(valor)}
            aria-pressed={activo}
            className={`group relative flex w-full flex-col items-start gap-5 overflow-hidden rounded-[28px] border backdrop-blur-xl p-6 text-left outline-none transition-all duration-200 select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
              activo
                ? 'border-primary bg-card shadow-xl shadow-primary/15 ring-1 ring-primary'
                : 'border-border bg-card/80 hover:border-primary/40 shadow-lg shadow-black/5 dark:shadow-black/20'
            }`}
          >
            {/* Resplandor interno sutil cuando está activo */}
            {activo && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/[0.03] to-transparent"
              />
            )}

            {/* Cabecera de la tarjeta: Icono a la izquierda + Flecha a la derecha */}
            <div className="relative z-10 flex w-full items-center justify-between">
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border transition-all duration-200 ${
                  activo
                    ? 'border-white/20 bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'border-border/80 bg-background/80 text-foreground shadow-xs group-hover:border-primary/30 group-hover:text-primary'
                }`}
              >
                <Icono className="h-7 w-7" />
              </span>

              <span
                aria-hidden
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                  activo
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border/60 bg-background/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary'
                }`}
              >
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>

            {/* Texto descriptivo debajo del icono */}
            <span className="relative z-10 w-full space-y-1">
              <span className="block text-xl font-black tracking-tight text-foreground">
                {label}
              </span>
              <span className="block text-xs font-semibold leading-relaxed text-muted-foreground">
                {descripcion}
              </span>
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}