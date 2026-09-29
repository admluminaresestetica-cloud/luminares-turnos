'use client';

import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import SeccionFAQ from '@/components/Home/SeccionFAQ';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-24 pt-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Cabecera con botón de regresar */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-card border border-border text-foreground hover:bg-accent transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Centro de Ayuda
            </h1>
            <p className="text-xs text-muted-foreground">
              Respuesta a tus dudas e inquietudes habituales
            </p>
          </div>
        </div>

        {/* Componente de Preguntas Frecuentes */}
        <div className="bg-card/60 backdrop-blur-sm border border-border rounded-3xl p-4 sm:p-6 shadow-xs">
          <SeccionFAQ />
        </div>

      </div>
    </div>
  );
}