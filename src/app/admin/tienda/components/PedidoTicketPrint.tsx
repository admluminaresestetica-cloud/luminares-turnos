'use client';

import React from 'react';

interface PedidoTicketPrintProps {
  pedido: any;
}

export default function PedidoTicketPrint({ pedido }: PedidoTicketPrintProps) {
  if (!pedido) return null;

  const esEnvio = pedido.metodo_envio === "envio";

  return (
    <div className="hidden print:block font-sans text-black bg-white p-6 max-w-[80mm] mx-auto text-xs leading-tight">
      {/* Encabezado del ticket */}
      <div className="text-center border-b border-black pb-3 mb-3">
        <h1 className="text-sm font-extrabold uppercase">Luminares Estética</h1>
        <p className="text-[10px] text-gray-600">Comprobante de Fulfillment</p>
        <span className="inline-block mt-1 bg-black text-white px-2 py-0.5 text-xs font-mono font-bold rounded">
          #{pedido.id.slice(0, 6).toUpperCase()}
        </span>
      </div>

      {/* Datos del Cliente y Envío */}
      <div className="space-y-1.5 mb-3 border-b border-black pb-3">
        <p><strong>Fecha:</strong> {new Date(pedido.created_at).toLocaleString("es-AR")}</p>
        <p><strong>Cliente:</strong> {pedido.nombre_cliente}</p>
        <p><strong>Teléfono:</strong> {pedido.telefono_cliente || "No especificado"}</p>
        <p><strong>Método:</strong> {esEnvio ? "📦 Envío a Domicilio" : "🏪 Retiro en Local"}</p>
        {esEnvio && pedido.direccion && (
          <p className="mt-1"><strong>Dirección:</strong> {pedido.direccion}</p>
        )}
      </div>

      {/* Listado de Productos */}
      <div className="mb-3 border-b border-black pb-3">
        <p className="font-bold uppercase text-[10px] mb-1">Productos:</p>
        <ul className="space-y-1">
          {(pedido.pedido_items && pedido.pedido_items.length > 0
            ? pedido.pedido_items
            : (pedido.items || []).map((i: any) => ({
                id: i.id || Math.random(),
                nombre_producto: i.nombre || i.title || "Producto",
                cantidad: i.cantidad || 1,
                precio_unitario: i.precio || i.unit_price || 0,
              }))
          ).map((item: any, idx: number) => (
            <li key={item.id || idx} className="flex justify-between">
              <span>{item.cantidad}x {item.nombre_producto}</span>
              <span className="font-mono">${(item.precio_unitario * item.cantidad).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Total y Preparador */}
      <div className="flex justify-between items-center font-bold text-sm mb-4">
        <span>TOTAL:</span>
        <span className="font-mono">${Number(pedido.total).toLocaleString()}</span>
      </div>

      {pedido.preparado_por && (
        <div className="text-[10px] text-center text-gray-700 border-t border-dashed border-gray-400 pt-2">
          Preparado por: {pedido.preparado_por}
        </div>
      )}

      {pedido.nota_adicional && (
        <div className="mt-2 p-1.5 bg-gray-100 rounded text-[10px]">
          <strong>Nota:</strong> {pedido.nota_adicional}
        </div>
      )}
    </div>
  );
}
