'use client';

import { useState, useEffect } from 'react';
import { KeyRound, Check, AlertCircle, Loader2 } from 'lucide-react';
import { obtenerPinAcceso, actualizarPinAcceso } from '@/lib/admin/ajustes';

export default function SeccionSeguridad() {
  const [pinActualGuardado, setPinActualGuardado] = useState('');
  const [pinIngresado, setPinIngresado] = useState('');
  const [nuevoPin, setNuevoPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    async function CargarPin() {
      try {
        const pin = await obtenerPinAcceso();
        setPinActualGuardado(pin);
      } catch (err) {
        console.error('Error cargando PIN:', err);
      } finally {
        setCargando(false);
      }
    }
    CargarPin();
  }, []);

  const handleGuardarPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (pinIngresado !== pinActualGuardado) {
      setMensaje({ tipo: 'error', texto: 'El PIN actual ingresado no es correcto.' });
      return;
    }

    if (nuevoPin.length < 4) {
      setMensaje({ tipo: 'error', texto: 'El nuevo PIN debe tener al menos 4 dígitos.' });
      return;
    }

    if (nuevoPin !== confirmarPin) {
      setMensaje({ tipo: 'error', texto: 'El nuevo PIN y la confirmación no coinciden.' });
      return;
    }

    setGuardando(true);
    try {
      await actualizarPinAcceso(nuevoPin);
      setPinActualGuardado(nuevoPin);
      setPinIngresado('');
      setNuevoPin('');
      setConfirmarPin('');
      setMensaje({ tipo: 'exito', texto: '¡PIN actualizado correctamente!' });
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar el PIN en Supabase.' });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-slate-400 p-6">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
        <span className="text-sm">Cargando configuración de seguridad...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs max-w-xl">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div className="p-2.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-xl">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
            Seguridad de Acceso Rápido
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cambia el PIN de 4 dígitos utilizado para ingresar a Ajustes y Métricas.
          </p>
        </div>
      </div>

      {mensaje && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
            mensaje.tipo === 'exito'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {mensaje.tipo === 'exito' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      <form onSubmit={handleGuardarPin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
            PIN Actual
          </label>
          <input
            type="password"
            maxLength={6}
            value={pinIngresado}
            onChange={(e) => setPinIngresado(e.target.value)}
            placeholder="****"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 dark:text-zinc-100"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Nuevo PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={nuevoPin}
              onChange={(e) => setNuevoPin(e.target.value)}
              placeholder="****"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Confirmar Nuevo PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={confirmarPin}
              onChange={(e) => setConfirmarPin(e.target.value)}
              placeholder="****"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 dark:text-zinc-100"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-50 shadow-sm"
        >
          {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Guardar Nuevo PIN</span>
        </button>
      </form>
    </div>
  );
}