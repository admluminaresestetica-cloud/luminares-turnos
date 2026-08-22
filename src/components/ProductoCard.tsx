"use client";

import React from "react";
import { useCarrito } from "@/context/CarritoContext";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  precio_original?: number;
  descripcion?: string;
  imagen_url?: string;
  categoria?: string;
  stock?: number;
  disponible?: boolean;
}

export default function ProductoCard({ producto }: { producto: Producto }) {
  const { carrito, agregarAlCarrito, restarUnidad } = useCarrito();

  const itemEnCarrito = carrito.find((item) => item.id === producto.id);
  const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div>
        {producto.imagen_url && (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            style={{
              width: "100%",
              height: "160px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          />
        )}
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "700",
            margin: "0 0 6px 0",
            color: "#1f2937",
          }}
        >
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: "0 0 12px 0",
              lineHeight: "1.4",
            }}
          >
            {producto.descripcion}
          </p>
        )}
      </div>

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}
          >
            ${producto.precio}
          </span>
          {producto.precio_original && (
            <span
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                textDecoration: "line-through",
              }}
            >
              ${producto.precio_original}
            </span>
          )}
        </div>

        {cantidad === 0 ? (
          <button
            onClick={() => agregarAlCarrito(producto)}
            style={{
              width: "100%",
              backgroundColor: "#111827",
              color: "#ffffff",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Agregar al carrito
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              padding: "4px 8px",
            }}
          >
            <button
              onClick={() => restarUnidad(producto.id)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              -
            </button>
            <span style={{ fontWeight: "700", fontSize: "14px" }}>
              {cantidad}
            </span>
            <button
              onClick={() => agregarAlCarrito(producto)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
