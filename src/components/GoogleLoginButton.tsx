'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import UserAccountModal from '@/components/UserAccountModal';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 1. Obtener la sesión actual al cargar
    async function getActiveSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }
    getActiveSession();

    // 2. Escuchar cambios de autenticación (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return <div className="h-8 w-20 animate-pulse bg-white/10 rounded-full" />;
  }

  // Si el usuario YA está logueado
  if (user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-xs">
        <UserIcon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span className="text-xs font-semibold text-white max-w-[120px] truncate">
          {user.user_metadata?.full_name || user.email}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="text-stone-300 hover:text-white transition-colors cursor-pointer p-0.5"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // Si el usuario es invitado (Guest) -> Abre el modal con las opciones de Google y Facebook
  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/10 shadow-xs cursor-pointer"
      >
        <LogIn className="h-3.5 w-3.5 text-white" />
        <span>Ingresar</span>
      </button>

      <UserAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}