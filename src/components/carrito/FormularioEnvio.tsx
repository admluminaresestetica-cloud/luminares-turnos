'use client';

import React from "react";

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
  onConfirmar: () => void;
}

export default function FormularioEnvio({
  totalPrecio,
  datosEnvio,
  setDatosEnvio,
  guardandoPedido,
  onConfirmar,
}: FormularioEnvioProps) {
  const inputClass =
    "w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 py-2.5 text-sm text-[#12151B] placeholder:text-gray-400 outline-none transition-all focus:border-[#12151B] focus:bg-white focus:ring-2 focus:ring-[#12151B]/10";

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
        <span className="rounded-full bg-[#0E6E55]/10 px-2.5 py-1 text-[11px] font-semibold text-[#0E6E55]">
          Listo para pedir
        </span>
      </div>

      <h3 className="mb-2.5 text-sm font-semibold text-[#12151B]">
        Datos del Comprador
      </h3>

      <div className="flex flex-col gap-2.5">
        <input
          type="text"
          placeholder="Tu Nombre completo *"
          value={datosEnvio.nombreCliente}
          onChange={(e) => setDatosEnvio({ ...datosEnvio, nombreCliente: e.target.value })}
          className={inputClass}
        />

        <input
          type="text"
          placeholder="Tu Teléfono / WhatsApp"
          value={datosEnvio.telefonoCliente}
          onChange={(e) => setDatosEnvio({ ...datosEnvio, telefonoCliente: e.target.value })}
          className={inputClass}
        />

        {/* Selector de método de envío tipo tarjeta */}
        <div className="grid grid-cols-2 gap-2.5">
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
              datosEnvio.metodoEnvio === "retiro"
                ? "border-[#12151B] bg-[#12151B] text-white shadow-sm"
                : "border-[#E7E5E0] bg-white text-[#12151B] hover:border-[#12151B]/40"
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
            🏬 Retiro
          </label>
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
              datosEnvio.metodoEnvio === "envio"
                ? "border-[#12151B] bg-[#12151B] text-white shadow-sm"
                : "border-[#E7E5E0] bg-white text-[#12151B] hover:border-[#12151B]/40"
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
            🚚 Envío
          </label>
        </div>

        {datosEnvio.metodoEnvio === "envio" && (
          <input
            type="text"
            placeholder="Dirección de envío *"
            value={datosEnvio.direccion}
            onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
            className={`${inputClass} animate-[fadeIn_0.2s_ease-out]`}
          />
        )}

        <button
          onClick={onConfirmar}
          disabled={guardandoPedido}
          className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold text-white shadow-md transition-all ${
            guardandoPedido
              ? "cursor-not-allowed bg-gray-400"
              : "bg-[#25D366] hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-lg active:translate-y-0 active:shadow-md"
          }`}
        >
          {guardandoPedido ? (
            "Procesando..."
          ) : (
            <>
              <span className="text-lg leading-none">📲</span>
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
