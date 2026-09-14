"use client";
import { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

interface ControlCajaTabProps {
  supabase: SupabaseClient;
}

export default function ControlCajaTab({ supabase }: ControlCajaTabProps) {
  const [cajaActual, setCajaActual] = useState<any | null>(null);
  const [cargando, setCargando] = useState(true);

  // Form estados
  const [montoApertura, setMontoApertura] = useState("");
  const [montoMovimiento, setMontoMovimiento] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState<"ingreso" | "egreso">("egreso");
  const [conceptoMovimiento, setConceptoMovimiento] = useState("");
  const [efectivoContado, setEfectivoContado] = useState("");

  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [ventasMetodo, setVentasMetodo] = useState<{ [key: string]: number }>({});

  const fetchCaja = async () => {
    setCargando(true);
    // Buscar caja abierta
    const { data: caja, error } = await supabase
      .from("cajas")
      .select("*")
      .eq("estado", "abierta")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) console.error("Error al obtener la caja:", error);

    setCajaActual(caja || null);

    if (caja) {
      // Cargar movimientos de caja
      const { data: movs } = await supabase
        .from("movimientos_caja")
        .select("*")
        .eq("caja_id", caja.id)
        .order("created_at", { ascending: false });

      setMovimientos(movs || []);

      // Cargar ventas realizadas desde la apertura
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("total, metodo_pago")
        .gte("created_at", caja.fecha_apertura);

      if (pedidos) {
        const totales: { [key: string]: number } = {};
        pedidos.forEach((p) => {
          const m = p.metodo_pago || "efectivo";
          totales[m] = (totales[m] || 0) + Number(p.total);
        });
        setVentasMetodo(totales);
      }
    }

    setCargando(false);
  };

  useEffect(() => {
    fetchCaja();
  }, []);

  const abrirCaja = async () => {
    if (!montoApertura || isNaN(Number(montoApertura))) {
      alert("Ingrese un monto válido para abrir la caja.");
      return;
    }

    const { error } = await supabase.from("cajas").insert([
      {
        monto_inicial: Number(montoApertura),
        estado: "abierta",
        fecha_apertura: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert("Error al abrir caja: " + error.message);
    } else {
      setMontoApertura("");
      fetchCaja();
    }
  };

  const registrarMovimiento = async () => {
    if (!montoMovimiento || !conceptoMovimiento || !cajaActual) {
      alert("Complete el monto y el concepto.");
      return;
    }

    const { error } = await supabase.from("movimientos_caja").insert([
      {
        caja_id: cajaActual.id,
        tipo: tipoMovimiento,
        monto: Number(montoMovimiento),
        concepto: conceptoMovimiento,
      },
    ]);

    if (error) {
      alert("Error al registrar movimiento: " + error.message);
    } else {
      setMontoMovimiento("");
      setConceptoMovimiento("");
      fetchCaja();
    }
  };

  const cerrarCaja = async () => {
    if (!efectivoContado || isNaN(Number(efectivoContado)) || !cajaActual) {
      alert("Ingrese el monto total en efectivo contado.");
      return;
    }

    if (!confirm("¿Está seguro de realizar el cierre de caja?")) return;

    const totalEfectivoEsperado = calcularEfectivoEsperado();
    const diferencia = Number(efectivoContado) - totalEfectivoEsperado;

    const { error } = await supabase
      .from("cajas")
      .update({
        monto_final_esperado: totalEfectivoEsperado,
        monto_final_real: Number(efectivoContado),
        diferencia: diferencia,
        estado: "cerrada",
        fecha_cierre: new Date().toISOString(),
      })
      .eq("id", cajaActual.id);

    if (error) {
      alert("Error al cerrar caja: " + error.message);
    } else {
      alert("Caja cerrada exitosamente.");
      setEfectivoContado("");
      fetchCaja();
    }
  };

  // Cálculo de totales
  const totalIngresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + Number(m.monto), 0);

  const totalEgresos = movimientos
    .filter((m) => m.tipo === "egreso")
    .reduce((acc, m) => acc + Number(m.monto), 0);

  const ventasEfectivo = ventasMetodo["efectivo"] || 0;

  const calcularEfectivoEsperado = () => {
    if (!cajaActual) return 0;
    return Number(cajaActual.monto_inicial) + ventasEfectivo + totalIngresos - totalEgresos;
  };

  if (cargando) {
    return <p className="py-8 text-center text-sm text-gray-500">Cargando datos de la caja...</p>;
  }

  if (!cajaActual) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold text-[#12151B]">Apertura de Caja</h2>
        <p className="mb-6 text-xs text-gray-500">
          No hay una caja abierta actualmente. Ingrese el monto inicial con el que comienza el día.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Monto Inicial ($)</label>
            <input
              type="number"
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0E6E55]"
            />
          </div>

          <button
            onClick={abrirCaja}
            className="w-full rounded-xl bg-[#0E6E55] py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            Abrir Caja Día
          </button>
        </div>
      </div>
    );
  }

  const efectivoEsperado = calcularEfectivoEsperado();

  return (
    <div className="space-y-6">
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 font-medium">Monto Inicial</p>
          <p className="mt-1 text-xl font-extrabold text-gray-800">
            ${Number(cajaActual.monto_inicial).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 font-medium">Ventas Efectivo</p>
          <p className="mt-1 text-xl font-extrabold text-emerald-600">
            +${ventasEfectivo.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 font-medium">Otros Métodos (MP / Transf.)</p>
          <p className="mt-1 text-xl font-extrabold text-blue-600">
            +${((ventasMetodo["mercadopago"] || 0) + (ventasMetodo["transferencia"] || 0)).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-[#0E6E55]/20 bg-[#0E6E55]/5 p-4">
          <p className="text-xs font-semibold text-[#0E6E55]">Efectivo Esperado en Caja</p>
          <p className="mt-1 text-xl font-extrabold text-[#0E6E55]">
            ${efectivoEsperado.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Registrar Movimiento Manual */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Registrar Ingreso / Egreso Manual</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Tipo</label>
              <select
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium outline-none focus:border-[#0E6E55]"
              >
                <option value="egreso">Egreso (Retiro / Pago)</option>
                <option value="ingreso">Ingreso Adicional</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Monto ($)</label>
              <input
                type="number"
                value={montoMovimiento}
                onChange={(e) => setMontoMovimiento(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#0E6E55]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Concepto / Motivo</label>
            <input
              type="text"
              value={conceptoMovimiento}
              onChange={(e) => setConceptoMovimiento(e.target.value)}
              placeholder="Ej: Pago a proveedor de insumos"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#0E6E55]"
            />
          </div>
          <button
            onClick={registrarMovimiento}
            className="w-full rounded-xl bg-gray-900 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
          >
            Registrar Movimiento
          </button>
        </div>

        {/* Realizar Cierre de Caja */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Cierre de Caja y Arqueo</h3>
          <p className="text-xs text-gray-500">
            Cuente el efectivo físico disponible en la caja e ingrese el total para verificar si existen diferencias.
          </p>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Efectivo Real Contado ($)</label>
            <input
              type="number"
              value={efectivoContado}
              onChange={(e) => setEfectivoContado(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500"
            />
          </div>
          {efectivoContado !== "" && !isNaN(Number(efectivoContado)) && (
            <div className="text-xs font-medium">
              Diferencia:{" "}
              <span
                className={
                  Number(efectivoContado) - efectivoEsperado === 0
                    ? "text-emerald-600 font-bold"
                    : Number(efectivoContado) - efectivoEsperado > 0
                    ? "text-blue-600 font-bold"
                    : "text-rose-600 font-bold"
                }
              >
                ${(Number(efectivoContado) - efectivoEsperado).toLocaleString()}
              </span>
            </div>
          )}
          <button
            onClick={cerrarCaja}
            className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
          >
            Cerrar Caja
          </button>
        </div>
      </div>

      {/* Historial de Movimientos de la Caja */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">Movimientos Manuales Registrados</h3>
        {movimientos.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">No hay ingresos ni egresos manuales en esta sesión.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {movimientos.map((m) => (
              <div key={m.id} className="flex justify-between py-2 text-xs">
                <div>
                  <p className="font-semibold text-gray-700">{m.concepto}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    m.tipo === "ingreso" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {m.tipo === "ingreso" ? "+" : "-"}${Number(m.monto).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}