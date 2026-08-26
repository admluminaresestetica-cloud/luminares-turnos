"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, LayoutGrid, X, Check } from "lucide-react";

interface BuscadorYCategoriasProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  categorias: string[];
  categoriaSeleccionada: string;
  onCategoriaSelect: (cat: string) => void;
}

export default function BuscadorYCategorias({
  busqueda,
  onBusquedaChange,
  categorias,
  categoriaSeleccionada,
  onCategoriaSelect,
}: BuscadorYCategoriasProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const seleccionarCategoria = (cat: string) => {
    onCategoriaSelect(cat);
    setMenuAbierto(false);
  };

  return (
    <div className="relative mb-8 space-y-4" ref={menuRef}>
      <div className="flex flex-col sm:flex-row items-center gap-3">

        {/* Botón Desplegable de Categorías */}
        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className={`flex w-full sm:w-auto items-center justify-between gap-2.5 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              menuAbierto || categoriaSeleccionada !== "Todos"
                ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/15"
                : "border-slate-200 bg-white text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span>
                {categoriaSeleccionada === "Todos"
                  ? "Categorías"
                  : categoriaSeleccionada}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                menuAbierto ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Menú Desplegable (Mega Menu Grid) */}
          {menuAbierto && (
            <div className="absolute left-0 top-full z-40 mt-2 w-full sm:w-[420px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Explorar Categorías
                </span>
                <button
                  type="button"
                  onClick={() => setMenuAbierto(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Grid de Categorías con 'Ver todo' destacado */}
              <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">

                {/* Opción 'Ver todo' */}
                <button
                  type="button"
                  onClick={() => seleccionarCategoria("Todos")}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200 text-left cursor-pointer ${
                    categoriaSeleccionada === "Todos"
                      ? "bg-slate-900 text-white font-semibold shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Ver todo</span>
                  {categoriaSeleccionada === "Todos" && (
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                  )}
                </button>

                {/* Resto de las Categorías de la BD */}
                {categorias
                  .filter((cat) => cat !== "Todos")
                  .map((cat) => {
                    const esSeleccionada = categoriaSeleccionada === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => seleccionarCategoria(cat)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200 text-left cursor-pointer ${
                          esSeleccionada
                            ? "bg-slate-900 text-white font-semibold shadow-sm"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {esSeleccionada && (
                          <Check className="h-3.5 w-3.5 text-white shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Buscador de Productos */}
        <div className="group relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-slate-900" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 shadow-xs outline-none transition-all duration-200 focus:border-slate-900 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-slate-900/[0.06]"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-slate-500 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}