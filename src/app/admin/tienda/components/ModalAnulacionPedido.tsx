"use client";

import { Pedido } from "./PedidosTab";
import { AlertTriangle, X } from "lucide-react";

export interface ItemAAnular {
  id: string;
  producto_id: number | null;
  nombre_producto: string;
  cantidadVendida: number;
  cantReponer: number;
  cantBaja: number;
}

interface ModalAnulacionPedidoProps {
  pedidoAAnular: Pedido | null;
  itemsAAnular: ItemAAnular[];
  setItemsAAnular: React.Dispatch<React.SetStateAction<ItemAAnular[]>>;
  onCerrar: () => void;
  onConfirmar: () => void;
}

export default function ModalAnulacionPedido({
  pedidoAAnular,
  itemsAAnular,
  setItemsAAnular,
  onCerrar,
  onConfirmar,
}: ModalAnulacionPedidoProps) {
  if (!pedidoAAnular) return null;

  const modificarCantidad = (
    index: number,
    tipo: "reponer" | "baja",
    operacion: "+" | "-"
  ) => {
    const copy = [...itemsAAnular];
    const item = copy[index];

    if (tipo === "reponer") {
      if (operacion === "-" && item.cantReponer > 0) {
        item.cantReponer -= 1;
        item.cantBaja += 1;
      } else if (operacion === "+" && item.cantReponer < item.cantidadVendida) {
        item.cantReponer += 1;
        item.cantBaja -= 1;
      }
    } else {
      if (operacion === "-" && item.cantBaja > 0) {
        item.cantBaja -= 1;
        item.cantReponer += 1;
      } else if (operacion === "+" && item.cantBaja < item.cantidadVendida) {
        item.cantBaja += 1;
        item.cantReponer -= 1;
      }
    }

    setItemsAAnular(copy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 pb-24 sm:pb-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-lg max-h-[85vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        
        {/* Cabecera fija */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 p-6 pb-4 shrink-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">
              Anulación / Devolución de Pedido
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Especificá cuántas unidades vuelven al inventario y cuántas van a baja por rotura.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 py-4 space-y-3">
          {itemsAAnular.map((item, idx) => (
            <div
              key={item.id || idx}
              className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-3.5 bg-gray-50/50 dark:bg-zinc-800/40 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                    {item.nombre_producto}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Total en el pedido: {item.cantidadVendida} un.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Control Unidades a Reponer */}
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2">
                  <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                    Al Stock:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => modificarCantidad(idx, "reponer", "-")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      {item.cantReponer}
                    </span>
                    <button
                      type="button"
                      onClick={() => modificarCantidad(idx, "reponer", "+")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Control Unidades en Baja / Rotura */}
                <div className="flex items-center justify-between rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/30 px-3 py-2">
                  <span className="text-[11px] font-semibold text-red-900 dark:text-red-300">
                    Baja / Roto:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => modificarCantidad(idx, "baja", "-")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-xs font-bold text-red-800 dark:text-red-300 shadow-2xs hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-red-950 dark:text-red-200">
                      {item.cantBaja}
                    </span>
                    <button
                      type="button"
                      onClick={() => modificarCantidad(idx, "baja", "+")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-xs font-bold text-red-800 dark:text-red-300 shadow-2xs hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {itemsAAnular.length === 0 && (
            <p className="text-center text-xs text-gray-400 dark:text-zinc-500 py-6">
              Sin ítems registrados en el pedido.
            </p>
          )}
        </div>

        {/* Footer fijo con los botones */}
        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-zinc-800 p-6 pt-4 shrink-0 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={onCerrar}
            className="h-11 rounded-xl border border-gray-200 dark:border-zinc-700 px-4 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="h-11 rounded-xl bg-red-600 px-5 text-xs font-bold text-white hover:bg-red-700 active:scale-95 shadow-md shadow-red-600/20 transition-all"
          >
            Confirmar Anulación
          </button>
        </div>

      </div>
    </div>
  );
}