"use client";
import { useState } from "react";
import { PosCartItem, TipoDescuento } from "./types";
import { ChevronUp, ChevronDown, ShoppingCart, Trash2 } from "lucide-react";

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
  const [expandidoMobile, setExpandidoMobile] = useState<boolean>(false);

  const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);

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

  const handleVaciar = () => {
    setDescuentoValor("");
    onVaciarCarrito();
  };

  const handleIniciarCobro = () => {
    onIniciarCobro(subtotal, descuentoCalculado, totalFinal);
    setDescuentoValor("");
    setExpandidoMobile(false);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 shadow-2xl transition-all duration-300 rounded-t-2xl lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto lg:border lg:border-[#E7E5E0] lg:p-4 lg:shadow-sm lg:rounded-2xl lg:h-[calc(100vh-180px)] lg:sticky lg:top-4 flex flex-col ${
        expandidoMobile ? "h-[80vh]" : "h-auto"
      }`}
    >
      {/* Cabecera / Barra resumida en Mobile */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <button
          onClick={() => setExpandidoMobile(!expandidoMobile)}
          className="flex items-center gap-2 text-left lg:pointer-events-none"
        >
          <div className="rounded-xl bg-[#0E6E55]/10 p-2 text-[#0E6E55]">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#12151B] lg:text-base">
              Carrito de Venta {totalUnidades > 0 && `(${totalUnidades})`}
            </h3>
            <p className="text-[11px] font-semibold text-[#0E6E55] lg:hidden">
              Total: ${totalFinal.toLocaleString("es-AR")}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {carrito.length > 0 && (
            <button
              onClick={handleVaciar}
              className="text-xs font-semibold text-[#C84343] hover:underline"
            >
              Vaciar
            </button>
          )}

          {/* Botón para desplegar/colapsar solo en móvil */}
          <button
            onClick={() => setExpandidoMobile(!expandidoMobile)}
            className="rounded-lg bg-gray-100 p-1.5 text-gray-600 lg:hidden"
          >
            {expandidoMobile ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Lista de productos seleccionados */}
      <div
        className={`no-scrollbar my-3 flex-1 overflow-y-auto space-y-2 ${
          expandidoMobile ? "block" : "hidden lg:block"
        }`}
      >
        {carrito.length === 0 ? (
          <div className="flex h-full min-h-[140px] flex-col items-center justify-center text-center text-gray-400">
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
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totales y Cobro */}
      <div className={`${expandidoMobile ? "block" : "hidden lg:block"} border-t border-gray-100 pt-3`}>
        {carrito.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
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
        )}

        <div className="space-y-1.5 text-xs">
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

        <button
          onClick={handleIniciarCobro}
          disabled={carrito.length === 0}
          className="mt-3 w-full rounded-xl bg-[#0E6E55] py-3 text-sm font-bold text-white transition-all hover:bg-[#0A5340] active:scale-[0.99] disabled:opacity-50"
        >
          💳 Cobrar ${totalFinal.toLocaleString("es-AR")}
        </button>
      </div>

      {/* Botón rápido de cobro directo cuando está colapsado en móvil */}
      {!expandidoMobile && carrito.length > 0 && (
        <button
          onClick={handleIniciarCobro}
          className="mt-2 w-full rounded-xl bg-[#0E6E55] py-2.5 text-xs font-bold text-white transition-all lg:hidden"
        >
          💳 Cobrar ${totalFinal.toLocaleString("es-AR")}
        </button>
      )}
    </div>
  );
}
