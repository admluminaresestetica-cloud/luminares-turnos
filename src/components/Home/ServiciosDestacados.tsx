'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Flame, Clock, ArrowRight } from 'lucide-react';

interface ItemDestacado {
  id: string;
  nombre: string;
  precio: number;
  duracion?: number;
  tabla: 'promos_laser' | 'servicios_generales' | 'servicios_laser';
  generoOriginal?: string;
  subtipoOriginal?: string;
}

export default function ServiciosDestacados() {
  const router = useRouter();
  const [destacados, setDestacados] = useState<ItemDestacado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestacados();
  }, []);

  async function fetchDestacados() {
    setLoading(true);
    try {
      const [resPromos, resGenerales, resLaser] = await Promise.all([
        supabase
          .from('promos_laser')
          .select('id, nombre_promo, precio_promo, duracion_total_min, genero')
          .eq('es_destacado', true)
          .eq('activo', true),
        supabase
          .from('servicios_generales')
          .select('id, subtipo, categoria, precio, duracion_minutos')
          .eq('es_destacado', true)
          .eq('activo', true),
        supabase
          .from('servicios_laser')
          .select('id, nombre_zona, precio_lista, duracion_minutos, genero')
          .eq('es_destacado', true)
          .eq('activo', true),
      ]);

      const promosFormatted: ItemDestacado[] = (resPromos.data || []).map((item) => ({
        id: item.id,
        nombre: item.nombre_promo || 'Promo Láser',
        precio: item.precio_promo || 0,
        duracion: item.duracion_total_min,
        tabla: 'promos_laser',
        generoOriginal: item.genero || 'femenino',
      }));

      const generalesFormatted: ItemDestacado[] = (resGenerales.data || []).map((item) => ({
        id: item.id,
        nombre: item.subtipo || item.categoria || 'Servicio de Estética',
        precio: item.precio || 0,
        duracion: item.duracion_minutos,
        tabla: 'servicios_generales',
        subtipoOriginal: item.subtipo || item.categoria,
      }));

      const laserFormatted: ItemDestacado[] = (resLaser.data || []).map((item) => ({
        id: item.id,
        nombre: item.nombre_zona || 'Depilación Láser',
        precio: item.precio_lista || 0,
        duracion: item.duracion_minutos,
        tabla: 'servicios_laser',
        generoOriginal: item.genero || 'femenino',
      }));

      setDestacados([...promosFormatted, ...generalesFormatted, ...laserFormatted]);
    } catch (err) {
      console.error('Error al cargar destacados:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleReservar = (item: ItemDestacado) => {
    if (item.tabla === 'promos_laser') {
      const promo = encodeURIComponent(item.nombre);
      const genero = item.generoOriginal || 'femenino';
      router.push(`/laser?genero=${genero}&promo=${promo}`);
    } else if (item.tabla === 'servicios_laser') {
      const zona = encodeURIComponent(item.nombre);
      const genero = item.generoOriginal || 'femenino';
      router.push(`/laser?genero=${genero}&zona=${zona}`);
    } else if (item.tabla === 'servicios_generales') {
      const servicio = encodeURIComponent(item.subtipoOriginal || item.nombre);
      router.push(`/servicios?servicio=${servicio}`);
    } else {
      router.push('/servicios');
    }
  };

  if (!loading && destacados.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3.5 my-6">
      {/* Título de la sección con acento Rojo/Coral elegante */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20 flex items-center justify-center">
            <Flame className="w-4.5 h-4.5 fill-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-stone-900 dark:text-zinc-100">
              Lo más buscado
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 font-semibold">
              Los tratamientos favoritos de nuestros clientes
            </p>
          </div>
        </div>
      </div>

      {/* Lista / Carrusel de Tarjetas */}
      {loading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-none py-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="min-w-[240px] h-[140px] rounded-[22px] bg-stone-100 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3.5 overflow-x-auto scrollbar-none py-1 px-0.5">
          {destacados.map((item) => (
            <div
              key={`${item.tabla}-${item.id}`}
              onClick={() => handleReservar(item)}
              className="min-w-[240px] max-w-[240px] bg-white dark:bg-zinc-900 border border-rose-950/10 dark:border-zinc-800 rounded-[22px] p-4 flex flex-col justify-between shadow-md shadow-rose-950/5 hover:shadow-lg hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all cursor-pointer group"
            >
              {/* Encabezado de la Tarjeta */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Badge en tonos rojo/coral sobrios */}
                  <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                    {item.tabla === 'promos_laser'
                      ? 'Promo'
                      : item.tabla === 'servicios_laser'
                      ? 'Láser'
                      : 'Estética'}
                  </span>
                  {item.duracion && (
                    <span className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400 dark:text-zinc-500" />
                      {item.duracion} min
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-stone-800 dark:text-zinc-100 text-sm leading-snug line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {item.nombre}
                </h3>
              </div>

              {/* Pie de la Tarjeta */}
              <div className="pt-3 flex items-end justify-between border-t border-stone-100 dark:border-zinc-800/80 mt-3">
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-semibold block">Precio</span>
                  <p className="text-sm font-black text-stone-900 dark:text-zinc-100">
                    ${item.precio?.toLocaleString('es-AR')}
                  </p>
                </div>

                {/* Botón de acción con toque rojo al hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReservar(item);
                  }}
                  className="bg-stone-900 dark:bg-zinc-800 hover:bg-rose-600 dark:hover:bg-rose-600 active:scale-95 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  aria-label="Reservar"
                >
                  <span>Reservar</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
