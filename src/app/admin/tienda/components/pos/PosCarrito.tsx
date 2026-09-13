"use client";
import { useState } from "react";
import { PosCartItem, TipoDescuento } from "./types";

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
  const [descuentoValor, setDescuentoValor] = useState<string>("");
  const [tipoDescuento, setTipoDescuento] = useState<TipoDescuento>("monto");

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.precio_unitario * item.cantidad,
    0
  );

  const valDesc = Number(descuentoValor) || 0;
  const descuentoCalculado =
    tipoDescuento === "porcentaje"
      ? (subtotal * valDesc) / 100
      : valDesc;

  const totalFinal = Math.max(0, subtotal - descuentoCalculado);

  return (
    <div className="flex flex-col rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm lg:h-[calc(100vh-180px)] lg:sticky lg:top-4">
      {/* Cabecera del Carrito */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-[#12151B]">🛒 Carrito de Venta</h3>
        {carrito.length > 0 && (
          <button
            onClick={onVaciarCarrito}
            className="text-xs font-semibold text-[#C84343] hover:underline"
          >
            Vaciar
          </button>
        )}
      </div>

      {/* Lista de productos seleccionados */}
      <div className="no-scrollbar my-3 flex-1 overflow-y-auto space-y-2 max-h-[300px] lg:max-h-none">
        {carrito.length === 0 ? (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center text-gray-400">
            <span className="text-2xl">🛍️</span>
            <p className="mt-1 text-xs font-medium">No hay productos en la orden</p>
          </div>
        ) : (
          carrito.map((item) => (
            <div
              key={item.producto_id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#F7F7F5] p-2.5"
            >
              <div className="flex-1 pr-2">
                <p className="line-clamp-1 text-xs font-bold text-[#12151B]">
                  {item.titulo}
                </p>
                <p className="text-[11px] font-semibold text-gray-500">
                  ${item.precio_unitario.toLocaleString("es-AR")} c/u
                </p>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onModificarCantidad(item.producto_id, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-5 text-center text-xs font-bold text-[#12151B]">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => onModificarCantidad(item.producto_id, 1)}
                  disabled={item.cantidad >= item.stock_disponible}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                >
                  +
                </button>
                <button
                  onClick={() => onEliminarItem(item.producto_id)}
                  className="ml-1 text-gray-400 hover:text-red-500 text-xs p-1"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Descuento manual opcional */}
      {carrito.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Descuento..."
              value={descuentoValor}
              onChange={(e) => setDescuentoValor(e.target.value)}
              className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-2 text-xs font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
            <button
              onClick={() => setTipoDescuento(tipoDescuento === "monto" ? "porcentaje" : "monto")}
              className="rounded-xl border border-[#E7E5E0] bg-gray-100 px-3 py-2 text-xs font-bold text-[#12151B]"
            >
              {tipoDescuento === "monto" ? "$" : "%"}
            </button>
          </div>

          {/* Totales */}
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
            {descuentoCalculado > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Descuento:</span>
                <span>-${descuentoCalculado.toLocaleString("es-AR")}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-extrabold text-[#12151B]">
              <span>TOTAL:</span>
              <span className="text-[#0E6E55]">${totalFinal.toLocaleString("es-AR")}</span>
            </div>
          </div>

          {/* Botón Principal de Cobro */}
          <button
            onClick={() => onIniciarCobro(subtotal, descuentoCalculado, totalFinal)}
            disabled={carrito.length === 0}
            className="mt-4 w-full rounded-xl bg-[#0E6E55] py-3 text-sm font-bold text-white transition-all hover:bg-[#0A5340] active:scale-[0.99] disabled:opacity-50"
          >
            💳 Cobrar ${totalFinal.toLocaleString("es-AR")}
          </button>
        </div>
      )}
    </div>
  );
}