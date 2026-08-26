'use client';

import React, { useState } from 'react';

interface PedidoItem {
  id: string;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  created_at: string;
  nombre_cliente: string;
  metodo_envio: string;
  direccion: string | null;
  nota_adicional: string | null;
  total: number;
  estado: string;
  pedido_items: PedidoItem[];
}

interface PedidosTabProps {
  pedidos: Pedido[];
  cargandoPedidos: boolean;
  procesandoPedidoId: string | null;
  onFetchPedidos: () => void;
  onAprobarPedido: (id: string) => void;
  onCancelarPedido: (id: string) => void;
  onEliminarPedido: (id: string) => void;
}

export default function PedidosTab({
  pedidos,
  cargandoPedidos,
  procesandoPedidoId,
  onFetchPedidos,
  onAprobarPedido,
  onCancelarPedido,
  onEliminarPedido,
}: PedidosTabProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Filtrado de pedidos según los criterios seleccionados
  const pedidosFiltrados = pedidos.filter((pedido) => {
    // 1. Filtro por Estado
    if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) {
      return false;
    }

    // 2. Filtro por Fecha (formato YYYY-MM-DD)
    if (filtroFecha) {
      const fechaPedido = new Date(pedido.created_at).toISOString().split('T')[0];
      if (fechaPedido !== filtroFecha) {
        return false;
      }
    }

    // 3. Buscador por Nombre o ID
    if (busqueda.trim() !== '') {
      const termino = busqueda.toLowerCase();
      const coincideNombre = pedido.nombre_cliente?.toLowerCase().includes(termino) ?? false;
      const coincideId = pedido.id?.toLowerCase().includes(termino) ?? false;
      if (!coincideNombre && !coincideId) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-lg font-bold text-[#12151B]">📋 Pedidos Recibidos</h2>
        <button
          onClick={onFetchPedidos}
          className="self-start rounded-xl border border-[#E7E5E0] px-4 py-2 text-xs font-semibold text-[#12151B] transition-colors hover:bg-[#F7F7F5] sm:self-auto"
        >
          🔄 Actualizar lista
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3">
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar cliente o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 min-w-[180px] rounded-lg border border-[#E7E5E0] bg-white px-3 py-1.5 text-xs text-[#12151B] outline-none focus:border-[#0E6E55]"
        />

        {/* Filtro Estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-lg border border-[#E7E5E0] bg-white px-3 py-1.5 text-xs font-semibold text-[#12151B] outline-none focus:border-[#0E6E55]"
        >
          <option value="todos">Todos los Estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
          <option value="aprobado">Aprobado</option>
        </select>

        {/* Filtro Fecha */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="rounded-lg border border-[#E7E5E0] bg-white px-3 py-1.5 text-xs text-[#12151B] outline-none focus:border-[#0E6E55]"
          />
          {filtroFecha && (
            <button
              onClick={() => setFiltroFecha('')}
              className="text-[11px] font-bold text-[#C84343] hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {cargandoPedidos ? (
        <p className="text-sm text-[#6B675F]">Cargando pedidos...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <p className="text-sm text-[#6B675F]">
          {pedidos.length === 0
            ? "No hay pedidos registrados aún."
            : "No se encontraron pedidos con los filtros seleccionados."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-5 transition-all"
            >
              <div className="mb-3 flex items-start justify-between">
  <div>
    <div className="flex items-center gap-2 mb-1">
      <span className="rounded-md bg-white border border-[#E7E5E0] px-2 py-0.5 font-mono text-[11px] font-bold text-[#12151B] shadow-xs">
        #{pedido.id.slice(0, 6).toUpperCase()}
      </span>
      <h3 className="m-0 text-base font-bold text-[#12151B]">
        {pedido.nombre_cliente}
      </h3>
    </div>
    <p className="m-0 mt-0.5 text-xs text-[#6B675F]">
      {new Date(pedido.created_at).toLocaleString("es-AR")}
    </p>
  </div>

  {/* CONTENEDOR DE ESTADO + BOTÓN ELIMINAR */}
  <div className="flex items-center gap-2">
    <span
      className={`rounded-lg px-3 py-1 text-xs font-bold uppercase ${
        pedido.estado === "completado"
          ? "bg-[#D1FAE5] text-[#065F46]"
          : pedido.estado === "cancelado"
          ? "bg-[#FEE2E2] text-[#991B1B]"
          : "bg-[#FEF3C7] text-[#92400E]"
      }`}
    >
      {pedido.estado}
    </span>

    {/* Botón de eliminar con una X */}
    <button
      onClick={() => {
        if (window.confirm("¿Estás seguro de eliminar este pedido de prueba?")) {
          onEliminarPedido(pedido.id);
        }
      }}
      title="Eliminar pedido"
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E7E5E0] bg-white text-xs font-bold text-gray-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      ✕
    </button>
  </div>
</div>

              <div className="mb-3 text-xs text-[#12151B]">
                <strong>Método:</strong>{" "}
                {pedido.metodo_envio === "envio" ? "Envío a domicilio" : "Retiro en local"}
                {pedido.direccion && (
                  <span> | <strong>Dirección:</strong> {pedido.direccion}</span>
                )}
                {pedido.nota_adicional && (
                  <p className="mt-1 italic text-[#6B675F]">
                    Nota: "{pedido.nota_adicional}"
                  </p>
                )}
              </div>

              <div className="border-t border-[#E7E5E0] pt-3">
                <p className="m-0 text-xs font-bold text-[#6B675F]">Detalle del pedido:</p>
                <ul className="my-2 list-disc pl-5 text-xs text-[#12151B]">
                  {pedido.pedido_items.map((item) => (
                    <li key={item.id}>
                      {item.cantidad}x {item.nombre_producto} - ${item.precio_unitario} c/u
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E7E5E0] pt-3">
                <span className="text-base font-bold text-[#12151B]">
                  Total: ${pedido.total}
                </span>

                {pedido.estado === "pendiente" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCancelarPedido(pedido.id)}
                      disabled={procesandoPedidoId === pedido.id}
                      className="rounded-lg border border-[#C84343] px-3 py-1.5 text-xs font-semibold text-[#C84343] hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => onAprobarPedido(pedido.id)}
                      disabled={procesandoPedidoId === pedido.id}
                      className="rounded-lg bg-[#0E6E55] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0A5340] disabled:opacity-50"
                    >
                      {procesandoPedidoId === pedido.id ? "Aprobando..." : "Aprobar Compra"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}