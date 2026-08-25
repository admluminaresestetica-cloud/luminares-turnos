import Link from 'next/link';
import { MapPin, Wallet, ShieldCheck, ShoppingBag } from 'lucide-react';

interface FooterProps {
  tipo?: 'reserva' | 'tienda';
}

export default function Footer({ tipo = 'reserva' }: FooterProps) {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/60 backdrop-blur-xs py-6 mt-auto">
      <div className="max-w-md mx-auto px-4 text-center space-y-4">
        
        {/* Ubicación y Medios de Pago */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs font-medium text-slate-600">
          <a
            href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x95b6530031ebfef9:0xc7bf7db44f73adf7?entry=gemini&utm_source=gemini&utm_campaign=gem-default" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Rosario, Santa Fe · Ver mapa</span>
          </a>

          <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {tipo === 'tienda' ? 'Efectivo · Mercado Pago' : 'Efectivo · Transferencia'}
            </span>
          </div>
        </div>

        {/* Links de navegación y Políticas */}
        <div className="flex justify-center items-center gap-3 text-[11px] text-slate-400 font-medium">
          {tipo === 'reserva' ? (
            <>
              <Link href="/mis-turnos" className="hover:text-slate-700 transition-colors">
                Mis Turnos
              </Link>
              <span>•</span>
              <Link href="/faq" className="hover:text-slate-700 transition-colors inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                Políticas y FAQ
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-slate-700 transition-colors inline-flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-slate-400" />
                Reservar Turno
              </Link>
              <span>•</span>
              <Link href="/faq" className="hover:text-slate-700 transition-colors inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                Envíos y FAQ
              </Link>
            </>
          )}
        </div>

        {/* Copyright */}
        <p className="text-[10px] text-slate-400 font-medium pt-1">
          © {anioActual} Luminares Estética. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}
