"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Wallet, ShieldCheck } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

export default function Footer() {
  const pathname = usePathname();
  const anioActual = new Date().getFullYear();
  const { config } = useConfig();

  // Si el usuario está en la tienda, este footer NO se renderiza
  if (pathname?.startsWith('/tienda')) {
    return null;
  }

  const direccionTexto = config?.direccion_texto || "Rosario, Santa Fe";
  const mapsUrl = config?.google_maps_url || "https://maps.google.com";
  const nombreEmpresa = config?.nombre_empresa || "Luminares Estética";

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 mt-auto dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
      <div className="max-w-md mx-auto px-4 text-center space-y-4">
        
        {/* Ubicación y Medios de Pago */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs font-medium text-slate-700 dark:text-zinc-300">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors bg-slate-50/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs cursor-pointer dark:bg-zinc-800 dark:border-zinc-700"
          >
            <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>{direccionTexto} · Ver mapa</span>
          </a>

          <div className="inline-flex items-center gap-1.5 bg-slate-50/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs dark:bg-zinc-800 dark:border-zinc-700">
            <Wallet className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Efectivo · Transferencia</span>
          </div>
        </div>

        {/* Links de navegación y Políticas */}
        <div className="flex justify-center items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-semibold pt-1">
          <Link href="/mis-turnos" className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
            Mis Turnos
          </Link>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <Link href="/faq" className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            Políticas y FAQ
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
          © {anioActual} {nombreEmpresa}. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}