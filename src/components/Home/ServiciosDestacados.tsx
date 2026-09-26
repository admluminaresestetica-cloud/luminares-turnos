'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Flame, Clock, ArrowRight, Zap, Sparkles } from 'lucide-react';

interface ItemDestacado {
  id: string;
  nombre: string;
  precio: number;
  duracion?: number;
  imagen?: string | null;
  tabla: 'promos_laser' | 'servicios_generales' | 'servicios_laser';
  generoOriginal?: string;
  subtipoOriginal?: string;
}

export default function ServiciosDestacados() {
  const router = useRouter();
  const [destacados, setDestacados] = useState<ItemDestacado[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDestacados();
  }, []);

  // Efecto para el desplazamiento automático (autoplay) hacia la derecha
  useEffect(() => {
    if (loading || destacados.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let intervalId: NodeJS.Timeout;

    const startAutoplay = () => {
      intervalId = setInterval(() => {
        if (!container) return;
        const scrollAmount = 210; // Ancho aproximado de la tarjeta + gap
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (container.scrollLeft >= maxScrollLeft - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }, 3500);
    };

    startAutoplay();

    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => startAutoplay();

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleMouseEnter);
    container.addEventListener('touchend', handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchstart', handleMouseEnter);
        container.removeEventListener('touchend', handleMouseLeave);
      }
    };
  }, [loading, destacados]);

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
          .select('id, subtipo, categoria, precio, duracion_minutos, imagen_url')
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
        imagen: null,
        tabla: 'promos_laser',
        generoOriginal: item.genero || 'femenino',
      }));

      const generalesFormatted: ItemDestacado[] = (resGenerales.data || []).map((item: any) => ({
        id: item.id,
        nombre: item.subtipo || item.categoria || 'Servicio de Estética',
        precio: item.precio || 0,
        duracion: item.duracion_minutos,
        imagen: item.imagen_url || null,
        tabla: 'servicios_generales',
        subtipoOriginal: item.subtipo || item.categoria,
      }));

      const laserFormatted: ItemDestacado[] = (resLaser.data || []).map((item) => ({
        id: item.id,
        nombre: item.nombre_zona || 'Depilación Láser',
        precio: item.precio_lista || 0,
        duracion: item.duracion_minutos,
        imagen: null,
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
    <section className="space-y-3 my-4">
      {/* Título de la sección */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-zinc-100">
              Lo más buscado
            </h2>
            <p className="text-[10px] text-stone-500 dark:text-zinc-400 font-semibold">
              Los tratamientos favoritos de nuestros clientes
            </p>
          </div>
        </div>
      </div>

      {/* Lista / Carrusel deslizable con Autoplay */}
      {loading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-none py-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="min-w-[195px] h-[115px] rounded-[20px] bg-stone-100 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-none py-1 px-0.5 touch-pan-x snap-x snap-mandatory scroll-smooth"
        >
          {destacados.map((item) => {
            const esLaser = item.tabla === 'promos_laser' || item.tabla === 'servicios_laser';

            return (
              <div
                key={`${item.tabla}-${item.id}`}
                onClick={() => handleReservar(item)}
                className="snap-start min-w-[195px] max-w-[195px] bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-3 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-rose-500/40 dark:hover:border-rose-500/35 transition-all cursor-pointer group shrink-0"
              >
                {/* Parte superior: Foto si es estética, o Badge/Rayito si es láser */}
                <div className="space-y-1.5">
                  {item.imagen ? (
                    <div className="w-full h-12 rounded-xl overflow-hidden mb-1 bg-stone-100 dark:bg-zinc-800 relative">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : esLaser ? (
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                        {item.tabla === 'promos_laser' ? 'Promo Láser' : 'Depilación Láser'}
                      </span>
                      <div className="p-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <Zap className="w-3.5 h-3.5 fill-rose-500/20" />
                      </div>
                    </div>
                  ) : null}

                  {!esLaser && (
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                        Estética
                      </span>
                      {item.duracion && (
                        <span className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-stone-400 dark:text-zinc-500" />
                          {item.duracion}m
                        </span>
                      )}
                    </div>
                  )}

                  {esLaser && item.duracion && (
                    <div className="flex items-center justify-end -mt-1">
                      <span className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-stone-400 dark:text-zinc-500" />
                        {item.duracion}m
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-stone-800 dark:text-zinc-100 text-xs leading-snug line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {item.nombre}
                  </h3>
                </div>

                {/* Pie de la Tarjeta */}
                <div className="pt-2 flex items-end justify-between border-t border-stone-100 dark:border-zinc-800/80 mt-1.5">
                  <div>
                    <span className="text-[8px] text-stone-400 dark:text-zinc-500 font-semibold block uppercase">Precio</span>
                    <p className="text-xs font-black text-stone-900 dark:text-zinc-100">
                      ${item.precio?.toLocaleString('es-AR')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReservar(item);
                    }}
                    className="bg-stone-900 dark:bg-zinc-800 hover:bg-rose-600 dark:hover:bg-rose-600 active:scale-95 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    aria-label="Reservar"
                  >
                    <span>Reservar</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
