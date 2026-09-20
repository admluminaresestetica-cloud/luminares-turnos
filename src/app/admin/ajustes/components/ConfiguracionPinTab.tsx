"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfiguracionPinTab() {
  const [pinActualInput, setPinActualInput] = useState("");
  const [nuevoPin, setNuevoPin] = useState("");
  const [confirmarPin, setConfirmarPin] = useState("");
  const [pinGuardadoBD, setPinGuardadoBD] = useState("1234");
  const [configId, setConfigId] = useState<number | string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchPin = async () => {
      const { data, error } = await supabase
        .from("configuracion_empresa")
        .select("id, pin_admin")
        .limit(1)
        .maybeSingle();

      if (data) {
        setConfigId(data.id);
        if (data.pin_admin) {
          setPinGuardadoBD(data.pin_admin);
        }
      }
    };
    fetchPin();
  }, []);

  const handleGuardarPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (pinActualInput !== pinGuardadoBD) {
      setMensaje({ tipo: "error", texto: "El PIN actual ingresado no es correcto." });
      return;
    }

    if (nuevoPin.length < 4) {
      setMensaje({ tipo: "error", texto: "El nuevo PIN debe tener al menos 4 dígitos." });
      return;
    }

    if (nuevoPin !== confirmarPin) {
      setMensaje({ tipo: "error", texto: "El nuevo PIN y su confirmación no coinciden." });
      return;
    }

    setCargando(true);

    const { error } = await supabase
      .from("configuracion_empresa")
      .update({ pin_admin: nuevoPin })
      .eq("id", configId ?? 1);

    setCargando(false);

    if (error) {
      setMensaje({ tipo: "error", texto: "Ocurrió un error al actualizar el PIN en la base de datos." });
    } else {
      setPinGuardadoBD(nuevoPin);
      setPinActualInput("");
      setNuevoPin("");
      setConfirmarPin("");
      setMensaje({ tipo: "exito", texto: "¡PIN de autorización actualizado correctamente!" });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg font-bold">
          🔒
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">PIN de Autorización</h2>
          <p className="text-xs text-gray-500">Clave rápida para abrir Ajustes y Métricas desde el panel</p>
        </div>
      </div>

      <form onSubmit={handleGuardarPin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">PIN Actual</label>
          <input
            type="password"
            maxLength={6}
            value={pinActualInput}
            onChange={(e) => setPinActualInput(e.target.value)}
            placeholder="• • • •"
            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-semibold tracking-widest focus:border-[#0E6E55] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nuevo PIN (4 a 6 dígitos)</label>
          <input
            type="password"
            maxLength={6}
            value={nuevoPin}
            onChange={(e) => setNuevoPin(e.target.value)}
            placeholder="• • • •"
            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-semibold tracking-widest focus:border-[#0E6E55] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Confirmar Nuevo PIN</label>
          <input
            type="password"
            maxLength={6}
            value={confirmarPin}
            onChange={(e) => setConfirmarPin(e.target.value)}
            placeholder="• • • •"
            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-semibold tracking-widest focus:border-[#0E6E55] focus:outline-none"
            required
          />
        </div>

        {mensaje && (
          <p className={`text-xs font-semibold p-2.5 rounded-lg ${mensaje.tipo === "exito" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {mensaje.texto}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-xl bg-[#0E6E55] py-2.5 text-xs font-bold text-white hover:bg-[#0A5441] active:scale-95 shadow-xs transition-all disabled:opacity-50"
        >
          {cargando ? "Guardando..." : "Actualizar PIN"}
        </button>
      </form>
    </div>
  );
}