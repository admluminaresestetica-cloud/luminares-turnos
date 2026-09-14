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
    // Escucha en tiempo real si un paciente pasa a estado 'en_espera' en pacientes_ficha
    const channel = supabase
      .channel('notificaciones_gabinete')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pacientes_ficha' },
        (payload) => {
          if (payload.new && payload.new.estado_atencion === 'en_espera') {
            const nombre = payload.new.nombre_paciente || 'Un paciente';
            setNuevoPacienteAlerta(`¡${nombre} acaba de ingresar a la lista de espera!`);
            
            // Ocultar alerta a los 6 segundos
            setTimeout(() => setNuevoPacienteAlerta(null), 6000);
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
    <div className="flex items-center justify-between rounded-xl bg-teal-600 px-4 py-3 text-white shadow-lg animate-bounce dark:bg-teal-700">
      <div className="flex items-center space-x-2">
        <BellRing className="h-5 w-5 shrink-0" />
        <span className="text-xs font-bold">{nuevoPacienteAlerta}</span>
      </div>
      <button
        type="button"
        onClick={() => setNuevoPacienteAlerta(null)}
        className="cursor-pointer rounded bg-teal-700 px-2 py-1 text-xs font-bold transition-colors hover:bg-teal-800 dark:bg-teal-800 dark:hover:bg-teal-900"
      >
        Cerrar
      </button>
    </div>
  );
}