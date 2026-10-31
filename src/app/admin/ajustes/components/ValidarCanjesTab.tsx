'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // <--- Si tu archivo se llama distinto, cambiá la ruta acá
import { QrCode, Search, CheckCircle2, AlertCircle, Clock, User, Gift, RefreshCw } from 'lucide-react';

interface CanjeItem {
  id: string;
  codigo_canje: string;
  estado: string; // 'PENDIENTE' | 'UTILIZADO'
  created_at: string;
  utilizado_at?: string;
  premios_catalogo?: {
    titulo: string;
    puntos_requeridos: number;
  };
  usuarios?: {
    nombre: string;
    email: string;
    telefono?: string;
  };
}

export default function ValidarCanjesTab() {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [canjeEncontrado, setCanjeEncontrado] = useState<CanjeItem | null>(null);
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  
  // Historial general
  const [historialCanjes, setHistorialCanjes] = useState<CanjeItem[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  // Cargar historial al montar el componente
  useEffect(() => {
    cargarHistorial();
  }, []);

// 1. Cargar Historial
  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const { data, error } = await supabase
        .from('canjes_usuarios')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) setHistorialCanjes(data);
    } catch (err) {
      console.error('Error al cargar historial de canjes:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // 2. Buscar Código
  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBusqueda.trim()) return;

    setLoading(true);
    setCanjeEncontrado(null);
    setMensajeError('');
    setMensajeExito('');

    const codigoLimpio = codigoBusqueda.trim().toUpperCase();

    try {
      const { data, error } = await supabase
        .from('canjes_usuarios')
        .select('*')
        .eq('codigo_canje', codigoLimpio)
        .single();

      if (error || !data) {
        setMensajeError('No se encontró ningún canje con ese código. Verificá que esté bien escrito.');
      } else {
        setCanjeEncontrado(data);
      }
    } catch (err) {
      setMensajeError('Ocurrió un error al buscar el código.');
    } finally {
      setLoading(false);
    }
  };

const handleConfirmarEntrega = async (idCanje: string) => {
    setLoading(true);
    setMensajeError('');
    setMensajeExito('');

    try {
      // 🟢 Actualizamos únicamente la columna 'estado' que sí existe en la tabla
      const { error } = await supabase
        .from('canjes_usuarios')
        .update({ 
          estado: 'utilizado' 
        })
        .eq('id', idCanje);

      if (error) throw error;

      setMensajeExito('¡Canje validado y entregado con éxito!');
      
      if (canjeEncontrado) {
        setCanjeEncontrado({
          ...canjeEncontrado,
          estado: 'utilizado'
        });
      }
      cargarHistorial();
    } catch (err) {
      console.error(err); // Esto te mostrará el error real en la consola si vuelve a pasar
      setMensajeError('Error al actualizar el estado del canje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta Buscador */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-violet-500/10 text-violet-500 rounded-2xl">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">
              Validador de Canjes en Recepción
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ingresá o escaneá el código alfanumérico que presenta el cliente (ej: <span className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-fuchsia-600 dark:text-fuchsia-400">CANJE-XXXX</span>).
            </p>
          </div>
        </div>

        <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              placeholder="Ej: CANJE-6PR0"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl text-sm text-slate-900 dark:text-zinc-100 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl transition-all shadow-sm shadow-rose-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Buscar</span>
          </button>
        </form>

        {/* Mensajes de feedback */}
        {mensajeError && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mensajeError}</span>
          </div>
        )}

        {mensajeExito && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Resultado de la Búsqueda */}
        {canjeEncontrado && (
          <div className="mt-6 p-5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-zinc-700/60">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-lg">
                  {canjeEncontrado.codigo_canje}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  canjeEncontrado.estado === 'UTILIZADO'
                    ? 'bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {canjeEncontrado.estado}
                </span>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(canjeEncontrado.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Cliente:</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {canjeEncontrado.usuarios?.nombre || 'Usuario sin nombre'} ({canjeEncontrado.usuarios?.email})
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Premio Canjeado:</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-rose-500" />
                  {canjeEncontrado.premios_catalogo?.titulo || 'Premio'} 
                  <span className="text-rose-500 font-normal">({canjeEncontrado.premios_catalogo?.puntos_requeridos} pts)</span>
                </p>
              </div>
            </div>

            {canjeEncontrado.estado === 'pendiente' ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmarEntrega(canjeEncontrado.id)}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Entrega de Premio</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-slate-400 font-medium bg-slate-200/50 dark:bg-zinc-800 rounded-xl">
                Este premio ya fue entregado con anterioridad.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historial de Canjes Recientes */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
            Historial de Canjes Recientes
          </h4>
          <button
            type="button"
            onClick={cargarHistorial}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistorial ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {loadingHistorial ? (
          <div className="text-center py-8 text-xs text-slate-400">Cargando historial...</div>
        ) : historialCanjes.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No hay canjes registrados todavía.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 font-medium">
                  <th className="pb-3 px-3">Código</th>
                  <th className="pb-3 px-3">Cliente</th>
                  <th className="pb-3 px-3">Premio</th>
                  <th className="pb-3 px-3">Estado</th>
                  <th className="pb-3 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
                {historialCanjes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-violet-600 dark:text-violet-400">
                      {c.codigo_canje}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {c.usuarios?.nombre || c.usuarios?.email || 'Cliente'}
                    </td>
                    <td className="py-3 px-3">
                      {c.premios_catalogo?.titulo || 'Premio'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.estado === 'utilizado'
                          ? 'bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}