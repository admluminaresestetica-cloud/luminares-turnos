"use client";
import { useState, useEffect } from "react";
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Lock, Unlock, RefreshCw } from "lucide-react";

interface CajaTurno {
  id: string;
  monto_apertura: number;
  estado: "abierta" | "cerrada";
  fecha_apertura: string;
}

interface ControlCajaTabProps {
  supabase: any;
}

export default function ControlCajaTab({ supabase }: ControlCajaTabProps) {
  const [cajaActual, setCajaActual] = useState<CajaTurno | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulario Apertura
  const [montoAperturaInput, setMontoAperturaInput] = useState("");

  // Formulario Movimiento
  const [tipoMov, setTipoMov] = useState<"ingreso" | "retiro">("retiro");
  const [montoMov, setMontoMov] = useState("");
  const [conceptoMov, setConceptoMov] = useState("");

  // Cierre de Caja / Totales
  const [totalesVentas, setTotalesVentas] = useState({
    efectivo: 0,
    transferencia: 0,
    tarjeta: 0,
    retiros: 0,
    ingresosExtra: 0,
  });
  const [efectivoRealContado, setEfectivoRealContado] = useState("");
  const [observacionesCierre, setObservacionesCierre] = useState("");

  useEffect(() => {
    cargarCajaActual();
  }, []);

  const cargarCajaActual = async () => {
    setLoading(true);
    // Buscar la última caja que esté en estado 'abierta'
    const { data, error } = await supabase
      .from("cajas_turnos")
      .select("*")
      .eq("estado", "abierta")
      .order("fecha_apertura", { ascending: false })
      .maybeSingle();

    if (error) {
      console.error("Error al cargar la caja:", error.message);
    } else if (data) {
      setCajaActual(data);
      await calcularTotalesCaja(data.id, data.monto_apertura, data.fecha_apertura);
    } else {
      setCajaActual(null);
    }
    setLoading(false);
  };

  const calcularTotalesCaja = async (cajaId: string, montoApertura: number, fechaApertura: string) => {
    // 1. Obtener ventas del POS generadas desde la apertura
    const { data: pedidos } = await supabase
      .from("pedidos")
      .select("total, metodo_pago")
      .gte("created_at", fechaApertura);

    let efec = 0, trans = 0, tarj = 0;
    pedidos?.forEach((p: any) => {
      const metodo = (p.metodo_pago || "").toLowerCase();
      if (metodo.includes("efectivo")) efec += Number(p.total);
      else if (metodo.includes("transferencia") || metodo.includes("mercado")) trans += Number(p.total);
      else if (metodo.includes("tarjeta") || metodo.includes("débito") || metodo.includes("crédito")) tarj += Number(p.total);
      else efec += Number(p.total); // fallback
    });

    // 2. Obtener movimientos manuales
    const { data: movs } = await supabase
      .from("caja_movimientos")
      .select("tipo, monto")
      .eq("caja_id", cajaId);

    let retiros = 0, ingresos = 0;
    movs?.forEach((m: any) => {
      if (m.tipo === "retiro") retiros += Number(m.monto);
      if (m.tipo === "ingreso") ingresos += Number(m.monto);
    });

    setTotalesVentas({
      efectivo: efec,
      transferencia: trans,
      tarjeta: tarj,
      retiros,
      ingresosExtra: ingresos,
    });
  };

  // Abrir Turno de Caja
  const handleAbrirCaja = async () => {
    const monto = parseFloat(montoAperturaInput) || 0;
    const { data, error } = await supabase
      .from("cajas_turnos")
      .insert([
        {
          monto_apertura: monto,
          estado: "abierta",
          fecha_apertura: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Error al abrir caja: " + error.message);
    } else {
      setCajaActual(data);
      setMontoAperturaInput("");
      cargarCajaActual();
    }
  };

  // Registrar Movimiento Manual (Ingreso/Retiro)
  const handleRegistrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cajaActual) return;
    const monto = parseFloat(montoMov);
    if (!monto || monto <= 0 || !conceptoMov.trim()) {
      alert("Ingresá un monto y concepto válidos.");
      return;
    }

    const { error } = await supabase.from("caja_movimientos").insert([
      {
        caja_id: cajaActual.id,
        tipo: tipoMov,
        monto,
        concepto: conceptoMov.trim(),
      },
    ]);

    if (error) {
      alert("Error al registrar movimiento: " + error.message);
    } else {
      alert("Movimiento registrado correctamente.");
      setMontoMov("");
      setConceptoMov("");
      cargarCajaActual();
    }
  };

  // Realizar Cierre de Caja (Arqueo)
  const handleCerrarCaja = async () => {
    if (!cajaActual) return;

    const esperadoEfectivo =
      Number(cajaActual.monto_apertura) +
      totalesVentas.efectivo +
      totalesVentas.ingresosExtra -
      totalesVentas.retiros;

    const realEfectivo = parseFloat(efectivoRealContado) || 0;
    const diferencia = realEfectivo - esperadoEfectivo;

    if (!confirm(`¿Confirmar cierre de caja?\nEfectivo Esperado: $${esperadoEfectivo.toLocaleString("es-AR")}\nEfectivo Contado: $${realEfectivo.toLocaleString("es-AR")}\nDiferencia: $${diferencia.toLocaleString("es-AR")}`)) {
      return;
    }

    const { error } = await supabase
      .from("cajas_turnos")
      .update({
        estado: "cerrada",
        fecha_cierre: new Date().toISOString(),
        monto_cierre_real: realEfectivo,
        monto_esperado_efectivo: esperadoEfectivo,
        diferencia,
        total_efectivo: totalesVentas.efectivo,
        total_transferencia: totalesVentas.transferencia,
        total_tarjeta: totalesVentas.tarjeta,
        observaciones: observacionesCierre,
      })
      .eq("id", cajaActual.id);

    if (error) {
      alert("Error al cerrar caja: " + error.message);
    } else {
      alert("Caja cerrada exitosamente.");
      setCajaActual(null);
      setEfectivoRealContado("");
      setObservacionesCierre("");
      cargarCajaActual();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando control de caja...</div>;
  }

  // SI LA CAJA ESTÁ CERRADA: Mostrar formulario de apertura
  if (!cajaActual) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Caja Cerrada</h2>
            <p className="text-xs text-gray-500">Iniciá una nueva jornada o turno</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Monto Inicial en Cajón ($)</label>
            <input
              type="number"
              value={montoAperturaInput}
              onChange={(e) => setMontoAperturaInput(e.target.value)}
              placeholder="Ej: 15000"
              className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm font-semibold focus:border-[#0E6E55] focus:outline-none"
            />
          </div>

          <button
            onClick={handleAbrirCaja}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E6E55] py-3 text-sm font-bold text-white transition-all hover:bg-[#0B5743]"
          >
            <Unlock className="h-4 w-4" />
            Abrir Caja del Día
          </button>
        </div>
      </div>
    );
  }

  const efectivoEsperado =
    Number(cajaActual.monto_apertura) +
    totalesVentas.efectivo +
    totalesVentas.ingresosExtra -
    totalesVentas.retiros;

  const diferenciaActual = (parseFloat(efectivoRealContado) || 0) - efectivoEsperado;

  return (
    <div className="space-y-6">
      {/* Cabecera / Estado de la Caja */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <Unlock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Caja Abierta</h2>
            <p className="text-xs text-gray-500">
              Apertura: {new Date(cajaActual.fecha_apertura).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} HS
            </p>
          </div>
        </div>
        <button
          onClick={cargarCajaActual}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 p-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar
        </button>
      </div>

      {/* Grid de Resumen en Tiempo Real */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <span className="text-xs font-medium text-gray-500">Monto Inicial</span>
          <p className="mt-1 text-lg font-bold text-gray-900">${Number(cajaActual.monto_apertura).toLocaleString("es-AR")}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <span className="text-xs font-medium text-gray-500">Ventas Efectivo</span>
          <p className="mt-1 text-lg font-bold text-emerald-600">+${totalesVentas.efectivo.toLocaleString("es-AR")}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <span className="text-xs font-medium text-gray-500">Digital (Transf / Tarjeta)</span>
          <p className="mt-1 text-lg font-bold text-blue-600">
            +${(totalesVentas.transferencia + totalesVentas.tarjeta).toLocaleString("es-AR")}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <span className="text-xs font-medium text-gray-500">Retiros / Gastos</span>
          <p className="mt-1 text-lg font-bold text-rose-600">-${totalesVentas.retiros.toLocaleString("es-AR")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Formulario de Retiros / Ingresos Manuales */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#0E6E55]" /> Registrar Ingreso / Retiro Manual
          </h3>
          <form onSubmit={handleRegistrarMovimiento} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoMov("retiro")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                  tipoMov === "retiro" ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-gray-50 text-gray-600"
                }`}
              >
                <ArrowDownCircle className="h-4 w-4" /> Retiro / Gasto
              </button>
              <button
                type="button"
                onClick={() => setTipoMov("ingreso")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                  tipoMov === "ingreso" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-600"
                }`}
              >
                <ArrowUpCircle className="h-4 w-4" /> Ingreso Extra
              </button>
            </div>

            <input
              type="number"
              value={montoMov}
              onChange={(e) => setMontoMov(e.target.value)}
              placeholder="Monto ($)"
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-semibold focus:outline-none"
            />
            <input
              type="text"
              value={conceptoMov}
              onChange={(e) => setConceptoMov(e.target.value)}
              placeholder="Concepto (ej: Pago de taxi, Pago proveedor, etc.)"
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#12151B] text-white text-xs font-bold hover:bg-[#2C323E]"
            >
              Cargar Movimiento
            </button>
          </form>
        </div>

        {/* Sección de Cierre / Arqueo */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600" /> Cierre de Caja y Arqueo
          </h3>

          <div className="rounded-xl bg-gray-50 p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Efectivo Inicial:</span>
              <span className="font-semibold">${Number(cajaActual.monto_apertura).toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ventas en Efectivo:</span>
              <span className="font-semibold text-emerald-600">+${totalesVentas.efectivo.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ingresos Extras / Retiros:</span>
              <span className="font-semibold text-rose-600">
                ${(totalesVentas.ingresosExtra - totalesVentas.retiros).toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-900">
              <span>Efectivo Esperado en Cajón:</span>
              <span>${efectivoEsperado.toLocaleString("es-AR")}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Monto Real Contado en Cajón ($)</label>
            <input
              type="number"
              value={efectivoRealContado}
              onChange={(e) => setEfectivoRealContado(e.target.value)}
              placeholder="Ingresá cuánto efectivo contaste"
              className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-gray-900 focus:outline-none"
            />
          </div>

          {efectivoRealContado !== "" && (
            <div className={`p-2.5 rounded-xl text-xs font-bold flex justify-between ${
              diferenciaActual === 0 ? "bg-emerald-50 text-emerald-700" : diferenciaActual < 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
            }`}>
              <span>Diferencia de Arqueo:</span>
              <span>${diferenciaActual.toLocaleString("es-AR")}</span>
            </div>
          )}

          <textarea
            value={observacionesCierre}
            onChange={(e) => setObservacionesCierre(e.target.value)}
            placeholder="Observaciones de cierre (opcional)..."
            rows={2}
            className="w-full rounded-xl border border-gray-200 p-2 text-xs focus:outline-none resize-none"
          />

          <button
            onClick={handleCerrarCaja}
            className="w-full py-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Realizar Cierre de Caja
          </button>
        </div>
      </div>
    </div>
  );
}