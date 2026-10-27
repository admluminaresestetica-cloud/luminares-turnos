'use client';

import { useState } from 'react';
import { X, User, Calendar, PackageSearch, Heart, Sparkles, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAccountModal({ isOpen, onClose }: UserAccountModalProps) {
  // Cambiamos 'logout' por 'signOut' que es el nombre real en el AuthContext
  const { user, loginWithGoogle, signOut } = useAuth();
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setCargandoGoogle(true);
      await loginWithGoogle();
      // No ejecutamos onClose() para dar tiempo a que la página redirija a Google
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setCargandoGoogle(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      // Recarga limpia para refrescar la sesión en toda la app
      window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-end sm:hidden animate-fadeIn">
      <div 
        className="w-full bg-background border-t border-border rounded-t-[32px] p-6 space-y-5 shadow-2xl mb-16 animate-slideUp"
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
          /* Si está logueado: Programa de Fidelidad / Puntos */
          <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Puntos Luminares
              </span>
              <p className="text-lg font-black text-foreground leading-none">
                0 pts
              </p>
              <p className="text-[10px] text-muted-foreground">Acumulá puntos en tus compras y servicios</p>
            </div>
          </div>
        )}

        {/* Accesos Directos Unificados */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            Accesos rápidos
          </span>

          <Link
            href="/mis-turnos"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Mis Turnos y Reservas</span>
            </div>
          </Link>

          <Link
            href="/seguimiento"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <PackageSearch className="w-4 h-4" />
              </div>
              <span>Mis Compras y Pedidos</span>
            </div>
          </Link>

          <Link
            href="/favoritos"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-accent active:scale-[0.99] transition-all text-xs font-bold text-foreground shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Heart className="w-4 h-4" />
              </div>
              <span>Mis Productos Favoritos</span>
            </div>
          </Link>
        </div>

        {/* Cerrar sesión si está logueado */}
        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        )}
      </div>
    </div>
  );
}