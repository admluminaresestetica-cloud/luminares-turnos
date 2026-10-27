'use client';

import React, { useState, useEffect } from "react";
import { useCarrito } from "@/context/CarritoContext";
import { useConfig } from "@/context/ConfigContext";
import { supabase } from "@/lib/supabase";
import { X, Trash2, ShoppingCart, ArrowRight, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import FormularioEnvio from "./carrito/FormularioEnvio";
import { useAuth } from "@/context/AuthContext";

interface CarritoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarritoDrawer({ isOpen, onClose }: CarritoDrawerProps) {
  const { config } = useConfig();
  const { user } = useAuth();
  const {
    carrito,
    datosEnvio,
    setDatosEnvio,
    agregarAlCarrito,
    restarDelCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
  } = useCarrito();

  const [paso, setPaso] = useState<"carrito" | "checkout">("carrito");
  const [cargandoMP, setCargandoMP] = useState(false);
  const [metodoPago, setMetodoPago] = useState<
    "whatsapp" | "mercadopago_debito" | "mercadopago_cuotas"
  >("whatsapp");

  const [costoEnvioFijo, setCostoEnvioFijo] = useState(0);
  const [whatsappNumeroDB, setWhatsappNumeroDB] = useState<string>("");

  const [envioDomicilioActivo, setEnvioDomicilioActivo] = useState(true);
  const [envioGratisActivo, setEnvioGratisActivo] = useState(false);
  const [montoEnvioGratis, setMontoEnvioGratis] = useState(0);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const { data, error } = await supabase
          .from("configuracion_empresa")
          .select("costo_envio_base, envio_domicilio_activo, envio_gratis_activo, monto_envio_gratis, whatsapp_numero")
          .maybeSingle();

        if (error) {
          console.error("Error al obtener configuración:", error);
          return;
        }

        if (data) {
          setCostoEnvioFijo(Number(data.costo_envio_base) || 0);
          setEnvioDomicilioActivo(data.envio_domicilio_activo ?? true);
          setEnvioGratisActivo(data.envio_gratis_activo ?? false);
          setMontoEnvioGratis(Number(data.monto_envio_gratis) || 0);
          if (data.whatsapp_numero) {
            setWhatsappNumeroDB(data.whatsapp_numero);
          }
        }
      } catch (err) {
        console.error("Error inesperado al cargar configuración:", err);
      }
    }

    cargarConfiguracion();
  }, []);

  const carritoSeguro = Array.isArray(carrito) ? carrito : [];
  const subtotalProductos = carritoSeguro.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * (item.cantidad || 1),
    0
  );

  const tieneEnvioGratis =
    envioGratisActivo &&
    montoEnvioGratis > 0 &&
    subtotalProductos >= montoEnvioGratis;

  const esEnvioADomicilio = datosEnvio.metodoEnvio === "envio";
  const costoEnvioAplicado =
    esEnvioADomicilio && !tieneEnvioGratis ? costoEnvioFijo : 0;

  // --- 🟢 LÓGICA DINÁMICA DE CONFIGURACIÓN ---
  const cuotasHabilitadas = config?.cuotas_habilitadas ?? true;
  const montoMinimoCuotas = Number(config?.monto_minimo_cuotas ?? 0);
  const cantidadCuotasConfig = Number(config?.cantidad_cuotas ?? 3);
  const porcentajeRecargoCuotasConfig = Number(config?.porcentaje_recargo_cuotas ?? 25);
  const porcentajeRecargoDebitoConfig = Number(config?.porcentaje_recargo_debito ?? 10);

  const PORCENTAJE_DEBITO = porcentajeRecargoDebitoConfig / 100; 
  const PORCENTAJE_CUOTAS = porcentajeRecargoCuotasConfig / 100; 

  const productoNoAptoCuotas = carritoSeguro.find(
    (item) => item.permite_cuotas === false
  );
  const alcanzaMontoMinimoCuotas = subtotalProductos >= montoMinimoCuotas;
  const aptoParaCuotas =
    cuotasHabilitadas && !productoNoAptoCuotas && alcanzaMontoMinimoCuotas;

  useEffect(() => {
    if (!aptoParaCuotas && metodoPago === "mercadopago_cuotas") {
      setMetodoPago("whatsapp");
    }
  }, [aptoParaCuotas, metodoPago]);  

  const totalBaseConEnvio = subtotalProductos + costoEnvioAplicado;
  const totalTransferencia = totalBaseConEnvio;
  const totalDebitoOp = Math.round(totalBaseConEnvio * (1 + PORCENTAJE_DEBITO));
  const totalCuotasOp = Math.round(totalBaseConEnvio * (1 + PORCENTAJE_CUOTAS));
  const valorCuotaOp = cantidadCuotasConfig > 0 ? Math.round(totalCuotasOp / cantidadCuotasConfig) : totalCuotasOp;

  let totalFinalAbonar = totalTransferencia;
  let recargoMonto = 0;

  if (metodoPago === "mercadopago_debito") {
    totalFinalAbonar = totalDebitoOp;
    recargoMonto = totalDebitoOp - totalBaseConEnvio;
  } else if (metodoPago === "mercadopago_cuotas") {
    totalFinalAbonar = totalCuotasOp;
    recargoMonto = totalCuotasOp - totalBaseConEnvio;
  }

  const validarCamposFormulario = (): boolean => {
    const nombre = datosEnvio.nombreCliente?.trim() || "";
    const telefono = datosEnvio.telefonoCliente?.trim() || "";
    const direccion = datosEnvio.direccion?.trim() || "";

    if (!nombre) {
      alert("Por favor, ingresá tu nombre y apellido.");
      return false;
    }
    if (!telefono) {
      alert("Por favor, ingresá tu número de teléfono / celular.");
      return false;
    }
    if (datosEnvio.metodoEnvio === "envio" && !direccion) {
      alert("Por favor, ingresá la dirección de envío.");
      return false;
    }
    return true;
  };

  const guardarPedidoEnDB = async (
    montoFinal: number,
    medioPagoStr: string
  ): Promise<string | null> => {
    try {
      const direccionReal =
        datosEnvio.metodoEnvio === "envio" && datosEnvio.direccion?.trim()
          ? datosEnvio.direccion.trim()
          : null;

      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            nombre_cliente: datosEnvio.nombreCliente.trim(),
            telefono_cliente: datosEnvio.telefonoCliente.trim() || null,
            metodo_envio: datosEnvio.metodoEnvio || "retiro",
            metodo_pago: medioPagoStr,
            es_cuotas: metodoPago === "mercadopago_cuotas",
            recargo_monto: recargoMonto,
            total: montoFinal,
            estado: "pendiente",
            direccion: direccionReal,
            user_id: user?.id || datosEnvio.user_id || null,
            nota_adicional:
              `${datosEnvio.notaAdicional?.trim() || ""} [Pago: ${medioPagoStr}]`.trim(),
          },
        ])
        .select();

      if (pedidoError) {
        console.error("Error al insertar pedido:", pedidoError);
        return null;
      }

      if (pedidoData && pedidoData.length > 0) {
        const idPedido = pedidoData[0].id;
        const itemsParaInsertar = carritoSeguro.map((item) => ({
          pedido_id: idPedido,
          producto_id: item.id,
          nombre_producto: item.nombre,
          precio_unitario: Number(item.precio) || 0,
          cantidad: item.cantidad,
        }));

        await supabase.from("pedido_items").insert(itemsParaInsertar);
        return idPedido; // 👈 Devolvemos el ID generado
      }
      return null;
    } catch (err) {
      console.error("Excepción en DB:", err);
      return null;
    }
  };
const procesarWhatsApp = async () => {
    if (!validarCamposFormulario()) return;

    // Guardamos y obtenemos el ID real del pedido
    const idPedidoReal = await guardarPedidoEnDB(totalFinalAbonar, "Transferencia / Efectivo");
    const codigoCorto = idPedidoReal ? idPedidoReal.slice(0, 6).toUpperCase() : "REGISTRADO";

    let mensaje = `¡Hola! Quisiera confirmar el siguiente pedido:\n\n`;
    mensaje += `📦 *Código de Pedido:* #${codigoCorto}\n`;
    mensaje += `👤 *Cliente:* ${datosEnvio.nombreCliente.trim()}\n`;
    if (datosEnvio.telefonoCliente) {
      mensaje += `📞 *Teléfono:* ${datosEnvio.telefonoCliente.trim()}\n`;
    }
    mensaje += `🚚 *Método de entrega:* ${
      datosEnvio.metodoEnvio === "envio"
        ? `Envío a domicilio (${datosEnvio.direccion.trim()})`
        : "Retiro en local"
    }\n`;
    mensaje += `💳 *Método de Pago:* Transferencia / Efectivo\n\n`;
    mensaje += `📋 *Detalle del pedido:*\n`;

    carritoSeguro.forEach((item) => {
      mensaje += `• ${item.nombre} x${item.cantidad} - $${(
        (Number(item.precio) || 0) * item.cantidad
      ).toLocaleString("es-AR")}\n`;
    });

    if (costoEnvioAplicado > 0) {
      mensaje += `• Costo de envío: $${costoEnvioAplicado.toLocaleString("es-AR")}\n`;
    }

    mensaje += `\n💰 *Total a abonar:* $${totalFinalAbonar.toLocaleString("es-AR")}\n`;
    
    // 🔗 Agregamos el enlace directo para hacer el seguimiento
    mensaje += `\n🔍 Podés hacer el seguimiento de tu pedido en tiempo real ingresando aquí:\n`;
    mensaje += `http://localhost:3000/seguimiento\n`; // (o tu dominio en producción)

    if (datosEnvio.notaAdicional?.trim()) {
      mensaje += `\n📝 *Nota:* ${datosEnvio.notaAdicional.trim()}\n`;
    }

    const rawNumber = config?.whatsapp_numero || whatsappNumeroDB || "";
    const numeroTelefono = rawNumber.replace(/[^0-9]/g, "");

    const whatsappUrl = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(
      mensaje
    )}`;
    
    vaciarCarrito();
    onClose();
    window.open(whatsappUrl, "_blank");
  };

  const procesarMercadoPago = async () => {
    if (!validarCamposFormulario()) return;

    setCargandoMP(true);
    try {
      const recargoPorcentaje = metodoPago === "mercadopago_cuotas" ? PORCENTAJE_CUOTAS : PORCENTAJE_DEBITO;

      const itemsParaApi = carritoSeguro.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        precio: Number(item.precio) || 0,
        cantidad: item.cantidad,
      }));

      if (costoEnvioAplicado > 0) {
        itemsParaApi.push({
          id: "envio-cadeteria",
          nombre: "Costo de Cadetería / Envío",
          precio: costoEnvioAplicado,
          cantidad: 1,
        });
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemsCarrito: itemsParaApi,
          recargoPorcentaje: recargoPorcentaje,
          cliente: {
            nombre: datosEnvio.nombreCliente.trim(),
            telefono: datosEnvio.telefonoCliente.trim(),
            metodoEnvio: datosEnvio.metodoEnvio,
            direccion: datosEnvio.direccion,
            user_id: user?.id || null,
          },
          user_id: user?.id || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.init_point) {
        onClose();
        window.location.href = data.init_point;
      } else {
        alert(data.error || "Ocurrió un error al generar la preferencia de Mercado Pago.");
      }
    } catch (err) {
      console.error("Error al procesar Mercado Pago:", err);
      alert("Error de conexión al procesar el pago.");
    } finally {
      setCargandoMP(false);
    }
  };

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metodoPago === "whatsapp") {
      procesarWhatsApp();
    } else {
      procesarMercadoPago();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col text-foreground transition-colors">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-muted/20">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {paso === "carrito" ? "Tu Carrito" : "Finalizar Compra"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper / Barra de Progreso (Solo en Checkout) */}
          {paso === "checkout" && carritoSeguro.length > 0 && (
            <div className="px-6 py-3 bg-muted/40 border-b border-border flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Datos</span>
              </div>
              <div className="w-8 h-px bg-border"></div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>2. Envío</span>
              </div>
              <div className="w-8 h-px bg-border"></div>
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Pago</span>
              </div>
            </div>
          )}

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-5 pb-20 sm:pb-6 space-y-5">
            {carritoSeguro.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">El carrito está vacío</p>
              </div>
            ) : paso === "carrito" ? (
              <div className="space-y-3">
                {/* Barrita envío gratis */}
                {envioGratisActivo && montoEnvioGratis > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 text-xs">
                    {subtotalProductos >= montoEnvioGratis ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>🎉</span>
                        <span>¡Felicitaciones! Tenés <strong>Envío Gratis</strong> alcanzado.</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-foreground font-semibold mb-1.5">
                          <span>
                            Agregá <strong>${(montoEnvioGratis - subtotalProductos).toLocaleString("es-AR")}</strong> más para envío gratis
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {Math.min(100, Math.round((subtotalProductos / montoEnvioGratis) * 100))}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{
                              width: `${Math.min(100, (subtotalProductos / montoEnvioGratis) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Listado de productos */}
                {carritoSeguro.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/40 gap-3"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-card border border-border flex items-center justify-center">
                      {item.imagen_url ? (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <span className="text-base">🛍️</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-foreground truncate">{item.nombre}</h4>
                      <p className="text-xs text-muted-foreground">${(Number(item.precio) || 0).toLocaleString("es-AR")}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-border rounded-lg bg-card">
                        <button
                          onClick={() => restarDelCarrito(item.id)}
                          className="px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground rounded-l-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-foreground">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => agregarAlCarrito(item)}
                          className="px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground rounded-r-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="text-muted-foreground hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Paso Checkout */
              <form id="checkout-form" onSubmit={manejarSubmit} className="space-y-5">
                
                {/* Resumen Superior Estilizado */}
                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Total a Pagar</span>
                    <div className="text-xl font-black text-foreground">
                      ${totalFinalAbonar.toLocaleString("es-AR")}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Pago Seguro
                  </span>
                </div>

                <FormularioEnvio
                  datosEnvio={{
                    ...datosEnvio,
                    metodoEnvio: (datosEnvio.metodoEnvio === "envio" ? "envio" : "retiro") as "retiro" | "envio"
                  }}
                  setDatosEnvio={setDatosEnvio}
                  costoEnvio={costoEnvioFijo}
                  metodoPago={metodoPago === "whatsapp" ? "whatsapp" : "mercadopago"}
                  totalPrecio={subtotalProductos}
                  tieneEnvioGratis={tieneEnvioGratis}
                  guardandoPedido={cargandoMP}
                  onConfirmar={() => {}}
                  envioDomicilioActivo={envioDomicilioActivo}
                />

                {/* Métodos de Pago */}
                <div className="space-y-2.5 pt-2">
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Seleccionar Método de Pago:
                  </label>

                  <button
                    type="button"
                    onClick={() => setMetodoPago("whatsapp")}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs transition-all active:scale-[0.98] cursor-pointer ${
                      metodoPago === "whatsapp"
                        ? "border-emerald-600 dark:border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-600/20"
                        : "border-border bg-card text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">💬 Transferencia / Efectivo</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Pago directo de contado
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${totalTransferencia.toLocaleString("es-AR")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago("mercadopago_debito")}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs transition-all active:scale-[0.98] cursor-pointer ${
                      metodoPago === "mercadopago_debito"
                        ? "border-sky-600 dark:border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 shadow-xs ring-1 ring-sky-600/20"
                        : "border-border bg-card text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        💳 Mercado Pago (Débito / 1 Pago)
                        <span className="text-[9px] bg-sky-500/20 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Tarjeta de débito o saldo • Acreditación inmediata
                      </div>
                    </div>
                    <span className="font-bold text-sky-700 dark:text-sky-400 text-sm">
                      ${totalDebitoOp.toLocaleString("es-AR")}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={!aptoParaCuotas}
                    onClick={() => aptoParaCuotas && setMetodoPago("mercadopago_cuotas")}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs transition-all ${
                      !aptoParaCuotas
                        ? "border-border bg-muted/40 text-muted-foreground opacity-60 cursor-not-allowed"
                        : metodoPago === "mercadopago_cuotas"
                        ? "border-purple-600 dark:border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-purple-600/20 active:scale-[0.98] cursor-pointer"
                        : "border-border bg-card text-foreground hover:bg-muted/50 active:scale-[0.98] cursor-pointer"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        💳 {cantidadCuotasConfig} Cuotas Fijas
                        {!aptoParaCuotas && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-normal">
                            No disponible
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {cantidadCuotasConfig} pagos de ${valorCuotaOp.toLocaleString("es-AR")}
                      </div>
                    </div>
                    <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">
                      ${totalCuotasOp.toLocaleString("es-AR")}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {carritoSeguro.length > 0 && (
            <div className="p-4 sm:p-6 pb-20 sm:pb-6 border-t border-border bg-muted/30 space-y-4">
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal productos:</span>
                  <span>${subtotalProductos.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de envío:</span>
                  <span>
                    {costoEnvioAplicado === 0 ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {datosEnvio.metodoEnvio === "retiro"
                          ? "Gratis (Retiro en local)"
                          : "Gratis (Envío promocional)"}
                      </span>
                    ) : (
                      `$${costoEnvioAplicado.toLocaleString("es-AR")}`
                    )}
                  </span>
                </div>
                {recargoMonto > 0 && (
                  <div className="flex justify-between text-muted-foreground/80">
                    <span>
                      {metodoPago === "mercadopago_cuotas"
                        ? `Recargo cuotas (${porcentajeRecargoCuotasConfig}%)`
                        : `Recargo débito (${porcentajeRecargoDebitoConfig}%)`}
                    </span>
                    <span>+${recargoMonto.toLocaleString("es-AR")}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                  <span>Total final:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">${totalFinalAbonar.toLocaleString("es-AR")}</span>
                </div>
              </div>

              {paso === "carrito" ? (
                <button
                  onClick={() => setPaso("checkout")}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Continuar compra
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaso("carrito")}
                    className="w-1/3 border border-border bg-card hover:bg-muted text-foreground py-3.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={cargandoMP}
                    className="w-2/3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {cargandoMP ? (
                      "Procesando..."
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        {metodoPago === "whatsapp" ? "Confirmar por WhatsApp" : `Pagar $${totalFinalAbonar.toLocaleString("es-AR")}`}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}