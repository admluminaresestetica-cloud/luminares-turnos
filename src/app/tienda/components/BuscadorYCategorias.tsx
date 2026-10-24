"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Flame, ArrowUpDown, Check, SlidersHorizontal } from "lucide-react";

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
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const esOfertasActivo = categoriaSeleccionada === "Ofertas";
  const tieneFiltroActivo = categoriaSeleccionada !== "Todos";
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
    <div className="relative mb-6 space-y-3">
      {/* Fila Superior: Buscador + Botón Categorías + Filtro de Orden */}
      <div className="flex items-center gap-2">
        {/* Campo de Búsqueda */}
        <div className="group relative flex-1 transition-transform duration-150 active:scale-[0.99]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500 transition-colors duration-200 group-focus-within:text-[#0E6E55] dark:group-focus-within:text-emerald-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-full border border-slate-200/90 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80 py-2.5 pl-10 pr-9 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 shadow-2xs outline-none transition-all duration-200 focus:border-[#0E6E55]/60 dark:focus:border-emerald-500/60 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#0E6E55]/10"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 bg-slate-200/80 dark:bg-zinc-800 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Botón para Desplegar Categorías */}
        <button
          type="button"
          onClick={() => setMostrarCategorias(!mostrarCategorias)}
          className={`flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer ${
            mostrarCategorias || tieneFiltroActivo
              ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] dark:border-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400"
              : "border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 stroke-[2.2]" />
          <span className="hidden sm:inline">Categorías</span>
          {tieneFiltroActivo && (
            <span className="h-2 w-2 rounded-full bg-[#0E6E55] dark:bg-emerald-400 animate-pulse" />
          )}
        </button>

        {/* Botón y Menú de Orden */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-all active:scale-[0.98]"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
            <span className="hidden sm:inline">{opcionActual}</span>
          </button>

          {menuAbierto && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-xl shadow-slate-900/10 dark:shadow-zinc-950/50 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                        seleccionado
                          ? "bg-[#0E6E55] text-white shadow-xs"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span>{op.label}</span>
                      {seleccionado && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fila Inferior: Tira Horizontal Desplegable de Categorías */}
      {mostrarCategorias && (
        <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto scroll-smooth py-1 font-medium text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={() => onCategoriaSelect("Todos")}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95 ${
              categoriaSeleccionada === "Todos"
                ? "bg-[#0E6E55] text-white shadow-md shadow-[#0E6E55]/25"
                : "border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800"
            }`}
          >
            Ver todo
          </button>

          <button
            type="button"
            onClick={() => onCategoriaSelect(esOfertasActivo ? "Todos" : "Ofertas")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95 ${
              esOfertasActivo
                ? "bg-[#0E6E55] text-white shadow-md shadow-[#0E6E55]/25 ring-2 ring-[#0E6E55]/30"
                : "bg-[#E6F4EA] dark:bg-emerald-950/40 text-[#0E6E55] dark:text-emerald-400 border border-[#A3E0BF] dark:border-emerald-800/60 hover:bg-[#D1EBD9] dark:hover:bg-emerald-900/40"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
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
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95 ${
                    esSeleccionada
                      ? "bg-[#0E6E55] text-white shadow-md shadow-[#0E6E55]/25"
                      : "border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
