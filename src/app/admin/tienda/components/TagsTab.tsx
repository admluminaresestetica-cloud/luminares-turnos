'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Tag, CheckCircle2, XCircle } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TagsTab() {
  const [tags, setTags] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [orden, setOrden] = useState('0');
  const [guardando, setGuardando] = useState(false);

  // Cargar tags desde Supabase
  const fetchTags = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('tags_busqueda')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error al cargar tags:', error);
    } else {
      setTags(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Crear un nuevo tag
  const handleCrearTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !slug.trim()) return;

    setGuardando(true);
    const { error } = await supabase.from('tags_busqueda').insert([
      {
        nombre: nombre.trim(),
        slug: slug.trim().toLowerCase(),
        orden: parseInt(orden) || 0,
        activo: true,
      },
    ]);

    if (error) {
      console.error('Error al crear tag:', error);
      alert('Hubo un error al crear el tag');
    } else {
      setNombre('');
      setSlug('');
      setOrden('0');
      fetchTags();
    }
    setGuardando(false);
  };

  // Alternar estado activo/inactivo
  const handleToggleActivo = async (id: string, estadoActual: boolean) => {
    const { error } = await supabase
      .from('tags_busqueda')
      .update({ activo: !estadoActual })
      .eq('id', id);

    if (!error) {
      fetchTags();
    }
  };

  // Eliminar tag
  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este tag de búsqueda?')) return;

    const { error } = await supabase.from('tags_busqueda').delete().eq('id', id);

    if (!error) {
      fetchTags();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#12151B]">Tags de Búsqueda Inteligente</h2>
          <p className="text-xs text-gray-500">
            Administrá los accesos directos que aparecen arriba en la tienda para filtrar productos al instante.
          </p>
        </div>
      </div>

      {/* Formulario para agregar nuevo Tag */}
      <form onSubmit={handleCrearTag} className="rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#12151B] flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#0E6E55]" /> Agregar Nuevo Tag
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre visible (Ej: 🔥 Más Vendidos)</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: ✨ Nuevos Ingresos"
              className="w-full rounded-xl border border-[#E7E5E0] px-3 py-2 text-xs focus:outline-none focus:border-[#12151B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Slug / Palabra clave de filtro</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ej: nuevo (o parte del nombre/descripción)"
              className="w-full rounded-xl border border-[#E7E5E0] px-3 py-2 text-xs focus:outline-none focus:border-[#12151B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Orden de aparición</label>
            <input
              type="number"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-full rounded-xl border border-[#E7E5E0] px-3 py-2 text-xs focus:outline-none focus:border-[#12151B]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#12151B] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-black cursor-pointer"
        >
          <Plus className="h-4 w-4" /> {guardando ? 'Guardando...' : 'Crear Tag de Búsqueda'}
        </button>
      </form>

      {/* Listado de Tags existentes */}
      <div className="rounded-2xl border border-[#E7E5E0] bg-white overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-[#E7E5E0] bg-gray-50">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tags Activos en la Tienda</h3>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-xs text-gray-400">Cargando tags...</div>
        ) : tags.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No hay tags creados todavía. ¡Agregá el primero arriba!</div>
        ) : (
          <div className="divide-y divide-[#E7E5E0]">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F7F5] font-bold text-xs text-gray-600">
                    {tag.orden}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#12151B]">{tag.nombre}</h4>
                    <span className="text-[11px] text-gray-400 font-mono">Filtro: {tag.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActivo(tag.id, tag.activo)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                      tag.activo
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {tag.activo ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {tag.activo ? 'Visible' : 'Oculto'}
                  </button>

                  <button
                    onClick={() => handleEliminar(tag.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar tag"
                  >
                    <Trash2 className="h-4 w-4" />
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