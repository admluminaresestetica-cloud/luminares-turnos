'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, CheckCircle2, Loader2, QrCode, AlertCircle, User, Gift } from 'lucide-react';

interface CanjeDetalle {
  id: string;
  codigo_canje: string;
  estado: string;
  created_at: string;
  premios_catalogo: {
    titulo: string;
    descripcion: string;
    puntos_requeridos: number;
  };
  auth_users?: {
    email?: string;
  };
}

export default function ValidarCanjesTab() {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [canjeEncontrado, setCanjeEncontrado] = useState<CanjeDetalle | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [exitoAccion, setExitoAccion] = useState(false);

  const buscarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBusqueda.trim()) return;

    setCargando(true);
    setMensajeError(null);
    setCanjeEncontrado(null);
    setExitoAccion(false);

    try {
      const { data, error } = await supabase
        .from('canjes_usuarios')
        .select(`
          id,
          codigo_canje,
          estado,
          created_at,
          user_id,
          premios_catalogo (
            titulo,
            descripcion,
            puntos_requeridos
          )
        `)
        .ilike('codigo_canje', codigoBusqueda.trim())
        .maybeSingle();

      if (error || !data) {
        setMensajeError('No se encontró ningún canje con ese código. Verificá que esté bien escrito.');
      } else {
        setCanjeEncontrado(data as any);
      }
    } catch (err) {
      console.error('Error buscando código:', err);
      setMensajeError('Ocurrió un error al buscar el código.');
    } finally {
      setCargando(false);
    }
  };

  const marcarComoUtilizado = async (id: string) => {
    setActualizando(true);
    const { error } = await supabase
      .from('canjes_usuarios')
      .update({ estado: 'utilizado' })
      .eq('id', id);

    if (!error) {
      setCanjeEncontrado((prev) => (prev ? { ...prev, estado: 'utilizado' } : null));
      setExitoAccion(true);
      setTimeout(() => setExitoAccion(false), 3000);
    } else {
      setMensajeError('No se pudo actualizar el estado del canje.');
    }
    setActualizando(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm transition-all dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
            Validador de Canjes en Recepción
          </h2>
        </div>

        <p className="text-xs text-gray-500 dark:text-zinc-400">
          Ingresá o escaneá el código alfanumérico que el cliente presenta en el local (ej: <code className="font-mono bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-rose-600">CANJE-XXXX</code>) para verificar su validez y entregar el premio.
        </p>

        {/* Formulario de Búsqueda */}
        <form onSubmit={buscarCodigo} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 dark:text-zinc-500" />
            <input
              type="text"
              required
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              placeholder="Ej: CANJE-A8F2"
              className="w-full pl-10 pr-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 dark:bg-rose-600 cursor-pointer shrink-0"
          >
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Buscar</span>
          </button>
        </form>

        {/* Mensaje de Error */}
        {mensajeError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mensajeError}</span>
          </div>
        )}

        {/* Mensaje de Éxito de Actualización */}
        {exitoAccion && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>¡Canje validado y marcado como utilizado con éxito!</span>
          </div>
        )}

        {/* Resultado del Canje Encontrado */}
        {canjeEncontrado && (
          <div className="mt-4 p-4 rounded-2xl border bg-gray-50/80 border-gray-200 dark:bg-zinc-800/60 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-zinc-700 pb-3">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Código ingresado:</span>
                <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400 tracking-wider">
                  {canjeEncontrado.codigo_canje}
                </span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                canjeEncontrado.estado === 'pendiente' 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}>
                {canjeEncontrado.estado}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1 font-semibold">
                  <Gift className="w-3.5 h-3.5 text-rose-500" /> Premio Canjeado:
                </span>
                <p className="font-bold text-gray-900 dark:text-zinc-100">
                  {canjeEncontrado.premios_catalogo?.titulo}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  {canjeEncontrado.premios_catalogo?.descripcion}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 flex items-center gap-1 font-semibold">
                  <User className="w-3.5 h-3.5 text-rose-500" /> Costo en Puntos:
                </span>
                <p className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {canjeEncontrado.premios_catalogo?.puntos_requeridos} pts
                </p>
                <p className="text-[10px] text-gray-400">
                  Canjeado el: {new Date(canjeEncontrado.created_at).toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Botón de Acción para Marcar como Usado */}
            <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-700 flex justify-end">
              {canjeEncontrado.estado === 'pendiente' ? (
                <button
                  type="button"
                  disabled={actualizando}
                  onClick={() => marcarComoUtilizado(canjeEncontrado.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  {actualizando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Marcar como Entregado / Utilizado</span>
                </button>
              ) : (
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 py-1">
                  <CheckCircle2 className="w-4 h-4" /> Este premio ya fue entregado y utilizado.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
