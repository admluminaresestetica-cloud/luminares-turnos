"use client";

import React from "react";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";

interface ProductoCardProps {
  producto: Producto & { precio_original?: number };
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const { carrito, agregarAlCarrito, restarUnidad } = useCarrito();

  // Verificamos la cantidad actual de este producto en el carrito
  const itemEnCarrito = carrito.find((item) => item.id === producto.id);
  const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  const tieneOferta =
    producto.precio_original && producto.precio_original > producto.precio;

  const descuento = tieneOferta
    ? Math.round(
        ((producto.precio_original! - producto.precio) /
          producto.precio_original!) *
          100
      )
    : 0;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <div>
        {/* Contenedor de la Imagen con la etiqueta de oferta */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "180px",
            background: "#f3f4f6",
          }}
        >
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            >
              Sin imagen
            </div>
          )}

          {tieneOferta && (
            <span
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                background: "#16a34a",
                color: "white",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {descuento}% OFF
            </span>
          )}
        </div>

        {/* Información del producto */}
        <div style={{ padding: "16px" }}>
          <span
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {producto.categoria}
          </span>
          <h3
            style={{
              margin: "4px 0 8px 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            {producto.nombre}
          </h3>
          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: "13px",
              color: "#4b5563",
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {producto.descripcion}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}
            >
              ${producto.precio}
            </span>
            {tieneOferta && (
              <span
                style={{
                  textDecoration: "line-through",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                ${producto.precio_original}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: producto.stock > 0 ? "#059669" : "#dc2626",
              fontWeight: "500",
            }}
          >
            {producto.stock > 0
              ? `Stock disponible: ${producto.stock}`
              : "Sin stock"}
          </div>
        </div>
      </div>

      {/* Botón de compra / Control de cantidad */}
      <div style={{ padding: "0 16px 16px 16px" }}>
        {producto.stock <= 0 ? (
          <button
            disabled
            style={{
              width: "100%",
              background: "#9ca3af",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              cursor: "not-allowed",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Agotado
          </button>
        ) : cantidad === 0 ? (
          <button
            onClick={() => agregarAlCarrito(producto)}
            style={{
              width: "100%",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "background 0.2s",
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
              background: "#f3f4f6",
              borderRadius: "8px",
              padding: "4px",
              border: "1px solid #e5e7eb",
            }}
          >
            <button
              onClick={() => restarUnidad(producto.id)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: "#ffffff",
                border: "1px solid #d1d5db",
                fontWeight: "bold",
                color: "#374151",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              -
            </button>
            <span
              style={{
                fontWeight: "600",
                fontSize: "14px",
                color: "#1f2937",
              }}
            >
              {cantidad} en carrito
            </span>
            <button
              onClick={() => agregarAlCarrito(producto)}
              disabled={cantidad >= producto.stock}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: cantidad >= producto.stock ? "#e5e7eb" : "#ffffff",
                border: "1px solid #d1d5db",
                fontWeight: "bold",
                color: cantidad >= producto.stock ? "#9ca3af" : "#374151",
                cursor: cantidad >= producto.stock ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
