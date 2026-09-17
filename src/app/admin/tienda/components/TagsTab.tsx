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
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h2 className="text-base font-bold text-[#12151B] sm:text-lg">Tags de Búsqueda Inteligente</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Administrá los accesos directos que aparecen arriba en la tienda para filtrar productos al instante.
        </p>
      </div>

      {/* Formulario para agregar nuevo Tag */}
      <form onSubmit={handleCrearTag} className="space-y-4 rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#12151B]">
          <Tag className="h-4 w-4 text-[#0E6E55]" /> Agregar Nuevo Tag
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Nombre visible</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: ✨ Nuevos Ingresos"
              className="h-11 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 text-xs outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Slug / Palabra clave</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ej: nuevo"
              className="h-11 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 text-xs outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Orden de aparición</label>
            <input
              type="number"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 text-xs outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#12151B] text-xs font-bold text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 sm:w-auto sm:px-5"
        >
          <Plus className="h-4 w-4" /> {guardando ? 'Guardando...' : 'Crear Tag de Búsqueda'}
        </button>
      </form>

      {/* Listado de Tags existentes */}
      <div className="overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white shadow-sm sm:rounded-3xl">
        <div className="border-b border-[#E7E5E0] bg-gray-50 px-4 py-3 sm:px-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Tags Activos en la Tienda</h3>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-xs text-gray-400">Cargando tags...</div>
        ) : tags.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No hay tags creados todavía. ¡Agregá el primero arriba!</div>
        ) : (
          <div className="divide-y divide-[#E7E5E0]">
            {tags.map((tag) => (
              <div key={tag.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F7F5] text-xs font-bold text-gray-600">
                    {tag.orden}
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold text-[#12151B] sm:text-sm">{tag.nombre}</h4>
                    <span className="font-mono text-[11px] text-gray-400">Filtro: {tag.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggleActivo(tag.id, tag.activo)}
                    className={`flex h-9 items-center gap-1 rounded-full px-3 text-[11px] font-bold transition-colors active:scale-95 ${
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 active:scale-95"
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