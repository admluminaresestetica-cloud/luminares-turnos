'use client';

import React from "react";
import { Store, Truck, User, Phone, MapPin, MessageCircle, CreditCard, Loader2 } from "lucide-react";

interface DatosEnvio {
  nombreCliente: string;
  telefonoCliente: string;
  metodoEnvio: "retiro" | "envio";
  direccion: string;
  notaAdicional: string;
}

interface FormularioEnvioProps {
  totalPrecio: number;
  datosEnvio: DatosEnvio;
  setDatosEnvio: React.Dispatch<React.SetStateAction<DatosEnvio>>;
  guardandoPedido: boolean;
  metodoPago: "whatsapp" | "mercadopago";
  onConfirmar: () => void;
}

export default function FormularioEnvio({
  totalPrecio,
  datosEnvio,
  setDatosEnvio,
  guardandoPedido,
  metodoPago,
  onConfirmar,
}: FormularioEnvioProps) {
  const inputClass =
    "w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] py-2.5 pl-10 pr-3.5 text-sm text-[#12151B] placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#12151B] focus:bg-white focus:ring-4 focus:ring-[#12151B]/[0.06]";

  return (
    <div className="border-t border-[#E7E5E0] pt-4">
      {/* Resumen de compra */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-3.5">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Total a pagar
          </span>
          <span className="text-2xl font-extrabold text-[#12151B]">
            ${new Intl.NumberFormat("es-AR").format(totalPrecio)}
          </span>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            metodoPago === "mercadopago"
              ? "bg-blue-50 text-blue-700"
              : "bg-[#0E6E55]/10 text-[#0E6E55]"
          }`}
        >
          {metodoPago === "mercadopago" ? (
            <>
              <CreditCard className="h-3 w-3" strokeWidth={2.4} />
              Tarjeta / Cuotas
            </>
          ) : (
            <>
              <MessageCircle className="h-3 w-3" strokeWidth={2.4} />
              Listo para pedir
            </>
          )}
        </span>
      </div>

      <h3 className="mb-2.5 text-sm font-semibold text-[#12151B]">
        Datos del Comprador
      </h3>

      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Tu Nombre completo *"
            value={datosEnvio.nombreCliente}
            onChange={(e) => setDatosEnvio({ ...datosEnvio, nombreCliente: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Tu Teléfono / WhatsApp"
            value={datosEnvio.telefonoCliente}
            onChange={(e) => setDatosEnvio({ ...datosEnvio, telefonoCliente: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* Selector de método de envío tipo tarjeta */}
        <div className="grid grid-cols-2 gap-2.5">
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              datosEnvio.metodoEnvio === "retiro"
                ? "border-[#12151B] bg-[#12151B] text-white shadow-sm"
                : "border-[#E7E5E0] bg-white text-[#12151B] hover:border-[#12151B]/40 hover:bg-[#F7F7F5]"
            }`}
          >
            <input
              type="radio"
              name="metodoEnvio"
              value="retiro"
              checked={datosEnvio.metodoEnvio === "retiro"}
              onChange={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "retiro" })}
              className="sr-only"
            />
            <Store className="h-4 w-4 shrink-0" strokeWidth={2} />
            Retiro
          </label>
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              datosEnvio.metodoEnvio === "envio"
                ? "border-[#12151B] bg-[#12151B] text-white shadow-sm"
                : "border-[#E7E5E0] bg-white text-[#12151B] hover:border-[#12151B]/40 hover:bg-[#F7F7F5]"
            }`}
          >
            <input
              type="radio"
              name="metodoEnvio"
              value="envio"
              checked={datosEnvio.metodoEnvio === "envio"}
              onChange={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "envio" })}
              className="sr-only"
            />
            <Truck className="h-4 w-4 shrink-0" strokeWidth={2} />
            Envío
          </label>
        </div>

        {/* Campo de dirección + Cartel informativo de envío */}
        {datosEnvio.metodoEnvio === "envio" && (
          <div className="flex flex-col gap-2 animate-[fadeIn_0.2s_ease-out]">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Dirección de envío *"
                value={datosEnvio.direccion}
                onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Aviso de zonas de envío */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/80 p-3 text-xs text-amber-900 shadow-2xs">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={2} />
              <p className="m-0 leading-relaxed">
                <strong className="font-semibold text-amber-950">Envío bonificado</strong> en zonas cercanas a nuestro local. Por otras distancias, consultanos por WhatsApp.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onConfirmar}
          disabled={guardandoPedido}
          className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold text-white shadow-md transition-all duration-200 ${
            guardandoPedido
              ? "cursor-not-allowed bg-gray-400"
              : metodoPago === "mercadopago"
              ? "bg-[#0B3B78] hover:-translate-y-0.5 hover:bg-[#0A346B] hover:shadow-lg active:translate-y-0 active:shadow-md"
              : "bg-[#0E6E55] hover:-translate-y-0.5 hover:bg-[#0B5C47] hover:shadow-lg active:translate-y-0 active:shadow-md"
          }`}
        >
          {guardandoPedido ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
              Procesando...
            </>
          ) : metodoPago === "mercadopago" ? (
            <>
              <CreditCard className="h-[18px] w-[18px]" strokeWidth={2.2} />
              Pagar con Mercado Pago
            </>
          ) : (
            <>
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.2} />
              Confirmar Pedido por WhatsApp
            </>
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}