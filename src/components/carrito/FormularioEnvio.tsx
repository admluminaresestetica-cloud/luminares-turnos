'use client';

import React from "react";
import { Store, Truck, User, Phone, MapPin } from "lucide-react";

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
  costoEnvio,
  tieneEnvioGratis,
  datosEnvio,
  setDatosEnvio,
  envioDomicilioActivo = true,
}: FormularioEnvioProps) {
  const costoEnvioSeguro = Number(costoEnvio) || 0;

  const inputClass =
    "w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-3.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 shadow-2xs";

  return (
    <div className="space-y-4 pt-1">
      
      {/* Datos del Comprador */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-foreground">
          Datos de Contacto
        </label>

        {/* Campo Nombre y Apellido */}
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
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
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
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
      </div>

      {/* Opción de Entrega */}
      <div className="space-y-2.5 pt-1">
        <label className="block text-xs font-bold text-foreground">
          Opción de Entrega
        </label>

        <div className={`grid gap-2.5 ${envioDomicilioActivo ? "grid-cols-2" : "grid-cols-1"}`}>
          {/* Retiro en Local */}
          <button
            type="button"
            onClick={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "retiro" })}
            className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
              datosEnvio?.metodoEnvio === "retiro"
                ? "border-emerald-600 dark:border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-600/20"
                : "border-border bg-card text-foreground hover:bg-muted/50"
            }`}
          >
            <Store className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Retiro en local</span>
          </button>

          {/* Envío a Domicilio */}
          {envioDomicilioActivo && (
            <button
              type="button"
              onClick={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "envio" })}
              className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
                datosEnvio?.metodoEnvio === "envio"
                  ? "border-emerald-600 dark:border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-600/20"
                  : "border-border bg-card text-foreground hover:bg-muted/50"
              }`}
            >
              <Truck className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>Envío a domicilio</span>
            </button>
          )}
        </div>

        {/* Campo de dirección + Cartel de costo de envío */}
        {envioDomicilioActivo && datosEnvio?.metodoEnvio === "envio" && (
          <div className="space-y-2 pt-1 animate-[fadeIn_0.2s_ease-out]">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
              <input
                type="text"
                placeholder="Dirección de envío *"
                value={datosEnvio?.direccion || ""}
                onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Cartel Informativo */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-800 dark:text-amber-300">
              <MapPin className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              <span>
                {tieneEnvioGratis ? (
                  <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                    ¡Tenés envío gratis bonificado!
                  </strong>
                ) : (
                  <>
                    Costo de envío: <strong className="font-bold">${costoEnvioSeguro.toLocaleString("es-AR")}</strong> (sumado al total).
                  </>
                )}
              </span>
            </div>
          </div>
        )}
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