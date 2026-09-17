"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { calcularCuotas } from "@/lib/precios";
import { ModalGeneradorStory } from "./ModalGeneradorStory";
import {
  obtenerConfiguracion,
  ConfiguracionEmpresa,
} from "@/lib/supabase/configuracion-empresa";

interface ListaProductosProps {
  productos: any[];
  onEliminar: (id: any) => void;
  onEditar: (producto: any) => void;
  onToggleActivo?: (id: any, nuevoEstado: boolean) => void;
  onRestock?: (id: any, cantidadASumar: number) => void;
}

export default function ListaProductos({
  productos,
  onEliminar,
  onEditar,
  onToggleActivo,
  onRestock,
}: ListaProductosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [modalRestockId, setModalRestockId] = useState<number | string | null>(null);
  const [cantidadRestock, setCantidadRestock] = useState<string>("1");

  // Estados para el Generador de Stories
  const [productoStory, setProductoStory] = useState<any | null>(null);
  const [configEmpresa, setConfigEmpresa] = useState<ConfiguracionEmpresa | null>(null);

  // Cargar configuración de la empresa al montar el componente
  useEffect(() => {
    const cargarConfig = async () => {
      const config = await obtenerConfiguracion();
      setConfigEmpresa(config);
    };
    cargarConfig();
  }, []);

  // Buscador por nombre, categoría, precio, CÓDIGO DE BARRAS o ETIQUETAS
  const productosFiltrados = productos.filter((p) => {
    const termino = busqueda.toLowerCase().trim();
    const coincideNombre = p.nombre?.toLowerCase().includes(termino);
    const coincideCategoria = p.categoria?.toLowerCase().includes(termino);
    const coincidePrecio = p.precio?.toString().includes(termino);
    const coincideCodigoBarras = p.codigo_barras?.toLowerCase().includes(termino);
    const coincideEtiqueta = p.etiquetas?.some((tag: string) =>
      tag.toLowerCase().includes(termino)
    );

    return (
      coincideNombre ||
      coincideCategoria ||
      coincidePrecio ||
      coincideCodigoBarras ||
      coincideEtiqueta
    );
  });

  const handleConfirmarRestock = (id: number | string) => {
    const num = Number(cantidadRestock);
    if (num === 0 || isNaN(num)) return;
    if (onRestock) {
      onRestock(id, num);
    }
    setModalRestockId(null);
    setCantidadRestock("1");
  };

  return (
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-lg font-bold text-[#12151B]">
          📦 Listado de Productos
        </h2>

        {/* Buscador Global */}
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

            // Obtención de la lista de fotos y la portada
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
                  {/* Imagen de Portada con Badge de cantidad de fotos */}
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

                    {/* Botón de Pausa / Activar */}
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

                  {/* 🏷️ LISTADO DE ETIQUETAS/TAGS EN EL ADMIN */}
                  {p.etiquetas && p.etiquetas.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.etiquetas.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="rounded-full bg-emerald-100/70 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-[#0E6E55]"
                        >
                          🏷️ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Badge de Código de Barras */}
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

                      {/* Cuotas */}
                      {p.permite_cuotas !== false && (
                        <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                          💳 3 cuotas sin interés de ${calcularCuotas(p.precio).montoCuota.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>

                    {/* Stock + Botón Restock */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0E6E55]">
                        Stock: {p.stock || 0}
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

                {/* Botones de Acción */}
                <div className="mt-4 flex gap-2 border-t border-[#E7E5E0] pt-3">
                  {/* Botón para abrir la creación de Story */}
                  <button
                    type="button"
                    onClick={() => setProductoStory(p)}
                    title="Generar Story para Instagram/WhatsApp"
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
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

      {/* Modal de Re-stock */}
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
              inputMode="numeric"
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

      {/* Modal Generador de Stories */}
      <ModalGeneradorStory
        isOpen={Boolean(productoStory)}
        onClose={() => setProductoStory(null)}
        producto={productoStory}
        config={configEmpresa}
      />
    </div>
  );
}