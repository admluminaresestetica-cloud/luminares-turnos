"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
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
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-lg font-bold text-[#12151B]">
          📦 Listado de Productos
        </h2>

        <input
          type="text"
          placeholder="Buscar por nombre, categoría, etiqueta, precio o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3 py-2 text-xs text-[#12151B] outline-none transition-all focus:border-[#0E6E55] sm:w-72"
        />
      </div>

      {productosFiltrados.length === 0 ? (
        <p className="mt-4 text-xs text-[#6B675F]">
          {busqueda
            ? "No se encontraron productos que coincidan."
            : "No hay productos registrados aún."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                className={`flex flex-col justify-between rounded-xl border border-[#E7E5E0] p-4 transition-all ${
                  estaPausado ? "bg-[#E7E5E0]/30 opacity-75" : "bg-[#F7F7F5]"
                }`}
              >
                <div>
                  {imagenPortada && (
                    <div className="relative mb-3 h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={imagenPortada}
                        alt={p.nombre}
                        className="h-full w-full object-cover"
                      />
                      {totalFotos > 1 && (
                        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                          📷 {totalFotos} fotos
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#6B675F]">
                      {p.categoria || "General"}
                    </span>

                    <button
                      onClick={() =>
                        onToggleActivo && onToggleActivo(p.id, estaPausado)
                      }
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                        estaPausado
                          ? "bg-[#FEF2F2] text-[#C84343] hover:bg-[#FEE2E2]"
                          : "bg-[#E6F4F1] text-[#0E6E55] hover:bg-[#D1EBE6]"
                      }`}
                    >
                      {estaPausado ? "⏸️ Pausado" : "🟢 Activo"}
                    </button>
                  </div>

                  <h3 className="m-0 mt-3 text-base font-bold text-[#12151B]">
                    {p.nombre}
                  </h3>

                  {p.etiquetas && p.etiquetas.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.etiquetas.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-emerald-100/70 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-[#0E6E55]"
                        >
                          🏷️ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.codigo_barras && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono font-medium text-gray-500">
                      <span>🏷️ EAN:</span>
                      <span className="rounded bg-gray-200/60 px-1.5 py-0.2 text-gray-700">
                        {p.codigo_barras}
                      </span>
                    </div>
                  )}

                  <p className="m-0 mt-1 text-xs text-[#6B675F] line-clamp-2">
                    {p.descripcion}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
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
                        <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                          💳 3 cuotas sin interés de ${calcularCuotas(p.precio).montoCuota.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0E6E55]">
                        Stock: {p.stock ?? 0}
                      </span>
                      <button
                        onClick={() => setModalRestockId(p.id)}
                        title="Ajustar stock"
                        className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#0E6E55] border border-[#E7E5E0] hover:bg-[#E7E5E0]"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN: ¡AQUÍ ESTÁ EL BOTÓN DE STORY! */}
                <div className="mt-4 flex gap-2 border-t border-[#E7E5E0] pt-3">
                  <button
                    onClick={() => setProductoStory(p)}
                    title="Generar imagen para Redes / Story"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-[#0E6E55] transition-colors hover:bg-emerald-100"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Story</span>
                  </button>

                  <button
                    onClick={() => onEditar(p)}
                    className="flex-1 rounded-lg border border-[#E7E5E0] bg-white py-2 text-xs font-semibold text-[#12151B] transition-colors hover:bg-[#E7E5E0]"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => onEliminar(p.id)}
                    className="rounded-lg border border-[#F87171]/20 bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#C84343] transition-colors hover:bg-[#FEE2E2]"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Ajuste Stock */}
      {modalRestockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl border border-[#E7E5E0] bg-white p-5 shadow-lg">
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
              className="mt-3 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-2 text-sm font-bold text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalRestockId(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#6B675F] hover:bg-[#F7F7F5]"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmarRestock(modalRestockId)}
                className="rounded-lg bg-[#0E6E55] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0B5743]"
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