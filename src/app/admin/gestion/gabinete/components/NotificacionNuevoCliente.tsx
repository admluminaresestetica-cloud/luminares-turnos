'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BellRing } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NotificacionNuevoCliente() {
  const [nuevoPacienteAlerta, setNuevoPacienteAlerta] = useState<string | null>(null);

  useEffect(() => {
    // Escucha en tiempo real si se inserta una nueva sesión en estado 'en_espera'
    const channel = supabase
      .channel('notificaciones_gabinete')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sesiones_gabinete' },
        (payload) => {
          if (payload.new && payload.new.estado === 'en_espera') {
            setNuevoPacienteAlerta('¡Nuevo paciente derivado a gabinete por recepción!');
            // Ocultar alerta a los 5 segundos
            setTimeout(() => setNuevoPacienteAlerta(null), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!nuevoPacienteAlerta) return null;

  return (
    <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-bounce">
      <div className="flex items-center space-x-2">
        <BellRing className="w-5 h-5 shrink-0" />
        <span className="text-xs font-bold">{nuevoPacienteAlerta}</span>
      </div>
      <button
        onClick={() => setNuevoPacienteAlerta(null)}
        className="text-xs bg-indigo-700 hover:bg-indigo-800 px-2 py-1 rounded font-bold"
      >
        Cerrar
      </button>
    </div>
  );
}