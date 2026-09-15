'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCarrito } from "@/context/CarritoContext";
import { useConfig } from "@/context/ConfigContext";
import { createClient } from "@supabase/supabase-js";

import CarritoItem from "./carrito/CarritoItem";
import FormularioEnvio from "./carrito/FormularioEnvio";
import ModalExito from "./carrito/ModalExito";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CarritoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarritoDrawer({ isOpen, onClose }: CarritoDrawerProps) {
  const { config } = useConfig();
  const { carrito, agregarAlCarrito, restarUnidad, eliminarDelCarrito, vaciarCarrito } = useCarrito();
  const searchParams = useSearchParams();

  const montoEnvioGratis = Number((config as any)?.monto_envio_gratis ?? 40000);
  const costoEnvioBase = Number((config as any)?.costo_envio_base ?? 0);
  const envioDomicilioActivo = (config as any)?.envio_domicilio_activo ?? true;
  const envioGratisActivo = (config as any)?.envio_gratis_activo ?? true;

  // Configuración global de cuotas
  const cuotasHabilitadas = (config as any)?.cuotas_habilitadas ?? true;
  const montoMinimoCuotas = Number((config as any)?.monto_minimo_cuotas ?? 0);

  const rawNumber = config?.whatsapp_numero || "5493413954355";
  const telefonoWhatsApp = rawNumber.replace(/[^0-9]/g, "");

  const [guardandoPedido, setGuardandoPedido] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setMostrarModalExito(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const [metodoPago, setMetodoPago] = useState<"whatsapp" | "mercadopago">("whatsapp");

  const [datosEnvio, setDatosEnvio] = useState({
    nombreCliente: "",
    telefonoCliente: "",
    metodoEnvio: (envioDomicilioActivo ? "envio" : "retiro") as "retiro" | "envio",
    direccion: "",
    notaAdicional: "",
  });

  useEffect(() => {
    if (!envioDomicilioActivo && datosEnvio.metodoEnvio === "envio") {
      setDatosEnvio((prev) => ({ ...prev, metodoEnvio: "retiro", direccion: "" }));
    }
  }, [envioDomicilioActivo, datosEnvio.metodoEnvio]);

  // Bloquea el scroll del body mientras el drawer/bottom sheet está abierto.
  useEffect(() => {
    if (!isOpen) return;

    const scrollYPrevio = window.scrollY;
    const bodyStyle = document.body.style;

    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollYPrevio}px`;
    bodyStyle.left = "0";
    bodyStyle.right = "0";
    bodyStyle.width = "100%";
    bodyStyle.overscrollBehaviorY = "contain";

    return () => {
      bodyStyle.position = "";
      bodyStyle.top = "";
      bodyStyle.left = "";
      bodyStyle.right = "";
      bodyStyle.width = "";
      bodyStyle.overscrollBehaviorY = "";
      window.scrollTo(0, scrollYPrevio);
    };
  }, [isOpen]);

  if (!isOpen && !mostrarModalExito) return null;

  const subtotalProductos = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Validación de cuotas según la lista de ítems y configuración global
  const productoNoAptoCuotas = carrito.find((item: any) => item.permite_cuotas === false);
  const alcanzaMontoMinimoCuotas = subtotalProductos >= montoMinimoCuotas;
  const aptoParaCuotas = cuotasHabilitadas && alcanzaMontoMinimoCuotas && !productoNoAptoCuotas;

  // Si no está apto para cuotas y el usuario tiene seleccionado Mercado Pago, podemos avisarle o volver a WhatsApp si es estricto
  useEffect(() => {
    if (!aptoParaCuotas && metodoPago === "mercadopago" && productoNoAptoCuotas) {
      // Opcional: Notificar o ajustar si no se permite financiación
    }
  }, [aptoParaCuotas, metodoPago, productoNoAptoCuotas]);

  const tieneEnvioGratis = envioGratisActivo && subtotalProductos >= montoEnvioGratis;
  const faltaParaEnvioGratis = Math.max(0, montoEnvioGratis - subtotalProductos);
  const porcentajeProgreso = Math.min(100, (subtotalProductos / montoEnvioGratis) * 100);

  const costoEnvioAplicado =
    datosEnvio.metodoEnvio === "envio" && !tieneEnvioGratis ? costoEnvioBase : 0;

  const totalBaseConEnvio = subtotalProductos + costoEnvioAplicado;

  const PORCENTAJE_RECARGO = 0.10;
  const totalConRecargo = Math.round(totalBaseConEnvio * (1 + PORCENTAJE_RECARGO));

  const totalFinalAbonar = metodoPago === "mercadopago" ? totalConRecargo : totalBaseConEnvio;

  const validarFormulario = () => {
    if (!datosEnvio.nombreCliente.trim()) {
      alert("Por favor, ingresá tu nombre para continuar.");
      return false;
    }
    if (datosEnvio.metodoEnvio === "envio" && !datosEnvio.direccion.trim()) {
      alert("Por favor, ingresá tu dirección de envío.");
      return false;
    }
    return true;
  };

  const guardarPedidoEnDB = async (montoFinal: number, medioPagoStr: string) => {
    try {
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            nombre_cliente: datosEnvio.nombreCliente.trim(),
            telefono_cliente: datosEnvio.telefonoCliente.trim() || null,
            metodo_envio: datosEnvio.metodoEnvio,
            total: montoFinal,
            estado: "pendiente",
            direccion: datosEnvio.metodoEnvio === "envio" ? datosEnvio.direccion.trim() : null,
            nota_adicional: `${datosEnvio.notaAdicional.trim()} [Pago: ${medioPagoStr}]`.trim(),
          },
        ])
        .select();

      if (pedidoError) console.error("Error al insertar pedido:", pedidoError);

      if (pedidoData && pedidoData.length > 0) {
        const idPedido = pedidoData[0].id;
        const itemsParaInsertar = carrito.map((item) => ({
          pedido_id: idPedido,
          producto_id: item.id,
          nombre_producto: item.nombre,
          precio_unitario: item.precio,
          cantidad: item.cantidad,
        }));

        await supabase.from("pedido_items").insert(itemsParaInsertar);
      }
    } catch (err) {
      console.error("Excepción en DB:", err);
    }
  };

  const procesarWhatsApp = async () => {
    if (!validarFormulario()) return;

    setGuardandoPedido(true);
    await guardarPedidoEnDB(totalBaseConEnvio, "WhatsApp / Transferencia");

    let mensaje = `*¡Hola! Quiero realizar el siguiente pedido:*\n\n`;
    mensaje += `*Cliente:* ${datosEnvio.nombreCliente}\n`;
    if (datosEnvio.telefonoCliente) mensaje += `*Teléfono:* ${datosEnvio.telefonoCliente}\n`;
    mensaje += `*Método:* ${datosEnvio.metodoEnvio === "envio" ? "Envío a domicilio" : "Retiro en local"}\n`;

    if (datosEnvio.metodoEnvio === "envio" && datosEnvio.direccion) {
      mensaje += `*Dirección:* ${datosEnvio.direccion}\n`;
    }

    if (datosEnvio.notaAdicional) mensaje += `*Nota:* ${datosEnvio.notaAdicional}\n`;

    mensaje += `\n*Detalle del pedido:*\n`;
    carrito.forEach((item) => {
      mensaje += `- ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})\n`;
    });

    if (costoEnvioAplicado > 0) {
      mensaje += `- Cadetería / Envío: $${costoEnvioAplicado}\n`;
    }

    mensaje += `\n*Total a pagar (Transferencia / Efectivo):* $${totalBaseConEnvio}\n\n`;
    mensaje += `Quedo a la espera del alias para realizar la transferencia.`;

    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    vaciarCarrito();
    setGuardandoPedido(false);
    onClose();
    setMostrarModalExito(true);
  };

  const procesarMercadoPago = async () => {
    if (!validarFormulario()) return;

    setGuardandoPedido(true);
    await guardarPedidoEnDB(totalConRecargo, "Mercado Pago");

    try {
      const itemsEnvio = costoEnvioAplicado > 0 ? [{
        id: "envio-cadeteria",
        nombre: "Costo de Cadetería / Envío",
        precio: costoEnvioAplicado,
        cantidad: 1,
      }] : [];

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemsCarrito: [
            ...carrito.map((item) => ({
              id: item.id,
              nombre: item.nombre,
              precio: item.precio,
              cantidad: item.cantidad,
            })),
            ...itemsEnvio,
          ],
          cliente: {
            nombre: datosEnvio.nombreCliente.trim(),
            telefono: datosEnvio.telefonoCliente.trim(),
            direccion: datosEnvio.direccion.trim(),
            metodoEnvio: datosEnvio.metodoEnvio,
            nota: datosEnvio.notaAdicional.trim(),
          },
        }),
      });

      const data = await response.json();

      if (data.init_point) {
        vaciarCarrito();
        window.location.href = data.mobile_search_url || data.init_point;
      } else {
        alert("Error del servidor: " + (data.error || "Desconocido"));
      }
    } catch (error: any) {
      alert("Error en la solicitud: " + error.message);
    } finally {
      setGuardandoPedido(false);
    }
  };

  const manejarSubmit = () => {
    if (metodoPago === "whatsapp") {
      procesarWhatsApp();
    } else {
      procesarMercadoPago();
    }
  };

  return (
    <>
      <ModalExito
        mostrar={mostrarModalExito}
        onAceptar={() => setMostrarModalExito(false)}
      />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-end bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] overscroll-none">
          <div
            className="flex w-full sm:max-w-[420px] flex-col justify-between overflow-y-auto overscroll-contain bg-white shadow-2xl rounded-t-3xl sm:rounded-none max-h-[92vh] sm:h-full sm:max-h-full animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] sm:animate-[slideIn_0.28s_cubic-bezier(0.16,1,0.3,1)]"
            style={{ overscrollBehaviorY: "contain" }}
          >

            {/* Handle del Bottom Sheet (solo mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0 sticky top-0 z-10 bg-white">
              <span className="h-1.5 w-12 rounded-full bg-[#E7E5E0]" />
            </div>

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7E5E0] bg-white/95 px-5 py-4 shadow-sm backdrop-blur-sm">
              <h2 className="text-lg font-bold tracking-tight text-[#12151B]">
                Tu Carrito
                {carrito.length > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#12151B] px-1.5 text-xs font-semibold text-white">
                    {carrito.length}
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                aria-label="Cerrar carrito"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-[#F7F7F5] hover:text-[#12151B] active:scale-90"
              >
                <span className="text-lg leading-none">✕</span>
              </button>
            </div>

            {/* Barra de Envío Gratis */}
            {carrito.length > 0 && envioDomicilioActivo && envioGratisActivo && (
              <div className="border-b border-[#E7E5E0] bg-[#0E6E55]/5 px-5 py-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#12151B] mb-1.5">
                  {tieneEnvioGratis ? (
                    <span className="text-[#0E6E55] font-bold flex items-center gap-1">
                       ¡Genial! Tenés ENVÍO GRATIS
                    </span>
                  ) : (
                    <span>
                      Te faltan <strong className="text-[#0E6E55]">${faltaParaEnvioGratis.toLocaleString("es-AR")}</strong> para <strong>ENVÍO GRATIS</strong>
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 font-bold">{Math.round(porcentajeProgreso)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7E5E0]">
                  <div
                    className="h-full bg-[#0E6E55] transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${porcentajeProgreso}%` }}
                  />
                </div>
              </div>
            )}

            {/* Lista de Productos */}
            <div className="flex-1 px-5 py-4">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F7F7F5] text-4xl">
                    🛒
                  </div>
                  <p className="text-sm font-medium text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {carrito.map((item) => (
                    <CarritoItem
                      key={item.id}
                      item={item}
                      onRestar={restarUnidad}
                      onAgregar={agregarAlCarrito}
                      onEliminar={eliminarDelCarrito}
                    />
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="px-5 pb-5 space-y-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <div className="rounded-2xl border border-[#E7E5E0] p-3 bg-slate-50/60 space-y-2">
                  <label className="text-xs font-bold text-[#12151B] uppercase tracking-wider block">
                    Método de Pago
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMetodoPago("whatsapp")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                        metodoPago === "whatsapp"
                          ? "border-[#0E6E55] bg-[#0E6E55]/10 text-[#0E6E55] shadow-sm"
                          : "border-[#E7E5E0] bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>💬 WhatsApp</span>
                      <span className="text-[10px] font-normal text-gray-500">Transferencia / Alias</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPago("mercadopago")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                        metodoPago === "mercadopago"
                          ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                          : "border-[#E7E5E0] bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>💳 Mercado Pago</span>
                      <span className="text-[10px] font-normal text-gray-500">
                        {aptoParaCuotas ? "Tarjetas / 3 Cuotas (+10%)" : "Tarjetas / Débito (+10%)"}
                      </span>
                    </button>
                  </div>

                  {/* Avisos de Cuotas */}
                  {metodoPago === "mercadopago" && (
                    <div className="mt-2 text-[11px] space-y-1">
                      {productoNoAptoCuotas ? (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                          ⚠️ El producto <strong>{productoNoAptoCuotas.nombre}</strong> solo se abona al contado/débito. No aplica financiación en cuotas.
                        </div>
                      ) : !alcanzaMontoMinimoCuotas && cuotasHabilitadas ? (
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                          ℹ️ Sumá <strong>${(montoMinimoCuotas - subtotalProductos).toLocaleString("es-AR")}</strong> más para habilitar el pago en 3 cuotas.
                        </div>
                      ) : aptoParaCuotas ? (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                          ✨ ¡Tu compra aplica para abonar en 3 cuotas sin interés!
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <FormularioEnvio
                  totalPrecio={totalFinalAbonar}
                  costoEnvio={costoEnvioBase}
                  tieneEnvioGratis={tieneEnvioGratis}
                  datosEnvio={datosEnvio}
                  setDatosEnvio={setDatosEnvio}
                  guardandoPedido={guardandoPedido}
                  metodoPago={metodoPago}
                  onConfirmar={manejarSubmit}
                  envioDomicilioActivo={envioDomicilioActivo}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
