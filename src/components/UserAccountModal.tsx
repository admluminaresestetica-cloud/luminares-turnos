'use client';

import { useState, useEffect } from 'react';
import { X, User, Calendar, PackageSearch, Heart, Star, LogOut, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAccountModal({ isOpen, onClose }: UserAccountModalProps) {
  const { user, loginWithGoogle, signOut } = useAuth();
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [puntosTotales, setPuntosTotales] = useState<number>(0);
  const [cargandoPuntos, setCargandoPuntos] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);

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

  useEffect(() => {
    async function fetchData() {
      if (!user?.id || !isOpen) return;

      setCargandoPuntos(true);
      
      // Consultar puntos
      const { data, error } = await supabase
        .from('puntos_usuarios')
        .select('puntos_totales')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setPuntosTotales(data.puntos_totales || 0);
      } else {
        setPuntosTotales(0);
      }

      await cargarHistorial(user.id);
      setCargandoPuntos(false);
    }

    fetchData();
  }, [user?.id, isOpen]);

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

return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="absolute top-16 right-4 sm:right-8 w-full max-w-sm bg-background border border-border rounded-3xl p-5 space-y-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[82vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Foto de perfil" 
                className="w-11 h-11 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-xs">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-extrabold text-foreground leading-tight">
                {user ? (user.user_metadata?.full_name || 'Mi Perfil') : '¡Hola! Bienvenid@'}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {user ? user.email : 'Iniciá sesión para ver tu actividad'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Si no está logueado: Botón para ingresar con Google */}
        {!user ? (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3 text-center shadow-xs">
            <p className="text-xs text-muted-foreground font-medium">
              Iniciá sesión con tu cuenta de Google para acceder a tus turnos, compras y acumular puntos.
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={cargandoGoogle}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {cargandoGoogle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Conectando con Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                  </svg>
                  <span>Iniciar sesión con Google</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Si está logueado: Programa de Fidelidad / Puntos Dinámicos */
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                  <Star className="w-3 h-3" /> Puntos Luminares
                </span>
                <p className="text-base font-black text-foreground leading-none">
                  {cargandoPuntos ? (
                    <span className="text-xs font-normal text-muted-foreground animate-pulse">Cargando...</span>
                  ) : (
                    `${puntosTotales} pts`
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">Acumulá puntos en cada visita o compra</p>
              </div>
              <div className="px-2.5 py-1 bg-primary/20 rounded-xl text-[10px] font-bold text-primary">
                Nivel Inicial
              </div>
            </div>

            {/* ETAPA 1: Historial de Movimientos de Puntos */}
            <div className="bg-card border border-border rounded-2xl p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Historial de Puntos
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">Últimos movimientos</span>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {historial && historial.length > 0 ? (
                  historial.map((item) => {
                    const esPositivo = item.puntos > 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-muted/50 text-xs">
                        <div className="space-y-0.5 pr-2">
                          <p className="font-semibold text-foreground line-clamp-1">{item.descripcion || 'Movimiento de puntos'}</p>
                          <p className="text-[9px] text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`font-black shrink-0 ${esPositivo ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {esPositivo ? `+${item.puntos}` : item.puntos} pts
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-center text-muted-foreground py-2">
                    Aún no tenés movimientos registrados.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accesos Directos Unificados */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            Gestión y Actividad
          </span>

          <Link
            href="/mis-turnos"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span>Mis Turnos y Reservas</span>
            </div>
          </Link>

          <Link
            href="/seguimiento"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <PackageSearch className="w-3.5 h-3.5" />
              </div>
              <span>Mis Compras y Pedidos</span>
            </div>
          </Link>

          <Link
            href="/favoritos"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <span>Mis Productos Favoritos</span>
            </div>
          </Link>

          {/* Botón de Soporte / WhatsApp Rápido */}
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span>Soporte por WhatsApp</span>
            </div>
          </a>
        </div>

        {/* Cerrar sesión si está logueado */}
        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        )}
      </div>
    </div>
  );
}