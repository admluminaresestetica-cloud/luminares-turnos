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
        producto_id: Number(item.producto_id),
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 pb-20 sm:pb-4 backdrop-blur-xs animate-fadeIn">
      {/* Card/Modal optimizado sin scroll innecesario en PC */}
      <div 
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-2xl max-h-[85vh] sm:max-h-none overflow-y-auto sm:overflow-visible"
        onKeyDown={handleKeyDownForm}
      >
        {/* Handle táctil en móvil */}
        <div className="sm:hidden w-12 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto mb-2" />

        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            💳 Procesar Pago
          </h3>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* Display Total a Cobrar */}
        <div className="my-2 rounded-xl bg-gray-50 dark:bg-zinc-800/60 p-2.5 text-center border border-gray-100 dark:border-zinc-800">
          <span className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">
            Total a Cobrar
          </span>
          <p className="text-2xl sm:text-3xl font-black text-[#0E6E55] dark:text-emerald-400">
            ${totalConAjuste.toLocaleString("es-AR")}
          </p>
          
          {porcentajeAjuste !== 0 && (
            <span className={`text-[10px] font-bold ${porcentajeAjuste > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {porcentajeAjuste > 0 ? `+${porcentajeAjuste}% Recargo` : `${porcentajeAjuste}% Descuento`} (${montoAjusteMedioPago > 0 ? '+' : ''}${Math.round(montoAjusteMedioPago)})
            </span>
          )}
        </div>

        {/* Ajustes / Recargos */}
        <div className="mb-2 flex flex-col gap-1 rounded-xl bg-gray-50 dark:bg-zinc-800/40 p-2 border border-gray-100 dark:border-zinc-800">
          <span className="text-[10px] font-bold text-gray-600 dark:text-zinc-400">Ajuste / Recargo rápido:</span>
          <div className="grid grid-cols-6 gap-1">
            {[-10, -5, 0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setPorcentajeAjuste(pct)}
                className={`rounded-lg py-1 text-[10px] font-extrabold transition-all active:scale-95 ${
                  porcentajeAjuste === pct
                    ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                    : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
                }`}
              >
                {pct > 0 ? `+${pct}%` : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Modalidad de pago (Único vs Mixto) */}
        <div className="mb-2 flex rounded-xl bg-gray-100 dark:bg-zinc-800 p-0.5">
          <button
            type="button"
            onClick={() => setEsPagoMixto(false)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              !esPagoMixto ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-xs" : "text-gray-500 dark:text-zinc-400"
            }`}
          >
            Pago Único
          </button>
          <button
            type="button"
            onClick={() => setEsPagoMixto(true)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              esPagoMixto ? "bg-[#0E6E55] text-white shadow-xs" : "text-gray-500 dark:text-zinc-400"
            }`}
          >
            🔀 Pago Mixto
          </button>
        </div>

        {/* Pago Único */}
        {!esPagoMixto ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "efectivo", label: "💵 Efectivo" },
                { id: "transferencia", label: "📱 Transfer/MP" },
                { id: "tarjeta", label: "💳 Tarjeta" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSeleccionarMetodo(m.id)}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all active:scale-95 ${
                    metodoPago === m.id
                      ? "border-[#0E6E55] bg-[#0E6E55] text-white shadow-xs"
                      : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 hover:bg-gray-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {metodoPago === "efectivo" && (
              <div className="space-y-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 p-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 dark:text-zinc-200">Paga con ($):</label>
                  <button
                    type="button"
                    onClick={() => setPagoCon(totalConAjuste.toString())}
                    className="text-[10px] font-bold text-[#0E6E55] dark:text-emerald-400 hover:underline"
                  >
                    Pago Exacto
                  </button>
                </div>

                <input
                  ref={inputPagoRef}
                  type="number"
                  value={pagoCon}
                  onChange={(e) => setPagoCon(e.target.value)}
                  placeholder="Ej: 10000"
                  className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-sm font-bold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
                />

                {/* Billetes rápidos */}
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {[1000, 2000, 5000, 10000, 20000].map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      onClick={() => setPagoCon(monto.toString())}
                      className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-1 text-[10px] font-bold text-gray-700 dark:text-zinc-300 active:scale-95 transition-all"
                    >
                      ${monto / 1000}k
                    </button>
                  ))}
                </div>

                {montoEntregado > 0 && (
                  <div className="mt-1 flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 pt-1.5 text-xs">
                    <span className="font-bold text-gray-600 dark:text-zinc-400">Vuelto:</span>
                    <span
                      className={`font-black text-sm ${
                        esEfectivoInsuficiente ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"
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
          /* Pago Mixto */
          <div className="space-y-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5">
            <h4 className="text-[11px] font-extrabold text-[#0E6E55] dark:text-emerald-400">Desglose de Pago Mixto</h4>

            <div>
              <label className="text-[10px] font-bold text-gray-700 dark:text-zinc-300">Monto en Efectivo ($):</label>
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
                placeholder="Monto en efectivo"
                className="mt-0.5 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 text-xs font-bold text-gray-800 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-700 dark:text-zinc-300">Monto Digital ($):</label>
                <select
                  value={metodoDigitalSecundario}
                  onChange={(e) => setMetodoDigitalSecundario(e.target.value)}
                  className="rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-gray-700 dark:text-zinc-300"
                >
                  <option value="transferencia">Transferencia / MP</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
              <input
                type="number"
                value={montoDigitalMixto}
                onChange={(e) => setMontoDigitalMixto(e.target.value)}
                placeholder="Monto digital"
                className="mt-0.5 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 text-xs font-bold text-gray-800 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
              />
            </div>

            <div className="flex items-center justify-between border-t border-emerald-200 dark:border-emerald-900/40 pt-1.5 text-[11px]">
              <span className="font-bold text-gray-600 dark:text-zinc-400">Total ingresado:</span>
              <span
                className={`font-black ${
                  restanteMixto > 0 ? "text-amber-600" : restanteMixto === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                }`}
              >
                ${sumaMixto.toLocaleString("es-AR")}{" "}
                {restanteMixto > 0 && `(Faltan $${restanteMixto.toLocaleString("es-AR")})`}
              </span>
            </div>
          </div>
        )}

        {/* Nombre Cliente */}
        <div className="pt-1">
          <label className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">Nombre Cliente (Opcional)</label>
          <input
            type="text"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            placeholder="Cliente Ocasional"
            className="mt-0.5 w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 p-2 text-xs font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
          />
        </div>

        {/* Acciones del Modal */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading || esEfectivoInsuficiente || esMixtoIncompleto}
            onClick={handleConfirmarVenta}
            className="flex-1 rounded-xl bg-[#0E6E55] py-2.5 text-xs font-bold text-white transition-all hover:bg-[#0A5340] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Finalizar Venta"}
          </button>
        </div>
      </div>
    </div>
  );
}