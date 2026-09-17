'use client';

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Banner {
  id: string;
  imagen_url: string;
  titulo?: string;
  activo: boolean;
  orden: number;
}

export default function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);

  const cargarBanners = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("banners_tienda")
      .select("*")
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error al obtener banners:", error);
    } else {
      setBanners(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarBanners();
  }, []);

  const handleSubirBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) return alert("Por favor seleccioná una imagen.");

    setSubiendo(true);

    try {
      // 1. Nombre único para la imagen
      const fileExt = archivo.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // 2. Subir al Bucket 'bannersprincipaltienda'
      const { error: uploadError } = await supabase.storage
        .from("bannersprincipaltienda")
        .upload(fileName, archivo);

      if (uploadError) throw uploadError;

      // 3. Obtener la URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from("bannersprincipaltienda")
        .getPublicUrl(fileName);

      // 4. Insertar fila en la tabla 'banners_tienda'
      const { error: dbError } = await supabase.from("banners_tienda").insert([
        {
          imagen_url: publicUrlData.publicUrl,
          titulo: titulo || "Banner Promocional",
          activo: true,
          orden: banners.length + 1,
        },
      ]);

      if (dbError) throw dbError;

      // Resetear campos y recargar
      setTitulo("");
      setArchivo(null);
      await cargarBanners();
    } catch (err: any) {
      console.error("Error al subir el banner:", err);
      alert("Hubo un error al guardar el banner.");
    } finally {
      setSubiendo(false);
    }
  };

  const toggleEstado = async (id: string, estadoActual: boolean) => {
    const { error } = await supabase
      .from("banners_tienda")
      .update({ activo: !estadoActual })
      .eq("id", id);

    if (!error) {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, activo: !estadoActual } : b))
      );
    }
  };

  const eliminarBanner = async (id: string, imagenUrl: string) => {
    if (!confirm("¿Seguro que querés eliminar este banner?")) return;

    try {
      // Intentar extraer el nombre del archivo de la URL pública
      const fileName = imagenUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("bannersprincipaltienda").remove([fileName]);
      }

      const { error } = await supabase
        .from("banners_tienda")
        .delete()
        .eq("id", id);

      if (!error) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar banner:", err);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Formulario de Carga */}
      <div className="rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <h3 className="m-0 mb-4 text-base font-bold text-[#12151B] sm:text-lg">
          🖼️ Añadir Nuevo Banner
        </h3>

        <form onSubmit={handleSubirBanner} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Título Promocional (Opcional)
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 20% OFF en Cremas"
              className="h-11 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 text-sm outline-none transition-colors focus:border-[#0E6E55] focus:bg-white focus:ring-2 focus:ring-[#0E6E55]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Imagen del Banner
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-dashed border-[#E7E5E0] bg-[#F7F7F5] p-3 text-xs text-gray-500 outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-[#12151B] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-black"
            />
          </div>

          <button
            type="submit"
            disabled={subiendo || !archivo}
            className="h-11 w-full rounded-xl bg-[#0E6E55] text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {subiendo ? "Subiendo..." : "Guardar Banner"}
          </button>
        </form>
      </div>

      {/* Lista de Banners */}
      <div className="rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <h3 className="m-0 mb-4 text-base font-bold text-[#12151B] sm:text-lg">
          Banners Registrados
        </h3>

        {cargando ? (
          <p className="text-sm text-gray-500">Cargando banners...</p>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-3xl">🖼️</span>
            <p className="mt-2 text-xs text-gray-500">No hay banners configurados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((b) => (
              <div
                key={b.id}
                className="overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                  <img
                    src={b.imagen_url}
                    alt={b.titulo}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm ${
                      b.activo ? "bg-[#0E6E55]" : "bg-gray-500"
                    }`}
                  >
                    {b.activo ? "ACTIVO" : "PAUSADO"}
                  </span>
                </div>

                <div className="p-3.5">
                  <span className="block truncate text-sm font-semibold text-[#12151B]">
                    {b.titulo || "Sin título"}
                  </span>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => toggleEstado(b.id, b.activo)}
                      className="h-9 flex-1 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:scale-95"
                    >
                      {b.activo ? "Pausar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminarBanner(b.id, b.imagen_url)}
                      className="h-9 flex-1 rounded-lg bg-red-100 text-xs font-semibold text-red-600 transition-colors hover:bg-red-200 active:scale-95"
                    >
                      Eliminar
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