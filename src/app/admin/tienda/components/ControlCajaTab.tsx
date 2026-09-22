"use client";

import { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Lock, 
  Unlock, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock 
} from "lucide-react";

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

  // Desglose de ventas
  const [ventasEfectivoTotal, setVentasEfectivoTotal] = useState(0);
  const [ventasDigitalesTotal, setVentasDigitalesTotal] = useState(0);

  const fetchCaja = async () => {
    setCargando(true);

    // 1. Obtener la caja abierta
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
      // 2. Obtener movimientos manuales
      const { data: movs } = await supabase
        .from("movimientos_caja")
        .select("*")
        .eq("caja_id", caja.id)
        .order("created_at", { ascending: false });

      setMovimientos(movs || []);

      // 3. Obtener ventas desde que se abrió la caja
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("total, metodo_pago, estado")
        .gte("created_at", caja.fecha_apertura)
        .neq("estado", "cancelado");

      if (pedidos) {
        let efecSum = 0;
        let digiSum = 0;

        pedidos.forEach((p) => {
          const total = Number(p.total) || 0;
          const metodo = (p.metodo_pago || "").toLowerCase();

          if (metodo.includes("mixto")) {
            try {
              const partes = metodo.split("efectivo: $");
              if (partes.length > 1) {
                const montoTexto = partes[1].split(" ")[0].replace("+", "").trim();
                const efecMonto = parseFloat(montoTexto) || 0;

                efecSum += efecMonto;
                digiSum += (total - efecMonto);
              } else {
                digiSum += total;
              }
            } catch (err) {
              digiSum += total;
            }
          } else if (metodo.includes("efectivo")) {
            efecSum += total;
          } else {
            digiSum += total;
          }
        });

        setVentasEfectivoTotal(efecSum);
        setVentasDigitalesTotal(digiSum);
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

  const calcularEfectivoEsperado = () => {
    if (!cajaActual) return 0;
    return Number(cajaActual.monto_inicial) + ventasEfectivoTotal + totalIngresos - totalEgresos;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 animate-pulse">Cargando datos de la caja...</p>
      </div>
    );
  }

  if (!cajaActual) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs sm:rounded-3xl sm:p-8 mb-20 sm:mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E6E55]/10 dark:bg-emerald-950/50 text-[#0E6E55] dark:text-emerald-400">
          <Wallet className="h-6 w-6 stroke-[2]" />
        </div>
        <h2 className="mb-2 text-base font-bold text-gray-900 dark:text-zinc-100 sm:text-lg">Apertura de Caja</h2>
        <p className="mb-6 text-xs text-gray-500 dark:text-zinc-400">
          No hay una caja abierta actualmente. Ingrese el monto inicial con el que comienza el día.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-zinc-300">Monto Inicial ($)</label>
            <input
              type="number"
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
              placeholder="0.00"
              className="h-11 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3.5 text-sm text-gray-900 dark:text-zinc-100 outline-none transition-colors focus:border-[#0E6E55] focus:bg-white dark:focus:bg-zinc-900"
            />
          </div>

          <button
            onClick={abrirCaja}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0E6E55] text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0A5340] active:scale-[0.98]"
          >
            <Unlock className="h-4 w-4 stroke-[2.5]" />
            <span>Abrir Caja Día</span>
          </button>
        </div>
      </div>
    );
  }

  const efectivoEsperado = calcularEfectivoEsperado();

  return (
    <div className="space-y-5 sm:space-y-6 mb-20 sm:mb-8">
      {/* Resumen Superior */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <p className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 sm:text-xs">Monto Inicial</p>
          <p className="mt-1 text-lg font-extrabold text-gray-800 dark:text-zinc-100 sm:text-xl">
            ${Number(cajaActual.monto_inicial).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <p className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 sm:text-xs">Ventas Efectivo</p>
          <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400 sm:text-xl">
            +${ventasEfectivoTotal.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <p className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 sm:text-xs">Otros Métodos</p>
          <p className="mt-1 text-lg font-extrabold text-blue-600 dark:text-blue-400 sm:text-xl">
            +${ventasDigitalesTotal.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-[#0E6E55]/20 dark:border-emerald-900/50 bg-[#0E6E55]/5 dark:bg-emerald-950/30 p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-[#0E6E55] dark:text-emerald-400 sm:text-xs">Efectivo Esperado</p>
          <p className="mt-1 text-lg font-extrabold text-[#0E6E55] dark:text-emerald-400 sm:text-xl">
            ${efectivoEsperado.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {/* Registrar Movimiento Manual */}
        <div className="space-y-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-[#0E6E55] dark:text-emerald-400" />
            Registrar Ingreso / Egreso Manual
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-zinc-400">Tipo</label>
              <select
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value as any)}
                className="h-11 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 text-xs font-medium text-gray-900 dark:text-zinc-100 outline-none transition-colors focus:border-[#0E6E55]"
              >
                <option value="egreso">Egreso (Retiro / Pago)</option>
                <option value="ingreso">Ingreso Adicional</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-zinc-400">Monto ($)</label>
              <input
                type="number"
                value={montoMovimiento}
                onChange={(e) => setMontoMovimiento(e.target.value)}
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 text-xs text-gray-900 dark:text-zinc-100 outline-none transition-colors focus:border-[#0E6E55]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-zinc-400">Concepto / Motivo</label>
            <input
              type="text"
              value={conceptoMovimiento}
              onChange={(e) => setConceptoMovimiento(e.target.value)}
              placeholder="Ej: Pago a proveedor de insumos"
              className="h-11 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 text-xs text-gray-900 dark:text-zinc-100 outline-none transition-colors focus:border-[#0E6E55]"
            />
          </div>
          <button
            onClick={registrarMovimiento}
            className="h-11 w-full rounded-xl bg-gray-900 dark:bg-zinc-800 text-xs font-bold text-white transition-colors hover:bg-black dark:hover:bg-zinc-700 active:scale-[0.98]"
          >
            Registrar Movimiento
          </button>
        </div>

        {/* Realizar Cierre de Caja */}
        <div className="space-y-4 rounded-2xl border border-rose-100 dark:border-rose-950/50 bg-rose-50/30 dark:bg-rose-950/10 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <Lock className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            Cierre de Caja y Arqueo
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Cuente el efectivo físico disponible en la caja e ingrese el total para verificar si existen diferencias.
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-zinc-300">Efectivo Real Contado ($)</label>
            <input
              type="number"
              value={efectivoContado}
              onChange={(e) => setEfectivoContado(e.target.value)}
              placeholder="0.00"
              className="h-11 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-gray-900 dark:text-zinc-100 outline-none transition-colors focus:border-rose-500"
            />
          </div>
          {efectivoContado !== "" && !isNaN(Number(efectivoContado)) && (
            <div className="rounded-xl bg-white/70 dark:bg-zinc-800/80 p-3 text-xs font-medium border border-rose-100 dark:border-rose-900/30">
              Diferencia:{" "}
              <span
                className={
                  Number(efectivoContado) - efectivoEsperado === 0
                    ? "font-bold text-emerald-600 dark:text-emerald-400"
                    : Number(efectivoContado) - efectivoEsperado > 0
                    ? "font-bold text-blue-600 dark:text-blue-400"
                    : "font-bold text-rose-600 dark:text-rose-400"
                }
              >
                ${(Number(efectivoContado) - efectivoEsperado).toLocaleString()}
              </span>
            </div>
          )}
          <button
            onClick={cerrarCaja}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 text-xs font-bold text-white transition-colors hover:bg-rose-700 active:scale-[0.98]"
          >
            <Lock className="h-4 w-4 stroke-[2.5]" />
            <span>Cerrar Caja</span>
          </button>
        </div>
      </div>

      {/* Historial de Movimientos de la Caja */}
      <div className="space-y-2 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <h3 className="mb-2 text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
          Movimientos Manuales Registrados
        </h3>
        {movimientos.length === 0 ? (
          <p className="py-3 text-xs text-gray-400 dark:text-zinc-500">No hay ingresos ni egresos manuales en esta sesión.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {movimientos.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-700 dark:text-zinc-300">{m.concepto}</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-1 font-bold ${
                    m.tipo === "ingreso" 
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" 
                      : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {m.tipo === "ingreso" ? <ArrowUpRight className="h-3 w-3 stroke-[2.5]" /> : <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />}
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