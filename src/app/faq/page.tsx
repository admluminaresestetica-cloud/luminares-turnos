import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SeccionFAQ from '@/components/home/SeccionFAQ';

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Botón de volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Componente de las preguntas */}
        <SeccionFAQ />
      </div>
    </main>
  );
}
