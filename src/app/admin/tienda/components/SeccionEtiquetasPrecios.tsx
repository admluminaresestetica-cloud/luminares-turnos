"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Printer,
  Tag,
  CheckSquare,
  Square,
  Megaphone,
  Sparkles,
  Layers,
  LayoutGrid,
  Palette,
  QrCode,
} from "lucide-react";

interface Categoria {
  id: number | string;
  nombre: string;
}

interface Producto {
  id: number | string;
  nombre: string;
  precio: number;
  precio_original?: number | null;
  categoria_id?: number | string | null;
  codigo_barras?: string | null;
  stock?: number;
}

interface SeccionEtiquetasPreciosProps {
  productos: Producto[];
  categorias: Categoria[];
}

type ModoImpresion = "etiquetas" | "carteles";
type TipoCartel = "oferta" | "2x1" | "combo" | "nuevo";
type TamanoCartel = "a4" | "a5" | "a6";
type EstiloCartel = "clasico" | "impacto" | "minimalista";

export default function SeccionEtiquetasPrecios({
  productos = [],
  categorias = [],
}: SeccionEtiquetasPreciosProps) {
  // Estado principal de la sección
  const [modo, setModo] = useState<ModoImpresion>("etiquetas");

  // --- ESTADOS DE MODO ETIQUETAS DE GÓNDOLA ---
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todas");
  const [seleccionados, setSeleccionados] = useState<Set<number | string>>(new Set());
  const [formatoImpresionEtiqueta, setFormatoImpresionEtiqueta] = useState<"a4" | "termico">("a4");

  // --- ESTADOS DE MODO CARTELES PROMOCIONALES ---
  const [tipoCartel, setTipoCartel] = useState<TipoCartel>("oferta");
  const [tamanoCartel, setTamanoCartel] = useState<TamanoCartel>("a4");
  const [estiloCartel, setEstiloCartel] = useState<EstiloCartel>("clasico");
  const [badgeCartel, setBadgeCartel] = useState<string>("SIN_BADGE");
  const [incluirQR, setIncluirQR] = useState(false);

  // Campos editables del cartel
  const [tituloCartel, setTituloCartel] = useState("OFERTA ESPECIAL");
  const [nombreProductoCartel, setNombreProductoCartel] = useState("Selecciona un producto");
  const [subtituloCartel, setSubtituloCartel] = useState("Por tiempo limitado o hasta agotar stock");
  const [precioOriginalCartel, setPrecioOriginalCartel] = useState("");
  const [precioOfertaCartel, setPrecioOfertaCartel] = useState("0");

  // Filtrado para Etiquetas
  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      const coincideNombre = prod.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCodigo = prod.codigo_barras
        ? prod.codigo_barras.toLowerCase().includes(busqueda.toLowerCase())
        : false;
      const coincideCategoria =
        categoriaSeleccionada === "todas" ||
        String(prod.categoria_id) === String(categoriaSeleccionada);

      return (coincideNombre || coincideCodigo) && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  const toggleSeleccion = (id: number | string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSeleccionarTodos = () => {
    if (seleccionados.size === productosFiltrados.length && productosFiltrados.length > 0) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(productosFiltrados.map((p) => p.id)));
    }
  };

  const productosAImprimirEtiquetas = useMemo(() => {
    return productos.filter((p) => seleccionados.has(p.id));
  }, [productos, seleccionados]);

  // Selección de producto para Cartel
  const handleSeleccionarProductoCartel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    if (!prodId) return;

    const prod = productos.find((p) => String(p.id) === String(prodId));
    if (prod) {
      setNombreProductoCartel(prod.nombre);
      setPrecioOfertaCartel(String(prod.precio));
      if (prod.precio_original && prod.precio_original > prod.precio) {
        setPrecioOriginalCartel(String(prod.precio_original));
      } else {
        setPrecioOriginalCartel("");
      }
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  // Clases dinámicas según el estilo del Cartel
  const getEstilosCartelPreview = () => {
    switch (estiloCartel) {
      case "impacto":
        return "bg-black text-white border-4 border-yellow-400";
      case "minimalista":
        return "bg-white text-zinc-900 border border-zinc-200 shadow-lg";
      default:
        return "bg-white text-black border-4 border-black";
    }
  };

  const getClasesTamanoCartel = () => {
    switch (tamanoCartel) {
      case "a4":
        return "w-full min-h-[520px] p-8 text-center";
      case "a5":
        return "max-w-md w-full min-h-[380px] p-6 text-center";
      case "a6":
        return "max-w-xs w-full min-h-[260px] p-4 text-center";
    }
  };

  return (
    <div className="space-y-6">
      {/* BARRA SUPERIOR DE SELECTOR DE MODO (SE OCULTA AL IMPRIMIR) */}
      <div className="print:hidden flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xs">
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setModo("etiquetas")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              modo === "etiquetas"
                ? "bg-white dark:bg-zinc-700 text-[#0E6E55] dark:text-emerald-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:text-zinc-400"
            }`}
          >
            <Tag className="w-4 h-4" />
            Etiquetas de Góndola
          </button>
          <button
            type="button"
            onClick={() => setModo("carteles")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              modo === "carteles"
                ? "bg-white dark:bg-zinc-700 text-[#0E6E55] dark:text-emerald-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:text-zinc-400"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Carteles Promocionales
          </button>
        </div>

        <button
          type="button"
          onClick={handleImprimir}
          disabled={modo === "etiquetas" && productosAImprimirEtiquetas.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0E6E55] text-white text-xs font-bold hover:bg-[#0A5340] active:scale-98 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="h-4 w-4" />
          Imprimir {modo === "etiquetas" ? `(${productosAImprimirEtiquetas.length})` : tamanoCartel.toUpperCase()}
        </button>
      </div>

      {/* ==================== MODO 1: ETIQUETAS DE GÓNDOLA ==================== */}
      {modo === "etiquetas" && (
        <div className="space-y-4">
          <div className="print:hidden space-y-4">
            {/* Formato */}
            <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                Formato de Impresión:
              </span>
              <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFormatoImpresionEtiqueta("a4")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    formatoImpresionEtiqueta === "a4"
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-xs"
                      : "text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  Grilla A4
                </button>
                <button
                  type="button"
                  onClick={() => setFormatoImpresionEtiqueta("termico")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    formatoImpresionEtiqueta === "termico"
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-xs"
                      : "text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  Rollo Térmico
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-900 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
                />
              </div>

              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-900 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
              >
                <option value="todas">Todas las Categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Listado para seleccionar */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={toggleSeleccionarTodos}
                  className="flex items-center gap-2 text-xs font-bold text-[#0E6E55] dark:text-emerald-400 hover:underline"
                >
                  {seleccionados.size === productosFiltrados.length && productosFiltrados.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {seleccionados.size === productosFiltrados.length && productosFiltrados.length > 0
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>

                <span className="text-xs text-gray-400 font-medium">
                  {seleccionados.size} seleccionados
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {productosFiltrados.map((prod) => {
                  const isSelected = seleccionados.has(prod.id);
                  const tieneOferta = prod.precio_original && prod.precio_original > prod.precio;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleSeleccion(prod.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#0E6E55] bg-[#0E6E55]/5 dark:border-emerald-600 dark:bg-emerald-950/20"
                          : "border-gray-100 bg-gray-50/50 dark:border-zinc-800/60 dark:bg-zinc-800/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-[#0E6E55] dark:text-emerald-400">
                          {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-800 dark:text-zinc-100 truncate">
                            {prod.nombre}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {tieneOferta ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 line-through">
                              ${prod.precio_original?.toLocaleString("es-AR")}
                            </span>
                            <span className="text-xs font-extrabold text-[#0E6E55] dark:text-emerald-400">
                              ${prod.precio.toLocaleString("es-AR")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                            ${prod.precio.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vista previa Etiquetas */}
          <div className="space-y-2">
            <h3 className="print:hidden text-xs font-bold uppercase tracking-wider text-gray-400">
              Vista Previa Etiquetas
            </h3>

            {productosAImprimirEtiquetas.length === 0 ? (
              <div className="print:hidden py-10 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                <Tag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">
                  Selecciona productos arriba para generar sus etiquetas.
                </p>
              </div>
            ) : (
              <div
                className={`bg-white text-black p-4 rounded-2xl border ${
                  formatoImpresionEtiqueta === "a4"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    : "flex flex-col items-center space-y-4 max-w-xs mx-auto"
                }`}
              >
                {productosAImprimirEtiquetas.map((prod) => {
                  const tieneOferta = prod.precio_original && prod.precio_original > prod.precio;

                  return (
                    <div
                      key={prod.id}
                      className="w-full border-2 border-black p-3 rounded-lg flex flex-col justify-between text-center bg-white min-h-[120px] break-inside-avoid"
                    >
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-0.5 mb-1 block">
                        LUMINARES ESTÉTICA
                      </span>

                      <h4 className="text-xs font-extrabold uppercase line-clamp-2 leading-tight my-auto text-gray-900">
                        {prod.nombre}
                      </h4>

                      <div className="mt-1.5 border-t border-dashed border-gray-300 pt-1">
                        {tieneOferta ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[10px] text-gray-400 line-through font-bold">
                              ${prod.precio_original?.toLocaleString("es-AR")}
                            </span>
                            <span className="text-base font-black text-black">
                              ${prod.precio.toLocaleString("es-AR")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-black text-black block">
                            ${prod.precio.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODO 2: CARTELES PROMOCIONALES ==================== */}
      {modo === "carteles" && (
        <div className="space-y-6">
          <div className="print:hidden space-y-4 rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-xs border border-gray-100 dark:border-zinc-800">
            {/* Vincular producto */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Vincular con un producto de tu catálogo
              </label>
              <select
                onChange={handleSeleccionarProductoCartel}
                defaultValue=""
                className="w-full rounded-xl border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-[#0E6E55]"
              >
                <option value="" disabled>
                  -- Selecciona para autocompletar --
                </option>
                {productos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nombre} — ${prod.precio.toLocaleString("es-AR")}
                  </option>
                ))}
              </select>
            </div>

            {/* Selectores de Diseño */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Plantilla */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Plantilla
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setTipoCartel("oferta"); setTituloCartel("OFERTA ESPECIAL"); }}
                    className={`p-2 rounded-xl border transition-all ${tipoCartel === "oferta" ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] font-bold" : "border-gray-200"}`}
                  >
                    Oferta
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipoCartel("2x1"); setTituloCartel("¡PROMO 2X1!"); }}
                    className={`p-2 rounded-xl border transition-all ${tipoCartel === "2x1" ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] font-bold" : "border-gray-200"}`}
                  >
                    2x1
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipoCartel("combo"); setTituloCartel("COMBO EXCLUSIVO"); }}
                    className={`p-2 rounded-xl border transition-all ${tipoCartel === "combo" ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] font-bold" : "border-gray-200"}`}
                  >
                    Combo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipoCartel("nuevo"); setTituloCartel("NUEVO INGRESO"); }}
                    className={`p-2 rounded-xl border transition-all ${tipoCartel === "nuevo" ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] font-bold" : "border-gray-200"}`}
                  >
                    Nuevo
                  </button>
                </div>
              </div>

              {/* Tamaño */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Tamaño
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                  {(["a4", "a5", "a6"] as TamanoCartel[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTamanoCartel(t)}
                      className={`p-2 rounded-xl uppercase border transition-all ${tamanoCartel === t ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] font-bold" : "border-gray-200"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estilo Visual */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" /> Tema Visual
                </label>
                <select
                  value={estiloCartel}
                  onChange={(e) => setEstiloCartel(e.target.value as EstiloCartel)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 dark:border-zinc-800"
                >
                  <option value="clasico">Clásico (Luminares Verde/Negro)</option>
                  <option value="impacto">Alto Impacto (Fondo Negro / Oro)</option>
                  <option value="minimalista">Minimalista Elegante</option>
                </select>
              </div>
            </div>

            {/* Badges y Extras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Badge Promocional</label>
                <select
                  value={badgeCartel}
                  onChange={(e) => setBadgeCartel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900"
                >
                  <option value="SIN_BADGE">Sin Badge</option>
                  <option value="3 CUOTAS SIN INTERÉS">3 Cuotas Sin Interés</option>
                  <option value="ENVÍO GRATIS">Envío Gratis</option>
                  <option value="STOCK LIMITADO">Stock Limitado</option>
                  <option value="CRUELTY FREE / VEGANO">100% Cruelty Free</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="qrCheck"
                  checked={incluirQR}
                  onChange={(e) => setIncluirQR(e.target.checked)}
                  className="rounded border-gray-300 text-[#0E6E55] focus:ring-[#0E6E55]"
                />
                <label htmlFor="qrCheck" className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-gray-500" /> Incluir QR de Pago / Catálogo Web
                </label>
              </div>
            </div>

            {/* Campos de texto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Título Destacado</label>
                <input
                  type="text"
                  value={tituloCartel}
                  onChange={(e) => setTituloCartel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  value={nombreProductoCartel}
                  onChange={(e) => setNombreProductoCartel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={subtituloCartel}
                  onChange={(e) => setSubtituloCartel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Precio Antes ($)</label>
                  <input
                    type="text"
                    value={precioOriginalCartel}
                    onChange={(e) => setPrecioOriginalCartel(e.target.value)}
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Precio Final ($)</label>
                  <input
                    type="text"
                    value={precioOfertaCartel}
                    onChange={(e) => setPrecioOfertaCartel(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vista Previa Cartel */}
          <div className="space-y-2">
            <h3 className="print:hidden text-xs font-bold uppercase tracking-wider text-gray-400">
              Vista Previa del Cartel
            </h3>

            <div className="bg-slate-100 dark:bg-zinc-950 p-6 rounded-3xl flex justify-center items-center overflow-x-auto">
              <div
                className={`rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all ${getEstilosCartelPreview()} ${getClasesTamanoCartel()}`}
              >
                {/* Badge flotante */}
                {badgeCartel !== "SIN_BADGE" && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider">
                    {badgeCartel}
                  </div>
                )}

                {/* Cabecera */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70 block mb-1">
                    LUMINARES ESTÉTICA
                  </span>
                  <div className="bg-emerald-700 text-white py-2 px-4 rounded-xl inline-block my-2 shadow-xs">
                    <h1 className="text-sm sm:text-lg font-black uppercase tracking-wider">
                      {tituloCartel}
                    </h1>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="my-auto py-4 space-y-3">
                  <h2 className="text-xl sm:text-3xl font-extrabold uppercase tracking-tight leading-tight">
                    {nombreProductoCartel}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold opacity-80 max-w-sm mx-auto">
                    {subtituloCartel}
                  </p>
                </div>

                {/* Pie / Precios */}
                <div className="border-t-2 border-dashed border-gray-300/40 pt-4 mt-2 -mx-6 -mb-6 p-6 flex flex-col items-center justify-center">
                  {precioOriginalCartel ? (
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-base sm:text-xl opacity-50 line-through font-bold">
                        ${Number(precioOriginalCartel).toLocaleString("es-AR")}
                      </span>
                      <span className="text-3xl sm:text-5xl font-black text-emerald-600">
                        ${Number(precioOfertaCartel).toLocaleString("es-AR")}
                      </span>
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-5xl font-black">
                      ${Number(precioOfertaCartel).toLocaleString("es-AR")}
                    </div>
                  )}

                  {incluirQR && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold opacity-70">
                      <QrCode className="w-4 h-4" /> Escanea para comprar online
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS EXCLUSIVOS PARA IMPRESIÓN */}
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