"use client";
import { PosCartItem } from "./types";

interface TicketVentaProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string | null;
  items: PosCartItem[];
  total: number;
  metodoPago: string;
  pagoCon: number;
  vuelto: number;
  nombreCliente: string;
}

export default function TicketVenta({
  isOpen,
  onClose,
  pedidoId,
  items,
  total,
  metodoPago,
  pagoCon,
  vuelto,
  nombreCliente,
}: TicketVentaProps) {
  if (!isOpen) return null;

  const handleImprimir = () => {
    window.print();
  };

  const handleEnviarWhatsApp = () => {
    let mensaje = `*COMPROBANTE DE COMPRA - Lluminares Estética*\n`;
    mensaje += `--------------------------------------\n`;
    if (pedidoId) mensaje += `Ticket ID: #${pedidoId.slice(0, 8)}\n`;
    mensaje += `Cliente: ${nombreCliente}\n`;
    mensaje += `--------------------------------------\n`;
    items.forEach((item) => {
      mensaje += `${item.cantidad}x ${item.titulo} - $${(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}\n`;
    });
    mensaje += `--------------------------------------\n`;
    mensaje += `*TOTAL: $${total.toLocaleString("es-AR")}*\n`;
    mensaje += `Medio de Pago: ${metodoPago.toUpperCase()}\n`;
    if (metodoPago === "efectivo") {
      mensaje += `Abonó con: $${pagoCon.toLocaleString("es-AR")}\n`;
      mensaje += `Vuelto: $${vuelto.toLocaleString("es-AR")}\n`;
    }
    mensaje += `\n¡Gracias por tu compra! ✨`;

    const encoded = encodeURIComponent(mensaje);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-2xl">
        {/* Cabecera Ticket */}
        <div className="border-b border-dashed border-gray-300 pb-4 text-center">
          <span className="text-2xl">✨</span>
          <h3 className="text-base font-extrabold text-[#12151B]">Luminares Estética</h3>
          <p className="text-[11px] text-gray-500">Ticket de Venta Presencial</p>
          {pedidoId && (
            <p className="mt-1 text-[10px] font-mono text-gray-400">
              ID: {pedidoId.slice(0, 8)}
            </p>
          )}
        </div>

        {/* Desglose de Ítems */}
        <div className="my-4 max-h-48 overflow-y-auto space-y-2 border-b border-dashed border-gray-300 pb-4 text-xs">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between font-medium text-[#12151B]">
              <span>
                {item.cantidad}x {item.titulo}
              </span>
              <span>${(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>

        {/* Totales y Métodos de Pago */}
        <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-4 text-xs">
          <div className="flex justify-between font-bold text-[#12151B]">
            <span>TOTAL:</span>
            <span className="text-[#0E6E55]">${total.toLocaleString("es-AR")}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Método de Pago:</span>
            <span className="capitalize">{metodoPago}</span>
          </div>
          {metodoPago === "efectivo" && (
            <>
              <div className="flex justify-between text-gray-500">
                <span>Paga con:</span>
                <span>${pagoCon.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Vuelto:</span>
                <span>${vuelto.toLocaleString("es-AR")}</span>
              </div>
            </>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleEnviarWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-700"
          >
            📱 Enviar Ticket por WhatsApp
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleImprimir}
              className="flex-1 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-[#12151B] py-2 text-xs font-bold text-white hover:bg-[#2C323E]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}