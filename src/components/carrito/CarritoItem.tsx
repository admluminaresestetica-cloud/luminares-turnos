'use client';

import React from "react";

interface CarritoItemProps {
  item: {
    id: string | number;
    nombre: string;
    precio: number;
    cantidad: number;
    stock?: number;
    imagen_url?: string;
  };
  onRestar: (id: string | number) => void;
  onAgregar: (item: any) => void;
  onEliminar: (id: string | number) => void;
}

export default function CarritoItem({
  item,
  onRestar,
  onAgregar,
  onEliminar,
}: CarritoItemProps) {
  const stockDisponible = item.stock ?? 0;
  const alcanzoLimite = item.cantidad >= stockDisponible;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f3f4f6",
        paddingBottom: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "8px",
            backgroundColor: "#f7f7f5",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid #e7e5e0",
          }}
        >
          {item.imagen_url ? (
            <img
              src={item.imagen_url}
              alt={item.nombre}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "18px" }}>🛍️</span>
          )}
        </div>

        <div>
          <strong style={{ fontSize: "13px", color: "#1f2937", display: "block" }}>
            {item.nombre}
          </strong>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            ${new Intl.NumberFormat("es-AR").format(item.precio)} c/u
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => onRestar(item.id)}
          style={{
            padding: "2px 8px",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          -
        </button>
        <span style={{ fontWeight: "700", fontSize: "13px", minWidth: "16px", textAlign: "center" }}>
          {item.cantidad}
        </span>
        <button
          onClick={() => onAgregar(item)}
          disabled={alcanzoLimite}
          style={{
            padding: "2px 8px",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: alcanzoLimite ? "not-allowed" : "pointer",
            opacity: alcanzoLimite ? 0.4 : 1,
            fontWeight: "bold",
          }}
        >
          +
        </button>
        <button
          onClick={() => onEliminar(item.id)}
          style={{
            background: "none",
            border: "none",
            color: "#ef4444",
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
}
