"use client";

import { Wand2, Layers, Shield, Sparkles } from "lucide-react";
import { SombraProducto, BordeProducto, StickerDecorativo } from "@/types/story";

interface ProductEffectsControlProps {
  sombra: SombraProducto;
  borde: BordeProducto;
  sticker: StickerDecorativo;
  onChangeSombra: (sombra: SombraProducto) => void;
  onChangeBorde: (borde: BordeProducto) => void;
  onChangeSticker: (sticker: StickerDecorativo) => void;
}

export function ProductEffectsControl({
  sombra = "ninguna",
  borde = "ninguno",
  sticker = "ninguno",
  onChangeSombra,
  onChangeBorde,
  onChangeSticker,
}: ProductEffectsControlProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Efectos & Estilos de Producto
        </span>
      </div>

      {/* Sombra 3D */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
          <Layers className="w-3 h-3 text-indigo-500" /> Sombra 3D del Producto
        </span>
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: "ninguna", label: "Plano" },
            { id: "suave", label: "Suave" },
            { id: "profunda", label: "3D Pro" },
            { id: "neon", label: "Neón" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeSombra(item.id as SombraProducto)}
              className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                sombra === item.id
                  ? "bg-indigo-500 text-white border-transparent shadow-xs"
                  : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Borde / Contenedor */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
          <Shield className="w-3 h-3 text-emerald-500" /> Marco o Borde
        </span>
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: "ninguno", label: "Libre" },
            { id: "blanco", label: "Blanco" },
            { id: "dorado", label: "Dorado" },
            { id: "fino_sutil", label: "Fino" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeBorde(item.id as BordeProducto)}
              className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                borde === item.id
                  ? "bg-emerald-600 text-white border-transparent shadow-xs"
                  : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stickers / Insignias Decorativas */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Insignia Decorativa
        </span>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: "ninguno", label: "Ninguna" },
            { id: "oferta_estrella", label: "⭐ Estrella" },
            { id: "copo_nieve", label: "❄️ Copo Nieve" },
            { id: "lazo_regalo", label: "🎁 Lazo Regalo" },
            { id: "corona_oro", label: "👑 Corona Oro" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeSticker(item.id as StickerDecorativo)}
              className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all truncate px-1 cursor-pointer ${
                sticker === item.id
                  ? "bg-amber-500 text-white border-transparent shadow-xs"
                  : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}