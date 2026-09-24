"use client";

import React, { useRef, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Package, Plus, Minus, ImageOff } from "lucide-react";
import { Producto } from "@/types/tienda";

interface ItemCarrito {
  id: string | number;
  cantidad: number;
  [key: string]: any;
}

interface CarruselEtiquetaModalProps {
  isOpen: boolean;
  tag: string;
  productos: Producto[];
  items?: ItemCarrito[];
  onClose: () => void;
  onSeleccionarProducto: (prod: Producto) => void;
  onVerMasGlobal: (tag: string) => void;
  handleSumarRecomendado?: (e: React.MouseEvent, rel: Producto, cant: number, stock: number) => void;
  handleRestarRecomendado?: (e: React.MouseEvent, rel: Producto, cant: number) => void;
}

export default function CarruselEtiquetaModal({
  isOpen,
  tag,
  productos,
  items = [],
  onClose,
  onSeleccionarProducto,
  onVerMasGlobal,
  handleSumarRecomendado,
  handleRestarRecomendado,
}: CarruselEtiquetaModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [erroresImagen, setErroresImagen] = useState<Record<string | number, boolean>>({});

  // Filtrado optimizado memoizado
  const productosFiltrados = useMemo(() => {
    if (!tag) return [];
    const criterio = tag.toLowerCase();

    return productos.filter((p) => {
      const nombre = p.nombre?.toLowerCase() || "";
      const cat = p.categoria?.toLowerCase() || "";
      const tagsProd = Array.isArray(p.etiquetas)
        ? p.etiquetas.map((t) => String(t).toLowerCase())
        : [];

      return (
        nombre.includes(criterio) ||
        cat.includes(criterio) ||
        tagsProd.some((t) => t.includes(criterio))
      );
    });
  }, [productos, tag]);

  if (!isOpen) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  const handleImageError = (id: string | number) => {
    setErroresImagen((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-300 rounded-t-[28px]">
      <div className="max-w-[1150px] mx-auto">
        {/* Cabecera del carrusel */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E6E55] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              #{tag}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Productos relacionados
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Ver Más Global */}
            <button
              onClick={() => {
                onVerMasGlobal(tag);
                onClose();
              }}
              className="bg-[#0E6E55] hover:bg-[#0b5643] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              VER MÁS
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenedor de lista o Estado Vacío */}
        {productosFiltrados.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1">
            <Package className="w-6 h-6 text-slate-300" />
            <span>No se encontraron más productos con esta etiqueta</span>
          </div>
        ) : (
          <div className="relative group">
            {/* Flecha Izquierda */}
            <button
              onClick={() => scroll("left")}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Lista de productos horizontal */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory"
            >
              {productosFiltrados.map((prod) => {
                const precioOriginal = Number(prod.precio_original) || 0;
                const tieneDescuento = precioOriginal > prod.precio;
                const prodStock = prod.stock ?? 0;

                // Comprobar si el producto ya está en el carrito
                const itemEnCarrito = items.find((item) => item.id === prod.id);
                const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
                const limiteAlcanzado = cantidadEnCarrito >= prodStock;
                const tieneErrorImagen = erroresImagen[prod.id];

                return (
                  <div
                    key={prod.id}
                    onClick={() => onSeleccionarProducto(prod)}
                    className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px] flex-shrink-0 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm hover:shadow-md hover:border-[#0E6E55]/40 transition-all cursor-pointer snap-start flex flex-col justify-between"
                  >
                    <div>
                      {/* Imagen y Badge de Descuento */}
                      <div className="relative w-full h-24 sm:h-28 bg-slate-50 rounded-xl overflow-hidden mb-2 flex items-center justify-center border border-slate-100">
                        {tieneDescuento && (
                          <span className="absolute top-1.5 left-1.5 z-10 bg-[#0E6E55] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">
                            OFERTA
                          </span>
                        )}
                        {prod.imagen_url && !tieneErrorImagen ? (
                          <Image
                            src={prod.imagen_url}
                            alt={prod.nombre}
                            fill
                            sizes="160px"
                            className="object-cover"
                            onError={() => handleImageError(prod.id)}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-300">
                            <ImageOff className="w-6 h-6 stroke-[1.5]" />
                          </div>
                        )}
                      </div>

                      {/* Nombre del producto */}
                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug mb-1">
                        {prod.nombre}
                      </h4>
                    </div>

                    {/* Precios y Botón interactivo de carrito */}
                    <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-slate-100/60">
                      <div className="flex flex-col">
                        {tieneDescuento && (
                          <span className="block text-[10px] text-slate-400 line-through leading-none">
                            ${precioOriginal.toLocaleString("es-AR")}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          ${(Number(prod.precio) || 0).toLocaleString("es-AR")}
                        </span>
                      </div>

                      {/* BOTÓN SUMAR O SELECTOR DE CANTIDAD */}
                      {cantidadEnCarrito === 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (handleSumarRecomendado) {
                              handleSumarRecomendado(e, prod, cantidadEnCarrito, prodStock);
                            }
                          }}
                          disabled={prodStock <= 0}
                          title="Agregar al carrito"
                          className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#0E6E55]/10 text-[#0E6E55] hover:bg-[#0E6E55] hover:text-white transition-all active:scale-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      ) : (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 rounded-xl p-0.5 shadow-sm shrink-0"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (handleRestarRecomendado) {
                                handleRestarRecomendado(e, prod, cantidadEnCarrito);
                              }
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition-all active:scale-90 font-bold text-xs cursor-pointer"
                            title="Restar una unidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="text-[11px] font-extrabold text-emerald-900 px-0.5">
                            {cantidadEnCarrito}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (handleSumarRecomendado) {
                                handleSumarRecomendado(e, prod, cantidadEnCarrito, prodStock);
                              }
                            }}
                            disabled={limiteAlcanzado}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition-all active:scale-90 font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Sumar una unidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flecha Derecha */}
            <button
              onClick={() => scroll("right")}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}