'use client';

import React from 'react';
import { Calendar, Trash2, CheckCircle2, MapPin, Truck, Store, Loader2, UserCheck, Clock, CreditCard, MessageCircle, Printer } from 'lucide-react';

interface PedidoCardProps {
  pedido: any;
  estaExpandido: boolean;
  toggleExpandir: (id: string) => void;
  procesandoPedidoId: string | null;
  onCambiarEstado: (id: string, nuevoEstado: string) => void;
  solicitarAutorizacion: (tipo: 'cancelar' | 'eliminar', pedidoId: string) => void;
  estadoStyles: Record<string, string>;
}

export default function PedidoCard({
  pedido,
  estaExpandido,
  toggleExpandir,
  procesandoPedidoId,
  onCambiarEstado,
  solicitarAutorizacion,
  estadoStyles,
}: PedidoCardProps) {
  const esMercadoPago = pedido.metodo_pago === "mercadopago";
  const pagoAprobado = Boolean(pedido.payment_id);

  // Limpiar el teléfono para que solo queden números para el enlace de WhatsApp
  const telefonoLimpio = pedido.telefono_cliente ? pedido.telefono_cliente.replace(/\D/g, '') : '';
  const mensajeWhatsApp = encodeURIComponent(`Hola ${pedido.nombre_cliente}, te escribimos de la tienda por tu pedido #${pedido.id.slice(0, 6).toUpperCase()}.`);
  const urlWhatsApp = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${mensajeWhatsApp}` : '#';

  // Lógica para generar y abrir la ventana de impresión independiente del ticket
  const manejarImpresion = () => {
    const itemsLista = (pedido.pedido_items && pedido.pedido_items.length > 0
      ? pedido.pedido_items
      : (pedido.items || []).map((i: any) => ({
          nombre_producto: i.nombre || i.title || "Producto",
          cantidad: i.cantidad || 1,
          precio_unitario: i.precio || i.unit_price || 0,
        }))
    );

    const htmlItems = itemsLista.map((item: any) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>${item.cantidad}x ${item.nombre_producto}</span>
        <span style="font-family: monospace;">$${(item.precio_unitario * item.cantidad).toLocaleString()}</span>
      </div>
    `).join('');

    const contenidoHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir Ticket #${pedido.id.slice(0, 6).toUpperCase()}</title>
          <style>
            body { font-family: sans-serif; font-size: 12px; color: black; background: white; width: 72mm; margin: 0; padding: 10px; }
            .header { text-align: center; border-bottom: 1px solid black; padding-bottom: 8px; margin-bottom: 8px; }
            .section { border-bottom: 1px solid black; padding-bottom: 8px; margin-bottom: 8px; }
            .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0; font-size: 14px; text-transform: uppercase;">Luminares Estética</h2>
            <p style="margin: 2px 0; font-size: 10px; color: #555;">Comprobante de Fulfillment</p>
            <div style="margin-top: 4px; display: inline-block; background: black; color: white; padding: 2px 6px; font-family: monospace; font-weight: bold; font-size: 11px;">
              #${pedido.id.slice(0, 6).toUpperCase()}
            </div>
          </div>

          <div class="section">
            <p style="margin: 2px 0;"><strong>Fecha:</strong> ${new Date(pedido.created_at).toLocaleString("es-AR")}</p>
            <p style="margin: 2px 0;"><strong>Cliente:</strong> ${pedido.nombre_cliente}</p>
            <p style="margin: 2px 0;"><strong>Teléfono:</strong> ${pedido.telefono_cliente || "No especificado"}</p>
            <p style="margin: 2px 0;"><strong>Método:</strong> ${pedido.metodo_envio === "envio" ? "📦 Envío a Domicilio" : "🏪 Retiro en Local"}</p>
            ${pedido.direccion ? `<p style="margin: 2px 0;"><strong>Dirección:</strong> ${pedido.direccion}</p>` : ''}
          </div>

          <div class="section">
            <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 10px; text-transform: uppercase;">Productos:</p>
            ${htmlItems}
          </div>

          <div class="total">
            <span>TOTAL:</span>
            <span style="font-family: monospace;">$${Number(pedido.total).toLocaleString()}</span>
          </div>

          ${pedido.preparado_por ? `<p style="text-align: center; font-size: 10px; margin-top: 10px; border-top: 1px dashed #999; padding-top: 4px;">Preparado por: ${pedido.preparado_por}</p>` : ''}
        </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank', 'width=400,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoHtml);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      setTimeout(() => {
        ventanaImpresion.print();
        ventanaImpresion.close();
      }, 300);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 p-4 sm:p-5 transition-all hover:border-slate-300 dark:hover:border-zinc-700">
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

            {/* Botón de WhatsApp Directo */}
            {pedido.telefono_cliente && (
              <a
                href={urlWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                title={`Chatear con ${pedido.nombre_cliente}`}
                className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{pedido.telefono_cliente}</span>
              </a>
            )}
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
            onClick={manejarImpresion}
            title="Imprimir etiqueta de pedido"
            className="flex h-8 items-center gap-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all cursor-pointer text-xs font-bold"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Imprimir</span>
          </button>

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

          {/* 5. Estando "Cerca" del domicilio */}
          {pedido.estado === "cerca" && (
            <>
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
}
