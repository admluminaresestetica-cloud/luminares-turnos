'use client';

import React, { useState, useEffect } from 'react';
import ModalPinAutorizacion from '@/app/admin/components/ModalPinAutorizacion';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  pedido_items?: PedidoItem[];
  items?: any[];
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

  // Estado para el PIN real de la base de datos
  const [pinAdminBD, setPinAdminBD] = useState<string>('1234');

  // Estados para controlar el Modal de PIN
  const [mostrarModalPin, setMostrarModalPin] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<{
    tipo: 'cancelar' | 'eliminar';
    pedidoId: string;
  } | null>(null);

  // Consultar el PIN configurado en 'configuracion_empresa'
  useEffect(() => {
    const fetchPin = async () => {
      const { data } = await supabase
        .from('configuracion_empresa')
        .select('pin_admin')
        .limit(1)
        .maybeSingle();

      if (data?.pin_admin) {
        setPinAdminBD(data.pin_admin);
      }
    };
    fetchPin();
  }, []);

  // Abrir modal pidiendo PIN
  const solicitarAutorizacion = (tipo: 'cancelar' | 'eliminar', pedidoId: string) => {
    setAccionPendiente({ tipo, pedidoId });
    setMostrarModalPin(true);
  };

  // Se ejecuta solo si el PIN ingresado es correcto
  const ejecutarAccionConfirmada = () => {
    if (!accionPendiente) return;

    if (accionPendiente.tipo === 'cancelar') {
      onCancelarPedido(accionPendiente.pedidoId);
    } else if (accionPendiente.tipo === 'eliminar') {
      onEliminarPedido(accionPendiente.pedidoId);
    }

    setMostrarModalPin(false);
    setAccionPendiente(null);
  };

  // Filtrado de pedidos según los criterios seleccionados
  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) {
      return false;
    }

    if (filtroFecha) {
      const fechaPedido = new Date(pedido.created_at).toISOString().split('T')[0];
      if (fechaPedido !== filtroFecha) {
        return false;
      }
    }

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

  // Función para exportar los pedidos filtrados a CSV
  const exportarACSV = () => {
    if (pedidosFiltrados.length === 0) {
      alert("No hay pedidos para exportar con los filtros actuales.");
      return;
    }

    const encabezados = ["ID", "Fecha", "Cliente", "Método Envío", "Dirección", "Estado", "Total"];
    const filas = pedidosFiltrados.map((p) => [
      p.id,
      new Date(p.created_at).toLocaleString("es-AR"),
      `"${p.nombre_cliente || ''}"`,
      p.metodo_envio,
      `"${p.direccion || ''}"`,
      p.estado,
      p.total
    ]);

    const contenidoCSV = [encabezados.join(";"), ...filas.map((f) => f.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const estadoStyles: Record<string, string> = {
    completado: "bg-[#D1FAE5] text-[#065F46]",
    aprobado: "bg-[#D1FAE5] text-[#065F46]",
    cancelado: "bg-[#FEE2E2] text-[#991B1B]",
    pendiente: "bg-[#FEF3C7] text-[#92400E]",
  };

  return (
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-base font-bold text-[#12151B] sm:text-lg">📋 Pedidos Recibidos</h2>

        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <button
            onClick={exportarACSV}
            className="h-10 shrink-0 rounded-xl border border-[#0E6E55] bg-[#0E6E55]/10 px-4 text-xs font-semibold text-[#0E6E55] transition-colors hover:bg-[#0E6E55]/20 active:scale-95"
          >
            📊 Exportar CSV
          </button>

          <button
            onClick={onFetchPedidos}
            className="h-10 shrink-0 rounded-xl border border-[#E7E5E0] px-4 text-xs font-semibold text-[#12151B] transition-colors hover:bg-[#F7F7F5] active:scale-95"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 sm:flex-row sm:flex-wrap">
        <input
          type="text"
          placeholder="Buscar cliente o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="h-10 w-full min-w-0 flex-1 rounded-lg border border-[#E7E5E0] bg-white px-3 text-xs text-[#12151B] outline-none focus:border-[#0E6E55] sm:min-w-[180px]"
        />

        <div className="flex gap-3">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-[#E7E5E0] bg-white px-3 text-xs font-semibold text-[#12151B] outline-none focus:border-[#0E6E55] sm:flex-none"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
            <option value="aprobado">Aprobado</option>
          </select>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="h-10 rounded-lg border border-[#E7E5E0] bg-white px-3 text-xs text-[#12151B] outline-none focus:border-[#0E6E55]"
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
        <div className="flex flex-col gap-3 sm:gap-4">
          {pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-2xl border border-[#E7E5E0] bg-[#F7F7F5] p-4 transition-all sm:p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#E7E5E0] bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-[#12151B] shadow-xs">
                      #{pedido.id.slice(0, 6).toUpperCase()}
                    </span>
                    <h3 className="m-0 truncate text-sm font-bold text-[#12151B] sm:text-base">
                      {pedido.nombre_cliente}
                    </h3>
                  </div>
                  <p className="m-0 mt-0.5 text-xs text-[#6B675F]">
                    {new Date(pedido.created_at).toLocaleString("es-AR")}
                  </p>
                </div>

                {/* CONTENEDOR DE ESTADO + BOTÓN ELIMINAR */}
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase sm:px-3 sm:text-xs ${
                      estadoStyles[pedido.estado] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pedido.estado}
                  </span>

                  <button
                    onClick={() => solicitarAutorizacion('eliminar', pedido.id)}
                    title="Eliminar pedido"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E5E0] bg-white text-xs font-bold text-gray-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="mb-3 rounded-lg bg-white/60 p-2.5 text-xs text-[#12151B]">
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
                  {(pedido.pedido_items && pedido.pedido_items.length > 0
                    ? pedido.pedido_items
                    : (pedido.items || []).map((i: any) => ({
                        id: i.id || Math.random(),
                        nombre_producto: i.nombre || i.title || "Producto",
                        cantidad: i.cantidad || 1,
                        precio_unitario: i.precio || i.unit_price || 0,
                      }))
                  ).map((item, idx) => (
                    <li key={item.id || idx}>
                      {item.cantidad}x {item.nombre_producto} - ${item.precio_unitario} c/u
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-[#E7E5E0] pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-base font-bold text-[#12151B]">
                  Total: ${pedido.total}
                </span>

                {pedido.estado === "pendiente" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => solicitarAutorizacion('cancelar', pedido.id)}
                      disabled={procesandoPedidoId === pedido.id}
                      className="h-10 flex-1 rounded-lg border border-[#C84343] px-3 text-xs font-semibold text-[#C84343] transition-colors hover:bg-red-50 active:scale-95 disabled:opacity-50 sm:flex-none"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => onAprobarPedido(pedido.id)}
                      disabled={procesandoPedidoId === pedido.id}
                      className="h-10 flex-1 rounded-lg bg-[#0E6E55] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#0A5340] active:scale-95 disabled:opacity-50 sm:flex-none"
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

      {/* MODAL DE AUTORIZACIÓN VÍA PIN DE ADMIN */}
      {mostrarModalPin && (
        <ModalPinAutorizacion
          isOpen={mostrarModalPin}
          onClose={() => {
            setMostrarModalPin(false);
            setAccionPendiente(null);
          }}
          onSuccess={ejecutarAccionConfirmada}
          pinCorrecto={pinAdminBD}
          titulo="Autorización requerida"
          subtitulo={`Ingresá el PIN de Administrador para ${
            accionPendiente?.tipo === 'cancelar' ? 'cancelar' : 'eliminar'
          } este pedido.`}
        />
      )}
    </div>
  );
}