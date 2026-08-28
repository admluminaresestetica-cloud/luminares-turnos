"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { Zap, Sparkles, Calendar, HelpCircle, ChevronRight, MessageCircle } from 'lucide-react';
import BannerPrincipal from '@/components/BannerPrincipal';

const ACCESOS = [
  {
    href: '/laser',
    titulo: 'Depilación Láser',
    descripcion: 'Elegí género, promos o zonas individuales. Descuentos automáticos y agenda inteligente.',
    icon: Zap,
    colorBg: 'bg-rose-50 group-hover:bg-rose-500',
    colorText: 'text-rose-600 group-hover:text-white',
    borderColor: 'hover:border-rose-300',
  },
  {
    href: '/servicios',
    titulo: 'Servicios Generales',
    descripcion: 'Faciales, uñas, masajes y ojos. Elegí categoría y subtipo.',
    icon: Sparkles,
    colorBg: 'bg-indigo-50 group-hover:bg-indigo-500',
    colorText: 'text-indigo-600 group-hover:text-white',
    borderColor: 'hover:border-indigo-300',
  },
  {
    href: '/mis-turnos',
    titulo: 'Mis Turnos',
    descripcion: 'Consultá, cancelá o reprogramá con tu celular y código de reserva.',
    icon: Calendar,
    colorBg: 'bg-emerald-50 group-hover:bg-emerald-500',
    colorText: 'text-emerald-600 group-hover:text-white',
    borderColor: 'hover:border-emerald-300',
  },
  {
    href: '/faq',
    titulo: 'Preguntas Frecuentes y Información Útil',
    descripcion: 'Resolvé todas tus dudas sobre señas, métodos de pago y recomendaciones.',
    icon: HelpCircle,
    colorBg: 'bg-amber-50 group-hover:bg-amber-500',
    colorText: 'text-amber-600 group-hover:text-white',
    borderColor: 'hover:border-amber-300',
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
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
      <BannerPrincipal />

      <div className="max-w-lg w-full mt-6">
        <header className="text-center mb-8">
          <p className="text-xs font-black tracking-[0.2em] uppercase mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">
              LUMINARES ESTÉTICA
            </span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Reservá tu turno
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Elegí el servicio que necesitás y confirmá en minutos.
          </p>
        </header>

        <nav className="flex flex-col gap-4">
          {ACCESOS.map((acceso) => {
            const Icon = acceso.icon;
            return (
              <Link
                key={acceso.href}
                href={acceso.href}
                className={`group flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 -translate-y-0 hover:-translate-y-0.5 ${acceso.borderColor}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${acceso.colorBg}`}
                >
                  <Icon className={`w-5 h-5 stroke-[1.75] transition-colors duration-200 ${acceso.colorText}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-900 transition-colors">
                    {acceso.titulo}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    {acceso.descripcion}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-xs hover:shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>¿Dudas? Hablanos por WhatsApp</span>
          </a>
        </div>

        <p className="text-center text-xs text-slate-400 my-6">
          Sin registro · Confirmación por WhatsApp
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#024128]/20 border-t-[#024128] rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}