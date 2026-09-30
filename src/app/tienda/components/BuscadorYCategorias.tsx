"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Flame, ArrowUpDown, Check } from "lucide-react";

interface BuscadorYCategoriasProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  categorias: string[];
  categoriaSeleccionada: string;
  onCategoriaSelect: (cat: string) => void;
  ordenarPor: string;
  onOrdenarChange: (val: string) => void;
}

const OpcionesOrden = [
  { id: "destacados", label: "Destacados" },
  { id: "precio-asc", label: "Precio: Menor a Mayor" },
  { id: "precio-desc", label: "Precio: Mayor a Menor" },
  { id: "descuento", label: "Mayor Descuento" },
];

export default function BuscadorYCategorias({
  busqueda,
  onBusquedaChange,
  categorias,
  categoriaSeleccionada,
  onCategoriaSelect,
  ordenarPor,
  onOrdenarChange,
}: BuscadorYCategoriasProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const esOfertasActivo = categoriaSeleccionada === "Ofertas";
  const opcionActual = OpcionesOrden.find((o) => o.id === ordenarPor)?.label || "Ordenar";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mb-8 space-y-4">
      {/* Fila Superior: Buscador y Filtro de Orden */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="group relative flex-1 w-full transition-transform duration-150 active:scale-[0.99]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-full border border-border bg-slate-50 dark:bg-zinc-900 py-3.5 pl-11 pr-10 text-sm text-foreground placeholder-muted-foreground shadow-xs outline-none transition-all duration-200 focus:border-slate-900 dark:focus:border-zinc-100 focus:bg-card focus:shadow-md focus:ring-4 focus:ring-slate-900/[0.06] dark:focus:ring-zinc-100/[0.06]"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Botón y Menú de Orden */}
        <div className="relative w-full sm:w-auto shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex w-full sm:w-auto items-center justify-between gap-2.5 rounded-full border border-border bg-card px-4 py-3 sm:py-2.5 text-sm text-foreground shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
          >
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-foreground">{opcionActual}</span>
            </span>
          </button>

          {menuAbierto && (
            <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-64 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-slate-900/10 dark:shadow-black/40 z-50 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex flex-col gap-1">
                {OpcionesOrden.map((op) => {
                  const seleccionado = ordenarPor === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        onOrdenarChange(op.id);
                        setMenuAbierto(false);
                      }}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-[0.98] ${
                        seleccionado
                          ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      <span>{op.label}</span>
                      {seleccionado && <Check className="h-4 w-4 text-white dark:text-zinc-900" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fila Inferior: Tira Horizontal de Categorías */}
      <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto scroll-smooth py-1 font-medium text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => onCategoriaSelect("Todos")}
          className={`shrink-0 rounded-full px-4 py-2.5 transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95 ${
            categoriaSeleccionada === "Todos"
              ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-md shadow-slate-900/15 dark:shadow-black/20"
              : "border border-border bg-card text-foreground hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-accent"
          }`}
        >
          Ver todo
        </button>

        <button
          type="button"
          onClick={() => onCategoriaSelect(esOfertasActivo ? "Todos" : "Ofertas")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 font-bold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95 ${
            esOfertasActivo
              ? "bg-[#0E6E55] dark:bg-emerald-600 text-white shadow-md shadow-[#0E6E55]/20 ring-2 ring-[#0E6E55] dark:ring-emerald-500"
              : "bg-[#E6F4EA] dark:bg-emerald-950/50 text-[#0E6E55] dark:text-emerald-400 border border-[#A3E0BF] dark:border-emerald-800/60 hover:bg-[#D1EBD9] dark:hover:bg-emerald-900/50"
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>Ofertas</span>
        </button>

        {categorias
          .filter((cat) => cat !== "Todos" && cat !== "Ofertas")
          .map((cat) => {
            const esSeleccionada = categoriaSeleccionada === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoriaSelect(cat)}
                className={`shrink-0 rounded-full px-4 py-2.5 transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95 ${
                  esSeleccionada
                    ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-md shadow-slate-900/15 dark:shadow-black/20"
                    : "border border-border bg-card text-foreground hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            );
          })}
      </div>
    </div>
  );
}
