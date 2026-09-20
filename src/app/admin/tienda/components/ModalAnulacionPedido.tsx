"use client";

import { Pedido } from "./PedidosTab";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
            ⚠️
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Anulación / Devolución de Pedido
            </h3>
            <p className="text-xs text-gray-500">
              Especificá cuántas unidades vuelven al inventario y cuántas van a baja por rotura.
            </p>
          </div>
        </div>

        <div className="my-4 max-h-72 overflow-y-auto space-y-3 border-b border-gray-100 pb-3 pr-1">
          {itemsAAnular.map((item, idx) => (
            <div
              key={item.id || idx}
              className="rounded-xl border border-gray-200 p-3 bg-gray-50/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    {item.nombre_producto}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Total en el pedido: {item.cantidadVendida} un.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Control Unidades a Reponer */}
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1.5">
                  <span className="text-[11px] font-semibold text-emerald-900">
                    Al Stock:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => modificarCantidad(idx, "reponer", "-")}
                      className="flex h-6 w-6 items-center justify-center rounded bg-white text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-emerald-950">
                      {item.cantReponer}
                    </span>
                    <button
                      type="button"
                      onClick={() => modificarCantidad(idx, "reponer", "+")}
                      className="flex h-6 w-6 items-center justify-center rounded bg-white text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Control Unidades en Baja / Rotura */}
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-1.5">
                  <span className="text-[11px] font-semibold text-red-900">
                    Baja / Roto:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => modificarCantidad(idx, "baja", "-")}
                      className="flex h-6 w-6 items-center justify-center rounded bg-white text-xs font-bold text-red-800 shadow-2xs hover:bg-red-100 active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-red-950">
                      {item.cantBaja}
                    </span>
                    <button
                      type="button"
                      onClick={() => modificarCantidad(idx, "baja", "+")}
                      className="flex h-6 w-6 items-center justify-center rounded bg-white text-xs font-bold text-red-800 shadow-2xs hover:bg-red-100 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {itemsAAnular.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-4">
              Sin ítems registrados en el pedido.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 active:scale-95 shadow-md shadow-red-600/20 transition-all"
          >
            Confirmar Anulación
          </button>
        </div>
      </div>
    </div>
  );
}