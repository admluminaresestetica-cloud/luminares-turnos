"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Sparkles } from "lucide-react";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";

interface ModalDetalleProductoProps {
  producto: Producto | null;
  todosProductos: Producto[];
  onClose: () => void;
  onSeleccionarProducto: (prod: Producto) => void;
  onAbrirCarrito?: () => void; // <--- Agregás esto
}

export default function ModalDetalleProducto({
  producto,
  todosProductos,
  onClose,
  onSeleccionarProducto,
  onAbrirCarrito, // <--- Lo recibís acá
}: ModalDetalleProductoProps) {
  const [cantidad, setCantidad] = useState(1);
  
  const context = useCarrito();
  const agregarAlCarrito = context?.agregarAlCarrito;
  const actualizarCantidad = (context as any)?.actualizarCantidad;
  const eliminarDelCarrito = (context as any)?.eliminarDelCarrito;
  const items = context?.items || context?.carrito || [];
  
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Stock real del producto principal
  const stockDisponible = producto?.stock ?? 0;
  const sinStock = stockDisponible <= 0;

  // Buscar cuántos hay actualmente en el carrito del producto principal
  const itemEnCarrito = Array.isArray(items) && producto
    ? items.find((item: any) => item.id === producto.id)
    : null;
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  // Cuántas unidades más se pueden agregar como máximo
  const maximoPermitidoParaAgregar = Math.max(0, stockDisponible - cantidadEnCarrito);

  // Reseteamos la cantidad según lo disponible al cambiar de producto
  useEffect(() => {
    if (maximoPermitidoParaAgregar > 0) {
      setCantidad(1);
    } else {
      setCantidad(0);
    }
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [producto, maximoPermitidoParaAgregar]);

  // Soporte para cerrar con tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (producto) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [producto, onClose]);

  if (!producto) return null;

  const precioOriginal = Number(producto.precio_original ?? producto.precio_anterior) || 0;
  const tieneDescuento = precioOriginal > producto.precio;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(((precioOriginal - producto.precio) / precioOriginal) * 100)
    : 0;

  // 1. Las dos funciones juntas
  const handleAgregarPrincipal = () => {
    if (cantidad <= 0 || maximoPermitidoParaAgregar <= 0 || !agregarAlCarrito) return;

    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto);
    }
    onClose();
  };

  const handleComprarAhora = () => {
    if (cantidad <= 0 || maximoPermitidoParaAgregar <= 0 || !agregarAlCarrito) return;

    // 1. Agrega las unidades al carrito
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto);
    }

    // 2. Cierra el modal de detalle
    onClose();

    // 3. Abre el CarritoDrawer inmediatamente
    if (onAbrirCarrito) {
      onAbrirCarrito();
    }
  };

  // Handlers para la sección de Cross-Selling (Productos Recomendados)
  const handleRestarRecomendado = (e: React.MouseEvent, relProd: Producto, cantActual: number) => {
    e.stopPropagation();
    if (cantActual > 1 && actualizarCantidad) {
      actualizarCantidad(relProd.id, cantActual - 1);
    } else if (eliminarDelCarrito) {
      eliminarDelCarrito(relProd.id);
    } else if (actualizarCantidad) {
      actualizarCantidad(relProd.id, 0);
    }
  };

  const handleSumarRecomendado = (e: React.MouseEvent, relProd: Producto, cantActual: number, relStock: number) => {
    e.stopPropagation();
    if (cantActual < relStock) {
      if (cantActual > 0 && actualizarCantidad) {
        actualizarCantidad(relProd.id, cantActual + 1);
      } else if (agregarAlCarrito) {
        agregarAlCarrito(relProd);
      }
    }
  };

  // Lógica de Cross-Selling
  const complementosOtrasCategorias = todosProductos.filter(
    (p) => p.id !== producto.id && p.categoria !== producto.categoria
  );

  const deLaMismaCategoria = todosProductos.filter(
    (p) => p.id !== producto.id && p.categoria === producto.categoria
  );

  const productosRelacionados = [...complementosOtrasCategorias, ...deLaMismaCategoria].slice(0, 3);

  // Controles de incremento y decremento modal principal
  const puedeSumar = cantidad < maximoPermitidoParaAgregar;
  const puedeRestar = cantidad > 1;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="sticky top-0 float-right z-20 -mr-2 -mt-2 sm:-mr-4 sm:-mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 backdrop-blur-md transition-colors hover:bg-slate-200 hover:text-slate-800 cursor-pointer shadow-sm"
          title="Cerrar (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start clear-both">
          {/* Imagen Principal */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            {producto.imagen_url ? (
              <Image
                src={producto.imagen_url}
                alt={producto.nombre}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                Sin Imagen
              </div>
            )}

            {tieneDescuento && !sinStock && (
              <span className="absolute top-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                -{porcentajeDescuento}% OFF
              </span>
            )}

            {sinStock && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-bold text-[#12151B]">
                  Sin Stock
                </span>
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E6E55]">
                {producto.categoria}
              </span>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl mt-1">
                {producto.nombre}
              </h2>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  ${producto.precio.toLocaleString("es-AR")}
                </span>
                {tieneDescuento && (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    ${precioOriginal.toLocaleString("es-AR")}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Stock disponible: <strong className="text-slate-800">{stockDisponible}</strong>
                {cantidadEnCarrito > 0 && (
                  <span className="ml-1 text-emerald-700 font-medium">
                    ({cantidadEnCarrito} en el carrito)
                  </span>
                )}
              </p>

              {producto.descripcion && (
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  {producto.descripcion}
                </p>
              )}
            </div>

            {/* Selector de Cantidad y Botón Principal */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <span className="text-xs font-semibold text-slate-600 pl-2">Cantidad a agregar:</span>
                <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-1">
                  <button
                    onClick={() => puedeRestar && setCantidad(cantidad - 1)}
                    disabled={!puedeRestar}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      puedeRestar
                        ? "text-slate-700 hover:bg-slate-100 cursor-pointer"
                        : "text-slate-300 cursor-not-allowed"
                    }`}
                    title="Restar cantidad"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="w-6 text-center text-sm font-bold text-slate-900">
                    {cantidad}
                  </span>

                  <button
                    onClick={() => puedeSumar && setCantidad(cantidad + 1)}
                    disabled={!puedeSumar}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      puedeSumar
                        ? "text-slate-700 hover:bg-slate-100 cursor-pointer"
                        : "text-slate-300 cursor-not-allowed"
                    }`}
                    title={!puedeSumar ? "Límite de stock alcanzado" : "Sumar cantidad"}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Botón de Agregar al Carrito */}
              <button
                onClick={handleAgregarPrincipal}
                disabled={sinStock || maximoPermitidoParaAgregar <= 0}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all ${
                  sinStock || maximoPermitidoParaAgregar <= 0
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-[#0E6E55] text-white hover:bg-[#0b5944] active:scale-[0.98] shadow-md shadow-[#0E6E55]/20 cursor-pointer"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {sinStock
                    ? "Sin stock disponible"
                    : maximoPermitidoParaAgregar <= 0
                    ? "Máximo alcanzado en el carrito"
                    : `Agregar al Carrito • $${(producto.precio * cantidad).toLocaleString("es-AR")}`}
                </span>
              </button>

              {/* Botón de Comprar Ahora (Estilo Mercado Libre, Limpio) */}
             <button
  onClick={handleComprarAhora}
  disabled={sinStock || maximoPermitidoParaAgregar <= 0}
  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all mt-2.5 ${
    sinStock || maximoPermitidoParaAgregar <= 0
      ? "bg-slate-200 text-slate-400 cursor-not-allowed border-transparent"
      : "border-2 border-[#0E6E55] bg-transparent text-[#0E6E55] hover:bg-[#0E6E55]/10 active:scale-[0.98] cursor-pointer"
  }`}
>
  <span>Comprar ahora</span>
</button>



            </div>
          </div>
        </div>

        {/* Sección Cross-Selling con Controles Inteligentes */}
        {productosRelacionados.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#0E6E55]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Completa tu rutina / Recomendados
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Suma en 1-clic</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {productosRelacionados.map((rel) => {
                const relPrecioOriginal = Number(rel.precio_original ?? rel.precio_anterior) || 0;
                const relTieneDesc = relPrecioOriginal > rel.precio;
                const relStock = rel.stock ?? 0;

                // Ver cuántos hay en carrito de este recomendado
                const itemRelEnCarrito = Array.isArray(items)
                  ? items.find((item: any) => item.id === rel.id)
                  : null;
                const relCantidadEnCarrito = itemRelEnCarrito ? itemRelEnCarrito.cantidad : 0;
                const relLimiteAlcanzado = relCantidadEnCarrito >= relStock;

                return (
                  <div
                    key={rel.id}
                    onClick={() => onSeleccionarProducto && onSeleccionarProducto(rel)}
                    className="group relative flex flex-col justify-between text-left rounded-2xl border border-slate-100 p-2.5 hover:border-[#0E6E55]/40 hover:bg-slate-50/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                        {rel.imagen_url ? (
                          <Image
                            src={rel.imagen_url}
                            alt={rel.nombre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-300">
                            Sin Foto
                          </div>
                        )}

                        {relTieneDesc && (
                          <span className="absolute top-1 left-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            OFF
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-slate-800 truncate block w-full group-hover:text-[#0E6E55] transition-colors">
                        {rel.nombre}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-slate-100/60">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0E6E55]">
                          ${rel.precio.toLocaleString("es-AR")}
                        </span>
                        {relTieneDesc && (
                          <span className="text-[9px] text-slate-400 line-through">
                            ${relPrecioOriginal.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>

                      {/* Controles de Cantidad / Botón Agregar para Recomendados */}
                      {relCantidadEnCarrito === 0 ? (
                        <button
                          onClick={(e) => handleSumarRecomendado(e, rel, relCantidadEnCarrito, relStock)}
                          disabled={relStock <= 0}
                          title="Agregar al carrito"
                          className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#0E6E55]/10 text-[#0E6E55] hover:bg-[#0E6E55] hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 rounded-xl p-0.5 shadow-sm">
                          <button
                            onClick={(e) => handleRestarRecomendado(e, rel, relCantidadEnCarrito)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition-all font-bold text-xs"
                            title="Restar una unidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="text-[11px] font-extrabold text-emerald-900 px-1">
                            {relCantidadEnCarrito}
                          </span>

                          <button
                            onClick={(e) => handleSumarRecomendado(e, rel, relCantidadEnCarrito, relStock)}
                            disabled={relLimiteAlcanzado}
                            className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                              relLimiteAlcanzado
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-[#0E6E55] text-white hover:bg-[#0b5944]"
                            }`}
                            title={relLimiteAlcanzado ? "Stock máximo alcanzado" : "Sumar una unidad"}
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
          </div>
        )}
      </div>
    </div>
  );
}