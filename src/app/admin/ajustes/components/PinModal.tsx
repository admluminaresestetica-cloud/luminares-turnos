'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Lock, KeyRound, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { obtenerPinAcceso } from '@/lib/admin/ajustes';

interface PinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  titulo?: string;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PinModal({
  isOpen,
  onSuccess,
  onClose,
  titulo = 'Acceso Protegido',
}: PinModalProps) {
  const [pinGuardado, setPinGuardado] = useState<string>('');
  const [pinIngresado, setPinIngresado] = useState<string>('');
  const [passwordIngresada, setPasswordIngresada] = useState<string>('');
  
  const [modoRescate, setModoRescate] = useState<boolean>(false);
  const [cargandoPin, setCargandoPin] = useState<boolean>(true);
  const [validando, setValidando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar PIN dinámico de Supabase al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const cargarPinBD = async () => {
        setCargandoPin(true);
        setError(null);
        try {
          const pin = await obtenerPinAcceso();
          setPinGuardado(pin);
        } catch (err) {
          console.error('Error al obtener el PIN de Supabase:', err);
        } finally {
          setCargandoPin(false);
        }
      };
      cargarPinBD();
    } else {
      // Limpiar estados al cerrar
      setPinIngresado('');
      setPasswordIngresada('');
      setModoRescate(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validar PIN rápido
  const handleValidarPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pinIngresado === pinGuardado) {
      onSuccess();
    } else {
      setError('PIN incorrecto. Inténtalo de nuevo.');
      setPinIngresado('');
    }
  };

  // Validar con Contraseña Principal (Rescate)
  const handleValidarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidando(true);

    try {
      // Obtener sesión activa para rescatar el email del usuario logueado
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        setError('No se detectó una sesión activa de administrador.');
        setValidando(false);
        return;
      }

      // Re-autenticar con la contraseña ingresada
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: passwordIngresada,
      });

      if (authError) {
        setError('Contraseña de cuenta incorrecta.');
      } else {
        // Validación exitosa mediante contraseña principal
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al verificar las credenciales.');
    } finally {
      setValidando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-xl">
            {modoRescate ? <ShieldAlert className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
              {titulo}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {modoRescate
                ? 'Ingresa la contraseña de tu cuenta'
                : 'Ingresa tu PIN de 4 dígitos para continuar'}
            </p>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Carga del PIN */}
        {cargandoPin ? (
          <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
            <span>Verificando permisos...</span>
          </div>
        ) : (
          <>
            {/* Opción 1: Formulario PIN de 4 dígitos */}
            {!modoRescate ? (
              <form onSubmit={handleValidarPin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    value={pinIngresado}
                    onChange={(e) => setPinIngresado(e.target.value)}
                    placeholder="****"
                    className="w-full text-center text-2xl tracking-widest font-mono py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 dark:text-zinc-100"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-xs"
                  >
                    Confirmar
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setModoRescate(true);
                    }}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
                  >
                    ¿Olvidaste tu PIN? Validar con contraseña
                  </button>
                </div>
              </form>
            ) : (
              /* Opción 2: Formulario de Rescate con Contraseña Principal */
              <form onSubmit={handleValidarPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Contraseña de tu cuenta
                  </label>
                  <input
                    type="password"
                    autoFocus
                    value={passwordIngresada}
                    onChange={(e) => setPasswordIngresada(e.target.value)}
                    placeholder="Escribe tu contraseña"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 dark:text-zinc-100"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setModoRescate(false);
                    }}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all"
                  >
                    Volver a PIN
                  </button>
                  <button
                    type="submit"
                    disabled={validando}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {validando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Ingresar</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}