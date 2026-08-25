"use client";

import Link from 'next/link';
import { MapPin, ShieldCheck, CreditCard, Lock } from 'lucide-react';

export default function FooterTienda() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/60 backdrop-blur-xs py-6 mt-auto">
      <div className="max-w-md mx-auto px-4 text-center space-y-4">
        
        {/* Ubicación y Métodos de Pago */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs font-medium text-slate-600">
          {/* Abrir Mapa */}
          <a
            href="https://maps.google.com" // Reemplazar con la URL exacta de tu mapa
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Rosario, Santa Fe · Ver mapa</span>
          </a>

          {/* Métodos de Pago */}
          <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            <span>Efectivo · Mercado Pago · WhatsApp</span>
          </div>
        </div>

        {/* Banner de Pago Seguro y Envíos */}
        <div className="flex justify-center items-center gap-3 text-[11px] text-slate-500 font-medium bg-slate-50 py-2 px-3 rounded-lg border border-slate-100">
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <Lock className="w-3 h-3 text-emerald-600" />
            Pago 100% Seguro por Mercado Pago
          </span>
          <span>•</span>
          <Link href="/faq" className="hover:text-slate-800 transition-colors inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-slate-400" />
            Envíos y FAQ
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-[10px] text-slate-400 font-medium pt-1">
          © {anioActual} Luminares Estética. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}