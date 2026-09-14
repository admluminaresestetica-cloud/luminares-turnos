"use client";
import { useState } from "react";
import { PosCartItem } from "./types";

interface ModalCobroProps {
  isOpen: boolean;
  onClose: () => void;
  carrito: PosCartItem[];
  subtotal: number;
  descuentoCalculado: number;
  totalFinal: number;
  supabase: any;
  // CAMBIO 1: Recibe el objeto con los datos del ticket de venta
  onVentaExitosa: (datosTicket: {
    pedidoId: string;
    items: PosCartItem[];
    total: number;
    metodoPago: string;
    pagoCon: number;
    vuelto: number;
    nombreCliente: string;
  }) => void;
}

export default function ModalCobro({
  isOpen,
  onClose,
  carrito,
  subtotal,
  descuentoCalculado,
  totalFinal,
  supabase,
  onVentaExitosa,
}: ModalCobroProps) {
  const [metodoPago, setMetodoPago] = useState<string>("efectivo");
  const [pagoCon, setPagoCon] = useState<string>("");
  const [nombreCliente, setNombreCliente] = useState<string>("Cliente Ocasional");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const montoEntregado = Number(pagoCon) || 0;
  const vuelto = metodoPago === "efectivo" ? Math.max(0, montoEntregado - totalFinal) : 0;
  const esEfectivoInsuficiente = metodoPago === "efectivo" && montoEntregado > 0 && montoEntregado < totalFinal;

  const handleConfirmarVenta = async () => {
    if (metodoPago === "efectivo" && montoEntregado < totalFinal) {
      alert("El monto entregado es menor al total a pagar.");
      return;
    }

    setLoading(true);

    try {
      const itemsPayload = carrito.map((item) => ({
        producto_id: item.producto_id,
        titulo: item.titulo,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      }));

      const { data, error } = await supabase.rpc("registrar_venta_pos", {
        p_items: itemsPayload,
        p_metodo_pago: metodoPago,
        p_total: totalFinal,
        p_pago_con: metodoPago === "efectivo" ? montoEntregado : totalFinal,
        p_vuelto: vuelto,
        p_cliente_nombre: nombreCliente.trim() || "Cliente Ocasional",
      });

      if (error) {
        throw error;
      }

      // CAMBIO 2: Pasamos toda la información necesaria para armar el ticket
      if (data && data.pedido_id) {
        onVentaExitosa({
          pedidoId: data.pedido_id,
          items: carrito,
          total: totalFinal,
          metodoPago,
          pagoCon: metodoPago === "efectivo" ? montoEntregado : totalFinal,
          vuelto,
          nombreCliente: nombreCliente.trim() || "Cliente Ocasional",
        });
      }

      onClose();
    } catch (err: any) {
      alert("Error al procesar la venta: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-2xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-[#12151B]">💳 Procesar Pago POS</h3>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Resumen de Total */}
        <div className="my-4 rounded-xl bg-[#F7F7F5] p-4 text-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total a Cobrar
          </span>
          <p className="mt-1 text-3xl font-black text-[#0E6E55]">
            ${totalFinal.toLocaleString("es-AR")}
          </p>
          {descuentoCalculado > 0 && (
            <p className="mt-1 text-xs font-semibold text-emerald-600">
              Descuento aplicado: -${descuentoCalculado.toLocaleString("es-AR")}
            </p>
          )}
        </div>

        {/* Selección de Método de Pago */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#12151B]">Medio de Pago</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "efectivo", label: "💵 Efectivo" },
              { id: "transferencia", label: "📱 Transfer/MP" },
              { id: "tarjeta", label: "💳 Tarjeta" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetodoPago(m.id)}
                className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  metodoPago === m.id
                    ? "border-[#0E6E55] bg-[#0E6E55] text-white"
                    : "border-[#E7E5E0] bg-white text-[#12151B] hover:bg-gray-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Cálculo de Vuelto (Si es Efectivo) */}
          {metodoPago === "efectivo" && (
            <div className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-[#FAFAFA] p-3">
              <label className="text-xs font-bold text-[#12151B]">Paga con ($):</label>
              <input
                type="number"
                value={pagoCon}
                onChange={(e) => setPagoCon(e.target.value)}
                placeholder="Ej: 10000"
                className="w-full rounded-xl border border-[#E7E5E0] bg-white p-2.5 text-sm font-bold text-[#12151B] outline-none focus:border-[#0E6E55]"
              />

              {/* Botones rápidos de dinero billete */}
              <div className="flex gap-1.5 pt-1">
                {[1000, 2000, 5000, 10000, 20000].map((monto) => (
                  <button
                    key={monto}
                    type="button"
                    onClick={() => setPagoCon(monto.toString())}
                    className="flex-1 rounded-lg border border-gray-200 bg-white py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-100"
                  >
                    ${monto / 1000}k
                  </button>
                ))}
              </div>

              {montoEntregado > 0 && (
                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                  <span className="font-bold text-gray-600">Vuelto:</span>
                  <span
                    className={`font-black text-base ${
                      esEfectivoInsuficiente ? "text-red-500" : "text-emerald-700"
                    }`}
                  >
                    {esEfectivoInsuficiente
                      ? "Faltan $" + (totalFinal - montoEntregado).toLocaleString("es-AR")
                      : "$" + vuelto.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Campo Opcional Cliente */}
          <div className="pt-2">
            <label className="text-xs font-bold text-[#12151B]">Nombre Cliente (Opcional)</label>
            <input
              type="text"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Cliente Ocasional"
              className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-2.5 text-xs font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#E7E5E0] bg-white py-3 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading || esEfectivoInsuficiente}
            onClick={handleConfirmarVenta}
            className="flex-1 rounded-xl bg-[#0E6E55] py-3 text-xs font-bold text-white transition-all hover:bg-[#0A5340] disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Finalizar Venta"}
          </button>
        </div>
      </div>
    </div>
  );
}