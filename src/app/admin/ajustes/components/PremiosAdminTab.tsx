'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Gift, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Star, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';

interface Premio {
  id: string;
  titulo: string;
  descripcion: string;
  puntos_requeridos: number;
  activo: boolean;
}

export default function PremiosAdminTab() {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Estados del formulario para nuevo premio
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [puntos, setPuntos] = useState<number>(100);

  useEffect(() => {
    cargarPremios();
  }, []);

  async function cargarPremios() {
    setCargando(true);
    const { data, error } = await supabase
      .from('premios_catalogo')
      .select('*')
      .order('puntos_requeridos', { ascending: true });

    if (!error && data) {
      setPremios(data);
    }
    setCargando(false);
  }

  const handleCrearPremio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || puntos <= 0) return;

    setGuardando(true);
    const { data, error } = await supabase
      .from('premios_catalogo')
      .insert([
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          puntos_requeridos: Number(puntos),
          activo: true,
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setPremios((prev) => [...prev, data]);
      setTitulo('');
      setDescripcion('');
      setPuntos(100);
      setMensaje('Premio creado con éxito');
      setTimeout(() => setMensaje(null), 3000);
    }
    setGuardando(false);
  };

  const toggleEstadoPremio = async (id: string, estadoActual: boolean) => {
    const { error } = await supabase
      .from('premios_catalogo')
      .update({ activo: !estadoActual })
      .eq('id', id);

    if (!error) {
      setPremios((prev) =>
        prev.map((p) => (p.id === id ? { ...p, activo: !estadoActual } : p))
      );
    }
  };

  const eliminarPremio = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este premio del catálogo?')) return;

    const { error } = await supabase
      .from('premios_catalogo')
      .delete()
      .eq('id', id);

    if (!error) {
      setPremios((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* TARJETA: CREAR NUEVO PREMIO */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm transition-all dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
            Agregar Nuevo Premio al Catálogo
          </h2>
        </div>

        <form onSubmit={handleCrearPremio} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 dark:text-zinc-300">
                Título del Premio
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Descuento de $2.000"
                className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 dark:text-zinc-300">
                Puntos Requeridos
              </label>
              <input
                type="number"
                required
                min="1"
                value={puntos}
                onChange={(e) => setPuntos(Number(e.target.value))}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 dark:text-zinc-300">
              Descripción Corta
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Válido para cualquier servicio de gabinete o láser."
              className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {mensaje ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {mensaje}
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={guardando}
              className="bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 dark:bg-rose-600 dark:hover:bg-rose-500 cursor-pointer"
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Crear Premio</span>
            </button>
          </div>
        </form>
      </div>

      {/* TARJETA: LISTADO DE PREMIOS ACTUALES */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm transition-all dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
            Premios Disponibles en el Catálogo
          </h2>
        </div>

        {cargando ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-6 justify-center animate-pulse dark:text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando catálogo de premios...
          </div>
        ) : premios.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-400 dark:text-zinc-500">
            No hay premios creados todavía. ¡Agregá el primero arriba!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {premios.map((premio) => (
              <div 
                key={premio.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  premio.activo 
                    ? 'bg-gray-50/60 border-gray-200/60 dark:bg-zinc-800/50 dark:border-zinc-700/60' 
                    : 'bg-gray-100/40 border-gray-200 opacity-60 dark:bg-zinc-850/30 dark:border-zinc-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                      {premio.titulo}
                    </h3>
                    <span className="font-mono text-xs font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                      {premio.puntos_requeridos} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2">
                    {premio.descripcion || 'Sin descripción detallada.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-zinc-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleEstadoPremio(premio.id, premio.activo)}
                    className="flex items-center gap-1.5 font-semibold text-gray-600 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    {premio.activo ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Activo</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Pausado</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminarPremio(premio.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Eliminar premio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
