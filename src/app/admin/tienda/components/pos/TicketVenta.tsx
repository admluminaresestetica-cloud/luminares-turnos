"use client";
import { useState, useEffect } from "react";
import { PosCartItem } from "./types";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TicketVentaProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string | null;
  items: PosCartItem[];
  subtotalInicial?: number;
  descuentoMonto?: number;
  recargoMonto?: number;
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
  subtotalInicial = 0,
  descuentoMonto = 0,
  recargoMonto = 0,
  total,
  metodoPago,
  pagoCon,
  vuelto,
  nombreCliente,
}: TicketVentaProps) {
  const [formatoImpresion, setFormatoImpresion] = useState<"80mm" | "58mm" | "a4">("80mm");
  
  const [datosEmpresa, setDatosEmpresa] = useState<{
    nombre: string;
    direccion: string | null;
    telefono: string | null;
    cuit: string | null;
    mensajeTicket: string | null;
  }>({
    nombre: "Mi Negocio",
    direccion: null,
    telefono: null,
    cuit: null,
    mensajeTicket: null,
  });

  useEffect(() => {
    if (!isOpen) return;

    async function cargarDatosEmpresa() {
      const { data } = await supabase
        .from("configuracion_empresa")
        .select("nombre_empresa, direccion_texto, whatsapp_numero, cuit, mensaje_ticket")
        .limit(1)
        .maybeSingle();

      if (data) {
        setDatosEmpresa({
          nombre: data.nombre_empresa || "Mi Negocio",
          direccion: data.direccion_texto || null,
          telefono: data.whatsapp_numero || null,
          cuit: data.cuit || null,
          mensajeTicket: data.mensaje_ticket || null,
        });
      }
    }

    cargarDatosEmpresa();
  }, [isOpen]);

  if (!isOpen) return null;

  const baseSubtotal =
    subtotalInicial > 0
      ? subtotalInicial
      : items.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0);

  const handleImprimir = () => {
    window.print();
  };

  const handleEnviarWhatsApp = () => {
    let mensaje = `*COMPROBANTE DE COMPRA - ${datosEmpresa.nombre.toUpperCase()}*\n`;
    if (datosEmpresa.cuit) mensaje += `CUIT: ${datosEmpresa.cuit}\n`;
    if (datosEmpresa.direccion) mensaje += `Dirección: ${datosEmpresa.direccion}\n`;
    mensaje += `--------------------------------------\n`;
    if (pedidoId) mensaje += `Ticket ID: #${pedidoId.slice(0, 8)}\n`;
    if (nombreCliente) mensaje += `Cliente: ${nombreCliente}\n`;
    mensaje += `--------------------------------------\n`;
    items.forEach((item) => {
      mensaje += `${item.cantidad}x ${item.titulo} - $${(
        item.precio_unitario * item.cantidad
      ).toLocaleString("es-AR")}\n`;
    });
    mensaje += `--------------------------------------\n`;

    if (descuentoMonto > 0 || recargoMonto > 0) {
      mensaje += `Subtotal Productos: $${baseSubtotal.toLocaleString("es-AR")}\n`;
      if (descuentoMonto > 0) {
        mensaje += `Descuento Aplicado: -$${descuentoMonto.toLocaleString("es-AR")}\n`;
      }
      if (recargoMonto > 0) {
        mensaje += `Recargo Medio Pago: +$${recargoMonto.toLocaleString("es-AR")}\n`;
      }
      mensaje += `--------------------------------------\n`;
    }

    mensaje += `*TOTAL FINAL: $${total.toLocaleString("es-AR")}*\n`;
    mensaje += `Medio de Pago: ${metodoPago.toUpperCase()}\n`;

    if (metodoPago.toLowerCase().includes("efectivo") && pagoCon > 0) {
      mensaje += `Abonó con: $${pagoCon.toLocaleString("es-AR")}\n`;
      mensaje += `Vuelto: $${vuelto.toLocaleString("es-AR")}\n`;
    }
    
    mensaje += `\n${datosEmpresa.mensajeTicket || "¡Gracias por tu compra! ✨"}`;

    const encoded = encodeURIComponent(mensaje);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-fadeIn print:p-0 print:bg-transparent print:static">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket-print-area, #ticket-print-area * {
            visibility: visible;
          }
          #ticket-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: ${formatoImpresion === "80mm" ? "78mm" : formatoImpresion === "58mm" ? "54mm" : "100%"};
            margin: 0;
            padding: 4px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Card/Bottom Sheet */}
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Handle de arrastre móvil */}
        <div className="no-print sm:hidden w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

        {/* Selector de Formato de Ticketera */}
        <div className="no-print mb-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 p-2.5 text-center">
          <p className="text-[10px] font-extrabold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Formato de Impresión
          </p>
          <div className="flex justify-center gap-1.5">
            <button
              onClick={() => setFormatoImpresion("80mm")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                formatoImpresion === "80mm"
                  ? "bg-[#0E6E55] text-white shadow-xs"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700"
              }`}
            >
              80mm
            </button>
            <button
              onClick={() => setFormatoImpresion("58mm")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                formatoImpresion === "58mm"
                  ? "bg-[#0E6E55] text-white shadow-xs"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700"
              }`}
            >
              58mm
            </button>
            <button
              onClick={() => setFormatoImpresion("a4")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                formatoImpresion === "a4"
                  ? "bg-[#0E6E55] text-white shadow-xs"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700"
              }`}
            >
              A4
            </button>
          </div>
        </div>

        {/* ÁREA IMPRIMIBLE DEL TICKET */}
        <div id="ticket-print-area">
          {/* Cabecera Ticket */}
          <div className="border-b border-dashed border-gray-300 dark:border-zinc-700 pb-3 text-center">
            <span className="text-xl print:hidden">✨</span>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-zinc-100 uppercase tracking-wide">
              {datosEmpresa.nombre}
            </h3>
            {datosEmpresa.cuit && (
              <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium">CUIT: {datosEmpresa.cuit}</p>
            )}
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">Ticket de Venta Presencial</p>
            {datosEmpresa.direccion && (
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">{datosEmpresa.direccion}</p>
            )}
            {nombreCliente && (
              <p className="mt-1 text-xs font-bold text-gray-800 dark:text-zinc-200">
                Cliente: {nombreCliente}
              </p>
            )}
            {pedidoId && (
              <p className="mt-0.5 text-[10px] font-mono text-gray-400 dark:text-zinc-500">
                ID: #{pedidoId.slice(0, 8)}
              </p>
            )}
          </div>

          {/* Desglose de Ítems */}
          <div className="my-3 max-h-40 overflow-y-auto print:max-h-none space-y-1.5 border-b border-dashed border-gray-300 dark:border-zinc-700 pb-3 text-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between font-medium text-gray-800 dark:text-zinc-200">
                <span className="pr-2 leading-tight">
                  {item.cantidad}x {item.titulo}
                </span>
                <span className="whitespace-nowrap font-bold">
                  ${(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>

          {/* Totales y Métodos de Pago */}
          <div className="space-y-1.5 border-b border-dashed border-gray-300 dark:border-zinc-700 pb-3 text-xs">
            {(descuentoMonto > 0 || recargoMonto > 0) && (
              <>
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span>${baseSubtotal.toLocaleString("es-AR")}</span>
                </div>

                {descuentoMonto > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Descuento:</span>
                    <span>-${descuentoMonto.toLocaleString("es-AR")}</span>
                  </div>
                )}

                {recargoMonto > 0 && (
                  <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400">
                    <span>Recargo:</span>
                    <span>+${recargoMonto.toLocaleString("es-AR")}</span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between text-sm font-black text-gray-900 dark:text-zinc-100 pt-1 border-t border-gray-100 dark:border-zinc-800">
              <span>TOTAL:</span>
              <span className="text-[#0E6E55] dark:text-emerald-400 print:text-black">
                ${total.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="flex flex-col gap-1 border-t border-b border-dashed border-gray-200 dark:border-zinc-800 py-2 my-2 text-xs">
              <div className="flex justify-between font-bold text-gray-700 dark:text-zinc-300">
                <span>Método de Pago:</span>
                <span className="capitalize">
                  {metodoPago.includes("Mixto") ? "Pago Mixto" : metodoPago}
                </span>
              </div>

              {metodoPago.includes("Mixto") && (
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 text-right leading-tight bg-gray-50 dark:bg-zinc-800 p-1.5 rounded-md border border-gray-100 dark:border-zinc-700 print:border-none print:bg-transparent">
                  {metodoPago}
                </p>
              )}
            </div>

            {metodoPago.toLowerCase().includes("efectivo") && pagoCon > 0 && (
              <>
                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                  <span>Paga con:</span>
                  <span>${pagoCon.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                  <span>Vuelto:</span>
                  <span>${vuelto.toLocaleString("es-AR")}</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 text-center text-[10px] text-gray-400 dark:text-zinc-500">
            <p>{datosEmpresa.mensajeTicket || "¡Gracias por tu preferencia! ✨"}</p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="no-print mt-4 space-y-2">
          <button
            onClick={handleEnviarWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition-all hover:bg-emerald-700"
          >
            📱 Enviar por WhatsApp
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleImprimir}
              className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 py-2.5 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 active:scale-95 transition-all"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-gray-900 dark:bg-zinc-100 py-2.5 text-xs font-bold text-white dark:text-zinc-900 hover:bg-gray-800 active:scale-95 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}