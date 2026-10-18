'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ImagePlus, Trash2, Pause, Play, Loader2, Video } from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BannerModalItem {
  id: string;
  imagen_url: string;
  titulo?: string;
  activo: boolean;
  orden: number;
}

export default function BannerModalTab() {
  const [banners, setBanners] = useState<BannerModalItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const cargarBanners = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error al obtener banners modales:', error);
    } else {
      setBanners(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarBanners();
  }, []);

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivo(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubirBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) return alert('Por favor seleccioná una imagen o video.');

    setSubiendo(true);

    try {
      const fileExt = archivo.name.split('.').pop();
      const fileName = `modal_${Date.now()}.${fileExt}`;

      // Subir al bucket 'imagenes-banner'
      const { error: uploadError } = await supabase.storage
        .from('imagenes-banner')
        .upload(fileName, archivo);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('imagenes-banner')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('banners').insert([
        {
          imagen_url: publicUrlData.publicUrl,
          titulo: titulo.trim() ? titulo : null,
          activo: true,
          orden: banners.length + 1,
        },
      ]);

      if (dbError) throw dbError;

      setTitulo('');
      setArchivo(null);
      setPreviewUrl(null);
      await cargarBanners();
    } catch (err: any) {
      console.error('Error al subir el banner modal:', err);
      alert('Hubo un error al guardar el banner: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const toggleEstado = async (id: string, estadoActual: boolean) => {
    const { error } = await supabase
      .from('banners')
      .update({ activo: !estadoActual })
      .eq('id', id);

    if (!error) {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, activo: !estadoActual } : b))
      );
    }
  };

  const eliminarBanner = async (id: string, imagenUrl: string) => {
    if (!confirm('¿Seguro que querés eliminar este banner modal?')) return;

    try {
      const fileName = imagenUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('imagenes-banner').remove([fileName]);
      }

      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (!error) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error al eliminar banner:', err);
    }
  };

  const esVideo = (url: string) => {
    return url?.toLowerCase().endsWith('.mp4') || url?.toLowerCase().endsWith('.webm');
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Carga */}
      <form onSubmit={handleSubirBanner} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-rose-500" />
          Añadir Banner Modal Emergente (Pantalla Completa al Entrar)
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
            Título / Descripción (Opcional)
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: ¡Aviso Importante / Nueva Promo!"
            className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
            Imagen o Video (MP4/WebM)
          </label>
          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={handleArchivoChange}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-zinc-800 dark:file:text-zinc-200"
          />
          {previewUrl && (
            <div className="mt-3 relative h-40 w-full max-w-sm rounded-2xl overflow-hidden border">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={subiendo || !archivo}
          className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2"
        >
          {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {subiendo ? 'Subiendo...' : 'Guardar Banner Modal'}
        </button>
      </form>

      {/* Lista de Banners Modales Registrados */}
      <div className="space-y-3">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
          Banners Modales Registrados ({banners.length})
        </h4>

        {cargando ? (
          <p className="text-xs text-slate-400">Cargando banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-xs text-slate-400">No hay banners modales configurados aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
                  {esVideo(b.imagen_url) ? (
                    <video
                      src={b.imagen_url}
                      className="h-full w-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={b.imagen_url}
                      alt={b.titulo || 'Banner'}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <span
                    className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                      b.activo ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  >
                    {b.activo ? 'ACTIVO' : 'PAUSADO'}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {b.titulo || 'Sin título'}
                  </span>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleEstado(b.id, b.activo)}
                      title={b.activo ? 'Pausar' : 'Activar'}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      {b.activo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => eliminarBanner(b.id, b.imagen_url)}
                      title="Eliminar"
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}