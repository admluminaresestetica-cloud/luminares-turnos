'use client';

import React from 'react';
import { Producto } from '@/types/tienda';
import { useCarrito } from '@/context/CarritoContext';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const { carrito, agregarAlCarrito, restarUnidad } = useCarrito();

  const itemEnCarrito = carrito.find((item) => item.id === producto.id);
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

   const stockDisponible = producto.stock ?? 0;
  const estaPausado = producto.activo === false;
  const sinStock = stockDisponible <= 0 || estaPausado;
  const alcanzoLimiteStock = cantidadEnCarrito >= stockDisponible;

  // Número de WhatsApp e ingreso de mensaje automático para reingreso
  const numeroTelefono = "5493413954355"; // Reemplazá por tu número de WhatsApp real con código de país
  const mensajeWA = encodeURIComponent(
    `¡Hola! Quería consultar cuándo vuelve a ingresar el producto: ${producto.nombre}`
  );
  const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeWA}`;


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
            {estaPausado ? 'Pausado' : 'Agotado'}
          </button>
        ) : cantidadEnCarrito > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => restarUnidad(producto.id)}
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
            {alcanzoLimiteStock && (
              <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '500' }}>
                Máx. alcanzado
              </span>
            )}
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