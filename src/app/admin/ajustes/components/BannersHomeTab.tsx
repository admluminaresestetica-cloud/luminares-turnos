'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ImagePlus, Trash2, Check, X, Tag, Link as LinkIcon, MoveUp, MoveDown, Loader2 } from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BannerHome {
  id: string;
  titulo: string;
  subtitulo: string;
  imagen_url: string;
  cupon_codigo: string;
  link_destino: string;
  activo: boolean;
  orden: number;
}

export default function BannersHomeTab() {
  const [banners, setBanners] = useState<BannerHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);

  // Formulario nuevo banner
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [cupon, setCupon] = useState('');
  const [linkDestino, setLinkDestino] = useState('/laser');
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const cargarBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banners_home')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error al cargar banners:', error);
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarBanners();
  }, []);

  const handleSeleccionarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivoImagen(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGuardarBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !archivoImagen) {
      alert('Por favor ingresá un título y seleccioná una imagen.');
      return;
    }

    setSubiendo(true);
    try {
      // 1. Subir imagen al bucket banners-home
      const extension = archivoImagen.name.split('.').pop();
      const nombreArchivo = `${Date.now()}.${extension}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('banners-home')
        .upload(nombreArchivo, archivoImagen, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: urlData } = supabase.storage.from('banners-home').getPublicUrl(uploadData.path);
      const imagen_url = urlData.publicUrl;

      // 3. Insertar registro en DB
      const { error: dbError } = await supabase.from('banners_home').insert([
        {
          titulo,
          subtitulo,
          imagen_url,
          cupon_codigo: cupon.toUpperCase().trim() || null,
          link_destino: linkDestino,
          orden: banners.length + 1,
          activo: true,
        },
      ]);

      if (dbError) throw dbError;

      // Reset
      setTitulo('');
      setSubtitulo('');
      setCupon('');
      setLinkDestino('/laser');
      setArchivoImagen(null);
      setPreviewUrl(null);
      await cargarBanners();
    } catch (err: any) {
      console.error('Error guardando banner:', err);
      alert('Ocurrió un error al guardar el banner: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const toggleEstadoBanner = async (id: string, estadoActual: boolean) => {
    const { error } = await supabase
      .from('banners_home')
      .update({ activo: !estadoActual })
      .eq('id', id);

    if (!error) {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, activo: !estadoActual } : b))
      );
    }
  };

  const eliminarBanner = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este banner?')) return;

    const { error } = await supabase.from('banners_home').delete().eq('id', id);
    if (!error) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulario de carga */}
      <form onSubmit={handleGuardarBanner} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-emerald-600" />
          Agregar Nuevo Banner Promocional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
              Título Principal (Ej: 15% OFF en Tratamientos)
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 15% OFF en Láser"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
              Subtítulo / Botón (Ej: Ver Promos)
            </label>
            <input
              type="text"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              placeholder="Ej: Ver Promos"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
              Código de Cupón (Opcional, Ej: LUMINARES15)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={cupon}
                onChange={(e) => setCupon(e.target.value)}
                placeholder="CUPON15"
                className="w-full pl-9 rounded-xl border border-slate-200 p-2.5 text-sm font-semibold uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
              Ruta de Destino
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select
                value={linkDestino}
                onChange={(e) => setLinkDestino(e.target.value)}
                className="w-full pl-9 rounded-xl border border-slate-200 p-2.5 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="/laser">Sección Láser</option>
                <option value="/tienda">Tienda Online</option>
                <option value="/servicios">Servicios Generales</option>
              </select>
            </div>
          </div>
        </div>

        {/* Carga de Imagen */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
            Imagen del Banner (Formato horizontal / Banner móvil)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleSeleccionarImagen}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-zinc-800 dark:file:text-zinc-200"
          />
          {previewUrl && (
            <div className="mt-3 relative h-32 w-full max-w-md rounded-2xl overflow-hidden border">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={subiendo}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 flex items-center gap-2"
        >
          {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {subiendo ? 'Guardando Banner...' : 'Publicar Banner'}
        </button>
      </form>

      {/* Lista de Banners Activos */}
      <div className="space-y-3">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
          Banners Configurados ({banners.length})
        </h4>

        {loading ? (
          <p className="text-xs text-slate-400">Cargando banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-xs text-slate-400">No hay banners configurados aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className={`relative flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                  b.activo
                    ? 'border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                    : 'border-slate-200/50 bg-slate-50/50 opacity-60 dark:bg-zinc-950'
                }`}
              >
                <img
                  src={b.imagen_url}
                  alt={b.titulo}
                  className="h-20 w-28 object-cover rounded-xl shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 truncate">
                    {b.titulo}
                  </p>
                  {b.cupon_codigo && (
                    <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Cupón: {b.cupon_codigo}
                    </span>
                  )}
                  <p className="text-[11px] text-slate-500 truncate">Destino: {b.link_destino}</p>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => toggleEstadoBanner(b.id, b.activo)}
                    title={b.activo ? 'Desactivar' : 'Activar'}
                    className={`p-1.5 rounded-lg border text-xs ${
                      b.activo
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    {b.activo ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => eliminarBanner(b.id)}
                    title="Eliminar"
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
