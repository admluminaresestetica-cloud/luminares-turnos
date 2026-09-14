"use client";
import { useState, useEffect } from "react";
import { X, RotateCcw, AlertTriangle, FileText, CheckCircle, PackageX } from "lucide-react";

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
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para controlar la anulación de una venta específica
  const [ventaAAnular, setVentaAAnular] = useState<any | null>(null);
  const [motivo, setMotivo] = useState<"cancelacion" | "rotura">("cancelacion");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarVentasDelDia();
    }
  }, [isOpen]);

  const cargarVentasDelDia = async () => {
    setLoading(true);
    try {
      // Obtiene el inicio del día actual
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("pedidos")
        .select("*, items:pedido_items(*)")
        .gte("created_at", hoy.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVentas(data || []);
    } catch (err) {
      console.error("Error al cargar ventas del día:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarAnulacion = async () => {
    if (!ventaAAnular) return;
    setProcesando(true);

    try {
      // 1. Si NO fue por rotura/falla, reintegramos el stock de cada ítem en Supabase
      if (motivo === "cancelacion" && ventaAAnular.items) {
        for (const item of ventaAAnular.items) {
          const { data: prod } = await supabase
            .from("productos")
            .select("stock")
            .eq("id", item.producto_id)
            .single();

          if (prod) {
            const nuevoStock = prod.stock + item.cantidad;
            await supabase
              .from("productos")
              .update({ stock: nuevoStock })
              .eq("id", item.producto_id);
          }
        }
      }

      // 2. Marcar la venta como 'anulada' y guardar el motivo
      const descMotivo =
        motivo === "cancelacion"
          ? "Error de cobro / Arrepentimiento (Stock devuelto)"
          : "Producto fallado / Roto (Stock no devuelto)";

      const { error } = await supabase
        .from("pedidos")
        .update({
          estado: "anulado",
          motivo_anulacion: descMotivo,
        })
        .eq("id", ventaAAnular.id);

      if (error) throw error;

      alert("La venta ha sido anulada correctamente.");
      setVentaAAnular(null);
      cargarVentasDelDia();
      onVentaAnulada(); // Notifica al POS para actualizar grilla de productos si devolvió stock
    } catch (err: any) {
      alert("Ocurrió un error al anular la venta: " + err.message);
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0E6E55]" />
            <h3 className="text-base font-bold text-gray-900">Historial de Ventas del Día</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Listado de Ventas */}
        <div className="my-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <p className="text-center py-8 text-xs text-gray-500">Cargando ventas...</p>
          ) : ventas.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-3xl">🧾</span>
              <p className="mt-2 text-xs font-medium text-gray-500">
                Aún no hay ventas registradas en el turno de hoy.
              </p>
            </div>
          ) : (
            ventas.map((v) => {
              const esAnulada = v.estado === "anulado";
              return (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    esAnulada
                      ? "bg-red-50/50 border-red-100 opacity-75"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-700">
                        #{v.id.toString().slice(0, 8)}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(v.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {esAnulada ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                          <X className="h-3 w-3" /> Anulada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle className="h-3 w-3" /> Completada
                        </span>
                      )}

                      {!esAnulada && (
                        <button
                          onClick={() => setVentaAAnular(v)}
                          className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" /> Anular
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalle de productos y total */}
                  <div className="flex justify-between items-end text-xs">
                    <div className="space-y-0.5 text-gray-600">
                      <p className="font-semibold text-gray-800">
                        Cliente: {v.nombre_cliente || "Consumidor Final"}
                      </p>
                      <p className="text-[11px]">
                        Pago: <span className="capitalize">{v.metodo_pago}</span>
                      </p>
                      {v.motivo_anulacion && (
                        <p className="text-[10px] font-medium text-red-600">
                          Motivo: {v.motivo_anulacion}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-400 block">Total</span>
                      <span className="text-sm font-black text-gray-900">
                        ${v.total?.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Secundario de Confirmación de Anulación */}
        {ventaAAnular && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-amber-600 mb-3">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-bold text-sm text-gray-900">
                  ¿Confirmar anulación de la venta?
                </h4>
              </div>

              <p className="text-xs text-gray-600 mb-4">
                Se descontará el monto de <strong>${ventaAAnular.total?.toLocaleString("es-AR")}</strong> del reporte de ventas de la caja.
              </p>

              <div className="space-y-2 mb-5">
                <label className="text-xs font-bold text-gray-700 block">
                  Seleccioná el motivo de devolución:
                </label>

                <label
                  onClick={() => setMotivo("cancelacion")}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    motivo === "cancelacion"
                      ? "border-[#0E6E55] bg-emerald-50/40"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="motivo"
                    checked={motivo === "cancelacion"}
                    onChange={() => setMotivo("cancelacion")}
                    className="mt-0.5 text-[#0E6E55]"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Error de cobro / Cliente se arrepintió
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <RotateCcw className="h-3 w-3 text-emerald-600" /> Los productos VUELVEN al stock.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setMotivo("rotura")}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    motivo === "rotura"
                      ? "border-red-500 bg-red-50/40"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="motivo"
                    checked={motivo === "rotura"}
                    onChange={() => setMotivo("rotura")}
                    className="mt-0.5 text-red-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Producto fallado / Roto / Vencido
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <PackageX className="h-3 w-3 text-red-500" /> Los productos NO vuelven al stock.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setVentaAAnular(null)}
                  disabled={procesando}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarAnulacion}
                  disabled={procesando}
                  className="flex-1 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
                >
                  {procesando ? "Anulando..." : "Confirmar Anulación"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
