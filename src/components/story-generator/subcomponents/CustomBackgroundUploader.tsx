"use client";

import { useRef } from "react";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";

interface CustomBackgroundUploaderProps {
  imagenFondo?: string;
  onSeleccionarImagen: (base64Url: string | undefined) => void;
}

export function CustomBackgroundUploader({
  imagenFondo,
  onSeleccionarImagen,
}: CustomBackgroundUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSeleccionarImagen(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        Fondo Propio / Foto Personalizada
      </span>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {imagenFondo ? (
        <div className="relative flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={imagenFondo}
              alt="Fondo personalizado"
              className="w-10 h-10 object-cover rounded-lg border border-slate-300 dark:border-zinc-600 shrink-0"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 truncate">
              Imagen personalizada activa
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSeleccionarImagen(undefined)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
            title="Quitar imagen de fondo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4 text-emerald-500" />
          <span>Subir imagen desde mi dispositivo</span>
        </button>
      )}
    </div>
  );
}