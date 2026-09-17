"use client";

import { useState } from "react";
import { Sparkles, Search, Pencil, Trash2 } from "lucide-react";
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
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-base font-bold text-[#12151B] sm:text-lg">
          📦 Listado de Productos
        </h2>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A6A29B]" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría, código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] py-2.5 pl-9 pr-3 text-xs text-[#12151B] outline-none transition-all focus:border-[#0E6E55] focus:bg-white sm:w-full"
          />
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
          <span className="text-3xl">🔍</span>
          <p className="mt-2 text-xs text-[#6B675F]">
            {busqueda
              ? "No se encontraron productos que coincidan."
              : "No hay productos registrados aún."}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white shadow-sm transition-all hover:shadow-lg ${
                  estaPausado ? "opacity-60" : ""
                }`}
              >
                <div>
                  {/* Imagen protagonista, edge-to-edge */}
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                    {imagenPortada ? (
                      <img
                        src={imagenPortada}
                        alt={p.nombre}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-gray-300">
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
                      className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur-sm transition-all active:scale-95 ${
                        estaPausado
                          ? "bg-white/90 text-[#C84343]"
                          : "bg-white/90 text-[#0E6E55]"
                      }`}
                    >
                      {estaPausado ? "⏸️ Pausado" : "🟢 Activo"}
                    </button>
                  </div>

                  <div className="p-4">
                    <span className="rounded-md bg-[#F7F7F5] px-2 py-1 text-[11px] font-semibold text-[#6B675F]">
                      {p.categoria || "General"}
                    </span>

                    <h3 className="m-0 mt-2.5 line-clamp-2 text-base font-bold leading-tight text-[#12151B]">
                      {p.nombre}
                    </h3>

                    {p.etiquetas && p.etiquetas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.etiquetas.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-emerald-200/80 bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-[#0E6E55]"
                          >
                            🏷️ {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {p.codigo_barras && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-mono font-medium text-gray-500">
                        <span>EAN:</span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">
                          {p.codigo_barras}
                        </span>
                      </div>
                    )}

                    {p.descripcion && (
                      <p className="m-0 mt-2 line-clamp-2 text-xs text-[#6B675F]">
                        {p.descripcion}
                      </p>
                    )}

                    <div className="mt-3.5 flex items-end justify-between gap-2 border-t border-[#F0F0EC] pt-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-[#12151B]">
                            ${p.precio}
                          </span>
                          {p.precio_original && (
                            <span className="text-xs text-[#A6A29B] line-through">
                              ${p.precio_original}
                            </span>
                          )}
                        </div>

                        {p.permite_cuotas !== false && (
                          <span className="w-fit rounded bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-600">
                            💳 3x ${calcularCuotas(p.precio).montoCuota.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-[#0E6E55]">
                          Stock: {p.stock ?? 0}
                        </span>
                        <button
                          onClick={() => setModalRestockId(p.id)}
                          title="Ajustar stock"
                          className="rounded-lg border border-[#E7E5E0] bg-[#F7F7F5] px-2 py-1 text-[10px] font-bold text-[#0E6E55] transition-colors hover:bg-[#E7E5E0] active:scale-95"
                        >
                          + Restock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex gap-2 border-t border-[#E7E5E0] p-3">
                  <button
                    onClick={() => setProductoStory(p)}
                    title="Generar imagen para Redes / Story"
                    className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-[#0E6E55] transition-colors hover:bg-emerald-100 active:scale-95"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onEditar(p)}
                    className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E7E5E0] bg-white text-xs font-semibold text-[#12151B] transition-colors hover:bg-[#F7F7F5] active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>

                  <button
                    onClick={() => onEliminar(p.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F87171]/20 bg-[#FEF2F2] text-[#C84343] transition-colors hover:bg-[#FEE2E2] active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-xs rounded-t-3xl border border-[#E7E5E0] bg-white p-5 shadow-lg sm:rounded-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
            <h3 className="m-0 text-sm font-bold text-[#12151B]">
              📦 Ajustar Stock
            </h3>
            <p className="mt-1 text-xs text-[#6B675F]">
              Ingresá el número a sumar (ej. <strong className="text-[#0E6E55]">5</strong>) o a restar (ej. <strong className="text-[#C84343]">-1</strong>):
            </p>
            <input
              type="text"
              value={cantidadRestock}
              onChange={(e) => setCantidadRestock(e.target.value)}
              placeholder="Ej: 5 o -1"
              className="mt-3 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-bold text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalRestockId(null)}
                className="h-11 rounded-xl px-4 text-xs font-semibold text-[#6B675F] transition-colors hover:bg-[#F7F7F5] active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmarRestock(modalRestockId)}
                className="h-11 rounded-xl bg-[#0E6E55] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#0B5743] active:scale-95"
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