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
  const totalSeguro = Number(totalPrecio) || 0;
  const costoEnvioSeguro = Number(costoEnvio) || 0;

  // Validación de campos antes de habilitar o procesar el botón
  const esNombreValido = (datosEnvio?.nombreCliente || "").trim().length >= 2;
  const esTelefonoValido = (datosEnvio?.telefonoCliente || "").trim().length >= 8;
  const esDireccionValida =
    datosEnvio?.metodoEnvio === "retiro" || (datosEnvio?.direccion || "").trim().length >= 3;

  const formularioValido = esNombreValido && esTelefonoValido && esDireccionValida;

  const handleConfirmar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioValido || guardandoPedido) return;
    onConfirmar();
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-muted/50 py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-foreground focus:bg-background focus:ring-2 focus:ring-ring/20";

  return (
    <form onSubmit={handleConfirmar} className="border-t border-border pt-4">
      {/* Resumen de compra */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3.5">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total a pagar
          </span>
          <span className="text-2xl font-extrabold text-foreground">
            ${totalSeguro.toLocaleString("es-AR")}
          </span>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            metodoPago === "mercadopago"
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
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

      <h3 className="mb-2.5 text-sm font-semibold text-foreground">
        Datos del Comprador
      </h3>

      <div className="flex flex-col gap-2.5">
        {/* Campo Nombre completo */}
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <input
            type="text"
            required
            placeholder="Tu Nombre completo *"
            value={datosEnvio?.nombreCliente || ""}
            onChange={(e) =>
              setDatosEnvio((prev) => ({
                ...prev,
                nombreCliente: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
              }))
            }
            className={inputClass}
          />
        </div>

        {/* Campo Teléfono */}
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <input
            type="tel"
            required
            inputMode="numeric"
            maxLength={10}
            placeholder="Tu Teléfono / WhatsApp *"
            value={datosEnvio?.telefonoCliente || ""}
            onChange={(e) =>
              setDatosEnvio((prev) => ({
                ...prev,
                telefonoCliente: e.target.value.replace(/\D/g, "").slice(0, 10),
              }))
            }
            className={inputClass}
          />
        </div>

        {/* Selector de Método de Envío */}
        <div className={`grid gap-2.5 ${envioDomicilioActivo ? "grid-cols-2" : "grid-cols-1"}`}>
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              datosEnvio?.metodoEnvio === "retiro"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="metodoEnvio"
              value="retiro"
              checked={datosEnvio?.metodoEnvio === "retiro"}
              onChange={() => setDatosEnvio((prev) => ({ ...prev, metodoEnvio: "retiro" }))}
              className="sr-only"
            />
            <Store className="h-4 w-4 shrink-0" strokeWidth={2} />
            Retiro
          </label>

          {envioDomicilioActivo && (
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                datosEnvio?.metodoEnvio === "envio"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="metodoEnvio"
                value="envio"
                checked={datosEnvio?.metodoEnvio === "envio"}
                onChange={() => setDatosEnvio((prev) => ({ ...prev, metodoEnvio: "envio" }))}
                className="sr-only"
              />
              <Truck className="h-4 w-4 shrink-0" strokeWidth={2} />
              Envío
            </label>
          )}
        </div>

        {/* Campo Dirección de Envío */}
        {envioDomicilioActivo && datosEnvio?.metodoEnvio === "envio" && (
          <div className="flex flex-col gap-2 animate-[fadeIn_0.2s_ease-out]">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
              <input
                type="text"
                required
                placeholder="Dirección de envío *"
                value={datosEnvio?.direccion || ""}
                onChange={(e) => setDatosEnvio((prev) => ({ ...prev, direccion: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              <p className="m-0 leading-relaxed">
                {tieneEnvioGratis ? (
                  <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                    ¡Tenés envío gratis bonificado!
                  </strong>
                ) : (
                  <>
                    Costo de envío / cadetería:{" "}
                    <strong className="font-bold text-amber-950 dark:text-amber-100">
                      ${costoEnvioSeguro.toLocaleString("es-AR")}
                    </strong>{" "}
                    (sumado al total).
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Botón de Confirmación integrado con estado de carga y prevención de doble clic */}
        <button
          type="submit"
          disabled={!formularioValido || guardandoPedido}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardandoPedido ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando pedido...
            </>
          ) : metodoPago === "mercadopago" ? (
            "Ir a Pagar con Mercado Pago"
          ) : (
            "Confirmar Pedido por WhatsApp"
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </form>
  );
}