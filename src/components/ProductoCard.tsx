"use client";

import React from "react";
// ──> CAMBIO 1: Importar ícono y hook de favoritos
import { Heart } from "lucide-react";
import { useFavoritos } from "@/context/FavoritosContext";
// <── FIN CAMBIO 1
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
  activo?: boolean;
  permite_cuotas?: boolean;
}

export default function ProductoCard({ producto }: { producto: Producto }) {
  const { carrito, agregarAlCarrito, restarUnidad } = useCarrito();
  // ──> CAMBIO 2: Usar el hook de favoritos
  const { toggleFavorito, esFavorito } = useFavoritos();
  // <── FIN CAMBIO 2

  const itemEnCarrito = carrito.find((item) => item.id === producto.id);
  const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  // Determinar si el producto está sin stock o pausado
  const stockDisponible = producto.stock ?? 0;
  const estaPausado = producto.activo === false || producto.disponible === false;
  const sinStock = stockDisponible <= 0;
  const estaAgotado = sinStock || estaPausado;
  const permiteCuotas = producto.permite_cuotas ?? true;

  // ──> CAMBIO 3: Verificar si es favorito
  const estaEnFavoritos = esFavorito(producto.id);
  // <── FIN CAMBIO 3

  // Límite alcanzado en el contador
  const alcanzoLimiteStock = cantidad >= stockDisponible;

  // Cálculo del porcentaje de descuento
  const tieneOferta =
    Boolean(producto.precio_original) &&
    (producto.precio_original ?? 0) > producto.precio;

  const porcentajeDescuento = tieneOferta
    ? Math.round(
        ((producto.precio_original! - producto.precio) /
          producto.precio_original!) *
          100
      )
    : 0;

  const handleAgregar = () => {
    agregarAlCarrito({
      ...producto,
      permite_cuotas: permiteCuotas,
    } as any);
  };

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
        opacity: estaAgotado ? 0.75 : 1,
        position: "relative", // Necesario para los botones absolutos
      }}
    >
      <div>
        {/* ──> CAMBIO 4: Insertar Botón de Corazón (Favoritos) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Por seguridad, si la card tuviera click
            toggleFavorito(producto as any);
          }}
          style={{
            position: "absolute",
            top: "12px",
            left: "12px", // Lo ponemos a la izquierda para no tapar los badges de la derecha
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            border: "none",
            borderRadius: "50%",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)")}
          title={estaEnFavoritos ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart
            size={18}
            style={{
              transition: "fill 0.2s ease, color 0.2s ease",
              color: estaEnFavoritos ? "#ef4444" : "#9ca3af",
              fill: estaEnFavoritos ? "#ef4444" : "none",
            }}
          />
        </button>
        {/* <── FIN CAMBIO 4 */}

        {/* Badges superiores (Derecha) */}
        <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "4px", zIndex: 1 }}>
          {!permiteCuotas && !estaAgotado && (
            <span
              style={{
                backgroundColor: "#f59e0b",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "700",
                padding: "3px 6px",
                borderRadius: "6px",
                textTransform: "uppercase",
              }}
            >
              Sin cuotas
            </span>
          )}

          {estaAgotado ? (
            <span
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "700",
                padding: "4px 8px",
                borderRadius: "6px",
                textTransform: "uppercase",
              }}
            >
              {estaPausado ? "Pausado" : "Sin Stock"}
            </span>
          ) : (
            tieneOferta && (
              <span
                style={{
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                {porcentajeDescuento}% OFF
              </span>
            )
          )}
        </div>

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
              filter: estaAgotado ? "grayscale(30%)" : "none",
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
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}
            >
              ${(Number(producto.precio) || 0).toLocaleString("es-AR")}
            </span>
            {tieneOferta && (
              <span
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  textDecoration: "line-through",
                }}
              >
                ${(Number(producto.precio_original) || 0).toLocaleString("es-AR")}
              </span>
            )}
          </div>

          {!estaAgotado && (
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Stock: {stockDisponible}
            </span>
          )}
        </div>

        {estaAgotado ? (
          <button
            disabled
            style={{
              width: "100%",
              backgroundColor: "#9ca3af",
              color: "#ffffff",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "not-allowed",
            }}
          >
            {estaPausado ? "No disponible" : "Agotado"}
          </button>
        ) : cantidad === 0 ? (
          <button
            onClick={handleAgregar}
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
              onClick={handleAgregar}
              disabled={alcanzoLimiteStock}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: alcanzoLimiteStock ? "#e5e7eb" : "#ffffff",
                color: alcanzoLimiteStock ? "#9ca3af" : "#000000",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: alcanzoLimiteStock ? "not-allowed" : "pointer",
              }}
              title={alcanzoLimiteStock ? "Máximo disponible alcanzado" : ""}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}