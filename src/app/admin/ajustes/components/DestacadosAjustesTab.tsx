'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tag, Sparkles, Zap, Flame, CheckCircle, Circle } from 'lucide-react';

interface ItemDestacado {
  id: string;
  nombre: string;
  precio: number;
  es_destacado: boolean;
  tabla: 'promos_laser' | 'servicios_generales' | 'servicios_laser';
}

export default function DestacadosAjustesTab() {
  const [items, setItems] = useState<ItemDestacado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'promos_laser' | 'servicios_generales' | 'servicios_laser'>('promos_laser');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodosLosServicios();
  }, []);

  async function fetchTodosLosServicios() {
    setLoading(true);
    try {
      // 1. Promos Láser
      const resPromos = await supabase
        .from('promos_laser')
        .select('id, nombre_promo, precio_promo, es_destacado');
      if (resPromos.error) console.error('Error en promos_laser:', resPromos.error);

      // 2. Servicios Generales
      const resGenerales = await supabase
        .from('servicios_generales')
        .select('id, subtipo, categoria, precio, es_destacado');
      if (resGenerales.error) console.error('Error en servicios_generales:', resGenerales.error);

      // 3. Servicios Láser
      const resLaser = await supabase
        .from('servicios_laser')
        .select('id, nombre_zona, precio_lista, es_destacado');
      if (resLaser.error) console.error('Error en servicios_laser:', resLaser.error);

      // Mapeo con nombres de columnas exactos de la DB
      const promosFormatted: ItemDestacado[] = (resPromos.data || []).map((item: any) => ({
        id: item.id,
        nombre: item.nombre_promo || 'Sin título',
        precio: item.precio_promo || 0,
        es_destacado: !!item.es_destacado,
        tabla: 'promos_laser',
      }));

      const generalesFormatted: ItemDestacado[] = (resGenerales.data || []).map((item: any) => ({
        id: item.id,
        nombre: item.subtipo || item.categoria || 'Servicio general',
        precio: item.precio || 0,
        es_destacado: !!item.es_destacado,
        tabla: 'servicios_generales',
      }));

      const laserFormatted: ItemDestacado[] = (resLaser.data || []).map((item: any) => ({
        id: item.id,
        nombre: item.nombre_zona || 'Zona láser',
        precio: item.precio_lista || 0,
        es_destacado: !!item.es_destacado,
        tabla: 'servicios_laser',
      }));

      const todos = [...promosFormatted, ...generalesFormatted, ...laserFormatted];
      setItems(todos);
    } catch (err) {
      console.error('Error al cargar items:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDestacado(item: ItemDestacado) {
    setSavingId(item.id);
    const nuevoEstado = !item.es_destacado;

    try {
      const { error } = await supabase
        .from(item.tabla)
        .update({ es_destacado: nuevoEstado })
        .eq('id', item.id);

      if (error) {
        console.error(`Error al actualizar ${item.tabla}:`, error);
        alert('No se pudo actualizar el estado.');
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, es_destacado: nuevoEstado } : i))
        );
      }
    } catch (err) {
      console.error('Error de red/servidor:', err);
    } finally {
      setSavingId(null);
    }
  }

  const filteredItems = items.filter((item) => {
    if (filter === 'todos') return true;
    return item.tabla === filter;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestión de "Lo más buscado"</h2>
            <p className="text-sm text-gray-600">
              Marcá los servicios o combos que querés que aparezcan destacados en el carrusel principal del inicio.
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas / Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('todos')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            filter === 'todos'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos ({items.length})
        </button>

        <button
          onClick={() => setFilter('promos_laser')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            filter === 'promos_laser'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Tag className="h-4 w-4" />
          Promos Laser ({items.filter((i) => i.tabla === 'promos_laser').length})
        </button>

        <button
          onClick={() => setFilter('servicios_generales')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            filter === 'servicios_generales'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Estética ({items.filter((i) => i.tabla === 'servicios_generales').length})
        </button>

        <button
          onClick={() => setFilter('servicios_laser')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            filter === 'servicios_laser'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Zap className="h-4 w-4" />
          Láser ({items.filter((i) => i.tabla === 'servicios_laser').length})
        </button>
      </div>

      {/* Lista de elementos */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          Cargando elementos...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          No se encontraron elementos en esta sección.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={`${item.tabla}-${item.id}`}
              onClick={() => toggleDestacado(item)}
              className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                item.es_destacado
                  ? 'border-amber-400 bg-amber-50/30 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${savingId === item.id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="pr-3">
                <p className="font-semibold text-gray-800">{item.nombre}</p>
                <p className="text-sm font-medium text-amber-600">
                  ${item.precio.toLocaleString('es-AR')}
                </p>
              </div>

              <div>
                {item.es_destacado ? (
                  <CheckCircle className="h-6 w-6 text-amber-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300 group-hover:text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}