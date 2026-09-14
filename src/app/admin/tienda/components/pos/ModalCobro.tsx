"use client";
import { useState, useEffect, useRef } from "react";
import { PosCartItem } from "./types";

interface ModalCobroProps {
  isOpen: boolean;
  onClose: () => void;
  carrito: PosCartItem[];
  subtotal: number;
  descuentoCalculado: number;
  totalFinal: number;
  supabase: any;
  onVentaExitosa: (datosTicket: {
    pedidoId: string;
    items: PosCartItem[];
    subtotalInicial: number;
    descuentoMonto: number;
    recargoMonto: number;
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
  totalFinal: totalBase,
  supabase,
  onVentaExitosa,
}: ModalCobroProps) {
  const [esPagoMixto, setEsPagoMixto] = useState<boolean>(false);
  const [metodoPago, setMetodoPago] = useState<string>("efectivo");
  
  const [montoEfectivoMixto, setMontoEfectivoMixto] = useState<string>("");
  const [montoDigitalMixto, setMontoDigitalMixto] = useState<string>("");
  const [metodoDigitalSecundario, setMetodoDigitalSecundario] = useState<string>("transferencia");

  const [porcentajeAjuste, setPorcentajeAjuste] = useState<number>(0);
  const [pagoCon, setPagoCon] = useState<string>("");
  const [nombreCliente, setNombreCliente] = useState<string>("Cliente Ocasional");
  const [loading, setLoading] = useState<boolean>(false);

  const inputPagoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPagoCon("");
      setMetodoPago("efectivo");
      setEsPagoMixto(false);
      setPorcentajeAjuste(0);
      setMontoEfectivoMixto("");
      setMontoDigitalMixto("");
      setTimeout(() => {
        if (inputPagoRef.current) {
          inputPagoRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Cálculos de montos desglosados
  const montoAjusteMedioPago = (totalBase * porcentajeAjuste) / 100;
  const recargoMonto = montoAjusteMedioPago > 0 ? Math.round(montoAjusteMedioPago) : 0;
  const descuentoAdicionalMonto = montoAjusteMedioPago < 0 ? Math.abs(Math.round(montoAjusteMedioPago)) : 0;
  const descuentoTotalMonto = descuentoCalculado + descuentoAdicionalMonto;

  const totalConAjuste = Math.max(0, Math.round(totalBase + montoAjusteMedioPago));

  const montoEntregado = Number(pagoCon) || 0;
  const vuelto = !esPagoMixto && metodoPago === "efectivo" ? Math.max(0, montoEntregado - totalConAjuste) : 0;
  const esEfectivoInsuficiente = !esPagoMixto && metodoPago === "efectivo" && montoEntregado < totalConAjuste;

  const numEfectivoMixto = Number(montoEfectivoMixto) || 0;
  const numDigitalMixto = Number(montoDigitalMixto) || 0;
  const sumaMixto = numEfectivoMixto + numDigitalMixto;
  const restanteMixto = totalConAjuste - sumaMixto;
  const esMixtoIncompleto = esPagoMixto && sumaMixto < totalConAjuste;

  const handleSeleccionarMetodo = (mId: string) => {
    setMetodoPago(mId);
    if (mId === "tarjeta") {
      setPorcentajeAjuste(10);
    } else {
      setPorcentajeAjuste(0);
    }
  };

  const handleConfirmarVenta = async () => {
    if (!esPagoMixto && metodoPago === "efectivo" && montoEntregado < totalConAjuste) {
      alert("El monto entregado es menor al total a pagar.");
      return;
    }

    if (esPagoMixto && sumaMixto < totalConAjuste) {
      alert("La suma de los pagos no cubre el total de la venta.");
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

      const metodoFinal = esPagoMixto
        ? `mixto (Efectivo: $${numEfectivoMixto} + ${metodoDigitalSecundario.toUpperCase()}: $${numDigitalMixto})`
        : metodoPago;

      const pagoConFinal = esPagoMixto
        ? totalConAjuste
        : metodoPago === "efectivo"
        ? montoEntregado
        : totalConAjuste;

      const { data, error } = await supabase.rpc("registrar_venta_pos", {
        p_items: itemsPayload,
        p_metodo_pago: metodoFinal,
        p_total: totalConAjuste,
        p_pago_con: pagoConFinal,
        p_vuelto: vuelto,
        p_cliente_nombre: nombreCliente.trim() || "Cliente Ocasional",
        p_descuento_monto: descuentoTotalMonto,
        p_recargo_monto: recargoMonto,
      });

      if (error) throw error;

      if (data && data.pedido_id) {
        onVentaExitosa({
          pedidoId: data.pedido_id,
          items: carrito,
          subtotalInicial: subtotal,
          descuentoMonto: descuentoTotalMonto,
          recargoMonto: recargoMonto,
          total: totalConAjuste,
          metodoPago: metodoFinal,
          pagoCon: pagoConFinal,
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

  const handleKeyDownForm = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && !esEfectivoInsuficiente && !esMixtoIncompleto) {
      e.preventDefault();
      handleConfirmarVenta();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-2xl"
        onKeyDown={handleKeyDownForm}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-[#12151B]">💳 Procesar Pago POS</h3>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="my-3 rounded-xl bg-[#F7F7F5] p-3 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Total a Cobrar
          </span>
          <p className="text-3xl font-black text-[#0E6E55]">
            ${totalConAjuste.toLocaleString("es-AR")}
          </p>
          
          {porcentajeAjuste !== 0 && (
            <span className={`text-[11px] font-bold ${porcentajeAjuste > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {porcentajeAjuste > 0 ? `+${porcentajeAjuste}% Recargo` : `${porcentajeAjuste}% Descuento`} (${montoAjusteMedioPago > 0 ? '+' : ''}${Math.round(montoAjusteMedioPago)})
            </span>
          )}
        </div>

        <div className="mb-3 flex items-center justify-between gap-1.5 rounded-xl bg-gray-50 p-2 border border-gray-100">
          <span className="text-[11px] font-bold text-gray-700">Ajuste / Recargo:</span>
          <div className="flex gap-1">
            {[-10, -5, 0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setPorcentajeAjuste(pct)}
                className={`rounded-lg px-2 py-1 text-[10px] font-extrabold transition-all ${
                  porcentajeAjuste === pct
                    ? "bg-[#12151B] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {pct > 0 ? `+${pct}%` : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setEsPagoMixto(false)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              !esPagoMixto ? "bg-white text-[#12151B] shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Pago Único
          </button>
          <button
            type="button"
            onClick={() => setEsPagoMixto(true)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              esPagoMixto ? "bg-[#0E6E55] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            🔀 Pago Mixto
          </button>
        </div>

        {!esPagoMixto ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "efectivo", label: "💵 Efectivo" },
                { id: "transferencia", label: "📱 Transfer/MP" },
                { id: "tarjeta", label: "💳 Tarjeta" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSeleccionarMetodo(m.id)}
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

            {metodoPago === "efectivo" && (
              <div className="space-y-2 rounded-xl border border-gray-200 bg-[#FAFAFA] p-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#12151B]">Paga con ($):</label>
                  <button
                    type="button"
                    onClick={() => setPagoCon(totalConAjuste.toString())}
                    className="text-[10px] font-bold text-[#0E6E55] hover:underline"
                  >
                    Paga Exacto
                  </button>
                </div>

                <input
                  ref={inputPagoRef}
                  type="number"
                  value={pagoCon}
                  onChange={(e) => setPagoCon(e.target.value)}
                  placeholder="Ej: 10000"
                  className="w-full rounded-xl border border-[#E7E5E0] bg-white p-2.5 text-sm font-bold text-[#12151B] outline-none focus:border-[#0E6E55]"
                />

                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[1000, 2000, 5000, 10000, 20000].map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      onClick={() => setPagoCon(monto.toString())}
                      className="rounded-lg border border-gray-200 bg-white py-1.5 text-[10px] font-bold text-gray-700 hover:bg-emerald-50 hover:border-[#0E6E55] hover:text-[#0E6E55] transition-all"
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
                        ? "Faltan $" + (totalConAjuste - montoEntregado).toLocaleString("es-AR")
                        : "$" + vuelto.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
            <h4 className="text-xs font-extrabold text-[#0E6E55]">Desglose de Pago Mixto</h4>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Monto en Efectivo ($):</label>
              <input
                type="number"
                value={montoEfectivoMixto}
                onChange={(e) => {
                  const val = e.target.value;
                  setMontoEfectivoMixto(val);
                  const num = Number(val) || 0;
                  if (num <= totalConAjuste) {
                    setMontoDigitalMixto((totalConAjuste - num).toString());
                  }
                }}
                placeholder="Monto entregado en efectivo"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-2 text-xs font-bold text-gray-800 outline-none focus:border-[#0E6E55]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-700">Monto Digital ($):</label>
                <select
                  value={metodoDigitalSecundario}
                  onChange={(e) => setMetodoDigitalSecundario(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-bold text-gray-700"
                >
                  <option value="transferencia">Transferencia / MP</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
              <input
                type="number"
                value={montoDigitalMixto}
                onChange={(e) => setMontoDigitalMixto(e.target.value)}
                placeholder="Monto cobrado digitalmente"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-2 text-xs font-bold text-gray-800 outline-none focus:border-[#0E6E55]"
              />
            </div>

            <div className="flex items-center justify-between border-t border-emerald-200 pt-2 text-xs">
              <span className="font-bold text-gray-600">Suma total ingresada:</span>
              <span
                className={`font-black ${
                  restanteMixto > 0 ? "text-amber-600" : restanteMixto === 0 ? "text-emerald-700" : "text-red-500"
                }`}
              >
                ${sumaMixto.toLocaleString("es-AR")}{" "}
                {restanteMixto > 0 && `(Faltan $${restanteMixto.toLocaleString("es-AR")})`}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <label className="text-xs font-bold text-[#12151B]">Nombre Cliente (Opcional)</label>
          <input
            type="text"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            placeholder="Cliente Ocasional"
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-2 text-xs font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#E7E5E0] bg-white py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar (Esc)
          </button>
          <button
            type="button"
            disabled={loading || esEfectivoInsuficiente || esMixtoIncompleto}
            onClick={handleConfirmarVenta}
            className="flex-1 rounded-xl bg-[#0E6E55] py-3 text-xs font-bold text-white transition-all hover:bg-[#0A5340] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Finalizar Venta (Enter)"}
          </button>
        </div>
      </div>
    </div>
  );
}