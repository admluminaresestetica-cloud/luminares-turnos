import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SeccionFAQ from '@/components/home/SeccionFAQ';

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white p-4 sm:p-6 md:p-12 font-sans selection:bg-rose-100 selection:text-rose-900">
      <div className="max-w-2xl mx-auto">
        {/* Botón de volver */}
        <Link
          href="/turnos"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs mb-6 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          <span>Volver al inicio</span>
        </Link>

        {/* Componente de las preguntas */}
        <SeccionFAQ />
      </div>
    </main>
  );
}