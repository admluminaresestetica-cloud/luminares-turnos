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
  return (
    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 14px",
          backgroundColor: "#f9fafb",
          borderRadius: "10px",
          marginBottom: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
          Total a pagar
        </span>
        <span style={{ fontSize: "18px", fontWeight: "800", color: "#111827" }}>
          ${new Intl.NumberFormat("es-AR").format(totalPrecio)}
        </span>
      </div>

      <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>Datos del Comprador</h3>

      <input
        type="text"
        placeholder="Tu Nombre completo *"
        value={datosEnvio.nombreCliente}
        onChange={(e) => setDatosEnvio({ ...datosEnvio, nombreCliente: e.target.value })}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "8px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      <input
        type="text"
        placeholder="Tu Teléfono / WhatsApp"
        value={datosEnvio.telefonoCliente}
        onChange={(e) => setDatosEnvio({ ...datosEnvio, telefonoCliente: e.target.value })}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "8px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
        <label style={{ fontSize: "13px" }}>
          <input
            type="radio"
            name="metodoEnvio"
            value="retiro"
            checked={datosEnvio.metodoEnvio === "retiro"}
            onChange={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "retiro" })}
          />{" "}
          Retiro en Local
        </label>
        <label style={{ fontSize: "13px" }}>
          <input
            type="radio"
            name="metodoEnvio"
            value="envio"
            checked={datosEnvio.metodoEnvio === "envio"}
            onChange={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "envio" })}
          />{" "}
          Envío a Domicilio
        </label>
      </div>

      {datosEnvio.metodoEnvio === "envio" && (
        <input
          type="text"
          placeholder="Dirección de envío *"
          value={datosEnvio.direccion}
          onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
      )}

      <button
        onClick={onConfirmar}
        disabled={guardandoPedido}
        style={{
          width: "100%",
          background: guardandoPedido ? "#9ca3af" : "#25D366",
          color: "white",
          border: "none",
          padding: "12px",
          borderRadius: "8px",
          fontWeight: "700",
          fontSize: "15px",
          cursor: guardandoPedido ? "not-allowed" : "pointer",
          marginTop: "10px",
        }}
      >
        {guardandoPedido ? "Procesando..." : "Confirmar Pedido por WhatsApp"}
      </button>
    </div>
  );
}