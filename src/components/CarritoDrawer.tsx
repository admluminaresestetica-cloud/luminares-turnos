'use client';

import React, { useState } from "react";
import { useCarrito } from "@/context/CarritoContext";
import { createClient } from "@supabase/supabase-js";

import CarritoItem from "./carrito/CarritoItem";
import FormularioEnvio from "./carrito/FormularioEnvio";
import ModalExito from "./carrito/ModalExito";

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
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            nombre_cliente: datosEnvio.nombreCliente.trim(),
            telefono_cliente: datosEnvio.telefonoCliente.trim() || null,
            metodo_envio: datosEnvio.metodoEnvio,
            total: totalPrecio,
            estado: "pendiente",
            direccion: datosEnvio.metodoEnvio === "envio" ? datosEnvio.direccion.trim() : null,
            nota_adicional: datosEnvio.notaAdicional.trim() || null,
          },
        ])
        .select();

      if (pedidoError) console.error("Error al insertar pedido:", pedidoError);

      if (pedidoData && pedidoData.length > 0) {
        const idPedido = pedidoData[0].id;
        const itemsParaInsertar = carrito.map((item) => ({
          pedido_id: idPedido,
          producto_id: item.id,
          nombre_producto: item.nombre,
          precio_unitario: item.precio,
          cantidad: item.cantidad,
        }));

        const { error: itemsError } = await supabase
          .from("pedido_items")
          .insert(itemsParaInsertar);

        if (itemsError) console.error("Error al insertar items:", itemsError);
      }
    } catch (err) {
      console.error("Excepción:", err);
    }

    let mensaje = `*¡Hola! Quiero realizar el siguiente pedido:*\n\n`;
    mensaje += `*Cliente:* ${datosEnvio.nombreCliente}\n`;
    if (datosEnvio.telefonoCliente) mensaje += `*Teléfono:* ${datosEnvio.telefonoCliente}\n`;
    mensaje += `*Método:* ${datosEnvio.metodoEnvio === "envio" ? "Envío a domicilio" : "Retiro en local"}\n`;

    if (datosEnvio.metodoEnvio === "envio" && datosEnvio.direccion) {
      mensaje += `*Dirección:* ${datosEnvio.direccion}\n`;
    }

    if (datosEnvio.notaAdicional) mensaje += `*Nota:* ${datosEnvio.notaAdicional}\n`;

    mensaje += `\n*Detalle del pedido:*\n`;
    carrito.forEach((item) => {
      mensaje += `- ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})\n`;
    });

    mensaje += `\n*Total a pagar:* $${totalPrecio}\n\n`;
    mensaje += `Quedo a la espera de los datos para concretar la compra.`;

    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    vaciarCarrito();
    setGuardandoPedido(false);
    onClose();
    setMostrarModalExito(true);
  };

  return (
    <>
      <ModalExito
        mostrar={mostrarModalExito}
        onAceptar={() => setMostrarModalExito(false)}
      />

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
                  {carrito.map((item) => (
                    <CarritoItem
                      key={item.id}
                      item={item}
                      onRestar={restarUnidad}
                      onAgregar={agregarAlCarrito}
                      onEliminar={eliminarDelCarrito}
                    />
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <FormularioEnvio
                totalPrecio={totalPrecio}
                datosEnvio={datosEnvio}
                setDatosEnvio={setDatosEnvio}
                guardandoPedido={guardandoPedido}
                onConfirmar={enviarAWhatsApp}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
