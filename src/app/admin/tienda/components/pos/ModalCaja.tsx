"use client";

import { useState, useEffect } from "react";

interface ModalCajaProps {
  isOpen: boolean;
  onClose: () => void;
  supabase: any;
  onEstadoCajaCambiado: (abierta: boolean, sesion: any) => void;
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
      consultarEstadoCaja();
    }
  }, [isOpen]);

  // Consultar en la tabla 'cajas' si hay un turno abierto
  const consultarEstadoCaja = async () => {
    setLoading(true);
    const { data: sesion, error } = await supabase
      .from("cajas")
      .select("*")
      .eq("estado", "abierta")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error al consultar la tabla cajas:", error.message);
    }

    setSesionActual(sesion || null);
    onEstadoCajaCambiado(!!sesion, sesion || null);
    setLoading(false);
  };

  // Abrir Turno de Caja en 'cajas'
  const handleAbrirCaja = async () => {
    const monto = Number(montoInicialInput);
    if (isNaN(monto) || monto < 0) {
      alert("Por favor ingresá un monto inicial válido.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("cajas")
      .insert([
        {
          monto_inicial: monto,
          estado: "abierta",
          fecha_apertura: new Date().toISOString(),
          monto_final_esperado: monto, // arranca siendo igual al inicial
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Error al abrir la caja: " + error.message);
    } else {
      setSesionActual(data);
      onEstadoCajaCambiado(true, data);
      setMontoInicialInput("");
      onClose();
    }
    setLoading(false);
  };

  // Cerrar Turno de Caja en 'cajas'
  const handleCerrarCaja = async () => {
    if (!sesionActual) return;

    const montoReal = Number(montoCierreInput);
    if (isNaN(montoReal) || montoCierreInput.trim() === "") {
      alert("Por favor ingresá el monto real contado en el cajón.");
      return;
    }

    const esperado = Number(sesionActual.monto_final_esperado || sesionActual.monto_inicial || 0);
    const dif = montoReal - esperado;

    setLoading(true);
    const { error } = await supabase
      .from("cajas")
      .update({
        estado: "cerrada",
        fecha_cierre: new Date().toISOString(),
        monto_final_real: montoReal,
        diferencia: dif,
      })
      .eq("id", sesionActual.id);

    if (error) {
      alert("Error al cerrar la caja: " + error.message);
    } else {
      alert("Caja cerrada correctamente.");
      setSesionActual(null);
      onEstadoCajaCambiado(false, null);
      setMontoCierreInput("");
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            💰 Apertura / Cierre de Caja
          </h3>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs font-semibold text-gray-500 flex flex-col items-center gap-2">
            <span className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            Cargando estado de la caja...
          </div>
        ) : !sesionActual ? (
          <div className="my-4 space-y-4">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
              ⚠️ La caja está <strong>CERRADA</strong>. Ingresá el monto inicial para abrir el turno.
            </div>

            <div>
              <label className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                Monto Inicial ($)
              </label>
              <input
                type="number"
                value={montoInicialInput}
                onChange={(e) => setMontoInicialInput(e.target.value)}
                placeholder="Ej: 5000"
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-3 text-sm font-bold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
              />

              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[2000, 5000, 10000, 20000].map((monto) => (
                  <button
                    key={monto}
                    type="button"
                    onClick={() => setMontoInicialInput(monto.toString())}
                    className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 py-1.5 text-[10px] font-bold text-gray-700 dark:text-zinc-300 active:scale-95 transition-all hover:bg-gray-50"
                  >
                    ${monto / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAbrirCaja}
              disabled={loading || !montoInicialInput}
              className="w-full rounded-xl bg-[#0E6E55] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0A5340] active:scale-95 disabled:opacity-50"
            >
              🔓 Abrir Turno de Caja
            </button>
          </div>
        ) : (
          <div className="my-4 space-y-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
              ✅ Caja <strong>ABIERTA</strong> desde las{" "}
              <strong>
                {new Date(sesionActual.fecha_apertura).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} hs
              </strong>.
            </div>

            <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40 p-3 text-xs flex justify-between items-center">
              <span className="text-gray-600 dark:text-zinc-400">Monto Inicial:</span>
              <span className="font-extrabold text-gray-900 dark:text-zinc-100">
                ${Number(sesionActual.monto_inicial).toLocaleString("es-AR")}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                Efectivo Real en Cajón al Cerrar ($)
              </label>
              <input
                type="number"
                value={montoCierreInput}
                onChange={(e) => setMontoCierreInput(e.target.value)}
                placeholder="Total contado al cierre..."
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm font-bold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
              />
            </div>

            <button
              onClick={handleCerrarCaja}
              disabled={loading || !montoCierreInput}
              className="w-full rounded-xl bg-red-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
            >
              🔒 Cerrar y Arquear Caja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}