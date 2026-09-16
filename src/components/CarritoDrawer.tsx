"use client";

import React, { useState, useEffect } from "react";
import { useCarrito } from "@/context/CarritoContext";
import { useConfig } from "@/context/ConfigContext";
import { supabase } from "@/lib/supabase";
import { X, Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import FormularioEnvio from "./carrito/FormularioEnvio";

interface CarritoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarritoDrawer({ isOpen, onClose }: CarritoDrawerProps) {
  const { config } = useConfig();
  const {
    carrito,
    datosEnvio,
    setDatosEnvio,
    agregarAlCarrito,
    restarDelCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
  } = useCarrito();

  // Estados del formulario y flujo de compra
  const [paso, setPaso] = useState<"carrito" | "checkout">("carrito");
  const [cargandoMP, setCargandoMP] = useState(false);
  const [metodoPago, setMetodoPago] = useState<
    "whatsapp" | "mercadopago_debito" | "mercadopago_cuotas"
  >("whatsapp");

  // Configuración desde DB
  const [cuotasHabilitadas, setCuotasHabilitadas] = useState(true);
  const [montoMinimoCuotas, setMontoMinimoCuotas] = useState(0);
  const [costoEnvioFijo, setCostoEnvioFijo] = useState(0);
  const [whatsappNumeroDB, setWhatsappNumeroDB] = useState<string>("");

  // Estados para reglas de envío desde configuracion_empresa
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
          console.error("Error al obtener la configuración de la empresa:", error);
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
        console.error("Error inesperado al cargar la configuración:", err);
      }
    }

    cargarConfiguracion();
  }, []);

  const carritoSeguro = Array.isArray(carrito) ? carrito : [];
  const subtotalProductos = carritoSeguro.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * (item.cantidad || 1),
    0
  );

  // Evaluación de Envío Gratis según la DB y si eligió Envío a Domicilio
  const tieneEnvioGratis =
    envioGratisActivo &&
    montoEnvioGratis > 0 &&
    subtotalProductos >= montoEnvioGratis;

  const esEnvioADomicilio = datosEnvio.metodoEnvio === "envio";
  const costoEnvioAplicado =
    esEnvioADomicilio && !tieneEnvioGratis ? costoEnvioFijo : 0;

  const productoNoAptoCuotas = carritoSeguro.find(
    (item) => item.permite_cuotas === false
  );
  const alcanzaMontoMinimoCuotas = subtotalProductos >= montoMinimoCuotas;
  const aptoParaCuotas =
    cuotasHabilitadas && !productoNoAptoCuotas && alcanzaMontoMinimoCuotas;

  const PORCENTAJE_DEBITO = 0.10;
  const PORCENTAJE_CUOTAS = 0.25;

  // Base real para calcular recargos (Productos + Envío)
  const totalBaseConEnvio = subtotalProductos + costoEnvioAplicado;

  // Opciones de Pago Calculadas
  const totalTransferencia = totalBaseConEnvio;
  const totalDebitoOp = Math.round(totalBaseConEnvio * (1 + PORCENTAJE_DEBITO));
  const totalCuotasOp = Math.round(totalBaseConEnvio * (1 + PORCENTAJE_CUOTAS));
  const valorCuotaOp = Math.round(totalCuotasOp / 3);

  // Determinación del Total Final según la opción seleccionada
  let totalFinalAbonar = totalTransferencia;
  let recargoMonto = 0;

  if (metodoPago === "mercadopago_debito") {
    totalFinalAbonar = totalDebitoOp;
    recargoMonto = totalDebitoOp - totalBaseConEnvio;
  } else if (metodoPago === "mercadopago_cuotas") {
    totalFinalAbonar = totalCuotasOp;
    recargoMonto = totalCuotasOp - totalBaseConEnvio;
  }

  // Validación previa de campos obligatorios
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
  ) => {
    try {
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            nombre_cliente: datosEnvio.nombreCliente.trim(),
            telefono_cliente: datosEnvio.telefonoCliente.trim() || null,
            metodo_envio: datosEnvio.metodoEnvio,
            metodo_pago: medioPagoStr,
            es_cuotas: metodoPago === "mercadopago_cuotas",
            recargo_monto: recargoMonto,
            total: montoFinal,
            estado: "pendiente",
            direccion:
              datosEnvio.metodoEnvio === "envio"
                ? datosEnvio.direccion.trim()
                : null,
            nota_adicional:
              `${datosEnvio.notaAdicional.trim()} [Pago: ${medioPagoStr}]`.trim(),
          },
        ])
        .select();

      if (pedidoError) console.error("Error al insertar pedido:", pedidoError);

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
      }
    } catch (err) {
      console.error("Excepción en DB:", err);
    }
  };

  const procesarWhatsApp = async () => {
    if (!validarCamposFormulario()) return;

    await guardarPedidoEnDB(totalFinalAbonar, "Transferencia / Efectivo");

    let mensaje = `¡Hola! Quisiera realizar el siguiente pedido:\n\n`;
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
      mensaje += `• Costo de envío: $${costoEnvioAplicado.toLocaleString(
        "es-AR"
      )}\n`;
    }

    mensaje += `\n💰 *Total a abonar:* $${totalFinalAbonar.toLocaleString(
      "es-AR"
    )}\n`;

    if (datosEnvio.notaAdicional.trim()) {
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
          cliente: {
            nombre: datosEnvio.nombreCliente.trim(),
            telefono: datosEnvio.telefonoCliente.trim(),
            metodoEnvio: datosEnvio.metodoEnvio,
            direccion: datosEnvio.direccion,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.init_point) {
        // NOTA: Se removió vaciarCarrito() de aquí para evitar que se borre 
        // el carrito si el usuario vuelve atrás desde la pasarela de pago.
        // Ahora se vaciará mediante un listener al retornar con ?status=success en la página principal.
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E7E5E0]">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0E6E55]" />
              {paso === "carrito" ? "Tu Carrito" : "Finalizar Compra"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
            {carritoSeguro.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300" />
                <p className="text-gray-500 font-medium">El carrito está vacío</p>
              </div>
            ) : paso === "carrito" ? (
              <div className="space-y-3">
                {carritoSeguro.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-[#E7E5E0] rounded-xl bg-gray-50/50 gap-3"
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                      {item.imagen_url ? (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-gray-900 truncate">
                        {item.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        ${(Number(item.precio) || 0).toLocaleString("es-AR")} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm">
                        <button
                          onClick={() => restarDelCarrito(item.id)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => agregarAlCarrito(item)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
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
                <FormularioEnvio
                  datosEnvio={datosEnvio}
                  setDatosEnvio={setDatosEnvio}
                  costoEnvio={costoEnvioFijo}
                  metodoPago={metodoPago === "whatsapp" ? "whatsapp" : "mercadopago"}
                  totalPrecio={subtotalProductos}
                  tieneEnvioGratis={tieneEnvioGratis}
                  guardandoPedido={cargandoMP}
                  onConfirmar={() => {}}
                />

                {/* Selección de Método de Pago */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Seleccionar Método de Pago:
                  </label>

                  {/* Opción 1: WhatsApp */}
                  <button
                    type="button"
                    onClick={() => setMetodoPago("whatsapp")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all active:scale-[0.98] ${
                      metodoPago === "whatsapp"
                        ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] shadow-sm"
                        : "border-[#E7E5E0] bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">💬 Transferencia / Efectivo</div>
                      <div className="text-[11px] font-normal text-gray-500">
                        Pago directo de contado
                      </div>
                    </div>
                    <span className="font-bold text-[#0E6E55] text-sm">
                      ${totalTransferencia.toLocaleString("es-AR")}
                    </span>
                  </button>

                  {/* Opción 2: Débito / 1 Pago (+10%) */}
                  <button
                    type="button"
                    onClick={() => setMetodoPago("mercadopago_debito")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all active:scale-[0.98] ${
                      metodoPago === "mercadopago_debito"
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-[#E7E5E0] bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">
                        💳 Mercado Pago (Débito / 1 Pago)
                      </div>
                      <div className="text-[11px] font-normal text-gray-500">
                        Tarjeta de débito o saldo en cuenta
                      </div>
                    </div>
                    <span className="font-bold text-blue-700 text-sm">
                      ${totalDebitoOp.toLocaleString("es-AR")}
                    </span>
                  </button>

                  {/* Opción 3: 3 Cuotas Fijas (+25%) */}
                  <button
                    type="button"
                    disabled={!aptoParaCuotas}
                    onClick={() => aptoParaCuotas && setMetodoPago("mercadopago_cuotas")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      !aptoParaCuotas
                        ? "border-gray-200 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                        : metodoPago === "mercadopago_cuotas"
                        ? "border-purple-600 bg-purple-50 text-purple-700 shadow-sm active:scale-[0.98]"
                        : "border-[#E7E5E0] bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        💳 3 Cuotas Fijas
                        {!aptoParaCuotas && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal">
                            No disponible
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-normal text-gray-500">
                        3 pagos de ${valorCuotaOp.toLocaleString("es-AR")}
                      </div>
                    </div>
                    <span className="font-bold text-purple-700 text-sm">
                      ${totalCuotasOp.toLocaleString("es-AR")}
                    </span>
                  </button>
                </div>

                {/* Avisos */}
                <div className="mt-2 text-[11px] space-y-1">
                  {productoNoAptoCuotas ? (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                      ⚠️ El producto <strong>{productoNoAptoCuotas.nombre}</strong> solo
                      se abona al contado/débito.
                    </div>
                  ) : !alcanzaMontoMinimoCuotas && cuotasHabilitadas ? (
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                      ℹ️ Sumá{" "}
                      <strong>
                        $
                        {(
                          montoMinimoCuotas - subtotalProductos
                        ).toLocaleString("es-AR")}
                      </strong>{" "}
                      más para habilitar las 3 cuotas.
                    </div>
                  ) : null}
                </div>
              </form>
            )}
          </div> 
                {/* Footer */}
          {carritoSeguro.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#E7E5E0] bg-gray-50 space-y-4">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal productos:</span>
                  <span>${subtotalProductos.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de envío:</span>
                  <span>
                    {costoEnvioAplicado === 0 ? (
                      <span className="font-bold text-[#0E6E55]">
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
                  <div className="flex justify-between text-gray-500">
                    <span>
                      {metodoPago === "mercadopago_cuotas"
                        ? "Recargo cuotas (25%):"
                        : "Recargo débito (10%):"}
                    </span>
                    <span>+${recargoMonto.toLocaleString("es-AR")}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total final:</span>
                  <span>${totalFinalAbonar.toLocaleString("es-AR")}</span>
                </div>
              </div>

              {paso === "carrito" ? (
                <button
                  onClick={() => setPaso("checkout")}
                  className="w-full bg-[#0E6E55] hover:bg-[#0b5643] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Continuar compra
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaso("carrito")}
                    className="w-1/3 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-xs transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={cargandoMP}
                    className="w-2/3 bg-[#0E6E55] hover:bg-[#0b5643] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {cargandoMP
                      ? "Procesando..."
                      : metodoPago === "whatsapp"
                      ? "Pedir por WhatsApp"
                      : "Pagar con Mercado Pago"}
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