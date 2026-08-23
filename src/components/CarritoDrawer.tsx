'use client';

<<<<<<< HEAD
import React from 'react';
import { Producto } from '@/types/tienda';
import { useCarrito } from '@/context/CarritoContext';
=======
import React, { useState } from "react";
import { useCarrito } from "@/context/CarritoContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
>>>>>>> c2357e45214b1dd6c17f7c8f886f53ebdb3c8cb1

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const { carrito, agregarAlCarrito, restarUnidad } = useCarrito();

<<<<<<< HEAD
  // Buscar cuántas unidades de este producto ya tiene el cliente en el carrito
  const itemEnCarrito = carrito.find((item) => item.id === producto.id);
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  // Lógica de disponibilidad
  const stockDisponible = producto.stock ?? 0;
  const estaPausado = producto.activo === false;
  const sinStock = stockDisponible <= 0 || estaPausado;
  const alcanzoLimiteStock = cantidadEnCarrito >= stockDisponible;
=======
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState("5493413954355"); // Tu número de recepción
  const [guardandoPedido, setGuardandoPedido] = useState(false);

  if (!isOpen) return null;

  const enviarAWhatsApp = async () => {
    if (!datosEnvio.nombreCliente.trim()) {
      alert("Por favor, ingresá tu nombre para continuar.");
      return;
    }

    setGuardandoPedido(true);

    try {
      // 1. Guardar el pedido en Supabase
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            nombre_cliente: datosEnvio.nombreCliente,
            telefono_cliente: datosEnvio.telefonoCliente || "",
            metodo_envio: datosEnvio.metodoEnvio,
            direccion: datosEnvio.metodoEnvio === "envio" ? datosEnvio.direccion : null,
            nota_adicional: datosEnvio.notaAdicional || null,
            total: totalPrecio,
            estado: "pendiente",
          },
        ])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 2. Guardar los ítems del pedido
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

      // 3. Crear el mensaje y abrir WhatsApp
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

      vaciarCarrito();
      onClose();
    } catch (error: any) {
      console.error("Error al registrar el pedido:", error);
      alert("Hubo un problema al procesar el pedido. Por favor intentá nuevamente.");
    } finally {
      setGuardandoPedido(false);
    }
  };
>>>>>>> c2357e45214b1dd6c17f7c8f886f53ebdb3c8cb1

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: sinStock ? 0.65 : 1,
        backgroundColor: '#ffffff',
      }}
    >
<<<<<<< HEAD
      {/* Badge de Pausado o Sin Stock */}
      {sinStock && (
        <span
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}
        >
          {estaPausado ? 'No disponible' : 'Sin Stock'}
        </span>
      )}

      <div>
        {producto.imagen_url && (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
=======
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
        {/* Cabecera */}
        <div>
          <div
>>>>>>> c2357e45214b1dd6c17f7c8f886f53ebdb3c8cb1
            style={{
              width: '100%',
              height: '160px',
              objectFit: 'cover',
              borderRadius: '6px',
              marginBottom: '12px',
            }}
          />
        )}
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
            {producto.descripcion}
          </p>
        )}
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
          ${producto.precio}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        {sinStock ? (
          <button
            disabled
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#d1d5db',
              color: '#6b7280',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'not-allowed',
            }}
          >
<<<<<<< HEAD
            {estaPausado ? 'Pausado' : 'Agotado'}
          </button>
        ) : cantidadEnCarrito > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => restarUnidad(producto.id)}
=======
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

          {/* Lista de productos */}
          {carrito.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b7280", marginTop: "40px", marginBottom: "40px" }}>
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
                        title={alcanzoLimite ? "Stock máximo alcanzado" : ""}
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
                );
              })}
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
              placeholder="Tu Nombre completo *"
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

            <input
              type="text"
              placeholder="Tu Teléfono / WhatsApp"
              value={datosEnvio.telefonoCliente || ""}
              onChange={(e) =>
                setDatosEnvio({ ...datosEnvio, telefonoCliente: e.target.value })
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
>>>>>>> c2357e45214b1dd6c17f7c8f886f53ebdb3c8cb1
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <span style={{ fontWeight: '600' }}>{cantidadEnCarrito}</span>
              <button
                onClick={() => agregarAlCarrito(producto)}
                disabled={alcanzoLimiteStock}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  cursor: alcanzoLimiteStock ? 'not-allowed' : 'pointer',
                  opacity: alcanzoLimiteStock ? 0.4 : 1,
                }}
              >
                +
              </button>
            </div>
<<<<<<< HEAD
            {alcanzoLimiteStock && (
              <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '500' }}>
                Máx. alcanzado
              </span>
            )}
=======

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
              }}
            >
              {guardandoPedido ? "Procesando..." : "Confirmar Pedido por WhatsApp"}
            </button>
>>>>>>> c2357e45214b1dd6c17f7c8f886f53ebdb3c8cb1
          </div>
        ) : (
          <button
            onClick={() => agregarAlCarrito(producto)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Agregar al Carrito
          </button>
        )}
      </div>
    </div>
  );
}
