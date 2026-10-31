'use client';

import { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  PackageSearch,
  Heart,
  LogOut,
  Loader2,
  MessageCircle,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Widgets modulares y modal de canje
import PuntosCardWidget from '@/components/puntos/PuntosCardWidget';
import ProximoTurnoWidget from '@/components/puntos/ProximoTurnoWidget';
import ReferidosCardWidget from '@/components/puntos/ReferidosCardWidget';
import HistorialPuntosList from '@/components/puntos/HistorialPuntosList';
import ModalCanjePremios from '@/components/puntos/ModalCanjePremios';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Atajo {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: 'primary' | 'emerald';
  external?: boolean;
}

const ATAJOS: Atajo[] = [
  { href: '/mis-turnos', label: 'Mis turnos y reservas', hint: 'Próximos y anteriores', icon: Calendar, tone: 'primary' },
  { href: '/seguimiento', label: 'Mis compras y pedidos', hint: 'Seguí el estado de tus pedidos', icon: PackageSearch, tone: 'primary' },
  { href: '/favoritos', label: 'Mis productos favoritos', hint: 'Lo que guardaste', icon: Heart, tone: 'primary' },
  { href: 'https://wa.me/', label: 'Soporte por WhatsApp', hint: 'Escribinos, te respondemos', icon: MessageCircle, tone: 'emerald', external: true },
];

const TONOS = {
  primary:
    'bg-primary/10 text-primary ring-primary/15 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary',
  emerald:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/15 group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-500',
} as const;

export default function UserAccountModal({ isOpen, onClose }: UserAccountModalProps) {
  const { user, loginWithGoogle, signOut } = useAuth();
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [puntosTotales, setPuntosTotales] = useState<number>(0);
  const [cargandoPuntos, setCargandoPuntos] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);

  const [canjesPendientes, setCanjesPendientes] = useState<any[]>([]);
  const [cargandoCanjes, setCargandoCanjes] = useState(false);

  // Estado para el próximo turno
  const [proximoTurno, setProximoTurno] = useState<any>(null);
  const [cargandoTurno, setCargandoTurno] = useState(false);

  // Estados para Referidos
  const [clienteData, setClienteData] = useState<any>(null);
  const [cargandoReferido, setCargandoReferido] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Estado para abrir/cerrar el modal de canje de premios
  const [isModalCanjeOpen, setIsModalCanjeOpen] = useState(false);

  function generarCodigoReferido(nombre: string): string {
    const limpio = (nombre || 'CLIENTE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 4);

    const aleatorio = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${limpio || 'USER'}-${aleatorio}`;
  }

  async function asegurarPerfilCliente(currentUser: any) {
    if (!currentUser?.id) return null;
    setCargandoReferido(true);

    try {
      let { data: cliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (cliente) {
        setClienteData(cliente);
        setCargandoReferido(false);
        return cliente;
      }

      const nombreGoogle = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Cliente';
      const codigoNuevo = generarCodigoReferido(nombreGoogle);

      const { data: nuevoCliente } = await supabase
        .from('clientes')
        .insert([
          {
            user_id: currentUser.id,
            nombre: nombreGoogle,
            celular: '',
            codigo_referido: codigoNuevo,
            descuentos_disponibles: 0,
            codigo_activo: false,
          },
        ])
        .select()
        .single();

      if (nuevoCliente) {
        setClienteData(nuevoCliente);
      }
    } catch (err) {
      console.error('Error al asegurar perfil de cliente:', err);
    } finally {
      setCargandoReferido(false);
    }
  }

  async function cargarHistorial(userId: string) {
    const { data } = await supabase
      .from('puntos_historial')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setHistorial(data);
    }
  }

async function cargarProximoTurno(userId: string) {
    setCargandoTurno(true);
    try {
      const ahoraIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('user_id', userId)
        .gte('fecha_hora_inicio', ahoraIso)
        // 🟢 Agregamos 'pendiente_sena' a los estados permitidos
        .in('estado', ['pendiente', 'confirmada', 'pendiente_sena'])
        .order('fecha_hora_inicio', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error al cargar próximo turno:', error);
      }

      setProximoTurno(data || null);
    } catch (err) {
      console.error('Error al cargar próximo turno:', err);
    } finally {
      setCargandoTurno(false);
    }
  }

  async function refetchDatosPuntos() {
    if (!user?.id) return;
    const { data } = await supabase
      .from('puntos_usuarios')
      .select('puntos_totales')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPuntosTotales(data.puntos_totales || 0);
    }
    await cargarHistorial(user.id);
  }

  useEffect(() => {
    async function fetchData() {
      if (!user?.id || !isOpen) return;

      setCargandoPuntos(true);

      const { data } = await supabase
        .from('puntos_usuarios')
        .select('puntos_totales')
        .eq('user_id', user.id)
        .maybeSingle();

      setPuntosTotales(data?.puntos_totales || 0);

      await Promise.all([
        cargarHistorial(user.id),
        asegurarPerfilCliente(user),
        cargarProximoTurno(user.id),
        cargarCanjesPendientes(user.id)
      ]);

      setCargandoPuntos(false);
    }

    fetchData();
  }, [user?.id, isOpen]);

  async function cargarCanjesPendientes(userId: string) {
  setCargandoCanjes(true);
  try {
    const { data, error } = await supabase
      .from('canjes_usuarios')
      .select('id, codigo_canje, created_at, estado, premios_catalogo(titulo, descripcion)')
      .eq('user_id', userId)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCanjesPendientes(data);
    }
  } catch (err) {
    console.error('Error al cargar canjes pendientes:', err);
  } finally {
    setCargandoCanjes(false);
  }
}

  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isModalCanjeOpen) onClose();
    };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, isModalCanjeOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setCargandoGoogle(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setCargandoGoogle(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const copiarCodigo = () => {
    if (!clienteData?.codigo_referido) return;
    navigator.clipboard.writeText(clienteData.codigo_referido);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const claseAtajo =
    'group flex items-center gap-3 p-3 rounded-2xl border border-stone-200/60 dark:border-zinc-800 ' +
    'bg-white/70 dark:bg-zinc-900/60 shadow-sm shadow-stone-900/[0.03] ' +
    'transition-all duration-200 ease-out ' +
    'hover:bg-white dark:hover:bg-zinc-900 hover:border-stone-300/70 dark:hover:border-zinc-700 ' +
    'hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-px ' +
    'active:scale-[0.98] active:translate-y-0 cursor-pointer ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';  
  
  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/50 dark:bg-black/70 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mi cuenta"
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col w-full h-[92vh] sm:h-auto sm:max-h-[85vh] sm:max-w-md overflow-hidden
                     rounded-t-[32px] sm:rounded-[32px]
                     bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-2xl
                     border-t sm:border border-stone-200/60 dark:border-zinc-800
                     shadow-2xl shadow-stone-900/20 dark:shadow-black/60
                     animate-in slide-in-from-bottom duration-300"
        >
          {/* Resplandor superior sutil */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/10 via-primary/[0.03] to-transparent"
          />

          {/* Handle bar (solo móvil) */}
          <div className="relative flex justify-center pt-3 pb-1 sm:hidden shrink-0" aria-hidden>
            <span className="h-1.5 w-11 rounded-full bg-stone-300/80 dark:bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-between gap-3 px-6 pt-3 sm:pt-6 pb-4 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Foto de perfil"
                    className="w-14 h-14 rounded-[20px] object-cover ring-2 ring-white dark:ring-zinc-900 shadow-lg shadow-primary/20"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-lg shadow-primary/10">
                    <User className="w-6 h-6" />
                  </div>
                )}
                {user && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-50 dark:border-zinc-950"
                    aria-label="Sesión activa"
                  />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-extrabold tracking-tight text-stone-900 dark:text-zinc-50 leading-tight truncate">
                  {user ? user.user_metadata?.full_name || 'Mi perfil' : '¡Hola! Bienvenid@'}
                </h3>
                <p className="text-xs font-medium text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                  {user ? user.email : 'Iniciá sesión para ver tu actividad'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="shrink-0 p-2.5 rounded-full bg-stone-200/50 dark:bg-zinc-800/70 text-stone-500 dark:text-zinc-400
                         hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100
                         active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo con scroll */}
          <div className="relative flex-1 overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-6">
            {!user ? (
              <div className="relative overflow-hidden rounded-3xl border border-stone-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 text-center shadow-xl shadow-stone-900/5">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-primary/10 blur-3xl"
                />
                <div className="relative space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-stone-900 dark:text-zinc-50">Entrá a tu cuenta</p>
                    <p className="text-xs leading-relaxed text-stone-500 dark:text-zinc-400 font-medium">
                      Con tu cuenta de Google accedés a tus turnos y compras, y empezás a acumular puntos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={cargandoGoogle}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-sm font-bold
                               bg-stone-900 text-white hover:bg-stone-800
                               dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white
                               shadow-lg shadow-stone-900/15 dark:shadow-black/30
                               active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {cargandoGoogle ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Conectando con Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                        </svg>
                        <span>Continuar con Google</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <PuntosCardWidget
                  puntosTotales={puntosTotales}
                  cargandoPuntos={cargandoPuntos}
                  onAbrirCanje={() => setIsModalCanjeOpen(true)}
                />

                <ProximoTurnoWidget
                  proximoTurno={proximoTurno}
                  cargandoTurno={cargandoTurno}
                  onCloseModal={onClose}
                />

                <ReferidosCardWidget
                  clienteData={clienteData}
                  cargandoReferido={cargandoReferido}
                  copiado={copiado}
                  onCopiarCodigo={copiarCodigo}
                />

{/* Sección de Canjes Activos / Sin Usar */}
{canjesPendientes.length > 0 && (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between px-1">
      <h4 className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
        Premios listos para retirar
      </h4>
      <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
        {canjesPendientes.length} pendiente{canjesPendientes.length > 1 ? 's' : ''}
      </span>
    </div>

    <div className="space-y-2">
      {canjesPendientes.map((canje) => (
        <div
          key={canje.id}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/[0.05] to-transparent border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="min-w-0 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
              Código de canje
            </span>
            <h5 className="text-xs font-extrabold text-stone-900 dark:text-zinc-100 truncate">
              {canje.premios_catalogo?.titulo || 'Premio Canjeado'}
            </h5>
          </div>

          <div className="shrink-0 text-right bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-2xs">
            <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 tracking-wider">
              {canje.codigo_canje}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

                <HistorialPuntosList historial={historial} />
              </div>
            )}

            {/* Accesos directos */}
            <section className="space-y-2.5">
              <h4 className="px-1 text-xs font-bold text-stone-500 dark:text-zinc-400">
                Gestión y actividad
              </h4>

              <div className="space-y-2">
                {ATAJOS.map(({ href, label, hint, icon: Icon, tone, external }) => {
                  const contenido = (
                    <>
                      <span
                        className={`shrink-0 w-10 h-10 rounded-xl ring-1 flex items-center justify-center transition-all duration-200 ${TONOS[tone]}`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-bold text-stone-900 dark:text-zinc-100 leading-tight truncate">
                          {label}
                        </span>
                        <span className="block text-[11px] font-medium text-stone-500 dark:text-zinc-500 mt-0.5 truncate">
                          {hint}
                        </span>
                      </span>
                      <ChevronRight className="shrink-0 w-4 h-4 text-stone-400 dark:text-zinc-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-stone-600 dark:group-hover:text-zinc-300" />
                    </>
                  );

                  return external ? (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className={claseAtajo}
                    >
                      {contenido}
                    </a>
                  ) : (
                    <Link key={href} href={href} onClick={onClose} className={claseAtajo}>
                      {contenido}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Cerrar sesión */}
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold
                           text-destructive bg-destructive/[0.06] hover:bg-destructive/10
                           border border-destructive/15 hover:border-destructive/25
                           active:scale-[0.98] transition-all cursor-pointer
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal secundario de canje de premios */}
      {user && (
        <ModalCanjePremios
          isOpen={isModalCanjeOpen}
          onClose={() => setIsModalCanjeOpen(false)}
          userId={user.id}
          puntosActuales={puntosTotales}
          onCanjeExitoso={refetchDatosPuntos}
        />
      )}
    </>
  );
}