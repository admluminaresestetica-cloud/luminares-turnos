'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Wallet, ShieldCheck, ExternalLink } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

export default function Footer() {
  const pathname = usePathname();
  const anioActual = new Date().getFullYear();
  const { config } = useConfig();
  const reducirMovimiento = useReducedMotion();

  // Si el usuario NO está en el home ('/'), este footer NO se renderiza en ninguna otra parte de la app
  if (pathname !== '/') {
    return null;
  }

  const direccionTexto = config?.direccion_texto || 'Rosario, Santa Fe';
  const mapsUrl = config?.google_maps_url || 'https://maps.google.com';
  const nombreEmpresa = config?.nombre_empresa || 'Luminares Estética';

  return (
    <footer className="w-full border-t border-border/80 bg-card/60 backdrop-blur-xl py-10 mt-auto transition-colors relative overflow-hidden">
      
      {/* 🌫️ Orbes de profundidad neutros sutiles en el footer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] bg-slate-400/5 dark:bg-zinc-700/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md mx-auto px-4 text-center space-y-5 relative z-10">
        
        {/* Ubicación y Medios de Pago */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs font-bold text-foreground/80">
          <motion.a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={reducirMovimiento ? undefined : { scale: 1.02, y: -1 }}
            whileTap={reducirMovimiento ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5 hover:text-primary transition-colors bg-card/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/80 shadow-xs cursor-pointer group"
          >
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{direccionTexto}</span>
            <span className="text-muted-foreground group-hover:text-primary flex items-center gap-0.5 ml-0.5">
              · Ver mapa <ExternalLink className="w-3 h-3" />
            </span>
          </motion.a>

          <motion.div
            whileHover={reducirMovimiento ? undefined : { scale: 1.02, y: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5 bg-card/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/80 shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Efectivo · Transferencia</span>
          </motion.div>
        </div>

        {/* Links de navegación y Políticas */}
        <div className="flex justify-center items-center gap-3 text-xs text-muted-foreground font-extrabold pt-1">
          <Link
            href="/mis-turnos"
            className="hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-accent/50"
          >
            Mis Turnos
          </Link>
          <span className="text-border">•</span>
          <Link
            href="/faq"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-accent/50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            Políticas y FAQ
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-muted-foreground/80 font-semibold tracking-tight pt-1">
          © {anioActual} <strong className="font-bold text-foreground">{nombreEmpresa}</strong>. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}