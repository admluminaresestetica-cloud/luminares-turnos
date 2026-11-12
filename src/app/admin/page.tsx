'use client';

import { Smartphone } from 'lucide-react';
import { dispararInstalacionAdmin } from './components/InstallPromptAdmin';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
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
import ThemeToggle from '@/components/common/ThemeToggle';
import AdminChatWidget from './components/AdminChatWidget';
import ModalPinAutorizacion from './components/ModalPinAutorizacion';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✨ Variantes de animación (solo UI)
const contenedorVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const tarjetaVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export default function AdminHubPage() {
  const router = useRouter();
  const reducirMovimiento = useReducedMotion();
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

  // 🔔 Conteos para los badges flotantes, indexados por ruta.
  // Queda vacío hasta que conectes una fuente de datos (ver notas de entrega).
  // Ejemplo: { '/admin/turnos': 3, '/admin/gestion/recepcion': 1 }
  const conteos: Record<string, number> = {};

  const modulos = [
    {
      titulo: 'Recepción',
      subtitulo: 'Ingreso & Clientes',
      icono: UserCheck,
      ruta: '/admin/gestion/recepcion',
      requierePin: false,
      glow: 'bg-indigo-500/20 dark:bg-indigo-400/15',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      titulo: 'Gabinete',
      subtitulo: 'Atención & Sesiones',
      icono: TvMinimal,
      ruta: '/admin/gestion/gabinete',
      requierePin: false,
      glow: 'bg-emerald-500/20 dark:bg-emerald-400/15',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      titulo: 'Reservas',
      subtitulo: 'Agenda & Horarios',
      icono: CalendarDays,
      ruta: '/admin/turnos',
      requierePin: false,
      glow: 'bg-amber-500/20 dark:bg-amber-400/15',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-500/30',
      accentColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      titulo: 'Tienda',
      subtitulo: 'Productos & Stock',
      icono: ShoppingBag,
      ruta: '/admin/tienda',
      requierePin: false,
      glow: 'bg-teal-500/20 dark:bg-teal-400/15',
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-teal-500/30',
      accentColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      titulo: 'Métricas',
      subtitulo: 'Reportes & Caja',
      icono: BarChart3,
      ruta: '/admin/metricas',
      requierePin: true,
      glow: 'bg-violet-500/20 dark:bg-violet-400/15',
      iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-violet-500/30',
      accentColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      titulo: 'Ajustes',
      subtitulo: 'Configuración',
      icono: Settings,
      ruta: '/admin/ajustes',
      requierePin: true,
      glow: 'bg-slate-400/20 dark:bg-zinc-400/10',
      iconBg: 'bg-gradient-to-br from-slate-700 to-slate-900 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-900 shadow-slate-900/25',
      accentColor: 'text-slate-700 dark:text-zinc-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans transition-colors pb-12 flex flex-col">

      {/* 🟦🟪 HERO FINTECH: DEGRADADO AZUL → VIOLETA CON ORBES DE LUZ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 dark:from-blue-950 dark:via-indigo-950 dark:to-zinc-900 pt-6 pb-24 px-4 sm:px-6 lg:px-8 text-white shadow-lg">
        {/* Orbes decorativos (no interactivos) */}
        <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-4 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />

        <motion.header
          variants={headerVariants}
          initial="hidden"
          animate="show"
          className="relative w-full max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Luminares
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
                  </span>
                </h1>
                <p className="text-xs text-blue-100/80 font-medium tracking-wide mt-0.5">
                  Centro de Gestión
                </p>
              </div>
            </div>

            {/* CONTENEDOR PARA LOS DOS BOTONES (Instalar y Salir) */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={reducirMovimiento ? undefined : { y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={dispararInstalacionAdmin}
                type="button"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl shadow-xs transition-colors cursor-pointer"
                title="Instalar App Admin"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar App</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={reducirMovimiento ? undefined : { y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={handleLogout}
                disabled={cerrandoSesion}
                type="button"
                className="flex items-center gap-1.5 text-xs font-bold text-rose-100 hover:text-white bg-rose-500/25 hover:bg-rose-500/40 backdrop-blur-md border border-rose-300/30 px-3.5 py-2 rounded-2xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{cerrandoSesion ? 'Saliendo...' : 'Salir'}</span>
              </motion.button>
            </div>
          </div>

          {/* Indicador de estado */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Panel activo
          </div>
        </motion.header>
      </div>

      {/* ⬜ BENTO GRID DE MÓDULOS (TARJETAS FLOTANTES DE VIDRIO) */}
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 flex-1 pb-6 relative">
        <motion.div
          variants={contenedorVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3.5 sm:gap-4"
        >
          {modulos.map((modulo, index) => {
            const IconoComponente = modulo.icono;
            // Bento: primera y última tarjeta ocupan todo el ancho
            const ancha = index === 0 || index === modulos.length - 1;
            const cantidad = conteos[modulo.ruta] ?? 0;

            const iconoConBadge = (
              <div className="relative shrink-0">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${modulo.iconBg}`}
                >
                  <IconoComponente className="h-6 w-6" strokeWidth={2.2} />
                </div>

                {/* 🔔 Badge flotante de notificaciones */}
                <AnimatePresence>
                  {cantidad > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-900"
                    >
                      {cantidad > 99 ? '99+' : cantidad}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );

            const pinBadge = (
              <span className="flex items-center gap-1 rounded-full border border-amber-200/80 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 shadow-2xs">
                <Lock className="h-2.5 w-2.5" /> PIN
              </span>
            );

            return (
              <motion.div
                key={modulo.ruta}
                variants={tarjetaVariants}
                whileHover={reducirMovimiento ? undefined : { y: -4 }}
                whileTap={{ scale: 0.97 }}
                className={ancha ? 'col-span-2' : ''}
              >
                <Link
                  href={modulo.ruta}
                  onClick={(e) => handleNavegacion(e, modulo.ruta, modulo.requierePin)}
                  className={`group relative flex h-full overflow-hidden rounded-[28px] border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 shadow-xl transition-shadow duration-300 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                    ancha ? 'flex-row items-center gap-4' : 'flex-col justify-between'
                  }`}
                >
                  {/* Resplandor de color del módulo */}
                  <span
                    className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-60 transition-opacity duration-300 group-hover:opacity-100 ${modulo.glow}`}
                  />

                  {ancha ? (
                    <>
                      {iconoConBadge}
                      <div className="relative flex min-w-0 flex-1 flex-col">
                        <span className="text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100">
                          {modulo.titulo}
                        </span>
                        <span className="mt-0.5 text-xs font-medium leading-tight text-slate-400 dark:text-zinc-500">
                          {modulo.subtitulo}
                        </span>
                      </div>
                      <div className="relative flex shrink-0 items-center gap-2">
                        {modulo.requierePin && pinBadge}
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 transition-transform duration-300 group-hover:translate-x-0.5">
                          <ChevronRight className={`h-4 w-4 ${modulo.accentColor}`} />
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Cabecera de la tarjeta: Icono + Badge PIN / Chevron */}
                      <div className="relative mb-5 flex w-full items-start justify-between">
                        {iconoConBadge}
                        {modulo.requierePin ? (
                          pinBadge
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                            <ChevronRight className={`h-4 w-4 ${modulo.accentColor}`} />
                          </span>
                        )}
                      </div>

                      {/* Pie de la tarjeta: Título + Subtítulo */}
                      <div className="relative flex flex-col">
                        <span className="text-base font-black tracking-tight text-slate-900 dark:text-zinc-100 transition-transform duration-300 group-hover:translate-x-0.5">
                          {modulo.titulo}
                        </span>
                        <span className="mt-1 text-xs font-medium leading-tight text-slate-400 dark:text-zinc-500">
                          {modulo.subtitulo}
                        </span>
                      </div>
                    </>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
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