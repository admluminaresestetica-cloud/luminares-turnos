"use client";

import { useState } from "react";
import { PosCartItem } from "./types";
import { ShoppingBag, Trash2, Plus, Minus, ChevronUp, ChevronDown } from "lucide-react";

interface PosCarritoProps {
  carrito: PosCartItem[];
  onModificarCantidad: (productoId: number, delta: number) => void;
  onEliminarItem: (productoId: number) => void;
  onVaciarCarrito: () => void;
  onIniciarCobro: (subtotal: number, descuentoCalculado: number, totalFinal: number) => void;
}

export default function PosCarrito({
  carrito,
  onModificarCantidad,
  onEliminarItem,
  onVaciarCarrito,
  onIniciarCobro,
}: PosCarritoProps) {
  const [expandidoMobile, setExpandidoMobile] = useState(false);

  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = carrito.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);

  const handleCobrarClick = () => {
    if (carrito.length === 0) return;
    onIniciarCobro(subtotal, 0, subtotal);
  };

  return (
    <>
      {/* BARRA FLOTANTE MÓVIL (Fija justo arriba del Bottom Nav) */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 px-3 pb-2">
        <div className="rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-md p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setExpandidoMobile(!expandidoMobile)}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0E6E55] text-white font-bold">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  Carrito ({totalItems}) {expandidoMobile ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </span>
                <span className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
                  ${subtotal.toLocaleString("es-AR")}
                </span>
              </div>
            </button>

            <button
              disabled={carrito.length === 0}
              onClick={handleCobrarClick}
              className="h-11 px-5 rounded-xl bg-[#0E6E55] text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 transition-all shrink-0"
            >
              Cobrar
            </button>
          </div>

          {/* Lista desplegable móvil */}
          {expandidoMobile && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 max-h-[50vh] overflow-y-auto space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">Items en orden</span>
                {carrito.length > 0 && (
                  <button onClick={onVaciarCarrito} className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Vaciar
                  </button>
                )}
              </div>

              {carrito.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">El carrito está vacío</p>
              ) : (
                carrito.map((item) => (
                  <div key={item.producto_id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/60">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-zinc-100 truncate">{item.titulo}</p>
                      <p className="text-[10px] text-gray-500">${item.precio_unitario.toLocaleString("es-AR")}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onModificarCantidad(item.producto_id, -1)} className="p-1 rounded-lg bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.cantidad}</span>
                      <button onClick={() => onModificarCantidad(item.producto_id, 1)} className="p-1 rounded-lg bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => onEliminarItem(item.producto_id)} className="p-1 text-red-500 ml-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* CARRITO ESCRITORIO (LG+) */}
      <div className="hidden lg:flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sticky top-24 h-[calc(100vh-120px)]">
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#0E6E55]" />
              Orden Actual
            </h2>
            {carrito.length > 0 && (
              <button
                onClick={onVaciarCarrito}
                className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Vaciar
              </button>
            )}
          </div>

          <div className="mt-4 max-h-[52vh] overflow-y-auto space-y-2.5 pr-1">
            {carrito.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-xs font-medium">El carrito está vacío</p>
                <p className="text-[11px] text-gray-300 mt-1">Seleccioná o escaneá productos</p>
              </div>
            ) : (
              carrito.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-zinc-800 dark:bg-zinc-800/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-zinc-100 truncate">{item.titulo}</p>
                    <p className="text-[11px] font-semibold text-[#0E6E55]">
                      ${(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 py-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                      <button
                        onClick={() => onModificarCantidad(item.producto_id, -1)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold px-1 min-w-[18px] text-center">{item.cantidad}</span>
                      <button
                        onClick={() => onModificarCantidad(item.producto_id, 1)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onEliminarItem(item.producto_id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumen de Pago Escritorio */}
        <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Total a Cobrar</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100">
              ${subtotal.toLocaleString("es-AR")}
            </span>
          </div>

          <button
            disabled={carrito.length === 0}
            onClick={handleCobrarClick}
            className="w-full py-3.5 rounded-xl bg-[#0E6E55] text-white font-bold text-sm shadow-md hover:bg-[#0A5340] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Iniciar Cobro (F2)
          </button>
        </div>
      </div>
    </>
  );
}