'use client';

import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import SeccionFAQ from '@/components/Home/SeccionFAQ';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#e8eee9] dark:bg-zinc-950 transition-colors pb-24 pt-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Cabecera con botón de regresar */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-stone-800 dark:text-zinc-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Centro de Ayuda
            </h1>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              Respuesta a tus dudas e inquietudes habituales
            </p>
          </div>
        </div>

        {/* Componente de Preguntas Frecuentes */}
        <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-stone-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xs">
          <SeccionFAQ />
        </div>

      </div>
    </div>
  );
}