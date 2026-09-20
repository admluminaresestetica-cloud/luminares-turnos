'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export interface PerfilUsuario {
  id: string;
  user_id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado';
  activo: boolean;
}

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function obtenerPerfil() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setPerfil(null);
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setPerfil(data as PerfilUsuario);
      }
      setCargando(false);
    }

    obtenerPerfil();
  }, []);

  return { perfil, cargando, esAdmin: perfil?.rol === 'admin' };
}