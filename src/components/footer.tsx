import Link from 'next/link';

export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/60 backdrop-blur-xs py-6 mt-auto">
      <div className="max-w-md mx-auto px-4 text-center space-y-2">
        <p className="text-xs text-slate-500 font-medium">
          © {anioActual} Centro de Estética. Todos los derechos reservados.
        </p>
        <div className="flex justify-center gap-4 text-[11px] text-slate-400 font-medium">
          <Link href="/mis-turnos" className="hover:text-slate-700 transition-colors">
            Mis Turnos
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-slate-700 transition-colors">
            Reservar
          </Link>
        </div>
      </div>
    </footer>
  );
}