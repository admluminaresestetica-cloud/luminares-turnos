"use client";
import { useState, useEffect, useMemo } from "react";
import { X, FileText, RotateCcw, AlertTriangle, Calendar, Search, DollarSign, ShoppingBag, CreditCard, Filter } from "lucide-react";

interface ModalHistorialVentasProps {
  isOpen: boolean;
  onClose: () => void;
  supabase: any;
  onVentaAnulada: () => void;
}

export default function ModalHistorialVentas({
  isOpen,
  onClose,
  supabase,
  onVentaAnulada,
}: ModalHistorialVentasProps) {
  const obtenerFechaHoyLocal = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  };

  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketSeleccionadoParaVer, setTicketSeleccionadoParaVer] = useState<any | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState<string>(obtenerFechaHoyLocal());
  const [filtroMetodoPago, setFiltroMetodoPago] = useState<string>("todos");
  
  const [ventaAAnular, setVentaAAnular] = useState<any | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState<"error" | "dano">("error");
  const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

  const cargarVentasPorFecha = async (fechaElegida: string) => {
    setLoading(true);
    try {
      const inicioDiaUTC = new Date(`${fechaElegida}T00:00:00-03:00`).toISOString();
      const finDiaUTC = new Date(`${fechaElegida}T23:59:59-03:00`).toISOString();

      const { data, error } = await supabase
  .from("pedidos")
  .select(`
    id,
    created_at,
    total,
    metodo_pago,
    estado,
    nombre_cliente,
    cliente_nombre,
    origen,
    items,
    descuento_monto
  `)
        .gte("created_at", inicioDiaUTC)
        .lte("created_at", finDiaUTC)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVentas(data || []);
    } catch (err) {
      console.error("Error al cargar ventas por fecha:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && fechaFiltro) {
      cargarVentasPorFecha(fechaFiltro);
    }
  }, [isOpen, fechaFiltro]);


  const handleConfirmarAnulacion = async () => {
    if (!ventaAAnular) return;
    setProcesandoAnulacion(true);

    try {
      if (motivoAnulacion === "error" && Array.isArray(ventaAAnular.items)) {
        for (const item of ventaAAnular.items) {
          const idProducto = item.producto_id || item.id;
          if (idProducto) {
            const { data: prodData } = await supabase
              .from("productos")
              .select("stock")
              .eq("id", idProducto)
              .single();

            if (prodData) {
              const nuevoStock = (prodData.stock || 0) + (item.cantidad || 1);
              await supabase
                .from("productos")
                .update({ stock: nuevoStock })
                .eq("id", idProducto);
            }
          }
        }
      }

      const textoMotivo =
        motivoAnulacion === "error"
          ? "Error de carga / Devolución cliente (Stock reintegrado)"
          : "Producto fallado / roto (Stock descartado)";

      const { error: updateError } = await supabase
        .from("pedidos")
        .update({
          estado: "anulado",
          motivo_anulacion: textoMotivo,
        })
        .eq("id", ventaAAnular.id);

      if (updateError) throw updateError;

      alert("Venta anulada correctamente.");
      setVentaAAnular(null);
      cargarVentasPorFecha(fechaFiltro);
      onVentaAnulada();
    } catch (err: any) {
      console.error("Error anulando venta:", err);
      alert("Ocurrió un error al intentar anular la venta.");
    } finally {
      setProcesandoAnulacion(false);
    }
  };

  // Filtrado avanzado (Búsqueda de texto + Método de pago)
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const term = busqueda.toLowerCase();
      const cliente = (v.cliente_nombre || v.nombre_cliente || "").toLowerCase();
      const id = String(v.id).toLowerCase();
      const coincideTexto = cliente.includes(term) || id.includes(term);

      const metodo = (v.metodo_pago || "").toLowerCase();
      let coincideMetodo = true;
      if (filtroMetodoPago === "efectivo") coincideMetodo = metodo.includes("efectivo");
      if (filtroMetodoPago === "transferencia") coincideMetodo = metodo.includes("transferencia") || metodo.includes("digital") || metodo.includes("qr");
      if (filtroMetodoPago === "tarjeta") coincideMetodo = metodo.includes("tarjeta");

      return coincideTexto && coincideMetodo;
    });
  }, [ventas, busqueda, filtroMetodoPago]);

  // Métricas calculadas sobre las ventas filtradas (excluyendo anuladas para el total)
  const metricas = useMemo(() => {
    const ventasValidas = ventasFiltradas.filter((v) => v.estado !== "anulado");
    const totalRecaudado = ventasValidas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
    const cantidadOperaciones = ventasValidas.length;
    const ticketPromedio = cantidadOperaciones > 0 ? totalRecaudado / cantidadOperaciones : 0;

    return { totalRecaudado, cantidadOperaciones, ticketPromedio };
  }, [ventasFiltradas]);
if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 pb-20 sm:pb-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative flex max-h-[92vh] sm:max-h-[90vh] w-full max-w-4xl flex-col rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        
        {/* Handle táctil móvil */}
        <div className="sm:hidden w-12 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto my-2" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 bg-[#F7F7F5] dark:bg-zinc-800/50 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#0E6E55]/10 dark:bg-emerald-950/40 p-2 text-[#0E6E55] dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-zinc-100">Historial de Ventas y Auditoría</h3>
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Día: <span className="font-bold text-gray-700 dark:text-zinc-300">{fechaFiltro}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* TARJETAS DE RESUMEN / MÉTRICAS SUPERIORES */}
        <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-gray-50/70 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
          <div className="rounded-2xl bg-white dark:bg-zinc-800/80 p-3 border border-gray-200/70 dark:border-zinc-700 shadow-xs">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400">Total Recaudado</p>
            <p className="mt-1 text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
              ${metricas.totalRecaudado.toLocaleString("es-AR")}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-800/80 p-3 border border-gray-200/70 dark:border-zinc-700 shadow-xs">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400">Operaciones Válidas</p>
            <p className="mt-1 text-sm sm:text-lg font-black text-gray-900 dark:text-zinc-100">
              {metricas.cantidadOperaciones} tickets
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-800/80 p-3 border border-gray-200/70 dark:border-zinc-700 shadow-xs">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400">Ticket Promedio</p>
            <p className="mt-1 text-sm sm:text-lg font-black text-blue-600 dark:text-blue-400">
              ${Math.round(metricas.ticketPromedio).toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        {/* Controles de Búsqueda, Fecha y Filtros de Pago */}
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente o N° ticket..."
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 py-2 pl-10 pr-4 text-xs font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filtroMetodoPago}
              onChange={(e) => setFiltroMetodoPago(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 py-2 px-3 text-xs font-bold text-gray-700 dark:text-zinc-300 outline-none focus:border-[#0E6E55]"
            >
              <option value="todos">💳 Todos los pagos</option>
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia">📱 Transferencia / Digital</option>
              <option value="tarjeta">💳 Tarjeta</option>
            </select>

            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 py-2 px-3 text-xs font-bold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
            />
            {fechaFiltro !== obtenerFechaHoyLocal() && (
              <button
                onClick={() => setFechaFiltro(obtenerFechaHoyLocal())}
                className="rounded-xl bg-gray-100 dark:bg-zinc-800 px-3 py-2 text-[11px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-200 transition-colors shrink-0"
              >
                Hoy
              </button>
            )}
          </div>
        </div>

        {/* Lista de Ventas Detallada */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400 animate-pulse">Cargando ventas...</div>
          ) : ventasFiltradas.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No se encontraron ventas con los filtros aplicados para la fecha ({fechaFiltro}).
            </div>
          ) : (
            ventasFiltradas.map((v) => {
              const esAnulada = v.estado === "anulado";
              const hora = new Date(v.created_at).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const nombreClienteDisplay = v.cliente_nombre || v.nombre_cliente || "Cliente Ocasional";

              return (
                
                <div
                key={v.id}
                onClick={() => setTicketSeleccionadoParaVer(v)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all cursor-pointer ${
                esAnulada
                ? "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 opacity-80"
                : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0E6E55] shadow-xs"
                  }`}
                    >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-zinc-100">
                        Ticket #{String(v.id).substring(0, 8)}...
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">({hora} hs)</span>
                      {esAnulada && (
                        <span className="rounded-md bg-red-100 dark:bg-red-950/60 px-2 py-0.5 text-[9px] font-black text-red-700 dark:text-red-400">
                          ANULADA
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 dark:text-zinc-400 flex flex-wrap gap-2 items-center">
                      <span>Cliente: <strong className="text-gray-800 dark:text-zinc-200">{nombreClienteDisplay}</strong></span>
                      <span className="text-gray-300 dark:text-zinc-700">•</span>
                      <span>Método: <strong className="capitalize text-[#0E6E55] dark:text-emerald-400">{v.metodo_pago || "Efectivo"}</strong></span>
                    </div>

                    {/* Desglose claro de productos */}
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-xl text-[11px] text-gray-700 dark:text-zinc-300 space-y-0.5 border border-gray-100 dark:border-zinc-800">
                      {Array.isArray(v.items) && v.items.length > 0 ? (
                        v.items.map((i: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                         <span>{i.cantidad || 1}x {i.titulo || i.nombre || i.nombre_producto || "Producto"}</span>
                         <span className="font-semibold text-gray-500 dark:text-zinc-400">
                         ${((Number(i.precio || i.precio_unitario) || 0) * (Number(i.cantidad) || 1)).toLocaleString("es-AR")}
                         </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">Sin detalle de productos</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:pl-4 border-t dark:border-zinc-800 sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-base font-black text-gray-900 dark:text-zinc-100">
                      ${Number(v.total).toLocaleString("es-AR")}
                    </span>

                    {!esAnulada && (
                      <button
                     onClick={(e) => {
                     e.stopPropagation(); // Evita que se abra el recibo al hacer clic en Anular
                     setVentaAAnular(v);
                      }}
                     className="flex items-center gap-1 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors active:scale-95"
                       >
                     <RotateCcw className="h-3.5 w-3.5" />
                     <span>Anular</span>
                     </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Confirmar Anulación */}
        {ventaAAnular && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-5 shadow-2xl border border-gray-100 dark:border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-zinc-100">Anular Ticket #{String(ventaAAnular.id).substring(0, 8)}...</h4>
              </div>

              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Seleccioná el motivo de la anulación para determinar el destino del stock:
              </p>

              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  motivoAnulacion === "error" ? "border-[#0E6E55] bg-[#0E6E55]/5 dark:border-emerald-500" : "border-gray-200 dark:border-zinc-800"
                }`}>
                  <input
                    type="radio"
                    name="motivo"
                    checked={motivoAnulacion === "error"}
                    onChange={() => setMotivoAnulacion("error")}
                    className="mt-0.5 accent-[#0E6E55]"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">Error de cobro / Devolución</span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">Producto en buen estado. <strong>Recupera stock</strong>.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  motivoAnulacion === "dano" ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-gray-200 dark:border-zinc-800"
                }`}>
                  <input
                    type="radio"
                    name="motivo"
                    checked={motivoAnulacion === "dano"}
                    onChange={() => setMotivoAnulacion("dano")}
                    className="mt-0.5 accent-red-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">Producto roto / Fallado</span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">Producto dado de baja. <strong>NO recupera stock</strong>.</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={procesandoAnulacion}
                  onClick={() => setVentaAAnular(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={procesandoAnulacion}
                  onClick={handleConfirmarAnulacion}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all active:scale-95"
                >
                  {procesandoAnulacion ? "Procesando..." : "Confirmar Anulación"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {/* MODAL DE VISTA RECIBO Y REIMPRESIÓN */}
        {ticketSeleccionadoParaVer && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-white text-black p-6 shadow-2xl space-y-4 relative">
              
              {/* Botón cerrar vista previa */}
              <button
                onClick={() => setTicketSeleccionadoParaVer(null)}
                className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 print:hidden"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Contenido del Recibo (Diseño optimizado para impresión térmica/papel) */}
              <div id="recibo-impresion" className="space-y-3 text-center pt-2">
                <div>
                  <p className="text-[10px] text-gray-500">Comprobante de Venta</p>
                </div>

                <div className="text-[11px] text-left border-y border-dashed border-gray-300 py-2 space-y-1">
                  <p><strong>Ticket ID:</strong> #{String(ticketSeleccionadoParaVer.id).substring(0, 12)}</p>
                  <p><strong>Fecha:</strong> {new Date(ticketSeleccionadoParaVer.created_at).toLocaleString("es-AR")}</p>
                  <p><strong>Cliente:</strong> {ticketSeleccionadoParaVer.cliente_nombre || ticketSeleccionadoParaVer.nombre_cliente || "Cliente Ocasional"}</p>
                  <p><strong>Pago:</strong> <span className="capitalize">{ticketSeleccionadoParaVer.metodo_pago || "Efectivo"}</span></p>
                </div>

                {/* Tabla de ítems del recibo */}
                <div className="text-left text-xs space-y-1.5 max-h-48 overflow-y-auto">
                  <p className="font-bold text-[10px] text-gray-400 uppercase">Detalle de productos:</p>
                  {Array.isArray(ticketSeleccionadoParaVer.items) && ticketSeleccionadoParaVer.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span>{item.cantidad || 1}x {item.titulo || item.nombre || item.nombre_producto || "Producto"}</span>
                      <span className="font-bold">${((Number(item.precio || item.precio_unitario) || 0) * (Number(item.cantidad) || 1)).toLocaleString("es-AR")}</span>
                    </div>
                  ))}
                </div>

                {/* Subtotal, Descuento y Total */}
<div className="border-t border-dashed border-gray-300 pt-3 space-y-1 text-xs">
  {Number(ticketSeleccionadoParaVer.descuento_monto) > 0 && (
    <>
      <div className="flex justify-between items-center text-gray-500">
        <span>Subtotal:</span>
        <span>${(Number(ticketSeleccionadoParaVer.total) + Number(ticketSeleccionadoParaVer.descuento_monto)).toLocaleString("es-AR")}</span>
      </div>
      <div className="flex justify-between items-center text-red-600 font-semibold">
        <span>Descuento:</span>
        <span>-${Number(ticketSeleccionadoParaVer.descuento_monto).toLocaleString("es-AR")}</span>
      </div>
    </>
  )}
  <div className="flex justify-between items-center pt-1 font-black text-sm">
    <span>TOTAL:</span>
    <span className="text-lg text-emerald-700">${Number(ticketSeleccionadoParaVer.total).toLocaleString("es-AR")}</span>
  </div>
</div>

                <p className="text-[9px] text-gray-400 pt-2">¡Gracias por tu compra!</p>
              </div>

              {/* Botones de acción (No salen al imprimir) */}
              <div className="flex gap-2 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setTicketSeleccionadoParaVer(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#0E6E55] hover:bg-[#0A5340] rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  Imprimir Copia
                </button>
              </div>

            </div>
          </div>
        )}
    </div>
  );
}