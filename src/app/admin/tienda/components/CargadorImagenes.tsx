"use client";

import { X } from "lucide-react";

interface CargadorImagenesProps {
  totalImagenes: number;
  imagenesExistentes: string[];
  previewsNuevas: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  eliminarExistente: (index: number) => void;
  eliminarNueva: (index: number) => void;
}

export default function CargadorImagenes({
  totalImagenes,
  imagenesExistentes,
  previewsNuevas,
  handleFileChange,
  eliminarExistente,
  eliminarNueva,
}: CargadorImagenesProps) {
  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-zinc-400">
        Imágenes del Producto{" "}
        <span className="font-normal text-gray-400 dark:text-zinc-500">
          ({totalImagenes} cargadas)
        </span>
      </label>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="w-full rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-3 text-xs text-gray-900 dark:text-zinc-100 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 dark:file:bg-zinc-700 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-white hover:file:bg-gray-800 dark:hover:file:bg-zinc-600 transition-colors cursor-pointer"
      />

      {totalImagenes > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {imagenesExistentes.map((url, idx) => (
            <div
              key={`exist-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 shadow-xs"
            >
              <img
                src={url}
                alt={`Imagen ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                #{idx + 1} {idx === 0 && "★"}
              </span>
              <button
                type="button"
                onClick={() => eliminarExistente(idx)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-95 transition-all hover:bg-red-700 active:scale-95 shadow-xs"
                title="Eliminar imagen"
              >
                <X className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          ))}

          {previewsNuevas.map((previewUrl, idx) => {
            const numeroImg = imagenesExistentes.length + idx + 1;
            return (
              <div
                key={`new-${idx}`}
                className="group relative aspect-square overflow-hidden rounded-xl border-2 border-[#0E6E55]/60 bg-gray-100 dark:bg-zinc-800 shadow-xs"
              >
                <img
                  src={previewUrl}
                  alt={`Nueva ${numeroImg}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-1 top-1 rounded-md bg-[#0E6E55] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  #{numeroImg} {numeroImg === 1 && "★"}
                </span>
                <button
                  type="button"
                  onClick={() => eliminarNueva(idx)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-95 transition-all hover:bg-red-700 active:scale-95 shadow-xs"
                  title="Eliminar imagen"
                >
                  <X className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}