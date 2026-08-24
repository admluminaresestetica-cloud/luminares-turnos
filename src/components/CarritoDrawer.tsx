'use client';

import React, { useState } from "react";
import { useCarrito } from "@/context/CarritoContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CarritoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarritoDrawer({ isOpen, onClose }: CarritoDrawerProps) {
  const { carrito, agregarAlCarrito, restarUnidad, eliminarDelCarrito, vaciarCarrito } = useCarrito();

  const [telefonoWhatsApp] = useState("5493413954355");
  const [guardandoPedido, setGuardandoPedido] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  const [datosEnvio, setDatosEnvio] = useState({
    nombreCliente: "",
    telefonoCliente: "",
    metodoEnvio: "retiro" as "retiro" | "envio",
    direccion: "",
    notaAdicional: "",
  });

  if (!isOpen && !mostrarModalExito) return null;

  const totalPrecio = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const enviarAWhatsApp = async () => {
    if (!datosEnvio.nombreCliente.trim()) {
      alert("Por favor, ingresá tu nombre para continuar.");
      return;
    }

    if (datosEnvio.metodoEnvio === "envio" && !datosEnvio.direccion.trim()) {
      alert("Por favor, ingresá tu dirección de envío.");
      return;
    }

    setGuardandoPedido(true);

    try {
      // 1. Guardar el pedido en estado 'pendiente' (NO modifica stock)
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            nombre_cliente: datosEnvio.nombreCliente.trim(),
            telefono_cliente: datosEnvio.telefonoCliente.trim() || null,
            metodo_envio: datosEnvio.metodoEnvio,
            direccion: datosEnvio.metodoEnvio === "envio" ? datosEnvio.direccion.trim() : null,
            nota_adicional: datosEnvio.notaAdicional.trim() || null,
            total: totalPrecio,
            estado: "pendiente",
          },
        ])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 2. Guardar los ítems del pedido
      if (pedidoData) {
        const itemsParaInsertar = carrito.map((item) => ({
          pedido_id: pedidoData.id,
          producto_id: item.id,
          nombre_producto: item.nombre,
          precio_unitario: item.precio,
          cantidad: item.cantidad,
        }));

        const { error: itemsError } = await supabase
          .from("pedido_items")
          .insert(itemsParaInsertar);

        if (itemsError) throw itemsError;
      }

      // 3. Redirigir a WhatsApp
      let mensaje = `*¡Hola! Quiero realizar el siguiente pedido:*\n\n`;
      mensaje += `*Cliente:* ${datosEnvio.nombreCliente}\n`;
      if (datosEnvio.telefonoCliente) {
        mensaje += `*Teléfono:* ${datosEnvio.telefonoCliente}\n`;
      }
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

      const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank");

      // 4. Limpiar carrito y mostrar modal de éxito
      vaciarCarrito();
      onClose();
      setMostrarModalExito(true);

    } catch (err) {
      console.error("Error crítico al guardar en Supabase:", err);
      alert("Hubo un error al registrar el pedido en la base de datos. Revisa la conexión o intenta nuevamente.");
    } finally {
      setGuardandoPedido(false);
    }
  };

  return (
    <>
      {/* MODAL DE ÉXITO */}
      {mostrarModalExito && (
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
              onClick={() => setMostrarModalExito(false)}
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
      )}

      {/* DRAWER DEL CARRITO */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 50,
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
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
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

              {carrito.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6b7280", marginTop: "40px" }}>
                  El carrito está vacío.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {carrito.map((item) => {
                    const stockDisponible = item.stock ?? 0;
                    const alcanzoLimite = item.cantidad >= stockDisponible;

                    return (
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
                            disabled={alcanzoLimite}
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ccc",
                              cursor: alcanzoLimite ? "not-allowed" : "pointer",
                              opacity: alcanzoLimite ? 0.5 : 1,
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
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "16px" }}>
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
                  onClick={enviarAWhatsApp}
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
