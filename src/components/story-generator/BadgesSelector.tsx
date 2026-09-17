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
];

export function BadgesSelector({
  badgeSeleccionado,
  onChangeBadge,
}: BadgesSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Etiqueta Promocional
      </span>
      <div className="grid grid-cols-2 gap-1.5">
        {LISTA_BADGES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onChangeBadge(b.id)}
            className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all text-left flex items-center gap-1.5 ${
              badgeSeleccionado === b.id
                ? "bg-emerald-600 text-white font-semibold shadow-sm"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            <span>{b.emoji}</span>
            <span className="truncate">{b.texto}</span>
          </button>
        ))}
      </div>
    </div>
  );
}