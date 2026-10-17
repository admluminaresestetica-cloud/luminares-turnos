"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface UnsplashPickerProps {
  onSeleccionarImagen: (url: string) => void;
}

// Banco masivo con muchísima variedad y URLs garantizadas de alta calidad
const BANCO_MASIVO: Record<string, { label: string; fotos: string[] }> = {
  bebes: {
    label: "👶 Bebés & Pañales",
    fotos: [
      "https://images.pexels.com/photos/459957/pexels-photo-459957.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3875217/pexels-photo-3875217.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1556706/pexels-photo-1556706.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3662828/pexels-photo-3662828.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/159293/kids-baby-infant-children-159293.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3279203/pexels-photo-3279203.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2253879/pexels-photo-2253879.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3875204/pexels-photo-3875204.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  },
  perfumeria: {
    label: "✨ Perfumería",
    fotos: [
      "https://images.pexels.com/photos/961794/pexels-photo-961794.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3059406/pexels-photo-3059406.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3985331/pexels-photo-3985331.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/843700/pexels-photo-843700.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/755992/pexels-photo-755992.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3059385/pexels-photo-3059385.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3985356/pexels-photo-3985356.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  },
  skincare: {
    label: "🧴 Skincare",
    fotos: [
      "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3737579/pexels-photo-3737579.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/5069412/pexels-photo-5069412.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4465121/pexels-photo-4465121.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  },
  regalos: {
    label: "🎁 Regalos & Deco",
    fotos: [
      "https://images.pexels.com/photos/264787/pexels-photo-264787.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1687141/pexels-photo-1687141.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/5728292/pexels-photo-5728292.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/6269363/pexels-photo-6269363.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/5872364/pexels-photo-5872364.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  },
  estetica: {
    label: "💎 Estética",
    fotos: [
      "https://images.pexels.com/photos/3985326/pexels-photo-3985326.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/5069430/pexels-photo-5069430.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3985358/pexels-photo-3985358.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/5069357/pexels-photo-5069357.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  },
  fitness: {
    label: "💪 Fitness",
    fotos: [
      "https://images.pexels.com/photos/4162448/pexels-photo-4162448.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  },
  navidad: {
    label: "🎄 Navidad",
    fotos: [
      "https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/5728292/pexels-photo-5728292.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/713661/pexels-photo-713661.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3303615/pexels-photo-3303615.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/5727928/pexels-photo-5727928.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  },
};

export function UnsplashPicker({ onSeleccionarImagen }: UnsplashPickerProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<string>("bebes");
  const [imagenesRotas, setImagenesRotas] = useState<Record<string, boolean>>({});

  const categoriaActual = BANCO_MASIVO[categoriaActiva] || BANCO_MASIVO["bebes"];

  const handleImageError = (url: string) => {
    setImagenesRotas((prev) => ({ ...prev, [url]: true }));
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Galería de Fondos Seleccionados
        </span>
      </div>

      {/* Pestañas de Categorías */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-none">
        {Object.keys(BANCO_MASIVO).map((key) => {
          const item = BANCO_MASIVO[key];
          const isActive = categoriaActiva === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCategoriaActiva(key)}
              className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Grilla Amplia con scroll propio que muestra todas las fotos sin cortes */}
      <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
        {categoriaActual.fotos.map((url, idx) => {
          if (imagenesRotas[url]) return null; // Oculta automáticamente si alguna URL falla

          return (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => onSeleccionarImagen(url)}
              className="relative h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 hover:scale-105 transition-all cursor-pointer group bg-slate-100 dark:bg-zinc-800 shadow-xs"
            >
              <img
                src={url}
                alt="Fondo de stock"
                onError={() => handleImageError(url)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white drop-shadow-md" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}