"use client";

import React, { useState } from "react";
import { useCarrito } from "@/context/CarritoContext";

interface CarritoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarritoDrawer({ isOpen, onClose }: CarritoDrawerProps) {
  const {
    carrito,
    agregarAlCarrito,
    restarUnidad,
    eliminarDelCarrito,
    vaciarCarrito,
    totalPrecio,
    datosEnvio,
    setDatosEnvio,
  } = useCarrito();

  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState("549XXXXXXXXX"); // Cambiá por tu número real con código de país

  if (!isOpen) return null;

  const enviarAWhatsApp = () => {
    if (!datosEnvio.nombreCliente.trim()) {
      alert("Por favor, ingresá tu nombre para continuar.");
      return;
    }

    let mensaje = `*¡Hola! Quiero realizar el siguiente pedido:*\n\n`;
    mensaje += `*Cliente:* ${datosEnvio.nombreCliente}\n`;
    mensaje += `*Método:* ${
      datosEnvio.metodoEnvio === "envio" ? "Envío a domicilio" : "Retiro en local"
    }\n`;

    if (datosEnvio.metodoEnvio === "envio" && datosEnvio.direccion) {
      mensaje += `*Dirección:* ${datosEnvio.direccion}\n`;
    }

    if (datosEnvio.notaAdicional) {
      mensaje += `*Nota:* ${datosEnvio.notaAdicional}\n`;
    }

    mensaje += `\n*Detalle del pedido:*\n`;
    carrito.forEach((item) => {
      mensaje += `- ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})\n`;
    });

    mensaje += `\n*Total a pagar:* $${totalPrecio}\n\n`;
    mensaje += `Quedo a la espera de los datos para concretar la compra.`;

    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        {/* Cabecera del Carrito */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "12px",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
              Tu Carrito
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              ✕
            </button>
          </div>

          {/* Lista de productos agregados */}
          {carrito.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b7280", my: "40px" }}>
              El carrito está vacío.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {carrito.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #f3f4f6",
                    paddingBottom: "8px",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "14px", color: "#1f2937" }}>
                      {item.nombre}
                    </strong>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      ${item.precio} c/u
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => restarUnidad(item.id)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => agregarAlCarrito(item)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => eliminarDelCarrito(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "12px",
                        marginLeft: "4px",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Datos y Confirmación */}
        {carrito.length > 0 && (
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
            <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>
              Datos del Comprador
            </h3>

            <input
              type="text"
              placeholder="Tu Nombre completo"
              value={datosEnvio.nombreCliente}
              onChange={(e) =>
                setDatosEnvio({ ...datosEnvio, nombreCliente: e.target.value })
              }
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
                  onChange={() =>
                    setDatosEnvio({ ...datosEnvio, metodoEnvio: "retiro" })
                  }
                />{" "}
                Retiro en Local
              </label>
              <label style={{ fontSize: "13px" }}>
                <input
                  type="radio"
                  name="metodoEnvio"
                  value="envio"
                  checked={datosEnvio.metodoEnvio === "envio"}
                  onChange={() =>
                    setDatosEnvio({ ...datosEnvio, metodoEnvio: "envio" })
                  }
                />{" "}
                Envío a Domicilio
              </label>
            </div>

            {datosEnvio.metodoEnvio === "envio" && (
              <input
                type="text"
                placeholder="Dirección de envío"
                value={datosEnvio.direccion}
                onChange={(e) =>
                  setDatosEnvio({ ...datosEnvio, direccion: e.target.value })
                }
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "16px",
                fontWeight: "700",
                margin: "12px 0",
              }}
            >
              <span>Total:</span>
              <span>${totalPrecio}</span>
            </div>

            <button
              onClick={enviarAWhatsApp}
              style={{
                width: "100%",
                background: "#25D366",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Confirmar Pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
