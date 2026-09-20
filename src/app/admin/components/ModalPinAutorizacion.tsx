'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Lock, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';

interface ModalPinProps {
  isOpen: boolean;
  pinCorrecto: string;
  titulo?: string;
  subtitulo?: string;
  onCerrar?: () => void;
  onClose?: () => void;
  onExito?: () => void;
  onSuccess?: () => void;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ModalPinAutorizacion({
  isOpen,
  pinCorrecto,
  titulo = "Acceso Restringido",
  subtitulo,
  onCerrar,
  onClose,
  onExito,
  onSuccess,
}: ModalPinProps) {
  const [pinIngresado, setPinIngresado] = useState('');
  const [passwordIngresada, setPasswordIngresada] = useState('');
  const [modoRescate, setModoRescate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Manejadores unificados con comprobación segura de llamadas
  const handleClose = () => {
    if (onCerrar) onCerrar();
    if (onClose) onClose();
  };

  const handleSuccess = () => {
    if (onExito) onExito();
    if (onSuccess) onSuccess();
  };

  // Al abrir el modal, recuperamos el email de la sesión activa de Supabase
  useEffect(() => {
    if (isOpen) {
      setPinIngresado('');
      setPasswordIngresada('');
      setError(null);
      setModoRescate(false);

      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          setUserEmail(data.user.email);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Validación por PIN
  const handleValidarPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinIngresado === pinCorrecto) {
      handleSuccess();
    } else {
      setError('PIN incorrecto. Intentá nuevamente.');
      setPinIngresado('');
    }
  };

  // 2. Validación por Contraseña Principal de Supabase
  const handleValidarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidando(true);

    try {
      let emailParaValidar = userEmail;

      if (!emailParaValidar) {
        const { data: { user } } = await supabase.auth.getUser();
        emailParaValidar = user?.email || null;
      }

      if (!emailParaValidar) {
        setError('No se pudo identificar al usuario activo.');
        setValidando(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: emailParaValidar,
        password: passwordIngresada,
      });

      if (authError) {
        setError('Contraseña incorrecta.');
      } else {
        handleSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al verificar la contraseña.');
    } finally {
      setValidando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center">
        
        <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
          {modoRescate ? <ShieldAlert className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
            {titulo}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {subtitulo || (modoRescate
              ? 'Ingresá tu contraseña de usuario para desbloquear'
              : 'Ingresá el PIN de Administrador para ingresar a este módulo')}
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 p-2.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!modoRescate ? (
          /* FORMULARIO PIN */
          <form onSubmit={handleValidarPin} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              autoFocus
              value={pinIngresado}
              onChange={(e) => setPinIngresado(e.target.value)}
              placeholder="• • • •"
              className="w-full text-center text-xl tracking-widest font-mono py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-hidden text-slate-800 dark:text-zinc-100"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Ingresar
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setModoRescate(true);
                }}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                ¿Olvidaste tu PIN? Validar con contraseña
              </button>
            </div>
          </form>
        ) : (
          /* FORMULARIO RESCATE POR CONTRASEÑA */
          <form onSubmit={handleValidarPassword} className="space-y-4">
            <input
              type="password"
              autoFocus
              value={passwordIngresada}
              onChange={(e) => setPasswordIngresada(e.target.value)}
              placeholder="Contraseña de tu cuenta"
              className="w-full text-center text-sm py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-hidden text-slate-800 dark:text-zinc-100"
              required
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setModoRescate(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={validando}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {validando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Validar</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}