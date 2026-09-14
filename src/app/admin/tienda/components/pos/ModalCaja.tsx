"use client";
import { useState, useEffect } from "react";

interface ModalCajaProps {
  isOpen: boolean;
  onClose: () => void;
  supabase: any;
  onEstadoCajaCambiado: (abierta: boolean) => void;
}

export default function ModalCaja({
  isOpen,
  onClose,
  supabase,
  onEstadoCajaCambiado,
}: ModalCajaProps) {
  const [sesionActual, setSesionActual] = useState<any>(null);
  const [montoInicialInput, setMontoInicialInput] = useState<string>("");
  const [montoCierreInput, setMontoCierreInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      cargarEstadoCaja();
    }
  }, [isOpen]);

  const cargarEstadoCaja = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("caja_sesiones")
      .select("*")
      .eq("estado", "abierta")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSesionActual(data || null);
    onEstadoCajaCambiado(!!data);
    setLoading(false);
  };

  const handleAbrirCaja = async () => {
    const monto = Number(montoInicialInput) || 0;
    setLoading(true);
    const { data, error } = await supabase
      .from("caja_sesiones")
      .insert({
        monto_inicial: monto,
        estado: "abierta",
        fecha_apertura: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      alert("Error al abrir caja: " + error.message);
    } else {
      setSesionActual(data);
      onEstadoCajaCambiado(true);
      setMontoInicialInput("");
    }
    setLoading(false);
  };

  const handleCerrarCaja = async () => {
    if (!sesionActual) return;
    const montoFinal = Number(montoCierreInput) || 0;
    setLoading(true);

    const { error } = await supabase
      .from("caja_sesiones")
      .update({
        estado: "cerrada",
        fecha_cierre: new Date().toISOString(),
        monto_final_real: montoFinal,
      })
      .eq("id", sesionActual.id);

    if (error) {
      alert("Error al cerrar caja: " + error.message);
    } else {
      alert("Caja cerrada correctamente.");
      setSesionActual(null);
      onEstadoCajaCambiado(false);
      setMontoCierreInput("");
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-[#12151B]">💰 Gestión de Caja Diaria</h3>
          <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs font-medium text-gray-500">Cargando datos de caja...</div>
        ) : !sesionActual ? (
          /* VISTA: APERTURA DE CAJA */
          <div className="my-4 space-y-4">
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              ⚠️ La caja está actualmente <strong>CERRADA</strong>. Abrí turno para iniciar ventas.
            </div>

            <div>
              <label className="text-xs font-bold text-[#12151B]">Monto Inicial en Efectivo ($)</label>
              <input
                type="number"
                value={montoInicialInput}
                onChange={(e) => setMontoInicialInput(e.target.value)}
                placeholder="Monto de cambio en cajón (ej. 5000)"
                className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-bold text-[#12151B] outline-none focus:border-[#0E6E55]"
              />
            </div>

            <button
              onClick={handleAbrirCaja}
              disabled={loading}
              className="w-full rounded-xl bg-[#0E6E55] py-3 text-xs font-bold text-white transition-all hover:bg-[#0A5340]"
            >
              🔓 Abrir Turno de Caja
            </button>
          </div>
        ) : (
          /* VISTA: ARQUEO Y CIERRE DE CAJA */
          <div className="my-4 space-y-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
              ✅ Caja <strong>ABIERTA</strong> desde el{" "}
              {new Date(sesionActual.fecha_apertura).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="rounded-xl border border-gray-100 bg-[#F7F7F5] p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Monto Inicial (Cambio):</span>
                <span className="font-bold">${Number(sesionActual.monto_inicial).toLocaleString("es-AR")}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#12151B]">Efectivo Real en Cajón ($)</label>
              <input
                type="number"
                value={montoCierreInput}
                onChange={(e) => setMontoCierreInput(e.target.value)}
                placeholder="Ingresar dinero contado al final del turno..."
                className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-white p-3 text-sm font-bold text-[#12151B] outline-none focus:border-[#0E6E55]"
              />
            </div>

            <button
              onClick={handleCerrarCaja}
              disabled={loading || !montoCierreInput}
              className="w-full rounded-xl bg-[#C84343] py-3 text-xs font-bold text-white transition-all hover:bg-[#A33434] disabled:opacity-50"
            >
              🔒 Arqueo y Cierre de Caja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}