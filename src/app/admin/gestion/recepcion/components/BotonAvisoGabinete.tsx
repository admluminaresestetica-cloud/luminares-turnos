'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Send, AlertTriangle, Clock, UserCheck } from 'lucide-react';

interface Props {
  gabineteId: string;
  nombreGabinete: string;
}

export default function BotonAvisoGabinete({ gabineteId, nombreGabinete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mensajeCustom, setMensajeCustom] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Avisos rápidos predefinidos
  const AVISOS_RAPIDOS = [
    { texto: "El paciente ya llegó y está en espera", icono: UserCheck, tipo: "normal" },
    { texto: "Estás con demora estimada de 15-20 min", icono: Clock, tipo: "urgente" },
    { texto: "Por favor acércate a Recepción", icono: AlertTriangle, tipo: "urgente" },
  ];

  const emitirAviso = async (mensaje: string, tipo: 'normal' | 'urgente' = 'normal') => {
    if (!mensaje.trim()) return;
    setEnviando(true);

    try {
      const channel = supabase.channel(`gabinete-${gabineteId}`);
      await channel.subscribe();

      await channel.send({
        type: 'broadcast',
        event: 'nuevo-aviso',
        payload: {
          id: crypto.randomUUID(),
          mensaje,
          tipo,
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        },
      });

      supabase.removeChannel(channel);
      setMensajeCustom('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error enviando aviso:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer shadow-xs"
        title={`Enviar aviso a ${nombreGabinete}`}
      >
        <Bell className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
        <span>Avisar</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/85 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Enviar aviso a {nombreGabinete}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mensajes Rápidos */}
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Avisos rápidos con 1 clic
              </p>
              {AVISOS_RAPIDOS.map((a, i) => {
                const Icon = a.icono;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => emitirAviso(a.texto, a.tipo as any)}
                    disabled={enviando}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 text-left text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all active:scale-98 cursor-pointer"
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${a.tipo === 'urgente' ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <span className="flex-1">{a.texto}</span>
                  </button>
                );
              })}
            </div>

            {/* Mensaje Personalizado */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                O escribe un mensaje personalizado
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mensajeCustom}
                  onChange={(e) => setMensajeCustom(e.target.value)}
                  placeholder="Ej: Trae la toalla extra..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => emitirAviso(mensajeCustom, 'normal')}
                  disabled={enviando || !mensajeCustom.trim()}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}