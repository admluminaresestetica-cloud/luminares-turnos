'use client';

import { Smartphone } from 'lucide-react';
import { dispararInstalacionAdmin } from './components/InstallPromptAdmin';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  UserCheck, 
  TvMinimal, 
  CalendarDays, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  LogOut,
  Lock,
  ChevronRight
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import AdminChatWidget from './components/AdminChatWidget';
import ModalPinAutorizacion from './components/ModalPinAutorizacion';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminHubPage() {
  const router = useRouter();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [pinAdmin, setPinAdmin] = useState('1234');
  const [modalPinOpen, setModalPinOpen] = useState(false);
  const [rutaDestino, setRutaDestino] = useState<string | null>(null);

  // Cargar PIN desde Supabase
  useEffect(() => {
    const fetchPin = async () => {
      const { data } = await supabase
        .from('configuracion_empresa')
        .select('pin_admin')
        .limit(1)
        .maybeSingle();

      if (data?.pin_admin) {
        setPinAdmin(data.pin_admin);
      }
    };
    fetchPin();
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setCerrandoSesion(true);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/admin/login';
      }
    }
  };

  const handleNavegacion = (e: React.MouseEvent, ruta: string, requierePin: boolean) => {
    if (requierePin) {
      e.preventDefault();
      setRutaDestino(ruta);
      setModalPinOpen(true);
    }
  };

  const modulos = [
    {
      titulo: 'Recepción',
      subtitulo: 'Ingreso & Clientes',
      icono: UserCheck,
      ruta: '/admin/gestion/recepcion',
      requierePin: false,
      cardBg: 'bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900 hover:border-indigo-200 dark:hover:border-indigo-800/60 shadow-xs hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-500 text-white shadow-indigo-500/25',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      titulo: 'Gabinete',
      subtitulo: 'Atención & Sesiones',
      icono: TvMinimal,
      ruta: '/admin/gestion/gabinete',
      requierePin: false,
      cardBg: 'bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 hover:border-emerald-200 dark:hover:border-emerald-800/60 shadow-xs hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/25',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      titulo: 'Reservas',
      subtitulo: 'Agenda & Horarios',
      icono: CalendarDays,
      ruta: '/admin/turnos',
      requierePin: false,
      cardBg: 'bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 hover:border-amber-200 dark:hover:border-amber-800/60 shadow-xs hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/25',
      accentColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      titulo: 'Tienda',
      subtitulo: 'Productos & Stock',
      icono: ShoppingBag,
      ruta: '/admin/tienda',
      requierePin: false,
      cardBg: 'bg-gradient-to-b from-teal-50/40 via-white to-white dark:from-teal-950/20 dark:via-zinc-900 dark:to-zinc-900 hover:border-teal-200 dark:hover:border-teal-800/60 shadow-xs hover:shadow-teal-500/10',
      iconBg: 'bg-teal-500 text-white shadow-teal-500/25',
      accentColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      titulo: 'Métricas',
      subtitulo: 'Reportes & Caja',
      icono: BarChart3,
      ruta: '/admin/metricas',
      requierePin: true,
      cardBg: 'bg-gradient-to-b from-violet-50/40 via-white to-white dark:from-violet-950/20 dark:via-zinc-900 dark:to-zinc-900 hover:border-violet-200 dark:hover:border-violet-800/60 shadow-xs hover:shadow-violet-500/10',
      iconBg: 'bg-violet-500 text-white shadow-violet-500/25',
      accentColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      titulo: 'Ajustes',
      subtitulo: 'Configuración',
      icono: Settings,
      ruta: '/admin/ajustes',
      requierePin: true,
      cardBg: 'bg-gradient-to-b from-slate-100/60 via-white to-white dark:from-zinc-800/40 dark:via-zinc-900 dark:to-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-slate-500/10',
      iconBg: 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900 shadow-slate-900/20',
      accentColor: 'text-slate-700 dark:text-zinc-300',
    },
  ];

 return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans transition-colors pb-12 flex flex-col">

      {/* 🟦 HERO SECTION CON DEGRADADO AZUL FINTECH */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 dark:from-blue-950 dark:via-blue-900 dark:to-zinc-900 pt-6 pb-20 px-4 sm:px-6 lg:px-8 text-white shadow-lg">
        <header className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Luminares
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block animate-pulse shadow-xs" />
              </h1>
              <p className="text-xs text-blue-100/80 font-medium tracking-wide mt-0.5">
                Centro de Gestión
              </p>
            </div>
          </div>

          {/* CONTENEDOR PARA LOS DOS BOTONES (Instalar y Salir) */}
          <div className="flex items-center gap-2">
            <button
              onClick={dispararInstalacionAdmin}
              type="button"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Instalar App Admin"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={cerrandoSesion}
              type="button"
              className="flex items-center gap-1.5 text-xs font-bold text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-md border border-rose-300/30 px-3.5 py-2 rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{cerrandoSesion ? 'Saliendo...' : 'Salir'}</span>
            </button>
          </div>
        </header>
      </div>

      {/* ⬜ GRILLA DE MÓDULOS (TARJETAS FLOTANTES) */}
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 flex-1 pb-6">
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {modulos.map((modulo, index) => {
            const IconoComponente = modulo.icono;
            const esUltimoImpar = index === modulos.length - 1 && modulos.length % 2 !== 0;

            return (
              <Link
                key={modulo.ruta}
                href={modulo.ruta}
                onClick={(e) => handleNavegacion(e, modulo.ruta, modulo.requierePin)}
                className={`group relative flex flex-col justify-between p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 hover:-translate-y-1 ${
                  esUltimoImpar ? 'col-span-2 sm:col-span-1 sm:col-start-1' : ''
                }`}
              >
                {/* Cabecera de la tarjeta: Icono + Badge PIN */}
                <div className="flex items-start justify-between w-full mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md ${modulo.iconBg}`}
                  >
                    <IconoComponente className="w-6 h-6" strokeWidth={2.2} />
                  </div>

                  {modulo.requierePin ? (
                    <span className="flex items-center gap-1 rounded-full border border-amber-200/80 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 shadow-2xs">
                      <Lock className="w-2.5 h-2.5" /> PIN
                    </span>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-2xs">
                      <ChevronRight className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    </div>
                  )}
                </div>

                {/* Pie de la tarjeta: Título + Subtítulo */}
                <div className="flex flex-col">
                  <span className={`text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight group-hover:translate-x-0.5 transition-transform ${modulo.accentColor}`}>
                    {modulo.titulo}
                  </span>
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 leading-tight mt-1">
                    {modulo.subtitulo}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* WIDGET FLOTANTE DE IA */}
      <AdminChatWidget />

      {/* MODAL DE VALIDACIÓN DE PIN */}
      <ModalPinAutorizacion
        isOpen={modalPinOpen}
        pinCorrecto={pinAdmin}
        titulo="Acceso Restringido"
        subtitulo="Ingresá el PIN de Administrador para ingresar a este módulo"
        onCerrar={() => {
          setModalPinOpen(false);
          setRutaDestino(null);
        }}
        onExito={() => {
          setModalPinOpen(false);
          if (rutaDestino) router.push(rutaDestino);
        }}
      />

    </div>
  );
}