'use client';

import React, { useState, useEffect } from 'react';
import ModalPinAutorizacion from '@/app/admin/components/ModalPinAutorizacion';
import { createBrowserClient } from '@supabase/ssr';

import { 
  ClipboardList, 
  Download, 
  RotateCw, 
  Search, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  Store,
  Loader2,
  UserCheck,
  Clock,
  CreditCard
} from "lucide-react";

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
  metodo_pago?: string;
  payment_id?: string;
  direccion: string | null;
  nota_adicional: string | null;
  total: number;
  estado: string;
  origen?: string;
  preparado_por?: string;
  historial_estados?: any[];
  pedido_items?: PedidoItem[];
  items?: any[];
}

interface PedidosTabProps {
  pedidos: Pedido[];
  cargandoPedidos: boolean;
  procesandoPedidoId: string | null;
  onFetchPedidos: () => void;
  onCambiarEstado: (id: string, nuevoEstado: string) => void;
  onCancelarPedido: (id: string) => void;
  onEliminarPedido: (id: string) => void;
}

export default function PedidosTab({
  pedidos,
  cargandoPedidos,
  procesandoPedidoId,
  onFetchPedidos,
  onCambiarEstado,
  onCancelarPedido,
  onEliminarPedido,
}: PedidosTabProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Estado para controlar qué tarjeta está expandida
  const [pedidoExpandidoId, setPedidoExpandidoId] = useState<string | null>(null);

  const toggleExpandir = (id: string) => {
    setPedidoExpandidoId(pedidoExpandidoId === id ? null : id);
  };

  // Estado para el PIN real de la base de datos
  const [pinAdminBD, setPinAdminBD] = useState<string>('1234');

  // Estados para controlar el Modal de PIN
  const [mostrarModalPin, setMostrarModalPin] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<{
    tipo: 'cancelar' | 'eliminar';
    pedidoId: string;
  } | null>(null);

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

  const solicitarAutorizacion = (tipo: 'cancelar' | 'eliminar', pedidoId: string) => {
    setAccionPendiente({ tipo, pedidoId });
    setMostrarModalPin(true);
  };

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

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (pedido.origen === 'pos' || pedido.origen === 'local' || pedido.origen === 'caja') {
      return false;
    }

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

  const exportarACSV = () => {
    if (pedidosFiltrados.length === 0) {
      alert("No hay pedidos para exportar con los filtros actuales.");
      return;
    }

    const encabezados = ["ID", "Fecha", "Cliente", "Método Envío", "Método Pago", "Estado", "Total", "Preparado Por"];
    const filas = pedidosFiltrados.map((p) => [
      p.id,
      new Date(p.created_at).toLocaleString("es-AR"),
      `"${p.nombre_cliente || ''}"`,
      p.metodo_envio,
      p.metodo_pago || 'efectivo/transferencia',
      p.estado,
      p.total,
      `"${p.preparado_por || ''}"`
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
  completado: "bg-[#D1FAE5] text-[#065F46] border-emerald-200",
  aprobado: "bg-[#D1FAE5] text-[#065F46] border-emerald-200",
  en_preparacion: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
  listo: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300",
  en_camino: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300",
  cerca: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300",
  no_entregado: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300",
  cancelado: "bg-[#FEE2E2] text-[#991B1B] border-rose-200",
  pendiente: "bg-[#FEF3C7] text-[#92400E] border-amber-200",
};

return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs transition-colors sm:rounded-3xl sm:p-6">
      {/* Encabezado y Acciones */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h2 className="m-0 text-base font-extrabold text-slate-900 dark:text-zinc-100 sm:text-lg">
            Pedidos Recibidos (Logística Web)
          </h2>
        </div>

        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={exportarACSV}
            className="h-9 sm:h-10 shrink-0 inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={onFetchPedidos}
            className="h-9 sm:h-10 shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 px-3.5 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar cliente o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <select
  value={filtroEstado}
  onChange={(e) => setFiltroEstado(e.target.value)}
  className="h-10 flex-1 sm:flex-none rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 px-3 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
>
  <option value="todos" className="dark:bg-zinc-900">Todos los Estados</option>
  <option value="pendiente" className="dark:bg-zinc-900">⏳ Pendiente</option>
  <option value="en_preparacion" className="dark:bg-zinc-900">📦 En Preparación</option>
  <option value="listo" className="dark:bg-zinc-900">🚀 Listo / Empaquetado</option>
  <option value="en_camino" className="dark:bg-zinc-900">🛵 En Camino</option>
  <option value="cerca" className="dark:bg-zinc-900">📍 Cerca del Domicilio</option>
  <option value="completado" className="dark:bg-zinc-900">✅ Entregado con Éxito</option>
  <option value="no_entregado" className="dark:bg-zinc-900">⚠️ No se pudo entregar</option>
  <option value="cancelado" className="dark:bg-zinc-900">❌ Cancelado</option>
</select>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 px-3 text-xs font-medium text-slate-800 dark:text-zinc-200 outline-none [color-scheme:light] dark:[color-scheme:dark]"
            />
            {filtroFecha && (
              <button
                type="button"
                onClick={() => setFiltroFecha('')}
                className="h-10 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido de la Lista */}
      {cargandoPedidos ? (
        <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span>Cargando pedidos...</span>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-zinc-400">
          {pedidos.length === 0
            ? "No hay pedidos registrados aún."
            : "No se encontraron pedidos con los filtros seleccionados."}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 sm:gap-4">
          {pedidosFiltrados.map((pedido: any) => {
            const estaExpandido = pedidoExpandidoId === pedido.id;
            const esMercadoPago = pedido.metodo_pago === "mercadopago";
            const pagoAprobado = Boolean(pedido.payment_id);

   
   return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs transition-colors sm:rounded-3xl sm:p-6">
      {/* Encabezado y Acciones */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h2 className="m-0 text-base font-extrabold text-slate-900 dark:text-zinc-100 sm:text-lg">
            Pedidos Recibidos (Logística Web)
          </h2>
        </div>

        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={exportarACSV}
            className="h-9 sm:h-10 shrink-0 inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={onFetchPedidos}
            className="h-9 sm:h-10 shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 px-3.5 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar cliente o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="h-10 flex-1 sm:flex-none rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 px-3 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
          >
            <option value="todos" className="dark:bg-zinc-900">Todos los Estados</option>
            <option value="pendiente" className="dark:bg-zinc-900">⏳ Pendiente</option>
            <option value="en_preparacion" className="dark:bg-zinc-900">📦 En Preparación</option>
            <option value="listo" className="dark:bg-zinc-900">🚀 Listo / Empaquetado</option>
            <option value="en_camino" className="dark:bg-zinc-900">🛵 En Camino</option>
            <option value="cerca" className="dark:bg-zinc-900">📍 Cerca del Domicilio</option>
            <option value="completado" className="dark:bg-zinc-900">✅ Entregado con Éxito</option>
            <option value="no_entregado" className="dark:bg-zinc-900">⚠️ No se pudo entregar</option>
            <option value="cancelado" className="dark:bg-zinc-900">❌ Cancelado</option>
          </select>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 px-3 text-xs font-medium text-slate-800 dark:text-zinc-200 outline-none [color-scheme:light] dark:[color-scheme:dark]"
            />
            {filtroFecha && (
              <button
                type="button"
                onClick={() => setFiltroFecha('')}
                className="h-10 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido de la Lista */}
      {cargandoPedidos ? (
        <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span>Cargando pedidos...</span>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-zinc-400">
          {pedidos.length === 0
            ? "No hay pedidos registrados aún."
            : "No se encontraron pedidos con los filtros seleccionados."}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 sm:gap-4">
          {pedidosFiltrados.map((pedido: any) => {
            const estaExpandido = pedidoExpandidoId === pedido.id;
            const esMercadoPago = pedido.metodo_pago === "mercadopago";
            const pagoAprobado = Boolean(pedido.payment_id);

            return (
              <div
                key={pedido.id}
                className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 p-4 sm:p-5 transition-all hover:border-slate-300 dark:hover:border-zinc-700"
              >
                {/* Header de la Tarjeta */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-extrabold text-slate-900 dark:text-zinc-100 shadow-2xs">
                        #{pedido.id.slice(0, 6).toUpperCase()}
                      </span>
                      <h3 className="m-0 truncate text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100">
                        {pedido.nombre_cliente}
                      </h3>
                    </div>
                    <p className="m-0 mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(pedido.created_at).toLocaleString("es-AR")}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-xl border px-2.5 py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${
                        estadoStyles[pedido.estado] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {pedido.estado.replace('_', ' ')}
                    </span>

                    <button
                      type="button"
                      onClick={() => solicitarAutorizacion('eliminar', pedido.id)}
                      title="Eliminar pedido"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Resumen Rápido (Método de Envío y Pago) */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-700/60">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      {pedido.metodo_envio === "envio" ? <Truck className="w-3.5 h-3.5 text-emerald-600" /> : <Store className="w-3.5 h-3.5 text-purple-600" />}
                      <strong>{pedido.metodo_envio === "envio" ? "Envío a domicilio" : "Retiro en local"}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{esMercadoPago ? "Mercado Pago" : "Efectivo / Transferencia"}</strong>
                    </span>
                  </div>

                  {esMercadoPago && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        pagoAprobado
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {pagoAprobado ? "Pago Aprobado (MP)" : "Pago Pendiente"}
                    </span>
                  )}
                </div>

                {/* Contenido Desplegable (Detalle Completo) */}
                {estaExpandido && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-slate-200/80 dark:border-zinc-800 text-xs">
                    {pedido.direccion && (
                      <div className="flex items-start gap-1.5 text-slate-600 dark:text-zinc-400">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span><strong>Dirección:</strong> {pedido.direccion}</span>
                      </div>
                    )}

                    {pedido.preparado_por && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <UserCheck className="w-4 h-4 shrink-0" />
                        <span>Atendido/Preparado por: {pedido.preparado_por}</span>
                      </div>
                    )}

                    {pedido.historial_estados && Array.isArray(pedido.historial_estados) && pedido.historial_estados.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 space-y-1">
                        <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Historial de flujo:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {pedido.historial_estados.map((h: any, i: number) => (
                            <span key={i} className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200 dark:border-zinc-700">
                              {h.estado} ({new Date(h.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {h.usuario})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {pedido.nota_adicional && (
                      <p className="italic text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-700/50 pt-2">
                        Nota: "{pedido.nota_adicional}"
                      </p>
                    )}

                    {/* Detalle de Productos */}
                    <div className="border-t border-slate-200/80 dark:border-zinc-800 pt-2">
                      <p className="font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                        Detalle de productos:
                      </p>
                      <ul className="space-y-1 pl-1">
                        {(pedido.pedido_items && pedido.pedido_items.length > 0
                          ? pedido.pedido_items
                          : (pedido.items || []).map((i: any) => ({
                              id: i.id || Math.random(),
                              nombre_producto: i.nombre || i.title || "Producto",
                              cantidad: i.cantidad || 1,
                              precio_unitario: i.precio || i.unit_price || 0,
                            }))
                        ).map((item: any, idx: number) => (
                          <li key={item.id || idx} className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-1">
                            <span>
                              <strong className="text-emerald-600 dark:text-emerald-400">{item.cantidad}x</strong> {item.nombre_producto}
                            </span>
                            <span className="font-mono text-slate-500">
                              ${(item.precio_unitario || 0).toLocaleString()} c/u
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* --- FOOTER DE LA TARJETA (TOTAL, BOTÓN EXPANDIR Y ACCIONES) --- */}
                <div className="mt-4 flex flex-col gap-3 border-t border-slate-200/80 dark:border-zinc-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-lg font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                      ${Number(pedido.total).toLocaleString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleExpandir(pedido.id)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {estaExpandido ? "▲ Ocultar detalle" : "▼ Ver detalle completo"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {pedido.estado !== "cancelado" && pedido.estado !== "completado" && (
                      <button
                        type="button"
                        onClick={() => solicitarAutorizacion('cancelar', pedido.id)}
                        disabled={procesandoPedidoId === pedido.id}
                        className="h-10 rounded-xl border border-rose-300 bg-rose-50/50 px-3.5 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}

                    {/* 1. Pendiente a En Preparación */}
                    {pedido.estado === "pendiente" && (
                      <button
                        type="button"
                        onClick={() => onCambiarEstado(pedido.id, "en_preparacion")}
                        disabled={procesandoPedidoId === pedido.id}
                        className="h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 text-xs font-bold text-white cursor-pointer"
                      >
                        {procesandoPedidoId === pedido.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Iniciar Armado</span>
                      </button>
                    )}

                    {/* 2. En Preparación a Listo */}
                    {pedido.estado === "en_preparacion" && (
                      <button
                        type="button"
                        onClick={() => onCambiarEstado(pedido.id, "listo")}
                        disabled={procesandoPedidoId === pedido.id}
                        className="h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 text-xs font-bold text-white cursor-pointer"
                      >
                        {procesandoPedidoId === pedido.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Marcar como Listo</span>
                      </button>
                    )}

                    {/* 3. Estando en "Listo", se bifurca según sea Envío o Retiro */}
                    {pedido.estado === "listo" && (
                      <>
                        {pedido.metodo_envio === "envio" ? (
                          <button
                            type="button"
                            onClick={() => onCambiarEstado(pedido.id, "en_camino")}
                            disabled={procesandoPedidoId === pedido.id}
                            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white cursor-pointer"
                          >
                            <span>🛵 Enviar a Cadetería (En Camino)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onCambiarEstado(pedido.id, "completado")}
                            disabled={procesandoPedidoId === pedido.id}
                            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white cursor-pointer"
                          >
                            <span>✅ Marcar como Retirado</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* 4. Estando "En Camino" (Ruta de cadetería) */}
                    {pedido.estado === "en_camino" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onCambiarEstado(pedido.id, "cerca")}
                          disabled={procesandoPedidoId === pedido.id}
                          className="h-10 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white cursor-pointer"
                        >
                          📍 Avisar "Cerca"
                        </button>
                        <button
                          type="button"
                          onClick={() => onCambiarEstado(pedido.id, "completado")}
                          disabled={procesandoPedidoId === pedido.id}
                          className="h-10 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white cursor-pointer"
                        >
                          ✅ Entregado con Éxito
                        </button>
                        <button
                          type="button"
                          onClick={() => onCambiarEstado(pedido.id, "no_entregado")}
                          disabled={procesandoPedidoId === pedido.id}
                          className="h-10 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white cursor-pointer"
                        >
                          ⚠️ No se pudo entregar
                        </button>
                      </>
                    )}

                    {/* 6. Si falló la entrega (No entregado) -> Permite reprogramar */}
                    {pedido.estado === "no_entregado" && (
                      <button
                        type="button"
                        onClick={() => onCambiarEstado(pedido.id, "en_camino")}
                        disabled={procesandoPedidoId === pedido.id}
                        className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white cursor-pointer"
                      >
                        🔄 Reprogramar y Volver a Enviar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de PIN de Admin */}
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