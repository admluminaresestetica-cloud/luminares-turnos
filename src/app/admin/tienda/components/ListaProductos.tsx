"use client";

import { useState } from "react";
import { Sparkles, Search, Pencil, Trash2, Package, Tag } from "lucide-react";
import { calcularCuotas } from "@/lib/precios";
import { ModalGeneradorStory } from "@/components/story-generator/ModalGeneradorStory";

export interface Producto {
  id: number | string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_original?: number;
  categoria?: string;
  stock?: number;
  activo?: boolean;
  permite_cuotas?: boolean;
  codigo_barras?: string;
  etiquetas?: string[];
  imagen_url?: string;
  imagenes_urls?: string[];
}

interface ListaProductosProps {
  productos: Producto[];
  config?: any; // Configuración de la empresa (logo, datos) para el lienzo
  onEliminar: (id: number | string) => void;
  onEditar: (producto: Producto) => void;
  onToggleActivo?: (id: number | string, nuevoEstado: boolean) => void;
  onRestock?: (id: number | string, cantidadASumar: number) => void;
}

export default function ListaProductos({
  productos,
  config,
  onEliminar,
  onEditar,
  onToggleActivo,
  onRestock,
}: ListaProductosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [modalRestockId, setModalRestockId] = useState<number | string | null>(null);
  const [cantidadRestock, setCantidadRestock] = useState<string>("1");

  // ESTADO PARA EL GENERADOR DE STORY/IMAGEN REDES
  const [productoStory, setProductoStory] = useState<Producto | null>(null);

  const productosFiltrados = productos.filter((p) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    return (
      p.nombre?.toLowerCase().includes(termino) ||
      p.categoria?.toLowerCase().includes(termino) ||
      p.precio?.toString().includes(termino) ||
      p.codigo_barras?.toLowerCase().includes(termino) ||
      p.etiquetas?.some((tag) => tag.toLowerCase().includes(termino))
    );
  });

  const handleConfirmarRestock = (id: number | string) => {
    const num = Number(cantidadRestock);
    if (isNaN(num) || num === 0) return;
    if (onRestock) onRestock(id, num);
    setModalRestockId(null);
    setCantidadRestock("1");
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs sm:rounded-3xl sm:p-6 pb-24 sm:pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-base font-bold text-gray-900 dark:text-zinc-100 sm:text-lg flex items-center gap-2">
          📦 Listado de Productos
        </h2>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría, código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 py-2.5 pl-10 pr-3 text-xs text-gray-900 dark:text-zinc-100 outline-none transition-all focus:border-[#0E6E55]"
          />
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <span className="text-3xl mb-2">🔍</span>
          <p className="text-xs font-bold text-gray-500 dark:text-zinc-400">
            {busqueda
              ? "No se encontraron productos que coincidan."
              : "No hay productos registrados aún."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productosFiltrados.map((p) => {
            const estaPausado = p.activo === false;

            const fotosArray: string[] =
              p.imagenes_urls && p.imagenes_urls.length > 0
                ? p.imagenes_urls
                : p.imagen_url
                ? [p.imagen_url]
                : [];

            const imagenPortada = fotosArray[0] || null;
            const totalFotos = fotosArray.length;

            return (
              <div
                key={p.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-all hover:shadow-md ${
                  estaPausado ? "opacity-60" : ""
                }`}
              >
                <div>
                  {/* Imagen del Producto */}
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                    {imagenPortada ? (
                      <img
                        src={imagenPortada}
                        alt={p.nombre}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-gray-300 dark:text-zinc-600">
                        📦
                      </div>
                    )}

                    {totalFotos > 1 && (
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        📷 {totalFotos}
                      </span>
                    )}

                    <button
                      onClick={() => onToggleActivo && onToggleActivo(p.id, estaPausado)}
                      className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-xs backdrop-blur-xs transition-all active:scale-95 ${
                        estaPausado
                          ? "bg-white/90 text-red-600 dark:bg-zinc-900/90 dark:text-red-400"
                          : "bg-white/90 text-[#0E6E55] dark:bg-zinc-900/90 dark:text-emerald-400"
                      }`}
                    >
                      {estaPausado ? "⏸️ Pausado" : "🟢 Activo"}
                    </button>
                  </div>

                  <div className="p-3.5 sm:p-4">
                    <span className="rounded-lg bg-gray-100 dark:bg-zinc-800 px-2 py-1 text-[10px] font-extrabold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      {p.categoria || "General"}
                    </span>

                    <h3 className="m-0 mt-2 line-clamp-2 text-sm font-bold leading-snug text-gray-900 dark:text-zinc-100">
                      {p.nombre}
                    </h3>

                    {p.etiquetas && p.etiquetas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.etiquetas.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-[#0E6E55] dark:text-emerald-400"
                          >
                            <Tag className="h-2.5 w-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {p.codigo_barras && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-mono font-medium text-gray-400 dark:text-zinc-500">
                        <span>EAN:</span>
                        <span className="rounded bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 text-gray-700 dark:text-zinc-300">
                          {p.codigo_barras}
                        </span>
                      </div>
                    )}

                    {p.descripcion && (
                      <p className="m-0 mt-2 line-clamp-2 text-xs text-gray-500 dark:text-zinc-400">
                        {p.descripcion}
                      </p>
                    )}

                    <div className="mt-3 flex items-end justify-between gap-2 border-t border-gray-100 dark:border-zinc-800 pt-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-gray-900 dark:text-zinc-100">
                            ${p.precio.toLocaleString("es-AR")}
                          </span>
                          {p.precio_original && (
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500 line-through">
                              ${p.precio_original.toLocaleString("es-AR")}
                            </span>
                          )}
                        </div>

                        {p.permite_cuotas !== false && (
                          <span className="w-fit rounded bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            💳 3x ${calcularCuotas(p.precio).montoCuota.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-black text-[#0E6E55] dark:text-emerald-400">
                          Stock: {p.stock ?? 0}
                        </span>
                        <button
                          onClick={() => setModalRestockId(p.id)}
                          title="Ajustar stock"
                          className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-2 py-1 text-[10px] font-bold text-[#0E6E55] dark:text-emerald-400 transition-colors hover:bg-gray-100 active:scale-95"
                        >
                          + Restock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex gap-2 border-t border-gray-100 dark:border-zinc-800 p-3 bg-gray-50/50 dark:bg-zinc-900/50">
                  <button
                    onClick={() => setProductoStory(p)}
                    title="Generar imagen para Redes / Story"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-[#0E6E55] dark:text-emerald-400 transition-all hover:bg-emerald-100 active:scale-95 shrink-0"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onEditar(p)}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-xs font-bold text-gray-800 dark:text-zinc-200 transition-all hover:bg-gray-100 active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>

                  <button
                    onClick={() => onEliminar(p.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 transition-all hover:bg-red-100 active:scale-95 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Ajuste Stock */}
      {modalRestockId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 pb-20 sm:pb-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xs rounded-t-3xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl">
            <div className="sm:hidden w-12 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />
            <h3 className="m-0 text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#0E6E55] dark:text-emerald-400" /> Ajustar Stock
            </h3>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-zinc-400">
              Ingresá la cantidad a sumar (ej: <strong className="text-[#0E6E55] dark:text-emerald-400">5</strong>) o a restar (ej: <strong className="text-red-500">-1</strong>):
            </p>
            <input
              type="text"
              value={cantidadRestock}
              onChange={(e) => setCantidadRestock(e.target.value)}
              placeholder="Ej: 5 o -1"
              className="mt-3 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-3 text-sm font-bold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalRestockId(null)}
                className="h-10 rounded-xl px-4 text-xs font-bold text-gray-500 dark:text-zinc-400 hover:bg-gray-100 active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmarRestock(modalRestockId)}
                className="h-10 rounded-xl bg-[#0E6E55] px-4 text-xs font-bold text-white transition-all hover:bg-[#0A5340] active:scale-95 shadow-xs"
              >
                Aplicar Cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GENERADOR DE STORY */}
      <ModalGeneradorStory
        isOpen={!!productoStory}
        onClose={() => setProductoStory(null)}
        producto={productoStory}
        config={config || null}
      />
    </div>
  );
}