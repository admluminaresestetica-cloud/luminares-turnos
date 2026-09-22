"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { Zap, Calendar, HelpCircle, MessageCircle, ArrowLeft, UserStar, ShieldCheck } from 'lucide-react';
import BannerPrincipal from '@/components/BannerPrincipal';
import { useConfig } from '@/context/ConfigContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ACCESOS = [
  {
    href: '/laser',
    titulo: 'Depilación Láser',
    subtitulo: 'Zonas y combos',
    icon: Zap,
    iconBg: 'bg-rose-500 text-white shadow-rose-500/20',
    cardBorder: 'hover:border-rose-300',
  },
  {
    href: '/servicios',
    titulo: 'Servicios Generales',
    subtitulo: 'Facial, pestañas y más',
    icon: UserStar,
    iconBg: 'bg-indigo-500 text-white shadow-indigo-500/20',
    cardBorder: 'hover:border-indigo-300',
  },
  {
    href: '/mis-turnos',
    titulo: 'Mis Turnos',
    subtitulo: 'Consultar agenda',
    icon: Calendar,
    iconBg: 'bg-emerald-500 text-white shadow-emerald-500/20',
    cardBorder: 'hover:border-emerald-300',
  },
  {
    href: '/faq',
    titulo: 'Info y FAQ',
    subtitulo: 'Dudas frecuentes',
    icon: HelpCircle,
    iconBg: 'bg-amber-500 text-white shadow-amber-500/20',
    cardBorder: 'hover:border-amber-300',
  },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";
  const { config } = useConfig();

  const nombreEmpresa = config?.nombre_empresa || 'LUMINARES ESTÉTICA';
  const rawNumber = config?.whatsapp_numero || '5493413954355';
  const numeroLimpio = rawNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${numeroLimpio}?text=Hola!%20Tengo%20una%20consulta.`;

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, router]);

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold tracking-widest uppercase text-slate-300">Entrando al panel admin...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Volver con Button de Shadcn */}
        <div className="w-full flex justify-start mb-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl font-bold text-xs text-slate-600 bg-white shadow-xs border-slate-200/80 active:scale-95"
          >
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al inicio</span>
            </Link>
          </Button>
        </div>

        {/* Banner */}
        <div className="w-full mb-3">
          <BannerPrincipal />
        </div>

        {/* Header con Badge de Shadcn */}
        <header className="text-center mb-5">
          <Badge
            variant="outline"
            className="bg-white border-slate-200/80 shadow-xs mb-2 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.18em] uppercase text-slate-700"
          >
            {nombreEmpresa}
          </Badge>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ¿Qué querés agendar hoy?
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Seleccioná una categoría para continuar
          </p>
        </header>

        {/* Grilla 2x2 basada en Cards de Shadcn */}
        <nav className="w-full grid grid-cols-2 gap-3">
          {ACCESOS.map((acceso) => {
            const Icon = acceso.icon;
            return (
              <Link key={acceso.href} href={acceso.href} className="group">
                <Card className={`relative p-4 h-36 rounded-[22px] border-slate-200/80 shadow-xs hover:shadow-md ${acceso.cardBorder} transition-all duration-200 active:scale-[0.96] flex flex-col items-center justify-center text-center select-none overflow-hidden bg-white`}>
                  {/* Ícono con elevación */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md mb-2.5 group-hover:scale-110 transition-transform duration-200 ${acceso.iconBg}`}>
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  {/* Textos con jerarquía definida */}
                  <span className="text-sm font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors leading-tight">
                    {acceso.titulo}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 mt-1 truncate max-w-[90%]">
                    {acceso.subtitulo}
                  </span>
                </Card>
              </Link>
            );
          })}
        </nav>

        {/* WhatsApp con Button de Shadcn */}
        <div className="mt-4 w-full">
          <Button
            asChild
            variant="outline"
            className="w-full h-11 bg-white border-slate-200/80 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-emerald-700 rounded-xl shadow-xs active:scale-[0.98]"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>¿Dudas? Escribinos por WhatsApp</span>
            </a>
          </Button>
        </div>

        {/* Badge inferior */}
        <div className="inline-flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sin registro obligatorio · Confirmación inmediata</span>
        </div>
      </div>
    </main>
  );
}

export default function HomePrueba() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}