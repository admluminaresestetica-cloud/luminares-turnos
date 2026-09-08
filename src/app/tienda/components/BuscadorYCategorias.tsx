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

  // Cerrar el menú si se hace click fuera
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
      {/* Fila Superior: Buscador y Filtro de Orden Personalizado */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-slate-500 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Botón y Menú Desplegable de Orden Personalizado (Estilo App) */}
        <div className="relative w-full sm:w-auto shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex w-full sm:w-auto items-center justify-between gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-xs hover:border-slate-300 cursor-pointer transition-all active:scale-98"
          >
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-slate-800">{opcionActual}</span>
            </span>
          </button>

          {/* Menú Flotante Estilo App */}
          {menuAbierto && (
            <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-900/10 z-50 animate-[fadeIn_0.15s_ease-out]">
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
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        seleccionado
                          ? "bg-slate-900 text-white font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{op.label}</span>
                      {seleccionado && <Check className="h-4 w-4 text-white" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fila Inferior: Tira Horizontal Desplazable de Categorías */}
      <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto scroll-smooth py-1 font-medium text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => onCategoriaSelect("Todos")}
          className={`shrink-0 rounded-full px-4 py-2.5 transition-all duration-200 cursor-pointer whitespace-nowrap ${
            categoriaSeleccionada === "Todos"
              ? "bg-slate-900 text-white font-semibold shadow-md shadow-slate-900/15"
              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          Ver todo
        </button>

        <button
          type="button"
          onClick={() => onCategoriaSelect(esOfertasActivo ? "Todos" : "Ofertas")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
            esOfertasActivo
              ? "bg-[#0E6E55] text-white shadow-md shadow-[#0E6E55]/20 ring-2 ring-[#0E6E55]"
              : "bg-[#E6F4EA] text-[#0E6E55] border border-[#A3E0BF] hover:bg-[#D1EBD9]"
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
                className={`shrink-0 rounded-full px-4 py-2.5 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  esSeleccionada
                    ? "bg-slate-900 text-white font-semibold shadow-md shadow-slate-900/15"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
