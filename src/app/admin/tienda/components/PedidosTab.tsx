'use client';

import React, { useState, useEffect } from 'react';
import ModalPinAutorizacion from '@/app/admin/components/ModalPinAutorizacion';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';

import PedidosFiltros from './PedidosFiltros';
import PedidoCard from './PedidoCard';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PedidosTabProps {
  pedidos: any[];
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
  const [pedidoExpandidoId, setPedidoExpandidoId] = useState<string | null>(null);

  const toggleExpandir = (id: string) => {
    setPedidoExpandidoId(pedidoExpandidoId === id ? null : id);
  };

  const [pinAdminBD, setPinAdminBD] = useState<string>('1234');
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
      {/* Componente de Filtros */}
      <PedidosFiltros
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
        filtroFecha={filtroFecha}
        setFiltroFecha={setFiltroFecha}
        exportarACSV={exportarACSV}
        onFetchPedidos={onFetchPedidos}
      />

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
          {pedidosFiltrados.map((pedido: any) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              estaExpandido={pedidoExpandidoId === pedido.id}
              toggleExpandir={toggleExpandir}
              procesandoPedidoId={procesandoPedidoId}
              onCambiarEstado={onCambiarEstado}
              solicitarAutorizacion={solicitarAutorizacion}
              estadoStyles={estadoStyles}
            />
          ))}
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
