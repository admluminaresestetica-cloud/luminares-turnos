"use client";

import React, { useState } from "react";
import {
  Package,
  Truck,
  Store,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  MessageCircle,
  Search,
  Filter,
} from "lucide-react";

export interface ItemPedido {
  id?: string;
  pedido_id?: string;
  producto_id?: number | null;
  nombre_producto?: string;
  nombre?: string;
  precio_unitario: number;
  cantidad: number;
  subtotal?: number;
}

export interface Pedido {
  id: string;
  created_at: string;
  nombre_cliente: string;
  cliente_nombre?: string;
  telefono_cliente: string | null;
  cliente_email?: string | null;
  metodo_envio: "envio" | "retiro" | string;
  direccion: string | null;
  nota_adicional?: string | null;
  total: number;
  estado: "pendiente" | "confirmado" | "entregado" | "cancelado" | string;
  metodo_pago?: "whatsapp" | "mercadopago" | string | null;
  items?: ItemPedido[];
  pedido_items?: ItemPedido[]; // Soporta la propiedad nativa de Supabase
  origen?: string | null;
}

export interface PedidosTabProps {
  pedidos?: Pedido[];
  cargandoPedidos?: boolean;
  procesandoPedidoId?: string | null;
  onFetchPedidos?: () => Promise<void>;
  onActualizarEstado?: (pedidoId: string, nuevoEstado: string) => Promise<void>;
  onAprobarPedido?: (id: string) => Promise<void>;
  onCancelarPedido?: (id: string) => void | Promise<void>;
  onEliminarPedido?: (id: string) => void | Promise<void>;
}

export default function PedidosTab({
  pedidos = [],
  cargandoPedidos = false,
  procesandoPedidoId = null,
  onActualizarEstado,
  onAprobarPedido,
  onCancelarPedido,
  onEliminarPedido,
}: PedidosTabProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  const listaPedidos = Array.isArray(pedidos) ? pedidos : [];

  const pedidosFiltrados = listaPedidos.filter((pedido) => {
    const coincideEstado =
      filtroEstado === "todos" || pedido.estado?.toLowerCase() === filtroEstado.toLowerCase();

    const nombre = (pedido.nombre_cliente || pedido.cliente_nombre || "").toLowerCase();
    const telefono = (pedido.telefono_cliente || "").toLowerCase();
    const id = (pedido.id || "").toLowerCase();
    const termino = busqueda.toLowerCase();

    return coincideEstado && (nombre.includes(termino) || telefono.includes(termino) || id.includes(termino));
  });

  const cambiarEstado = async (id: string, estado: string) => {
    if (onActualizarEstado) {
      try {
        setActualizandoId(id);
        await onActualizarEstado(id, estado);
      } finally {
        setActualizandoId(null);
      }
    } else if (estado === "confirmado" && onAprobarPedido) {
      await onAprobarPedido(id);
    } else if (estado === "cancelado" && onCancelarPedido) {
      await onCancelarPedido(id);
    }
  };

const getBadgeEstado = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case "confirmado":
    case "aprobado":
    case "completado":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "entregado":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "cancelado":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
};

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmado">Confirmados</option>
            <option value="entregado">Entregados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {cargandoPedidos ? (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">
          Cargando pedidos...
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            No se encontraron pedidos con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pedidosFiltrados.map((pedido) => {
            const nombreCliente = pedido.nombre_cliente || pedido.cliente_nombre || "Cliente sin nombre";
            const esEnvio = pedido.metodo_envio === "envio";
            const itemsDetalle = pedido.pedido_items || pedido.items || [];

            return (
              <div
                key={pedido.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md"
              >
                {/* Cabecera */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      #{pedido.id.slice(0, 8)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${getBadgeEstado(
                        pedido.estado
                      )}`}
                    >
                      {pedido.estado || "Pendiente"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(pedido.created_at).toLocaleString("es-AR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                {/* Cliente y Dirección */}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {nombreCliente}
                    </div>

                    {pedido.telefono_cliente && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <a
                          href={`https://wa.me/549${pedido.telefono_cliente.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          {pedido.telefono_cliente}
                        </a>
                      </div>
                    )}

                    {pedido.metodo_pago && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {pedido.metodo_pago === "mercadopago" ? (
                          <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        Pago: <span className="font-medium capitalize">{pedido.metodo_pago}</span>
                      </div>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className="flex flex-col justify-center">
                    {esEnvio ? (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 dark:bg-amber-500/10">
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          <Truck className="h-4 w-4 shrink-0" />
                          Envío a domicilio
                        </div>
                        <div className="flex items-start gap-2 text-sm text-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span className="font-medium">
                            {pedido.direccion && pedido.direccion.trim() !== "" ? (
                              pedido.direccion
                            ) : (
                              <span className="italic text-muted-foreground">
                                No se especificó dirección.
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs font-semibold text-foreground">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        Retiro en local
                      </div>
                    )}
                  </div>
                </div>

                {/* Items del Pedido */}
                {itemsDetalle.length > 0 && (
                  <div className="mt-4 rounded-xl border border-border/80 bg-muted/20 p-3.5">
                    <span className="block mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Productos del Pedido
                    </span>
                    <ul className="divide-y divide-border/40 text-xs">
                      {itemsDetalle.map((item, idx) => {
                        const nombreProd = item.nombre_producto || item.nombre || "Producto";
                        const subtotal = item.subtotal ?? (Number(item.precio_unitario || 0) * Number(item.cantidad || 1));

                        return (
                          <li key={idx} className="flex justify-between py-1.5">
                            <span className="text-foreground">
                              <strong className="font-semibold">{item.cantidad}x</strong> {nombreProd}
                            </span>
                            <span className="font-semibold text-foreground">
                              ${Number(subtotal).toLocaleString("es-AR")}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3.5">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total del Pedido
                    </span>
                    <span className="text-lg font-extrabold text-foreground">
                      ${Number(pedido.total || 0).toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
  disabled={actualizandoId === pedido.id || procesandoPedidoId === pedido.id}
  value={pedido.estado || "pendiente"}
  onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
  className="..."
>
  <option value="pendiente">Pendiente</option>
  <option value="confirmado">Confirmado / Aprobado</option>
  <option value="completado">Completado (POS)</option>
  <option value="entregado">Entregado</option>
  <option value="cancelado">Cancelado</option>
</select>

                    {onEliminarPedido && (
                      <button
                        onClick={() => onEliminarPedido(pedido.id)}
                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-400"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}