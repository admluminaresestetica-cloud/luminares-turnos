'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, ShoppingBag, Sparkles, X, Loader2, Zap, Sun, Moon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HeaderBusquedaProps {
  nombreEmpresa: string;
}

interface ProductoResultado {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string;
}

interface ServicioResultado {
  id: string;
  nombre: string;
  tipo: 'general' | 'laser_zona' | 'laser_promo';
  precio?: number;
  categoriaOriginal?: string;
  subtipoOriginal?: string;
  nombreZonaOriginal?: string;
  nombrePromoOriginal?: string;
  generoOriginal?: string;
}

interface TagBusqueda {
  id: string;
  nombre: string;
  slug: string;
}

export default function HeaderBusqueda({ nombreEmpresa }: HeaderBusquedaProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [productos, setProductos] = useState<ProductoResultado[]>([]);
  const [servicios, setServicios] = useState<ServicioResultado[]>([]);
  const [tags, setTags] = useState<TagBusqueda[]>([]);

  // Estado y lógica para Modo Oscuro
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detectar si el modo oscuro está guardado en localStorage o preferencia del sistema
    const isDarkStored = localStorage.getItem('theme') === 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkStored || (!('theme' in localStorage) && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar tags iniciales
  useEffect(() => {
    async function fetchTags() {
      try {
        const { data } = await supabase
          .from('tags_busqueda')
          .select('id, nombre, slug')
          .eq('activo', true)
          .order('orden', { ascending: true })
          .limit(6);

        if (data) setTags(data);
      } catch (err) {
        console.error('Error al obtener tags_busqueda:', err);
      }
    }
    fetchTags();
  }, []);

  // Búsqueda reactiva con debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setProductos([]);
      setServicios([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const searchTerm = `%${query.trim()}%`;

      try {
        const reqProductos = supabase
          .from('productos')
          .select('id, nombre, precio, imagen_url')
          .eq('activo', true)
          .or(`nombre.ilike.${searchTerm},categoria.ilike.${searchTerm}`)
          .limit(3);

        const reqServiciosGenerales = supabase
          .from('servicios_generales')
          .select('id, subtipo, categoria, precio')
          .eq('activo', true)
          .or(`subtipo.ilike.${searchTerm},categoria.ilike.${searchTerm}`)
          .limit(3);

        const reqZonasLaser = supabase
          .from('servicios_laser')
          .select('id, nombre_zona, genero, precio_lista')
          .eq('activo', true)
          .ilike('nombre_zona', searchTerm)
          .limit(3);

        const reqPromosLaser = supabase
          .from('promos_laser')
          .select('id, nombre_promo, genero, precio_promo')
          .eq('activo', true)
          .ilike('nombre_promo', searchTerm)
          .limit(3);

        const [resProd, resServGen, resZonasLaser, resPromosLaser] = await Promise.all([
          reqProductos,
          reqServiciosGenerales,
          reqZonasLaser,
          reqPromosLaser,
        ]);

        if (resProd.data) setProductos(resProd.data);

        const serviciosUnificados: ServicioResultado[] = [];

        if (resServGen.data) {
          resServGen.data.forEach((item) => {
            serviciosUnificados.push({
              id: item.id,
              nombre: item.subtipo || item.categoria,
              tipo: 'general',
              precio: item.precio,
              categoriaOriginal: item.categoria,
              subtipoOriginal: item.subtipo,
            });
          });
        }

        if (resZonasLaser.data) {
          resZonasLaser.data.forEach((item) => {
            serviciosUnificados.push({
              id: item.id,
              nombre: `Láser: ${item.nombre_zona} (${item.genero || 'femenino'})`,
              tipo: 'laser_zona',
              precio: item.precio_lista,
              nombreZonaOriginal: item.nombre_zona,
              generoOriginal: item.genero || 'femenino',
            });
          });
        }

        if (resPromosLaser.data) {
          resPromosLaser.data.forEach((item) => {
            serviciosUnificados.push({
              id: item.id,
              nombre: `Promo Láser: ${item.nombre_promo} (${item.genero || 'femenino'})`,
              tipo: 'laser_promo',
              precio: item.precio_promo,
              nombrePromoOriginal: item.nombre_promo,
              generoOriginal: item.genero || 'femenino',
            });
          });
        }

        setServicios(serviciosUnificados.slice(0, 5));
      } catch (err) {
        console.error('Error buscando en Supabase:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e?: React.FormEvent, busquedaDirecta?: string) => {
    if (e) e.preventDefault();
    const termino = busquedaDirecta || query.trim();
    if (!termino) return;

    setFocused(false);
    router.push(`/tienda?busqueda=${encodeURIComponent(termino)}`);
  };

  const seleccionarProducto = (id: number) => {
    setFocused(false);
    router.push(`/tienda?producto=${id}`);
  };

  const seleccionarServicio = (s: ServicioResultado) => {
    setFocused(false);

    if (s.tipo === 'laser_zona') {
      const zona = encodeURIComponent(s.nombreZonaOriginal || '');
      const genero = s.generoOriginal || 'femenino';
      router.push(`/laser?genero=${genero}&zona=${zona}`);
    } else if (s.tipo === 'laser_promo') {
      const promo = encodeURIComponent(s.nombrePromoOriginal || '');
      const genero = s.generoOriginal || 'femenino';
      router.push(`/laser?genero=${genero}&promo=${promo}`);
    } else {
      if (s.subtipoOriginal) {
        router.push(`/servicios?servicio=${encodeURIComponent(s.subtipoOriginal)}`);
      } else if (s.categoriaOriginal) {
        router.push(`/servicios?categoria=${encodeURIComponent(s.categoriaOriginal)}`);
      } else {
        router.push('/servicios');
      }
    }
  };

  const seleccionarTag = (tag: TagBusqueda) => {
    setQuery(tag.nombre);
    handleSearchSubmit(undefined, tag.nombre);
  };

  return (
    <div ref={containerRef} className="space-y-3 relative z-30">
      {/* Saludo + Botones de Acción (Mis Turnos + Cambio de Tema) */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-white/80">
            ¡Hola! Te damos la bienvenida a
          </p>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            {nombreEmpresa}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Modo Oscuro / Claro */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors border border-white/10 shadow-xs cursor-pointer active:scale-95"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 text-white" />
            )}
          </button>

          {/* Botón Mis Turnos */}
          <Link
            href="/mis-turnos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/10 shadow-xs"
          >
            <Calendar className="h-3.5 w-3.5 text-white" />
            <span>Mis Turnos</span>
          </Link>
        </div>
      </div>

      {/* Input de Búsqueda */}
      <form onSubmit={(e) => handleSearchSubmit(e)} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="¿Qué servicio, promo o producto buscás hoy?"
            className="w-full rounded-2xl border border-stone-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800 py-3 pl-10 pr-9 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-stone-400 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 shadow-xs transition-all"
          />
          {loading ? (
            <Loader2 className="absolute right-3 h-4 w-4 text-[hsl(var(--primary))] animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setProductos([]);
                setServicios([]);
              }}
              className="absolute right-3 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Dropdown de Resultados */}
        {focused && (
          <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-2xl border border-stone-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-3 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[380px] overflow-y-auto">
            {!query.trim() && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
                  Búsquedas populares
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => seleccionarTag(tag)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-[hsl(var(--primary))]/10 hover:text-[hsl(var(--primary))] text-xs font-semibold text-stone-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {tag.nombre}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400 px-1">
                      Escribí para buscar en el catálogo...
                    </span>
                  )}
                </div>
              </div>
            )}

            {servicios.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[hsl(var(--primary))]" /> Servicios, Zonas & Promos Láser
                </p>
                {servicios.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => seleccionarServicio(s)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {s.tipo.includes('laser') ? (
                        <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))] fill-[hsl(var(--primary))]" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                      )}
                      <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200">
                        {s.nombre}
                      </span>
                    </div>
                    {s.precio !== undefined && (
                      <span className="text-xs font-bold text-[hsl(var(--primary))]">
                        ${s.precio.toLocaleString('es-AR')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {productos.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1 flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3 text-[hsl(var(--primary))]" /> Productos en Tienda
                </p>
                {productos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => seleccionarProducto(p.id)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {p.imagen_url ? (
                        <div className="relative h-7 w-7 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={p.imagen_url}
                            alt={p.nombre}
                            fill
                            sizes="28px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-stone-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <ShoppingBag className="h-3.5 w-3.5 text-stone-400" />
                        </div>
                      )}
                      <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200 line-clamp-1">
                        {p.nombre}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[hsl(var(--primary))]">
                      ${p.precio.toLocaleString('es-AR')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {query.trim().length >= 2 &&
              !loading &&
              productos.length === 0 &&
              servicios.length === 0 && (
                <div className="p-3 text-center text-xs text-stone-500 dark:text-zinc-400">
                  No encontramos coincidencias exactas.
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="block mx-auto mt-1 font-bold text-[hsl(var(--primary))] hover:underline cursor-pointer"
                  >
                    Buscar &quot;{query}&quot; en la tienda →
                  </button>
                </div>
              )}
          </div>
        )}
      </form>
    </div>
  );
}
