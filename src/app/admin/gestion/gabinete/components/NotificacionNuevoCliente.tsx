'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BellRing, X } from 'lucide-react';

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
            const nombre = payload.new.nombre_completo || payload.new.nombre_paciente || 'Un paciente';
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
    <div className="flex items-center justify-between rounded-2xl border border-teal-200/80 bg-teal-600 px-4 py-3 text-white shadow-lg shadow-teal-600/20 animate-bounce dark:border-teal-800 dark:bg-teal-700">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
          <BellRing className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold sm:text-sm">{nuevoPacienteAlerta}</span>
      </div>
      <button
        type="button"
        onClick={() => setNuevoPacienteAlerta(null)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
        title="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
