'use client';

import React from "react";

interface ModalExitoProps {
  mostrar: boolean;
  onAceptar: () => void;
}

export default function ModalExito({ mostrar, onAceptar }: ModalExitoProps) {
  if (!mostrar) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", color: "#1f2937" }}>
          ¡Pedido Enviado!
        </h3>
        <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "20px" }}>
          Tu pedido fue registrado con éxito y redirigido a WhatsApp.
        </p>
        <button
          onClick={onAceptar}
          style={{
            width: "100%",
            background: "#25D366",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
