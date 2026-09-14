"use client";
import { useState, useEffect } from "react";
import { X, FileText, RotateCcw, AlertTriangle, Calendar, Search } from "lucide-react";

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
  // Función auxiliar para obtener hoy en formato YYYY-MM-DD
  const obtenerFechaHoyLocal = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  };

  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState<string>(obtenerFechaHoyLocal());
  const [ventaAAnular, setVentaAAnular] = useState<any | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState<"error" | "dano">("error");
  const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

  // Cargar ventas filtradas dinámicamente por la fecha elegida
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
          items
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

  // Escucha cambios en la apertura del modal o cambio de fecha
  useEffect(() => {
    if (isOpen && fechaFiltro) {
      cargarVentasPorFecha(fechaFiltro);
    }
  }, [isOpen, fechaFiltro]);

  if (!isOpen) return null;

  // Lógica para procesar la anulación de una venta (Restablece stock desde JSONB)
  const handleConfirmarAnulacion = async () => {
    if (!ventaAAnular) return;
    setProcesandoAnulacion(true);

    try {
      // 1. Reintegrar stock si es devolución / error de carga
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

      // 2. Cambiar estado a 'anulado' y registrar el motivo
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

  // Filtrado adicional por texto (cliente o ID de pedido)
  const ventasFiltradas = ventas.filter((v) => {
    const term = busqueda.toLowerCase();
    const cliente = (v.cliente_nombre || v.nombre_cliente || "").toLowerCase();
    const id = String(v.id).toLowerCase();
    return cliente.includes(term) || id.includes(term);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#F7F7F5] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#0E6E55]/10 p-2 text-[#0E6E55]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#12151B]">Historial de Ventas</h3>
              <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Ventas del día: <span className="font-bold text-gray-700">{fechaFiltro}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controles de Búsqueda y Fecha */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente o N° de ticket..."
              className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] py-2 pl-10 pr-4 text-xs font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] py-2 px-3 text-xs font-bold text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
            {fechaFiltro !== obtenerFechaHoyLocal() && (
              <button
                onClick={() => setFechaFiltro(obtenerFechaHoyLocal())}
                className="rounded-xl bg-gray-100 px-3 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Hoy
              </button>
            )}
          </div>
        </div>

        {/* Lista de Ventas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Cargando ventas...</div>
          ) : ventasFiltradas.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No se registraron ventas en la fecha seleccionada ({fechaFiltro}).
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
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                    esAnulada
                      ? "border-red-200 bg-red-50/50 opacity-75"
                      : "border-[#E7E5E0] bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900">
                        Ticket #{String(v.id).substring(0, 8)}...
                      </span>
                      <span className="text-[11px] text-gray-400">({hora} hs)</span>
                      {esAnulada && (
                        <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          ANULADA
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-600">
                      Cliente: <span className="font-semibold">{nombreClienteDisplay}</span> | Método:{" "}
                      <span className="capitalize font-medium">{v.metodo_pago || "Efectivo"}</span>
                    </div>

                    <div className="text-[11px] text-gray-500">
                      {Array.isArray(v.items)
                        ? v.items.map((i: any) => `${i.cantidad || 1}x ${i.titulo || i.nombre || "Producto"}`).join(", ")
                        : "Sin detalle de productos"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-sm font-bold text-[#12151B]">
                      ${Number(v.total).toLocaleString("es-AR")}
                    </span>

                    {!esAnulada && (
                      <button
                        onClick={() => setVentaAAnular(v)}
                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
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
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-bold text-base text-gray-900">Anular Ticket #{String(ventaAAnular.id).substring(0, 8)}...</h4>
              </div>

              <p className="text-xs text-gray-600">
                Seleccioná el motivo de la anulación para determinar el destino del stock:
              </p>

              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  motivoAnulacion === "error" ? "border-[#0E6E55] bg-[#0E6E55]/5" : "border-gray-200"
                }`}>
                  <input
                    type="radio"
                    name="motivo"
                    checked={motivoAnulacion === "error"}
                    onChange={() => setMotivoAnulacion("error")}
                    className="mt-0.5 accent-[#0E6E55]"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Error de cobro / Arrepentimiento</span>
                    <span className="text-[11px] text-gray-500 block">El producto se devuelve en buen estado. **Suma el stock de nuevo**.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  motivoAnulacion === "dano" ? "border-red-500 bg-red-50" : "border-gray-200"
                }`}>
                  <input
                    type="radio"
                    name="motivo"
                    checked={motivoAnulacion === "dano"}
                    onChange={() => setMotivoAnulacion("dano")}
                    className="mt-0.5 accent-red-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Producto roto / Fallado / Vencido</span>
                    <span className="text-[11px] text-gray-500 block">El producto no sirve para la venta. **NO recupera stock**.</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={procesandoAnulacion}
                  onClick={() => setVentaAAnular(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={procesandoAnulacion}
                  onClick={handleConfirmarAnulacion}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                >
                  {procesandoAnulacion ? "Procesando..." : "Confirmar Anulación"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}