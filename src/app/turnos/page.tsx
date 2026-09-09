"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { Zap, Sparkles, Calendar, HelpCircle, MessageCircle, ArrowLeft } from 'lucide-react';
import BannerPrincipal from '@/components/BannerPrincipal';

const ACCESOS = [
  {
    href: '/laser',
    titulo: 'Depilación Láser',
    icon: Zap,
    colorBg: 'bg-rose-50 text-rose-600',
    borderColor: 'hover:border-rose-300',
    hoverShadow: 'hover:shadow-[0_15px_30px_-5px_rgba(244,63,94,0.15)]',
  },
  {
    href: '/servicios',
    titulo: 'Servicios Generales',
    icon: Sparkles,
    colorBg: 'bg-indigo-50 text-indigo-600',
    borderColor: 'hover:border-indigo-300',
    hoverShadow: 'hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.15)]',
  },
  {
    href: '/mis-turnos',
    titulo: 'Mis Turnos',
    icon: Calendar,
    colorBg: 'bg-emerald-50 text-emerald-600',
    borderColor: 'hover:border-emerald-300',
    hoverShadow: 'hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.15)]',
  },
  {
    href: '/faq',
    titulo: 'Información y FAQ',
    icon: HelpCircle,
    colorBg: 'bg-amber-50 text-amber-600',
    borderColor: 'hover:border-amber-300',
    hoverShadow: 'hover:shadow-[0_15px_30px_-5px_rgba(245,158,11,0.15)]',
  },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, router]);

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#024128] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-light tracking-widest uppercase">Entrando al panel de administración...</p>
      </div>
    );
  }

  const whatsappUrl = "https://wa.me/5493413954355?text=Hola!%20Tengo%20una%20consulta.";

  return (
    <main className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Botón para volver al inicio general */}
        <div className="w-full flex justify-start mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl transition-all border border-slate-200 shadow-xs hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        <BannerPrincipal />

        <header className="text-center my-6">
          <p className="text-xs font-black tracking-[0.2em] uppercase mb-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">
              LUMINARES ESTÉTICA
            </span>
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reservá tu turno
          </h1>
        </header>

        {/* Grilla 2x2 Estilo App */}
        <nav className="w-full grid grid-cols-2 gap-4">
          {ACCESOS.map((acceso) => {
            const Icon = acceso.icon;
            return (
              <Link
                key={acceso.href}
                href={acceso.href}
                className={`group relative bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] ${acceso.hoverShadow} ${acceso.borderColor} transition-all duration-200 active:scale-[0.97] active:translate-y-0.5 flex flex-col items-center text-center justify-center aspect-square`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform duration-200 ${acceso.colorBg}`}
                >
                  <Icon className="w-8 h-8 stroke-[2]" />
                </div>

                <span className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors leading-snug">
                  {acceso.titulo}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors py-2 px-4 rounded-xl hover:bg-white/60"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>¿Dudas? Hablanos por WhatsApp</span>
          </a>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4 tracking-wide">
          Sin registro · Confirmación por WhatsApp
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#024128]/20 border-t-[#024128] rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}