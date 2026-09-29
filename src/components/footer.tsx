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
    <footer className="w-full border-t border-border bg-card py-8 mt-auto">
      <div className="max-w-md mx-auto px-4 text-center space-y-4">
        
        {/* Ubicación y Medios de Pago */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs font-medium text-foreground">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-primary transition-colors bg-secondary/60 px-3.5 py-1.5 rounded-full border border-border shadow-xs cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{direccionTexto} · Ver mapa</span>
          </a>

          <div className="inline-flex items-center gap-1.5 bg-secondary/60 px-3.5 py-1.5 rounded-full border border-border shadow-xs">
            <Wallet className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Efectivo · Transferencia</span>
          </div>
        </div>

        {/* Links de navegación y Políticas */}
        <div className="flex justify-center items-center gap-3 text-xs text-muted-foreground font-semibold pt-1">
          <Link href="/mis-turnos" className="hover:text-foreground transition-colors">
            Mis Turnos
          </Link>
          <span className="text-border">•</span>
          <Link href="/faq" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            Políticas y FAQ
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-muted-foreground font-medium">
          © {anioActual} {nombreEmpresa}. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}