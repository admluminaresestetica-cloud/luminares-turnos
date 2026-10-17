"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";

interface UnsplashPickerProps {
  onSeleccionarImagen: (url: string) => void;
}

const CATEGORIAS_RAPIDAS = [
  { label: "🌿 Naturaleza / Hojas", query: "hojas" },
  { label: "🎄 Navidad", query: "navidad" },
  { label: "🪵 Madera", query: "madera" },
  { label: "✨ Fiestas / Luces", query: "fiesta" },
  { label: "🔮 Neón", query: "neon" },
  { label: "👶 Bebé", query: "bebe" },
];

// Colección curada de fondos de stock HD 100% garantizados y clasificados
const BANCO_FONDOS: Record<string, string[]> = {
  hojas: [
    "https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/113338/pexels-photo-113338.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1089440/pexels-photo-1089440.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  navidad: [
    "https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/5728292/pexels-photo-5728292.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3303615/pexels-photo-3303615.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/713661/pexels-photo-713661.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3303614/pexels-photo-3303614.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/5727928/pexels-photo-5727928.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  madera: [
    "https://images.pexels.com/photos/1297311/pexels-photo-1297311.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/172276/pexels-photo-172276.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/301703/pexels-photo-301703.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/207300/pexels-photo-207300.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  fiesta: [
    "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/949587/pexels-photo-949587.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  neon: [
    "https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2603464/pexels-photo-2603464.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  bebe: [
    "https://images.pexels.com/photos/459957/pexels-photo-459957.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3875217/pexels-photo-3875217.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3875225/pexels-photo-3875225.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3875211/pexels-photo-3875211.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
};

export function UnsplashPicker({ onSeleccionarImagen }: UnsplashPickerProps) {
  const [query, setQuery] = useState("hojas");
  const [fotos, setFotos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  const buscarImagenes = (term: string) => {
    if (!term.trim()) return;
    setCargando(true);

    const termLimpio = term.trim().toLowerCase();

    setTimeout(() => {
      // Búsqueda inteligente por coincidencias de categoría
      let claveEncontrada = Object.keys(BANCO_FONDOS).find((k) =>
        termLimpio.includes(k) || k.includes(termLimpio)
      );

      // Mapeo especial para palabras comunes
      if (!claveEncontrada) {
        if (termLimpio.includes("green") || termLimpio.includes("leaf") || termLimpio.includes("planta") || termLimpio.includes("naturaleza")) {
          claveEncontrada = "hojas";
        } else if (termLimpio.includes("wood") || termLimpio.includes("tabla")) {
          claveEncontrada = "madera";
        } else if (termLimpio.includes("party") || termLimpio.includes("luz") || termLimpio.includes("sparkle")) {
          claveEncontrada = "fiesta";
        } else if (termLimpio.includes("christmas") || termLimpio.includes("pino") || termLimpio.includes("regalo")) {
          claveEncontrada = "navidad";
        } else if (termLimpio.includes("baby") || termLimpio.includes("pañal") || termLimpio.includes("nube")) {
          claveEncontrada = "bebe";
        } else {
          claveEncontrada = "hojas"; // Categoria por defecto de alta calidad
        }
      }

      setFotos(BANCO_FONDOS[claveEncontrada] || BANCO_FONDOS["hojas"]);
      setCargando(false);
    }, 150);
  };

  useEffect(() => {
    buscarImagenes("hojas");
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buscarImagenes(query);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Fondos de Stock (HD Confiable)
        </span>
      </div>

      {/* Buscador de fotos */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar fotos (ej: hojas, bebe, madera, navidad)..."
          className="w-full bg-slate-100 dark:bg-zinc-800 text-xs font-semibold px-3 py-2 pr-8 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-zinc-200 placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Chips Rápidos */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIAS_RAPIDAS.map((cat) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => {
              setQuery(cat.query);
              buscarImagenes(cat.query);
            }}
            className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grilla de Fotografías */}
      {cargando ? (
        <div className="flex items-center justify-center py-6 text-emerald-500">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
          {fotos.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => onSeleccionarImagen(url)}
              className="relative h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 hover:scale-102 transition-all cursor-pointer group bg-slate-100 dark:bg-zinc-800"
            >
              <img
                src={url}
                alt="Fondo de stock"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}