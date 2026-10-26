"use client";

import React, { useState } from "react";
import { Printer, Megaphone, Sparkles, Tag, Layers, Search } from "lucide-react";

type TipoCartel = "oferta" | "2x1" | "combo" | "nuevo";
type TamanoCartel = "a4" | "a5" | "a6";

interface Producto {
  id: number | string;
  nombre: string;
  precio: number;
  precio_original?: number | null;
}

interface SeccionCartelesProps {
  productos: Producto[];
}

export default function SeccionCarteles({ productos = [] }: SeccionCartelesProps) {
  const [tipo, setTipo] = useState<TipoCartel>("oferta");
  const [tamano, setTamano] = useState<TamanoCartel>("a4");
  
  // Campos editables del cartel
  const [tituloPersonalizado, setTituloPersonalizado] = useState("OFERTA ESPECIAL");
  const [nombreProducto, setNombreProducto] = useState("Selecciona un producto o escribe aquí");
  const [subtitulo, setSubtitulo] = useState("Por tiempo limitado o hasta agotar stock");
  const [precioOriginal, setPrecioOriginal] = useState("");
  const [precioOferta, setPrecioOferta] = useState("0");

  // Manejar la selección de un producto existente
  const handleSeleccionarProducto = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    if (!prodId) return;

    const prod = productos.find((p) => String(p.id) === String(prodId));
    if (prod) {
      setNombreProducto(prod.nombre);
      setPrecioOferta(String(prod.precio));
      if (prod.precio_original && prod.precio_original > prod.precio) {
        setPrecioOriginal(String(prod.precio_original));
      } else {
        setPrecioOriginal("");
      }
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const getClasesTamano = () => {
    switch (tamano) {
      case "a4":
        return "min-h-[500px] text-center p-8";
      case "a5":
        return "max-w-md mx-auto min-h-[350px] p-6 text-center";
      case "a6":
        return "max-w-xs mx-auto min-h-[220px] p-4 text-center";
    }
  };

  return (
    <div className="space-y-6">
      {/* PANEL DE CONFIGURACIÓN (SE OCULTA AL IMPRIMIR) */}
      <div className="print:hidden space-y-4 rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-xs border border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-[#0E6E55]" />
            Generador de Carteles Promocionales
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Elige un producto de tu catálogo o diseña un cartel personalizado para vidrieras y mostradores.
          </p>
        </div>

        {/* SELECTOR RÁPIDO DE PRODUCTOS EXISTENTES */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
          <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Vincular con un producto de tu tienda (Opcional)
          </label>
          <select
            onChange={handleSeleccionarProducto}
            defaultValue=""
            className="w-full rounded-xl border border-emerald-200 dark:border-emerald-800 px-3 py-2.5 text-xs font-semibold bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
          >
            <option value="" disabled>
              -- Selecciona un producto para autocompletar --
            </option>
            {productos.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.nombre} — ${prod.precio.toLocaleString("es-AR")}
              </option>
            ))}
          </select>
        </div>

        {/* Selectores de Tipo y Tamaño */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
              Plantilla de Cartel
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setTipo("oferta"); setTituloPersonalizado("OFERTA ESPECIAL"); }}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  tipo === "oferta"
                    ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] dark:text-emerald-400 font-bold"
                    : "border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400"
                }`}
              >
                <Tag className="w-4 h-4" /> Oferta
              </button>
              <button
                type="button"
                onClick={() => { setTipo("2x1"); setTituloPersonalizado("¡PROMO 2X1!"); }}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  tipo === "2x1"
                    ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] dark:text-emerald-400 font-bold"
                    : "border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400"
                }`}
              >
                <Sparkles className="w-4 h-4" /> 2x1 / Promo
              </button>
              <button
                type="button"
                onClick={() => { setTipo("combo"); setTituloPersonalizado("COMBO EXCLUSIVO"); }}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  tipo === "combo"
                    ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] dark:text-emerald-400 font-bold"
                    : "border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400"
                }`}
              >
                <Layers className="w-4 h-4" /> Combo
              </button>
              <button
                type="button"
                onClick={() => { setTipo("nuevo"); setTituloPersonalizado("NUEVO LANZAMIENTO"); }}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  tipo === "nuevo"
                    ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] dark:text-emerald-400 font-bold"
                    : "border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400"
                }`}
              >
                <Sparkles className="w-4 h-4" /> Nuevo
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
              Tamaño de Impresión
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              {(["a4", "a5", "a6"] as TamanoCartel[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTamano(t)}
                  className={`p-2.5 rounded-xl uppercase border transition-all ${
                    tamano === t
                      ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] dark:text-emerald-400 font-bold"
                      : "border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400"
                  }`}
                >
                  {t} {t === "a4" ? "(Vidriera)" : t === "a5" ? "(Mostrador)" : "(Góndola)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CAMPOS EDITABLES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Título Destacado</label>
            <input
              type="text"
              value={tituloPersonalizado}
              onChange={(e) => setTituloPersonalizado(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Nombre del Producto (Editable)</label>
            <input
              type="text"
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Subtítulo o Descripción</label>
            <input
              type="text"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Precio Anterior ($)</label>
              <input
                type="text"
                value={precioOriginal}
                onChange={(e) => setPrecioOriginal(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Precio Final ($)</label>
              <input
                type="text"
                value={precioOferta}
                onChange={(e) => setPrecioOferta(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
              />
            </div>
          </div>
        </div>

        {/* Botón de Impresión */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleImprimir}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0E6E55] text-white text-xs font-bold hover:bg-[#0A5340] active:scale-98 transition-all shadow-md"
          >
            <Printer className="h-4 w-4" />
            Imprimir Cartel ({tamano.toUpperCase()})
          </button>
        </div>
      </div>

      {/* VISTA PREVIA DEL CARTEL */}
      <div className="space-y-2">
        <h3 className="print:hidden text-xs font-bold uppercase tracking-wider text-gray-400">
          Vista Previa del Cartel
        </h3>

        <div className="bg-slate-100 dark:bg-zinc-950 p-6 rounded-3xl flex justify-center items-center overflow-x-auto">
          <div
            className={`bg-white text-black border-4 border-black rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden ${getClasesTamano()}`}
          >
            {/* Cabecera */}
            <div>

              <div className="bg-black text-white py-2 px-4 rounded-xl inline-block my-2">
                <h1 className="text-sm sm:text-lg font-black uppercase tracking-wider">
                  {tituloPersonalizado}
                </h1>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="my-auto py-4 space-y-3">
              <h2 className="text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900 leading-tight">
                {nombreProducto}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-gray-600 max-w-sm mx-auto">
                {subtitulo}
              </p>
            </div>

            {/* Precios */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-2 bg-gray-50/50 -mx-6 -mb-6 p-6">
              {(tipo === "oferta" || tipo === "combo") && precioOriginal ? (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-base sm:text-xl text-gray-400 line-through font-bold">
                    ${Number(precioOriginal).toLocaleString("es-AR")}
                  </span>
                  <span className="text-3xl sm:text-5xl font-black text-emerald-700">
                    ${Number(precioOferta).toLocaleString("es-AR")}
                  </span>
                </div>
              ) : (
                <div className="text-3xl sm:text-5xl font-black text-black">
                  ${Number(precioOferta).toLocaleString("es-AR")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS DE IMPRESIÓN */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header,
          nav,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}