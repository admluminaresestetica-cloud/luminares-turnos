'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ShoppingBag, MessageCircle, ChevronRight, Sparkles } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { Badge } from '@/components/ui/badge';

export default function LandingPagePrueba() {
  const { config } = useConfig();

  // Nombre y logo dinámicos
  const nombreEmpresa = config?.nombre_empresa || 'LUMINARES ESTÉTICA';
  const logoUrl = config?.logo_url || '/logodoradoo.svg';

  // WhatsApp dinámico
  const rawNumber = config?.whatsapp_numero || '5493413954355';
  const numeroLimpio = rawNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${numeroLimpio}?text=Hola!%20Tengo%20una%20consulta.`;

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-between p-6 md:p-12 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Contenedor tipo pantalla de celular */}
      <div className="max-w-md w-full my-auto flex flex-col items-center">
        
        {/* Encabezado / Logo con tarjeta flotante suave */}
        <header className="text-center mb-10 flex flex-col items-center w-full">
          <div className="relative group mb-4">
            {/* Brillo suave de fondo detrás del logo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[32px] blur-md group-hover:blur-lg transition-all duration-300 opacity-70" />
            
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-white shadow-sm border border-slate-100 overflow-hidden p-3.5">
              <Image 
                src={logoUrl} 
                alt={`Logo ${nombreEmpresa}`} 
                width={48} 
                height={48} 
                className="object-contain w-auto h-auto max-h-12 drop-shadow-sm"
                priority
              />
            </div>
          </div>

          {/* Badge Oficial de Shadcn UI */}
          <Badge 
            variant="outline" 
            className="mb-3 px-3 py-1 bg-emerald-50/80 border-emerald-200/80 text-emerald-800 font-bold tracking-[0.15em] text-[10px] uppercase gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
            {nombreEmpresa}
          </Badge>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ¿Qué te gustaría hacer hoy?
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Seleccioná una opción para comenzar
          </p>
        </header>

        {/* Grilla de Tarjetas táctiles principales */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          
          {/* Botón 1: Reservar Turnos */}
          <Link
            href="/turnos"
            className="group relative bg-white border border-slate-200/80 rounded-[30px] p-5 shadow-xs hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-300 active:scale-[0.96] transition-all duration-200 flex flex-col items-center text-center justify-between aspect-square overflow-hidden"
          >
            {/* Indicador de acción en la esquina superior */}
            <div className="w-full flex justify-end">
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white text-slate-400 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Ícono con contenedor en gradiente */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Calendar className="w-8 h-8 stroke-[2]" />
            </div>

            {/* Texto */}
            <div className="mt-2">
              <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug block">
                Reservar Turnos
              </span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">
                Agendá en segundos
              </span>
            </div>
          </Link>

          {/* Botón 2: Tienda Online */}
          <Link
            href="/tienda"
            className="group relative bg-white border border-slate-200/80 rounded-[30px] p-5 shadow-xs hover:shadow-xl hover:shadow-slate-900/5 hover:border-slate-400 active:scale-[0.96] transition-all duration-200 flex flex-col items-center text-center justify-between aspect-square overflow-hidden"
          >
            {/* Indicador de acción en la esquina superior */}
            <div className="w-full flex justify-end">
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white text-slate-400 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Ícono con contenedor en gradiente */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="w-8 h-8 stroke-[2]" />
            </div>

            {/* Texto */}
            <div className="mt-2">
              <span className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors leading-snug block">
                Tienda Online
              </span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">
                Productos y catálogo
              </span>
            </div>
          </Link>

        </div>

        {/* Tarjeta inferior de WhatsApp estilo píldora interactiva */}
        <div className="w-full">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white border border-slate-200/80 hover:border-emerald-200 hover:bg-emerald-50/30 p-3.5 rounded-2xl shadow-xs active:scale-[0.98] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5 fill-[#25D366]/20" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                  ¿Tenés alguna duda?
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Escribinos por WhatsApp directamente
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-500 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </a>
        </div>

      </div>

      {/* Footer minimalista */}
      <footer className="text-center text-[11px] text-slate-400 font-medium tracking-wide mt-8">
        © {new Date().getFullYear()} • {nombreEmpresa}
      </footer>

    </main>
  );
}