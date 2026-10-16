'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Asegúrate de que esta ruta apunte a tu cliente de Supabase
import { Bell, X, AlertCircle } from 'lucide-react';

interface PopUpNotificacion {
  id: string;
  mensaje: string;
  tipo: 'normal' | 'urgente';
  timestamp: string;
}

export default function NotificacionesGabinete({ gabineteId }: { gabineteId: string }) {
  const [notificacion, setNotificacion] = useState<PopUpNotificacion | null>(null);

  useEffect(() => {
    // Nos suscribimos al canal específico de este gabinete
    const channel = supabase
      .channel(`gabinete-${gabineteId}`)
      .on('broadcast', { event: 'nuevo-aviso' }, (payload) => {
        const data = payload.payload as PopUpNotificacion;
        setNotificacion(data);

        // Opcional: Intentar reproducir un sonido sutil de notificación si el navegador lo permite
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(() => {});
        } catch (e) {
          // Ignorar si el navegador bloquea el autoplay sin interacción previa
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gabineteId]);

  if (!notificacion) return null;

  const isUrgente = notificacion.tipo === 'urgente';

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-bounce-in px-4 sm:px-0">
      <div
        className={`p-4 rounded-3xl shadow-2xl border backdrop-blur-md flex items-start gap-3.5 transition-all ${
          isUrgente
            ? 'bg-rose-500/95 text-white border-rose-600 dark:bg-rose-950/95 dark:border-rose-800 shadow-rose-500/20'
            : 'bg-slate-900/95 text-white border-slate-800 dark:bg-zinc-900/95 dark:border-zinc-800 shadow-slate-900/20'
        }`}
      >
        <div className={`p-2.5 rounded-2xl shrink-0 ${isUrgente ? 'bg-white/20' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {isUrgente ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-75">
              Aviso de Recepción
            </p>
            <span className="text-[10px] font-mono opacity-75">{notificacion.timestamp}</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold mt-1 leading-snug">
            {notificacion.mensaje}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNotificacion(null)}
          className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}