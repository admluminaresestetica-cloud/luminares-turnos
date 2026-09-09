'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ShoppingBag, MessageCircle } from 'lucide-react';

export default function LandingPage() {
  const whatsappUrl = "https://wa.me/5493413954355?text=Hola!%20Tengo%20una%20consulta.";

  return (
    <main className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Encabezado / Logo */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-slate-100 mb-4 overflow-hidden p-3">
            {/* Imagen desde la carpeta public */}
            <Image 
              src="/logodoradoo.svg" 
              alt="Logo Luminares" 
              width={40} 
              height={40} 
              className="object-contain w-auto h-auto"
              priority
            />
          </div>
          <p className="text-xs font-black tracking-[0.25em] uppercase text-emerald-800 mb-1">
            LUMINARES ESTÉTICA
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ¿Qué te gustaría hacer hoy?
          </h1>
        </header>

        {/* Grilla / Tarjetas Verticales Estilo App */}
        <div className="w-full grid grid-cols-2 gap-4">
          
          {/* Botón 1: Reservar Turnos */}
          <Link
            href="/turnos"
            className="group relative bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_30px_-5px_rgba(14,110,85,0.15)] hover:border-emerald-300 transition-all duration-200 active:scale-[0.97] active:translate-y-0.5 flex flex-col items-center text-center justify-center aspect-square"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0E6E55] flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform duration-200">
              <Calendar className="w-8 h-8 stroke-[2]" />
            </div>
            <span className="text-sm font-bold text-slate-900 group-hover:text-[#0E6E55] transition-colors leading-snug">
              Reservar Turnos
            </span>
          </Link>

          {/* Botón 2: Tienda Online */}
          <Link
            href="/tienda"
            className="group relative bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_30px_-5px_rgba(18,21,27,0.15)] hover:border-slate-400 transition-all duration-200 active:scale-[0.97] active:translate-y-0.5 flex flex-col items-center text-center justify-center aspect-square"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform duration-200">
              <ShoppingBag className="w-8 h-8 stroke-[2]" />
            </div>
            <span className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors leading-snug">
              Tienda Online
            </span>
          </Link>

        </div>

        {/* Asistencia WhatsApp */}
        <div className="mt-8 text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors py-2 px-4 rounded-xl hover:bg-white/60"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>¿Necesitás asistencia? Escribinos</span>
          </a>
        </div>

        <footer className="text-center text-[11px] text-slate-400 mt-6 tracking-wide">
          Luminares Estética
        </footer>

      </div>
    </main>
  );
}