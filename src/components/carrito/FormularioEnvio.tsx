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
  costoEnvio: number;
  tieneEnvioGratis: boolean;
  datosEnvio: DatosEnvio;
  setDatosEnvio: React.Dispatch<React.SetStateAction<DatosEnvio>>;
  guardandoPedido: boolean;
  metodoPago: "whatsapp" | "mercadopago";
  onConfirmar: () => void;
  envioDomicilioActivo?: boolean;
}

export default function FormularioEnvio({
  totalPrecio,
  costoEnvio,
  tieneEnvioGratis,
  datosEnvio,
  setDatosEnvio,
  guardandoPedido,
  metodoPago,
  onConfirmar,
  envioDomicilioActivo = true,
}: FormularioEnvioProps) {
  // Aseguramos que los números sean válidos para evitar crashes de Intl / toLocaleString
  const totalSeguro = Number(totalPrecio) || 0;
  const costoEnvioSeguro = Number(costoEnvio) || 0;

  const inputClass =
    "w-full rounded-xl border border-[#E7E5E0] dark:border-zinc-800 bg-[#F7F7F5] dark:bg-zinc-900 py-2.5 pl-10 pr-3.5 text-sm text-[#12151B] dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-[#12151B] dark:focus:border-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-[#12151B]/[0.06] dark:focus:ring-zinc-100/[0.06]";

  return (
    <div className="border-t border-[#E7E5E0] dark:border-zinc-800 pt-4">
      {/* Resumen de compra */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E7E5E0] dark:border-zinc-800 bg-[#F7F7F5] dark:bg-zinc-900 px-4 py-3.5">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400">
            Total a pagar
          </span>
          <span className="text-2xl font-extrabold text-[#12151B] dark:text-zinc-100">
            ${totalSeguro.toLocaleString("es-AR")}
          </span>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            metodoPago === "mercadopago"
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
              : "bg-[#0E6E55]/10 dark:bg-emerald-500/20 text-[#0E6E55] dark:text-emerald-400"
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

      <h3 className="mb-2.5 text-sm font-semibold text-[#12151B] dark:text-zinc-100">
        Datos del Comprador
      </h3>

      <div className="flex flex-col gap-2.5">
        {/* Campo Nombre y Apellido */}
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" strokeWidth={2} />
          <input
            type="text"
            placeholder="Tu Nombre completo *"
            value={datosEnvio?.nombreCliente || ""}
            onChange={(e) => setDatosEnvio({ 
              ...datosEnvio, 
              nombreCliente: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') 
            })}
            className={inputClass}
          />
        </div>

        {/* Campo Teléfono */}
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" strokeWidth={2} />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="Tu Teléfono / WhatsApp *"
            value={datosEnvio?.telefonoCliente || ""}
            onChange={(e) => setDatosEnvio({ 
              ...datosEnvio, 
              telefonoCliente: e.target.value.replace(/\D/g, '').slice(0, 10) 
            })}
            className={inputClass}
          />
        </div>

        {/* Selector de método de envío */}
        <div className={`grid gap-2.5 ${envioDomicilioActivo ? "grid-cols-2" : "grid-cols-1"}`}>
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              datosEnvio?.metodoEnvio === "retiro"
                ? "border-[#12151B] dark:border-zinc-100 bg-[#12151B] dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                : "border-[#E7E5E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#12151B] dark:text-zinc-200 hover:border-[#12151B]/40 dark:hover:border-zinc-700 hover:bg-[#F7F7F5] dark:hover:bg-zinc-800/80"
            }`}
          >
            <input
              type="radio"
              name="metodoEnvio"
              value="retiro"
              checked={datosEnvio?.metodoEnvio === "retiro"}
              onChange={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "retiro" })}
              className="sr-only"
            />
            <Store className="h-4 w-4 shrink-0" strokeWidth={2} />
            Retiro
          </label>

          {envioDomicilioActivo && (
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                datosEnvio?.metodoEnvio === "envio"
                  ? "border-[#12151B] dark:border-zinc-100 bg-[#12151B] dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                  : "border-[#E7E5E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#12151B] dark:text-zinc-200 hover:border-[#12151B]/40 dark:hover:border-zinc-700 hover:bg-[#F7F7F5] dark:hover:bg-zinc-800/80"
              }`}
            >
              <input
                type="radio"
                name="metodoEnvio"
                value="envio"
                checked={datosEnvio?.metodoEnvio === "envio"}
                onChange={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "envio" })}
                className="sr-only"
              />
              <Truck className="h-4 w-4 shrink-0" strokeWidth={2} />
              Envío
            </label>
          )}
        </div>

        {/* Campo de dirección + Cartel informativo de costo de envío */}
        {envioDomicilioActivo && datosEnvio?.metodoEnvio === "envio" && (
          <div className="flex flex-col gap-2 animate-[fadeIn_0.2s_ease-out]">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" strokeWidth={2} />
              <input
                type="text"
                placeholder="Dirección de envío *"
                value={datosEnvio?.direccion || ""}
                onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Cartel de Costo de Envío */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-300 shadow-2xs">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              <p className="m-0 leading-relaxed">
                {tieneEnvioGratis ? (
                  <strong className="font-semibold text-emerald-800 dark:text-emerald-400">
                    ¡Tenés envío gratis bonificado!
                  </strong>
                ) : (
                  <>
                    Costo de envío / cadetería:{" "}
                    <strong className="font-bold text-amber-950 dark:text-amber-200">
                      ${costoEnvioSeguro.toLocaleString("es-AR")}
                    </strong>{" "}
                    (sumado al total).
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onConfirmar}
          disabled={guardandoPedido}
          className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold text-white shadow-md transition-all duration-200 ${
            guardandoPedido
              ? "cursor-not-allowed bg-gray-400 dark:bg-zinc-700"
              : metodoPago === "mercadopago"
              ? "bg-[#0B3B78] dark:bg-blue-600 hover:-translate-y-0.5 hover:bg-[#0A346B] dark:hover:bg-blue-500 hover:shadow-lg active:translate-y-0 active:shadow-md"
              : "bg-[#0E6E55] dark:bg-emerald-600 hover:-translate-y-0.5 hover:bg-[#0B5C47] dark:hover:bg-emerald-500 hover:shadow-lg active:translate-y-0 active:shadow-md"
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