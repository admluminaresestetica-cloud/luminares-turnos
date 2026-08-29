"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Wallet, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const anioActual = new Date().getFullYear();

  // Si el usuario está en la tienda, este footer NO se renderiza
  if (pathname?.startsWith('/tienda')) {
    return null;
  }

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 py-8 mt-auto forced-color-adjust-none">
      <div className="max-w-md mx-auto px-4 text-center space-y-4">
        
        {/* Ubicación y Medios de Pago */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs font-medium text-slate-700">
          <a
            href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x95b6530031ebfef9:0xc7bf7db44f73adf7?entry=gemini&utm_source=gemini&utm_campaign=gem-default" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Rosario, Santa Fe · Ver mapa</span>
          </a>

          <div className="inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Efectivo · Transferencia</span>
          </div>
        </div>

        {/* Links de navegación y Políticas */}
        <div className="flex justify-center items-center gap-3 text-xs text-slate-600 font-semibold pt-1">
          <Link href="/mis-turnos" className="hover:text-slate-900 transition-colors">
            Mis Turnos
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/faq" className="hover:text-slate-900 transition-colors inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            Políticas y FAQ
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-slate-500 font-medium">
          © {anioActual} Luminares Estética. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}