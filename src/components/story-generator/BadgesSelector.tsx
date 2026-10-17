"use client";

import { BadgeTipo } from "@/types/story";

interface BadgesSelectorProps {
  badgeSeleccionado: BadgeTipo;
  onChangeBadge: (badge: BadgeTipo) => void;
}

const LISTA_BADGES: { id: BadgeTipo; texto: string; emoji: string }[] = [
  { id: "ninguno", texto: "Sin etiqueta", emoji: "🚫" },
  { id: "ultimas_unidades", texto: "Últimas unidades", emoji: "🔥" },
  { id: "mas_vendido", texto: "Más vendido", emoji: "⭐" },
  { id: "oferta", texto: "Oferta especial", emoji: "💥" },
  { id: "envio_gratis", texto: "Envío gratis", emoji: "🚚" },
  { id: "nuevo", texto: "Nuevo ingreso", emoji: "✨" },
  { id: "cyberweek", texto: "Cyber Week", emoji: "⚡" },
  { id: "descuento_20", texto: "20% OFF", emoji: "🏷️" },
  { id: "descuento_50", texto: "50% OFF", emoji: "🔥" },
];

export function BadgesSelector({
  badgeSeleccionado,
  onChangeBadge,
}: BadgesSelectorProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        Etiqueta o Sello Promocional
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {LISTA_BADGES.map((b) => {
          const isSelected = badgeSeleccionado === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onChangeBadge(b.id)}
              className={`flex items-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold text-left transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400/30"
                  : "bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80"
              }`}
            >
              <span className="text-xs shrink-0">{b.emoji}</span>
              <span className="truncate">{b.texto}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}