'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCarrito } from "@/context/CarritoContext";
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
  const { carrito, agregarAlCarrito, restarUnidad, eliminarDelCarrito, vaciarCarrito } = useCarrito();
  const searchParams = useSearchParams();

  const [telefonoWhatsApp] = useState("5493413954355");
  const [guardandoPedido, setGuardandoPedido] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  // Detecta el retorno de Mercado Pago en la URL
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setMostrarModalExito(true);
      // Limpia los parámetros de la URL para evitar que se reabra al recargar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  // Selección de método de pago: 'whatsapp' o 'mercadopago'
  const [metodoPago, setMetodoPago] = useState<"whatsapp" | "mercadopago">("whatsapp");

  const [datosEnvio, setDatosEnvio] = useState({
    nombreCliente: "",
    telefonoCliente: "",
    metodoEnvio: "retiro" as "retiro" | "envio",
    direccion: "",
    notaAdicional: "",
  });

  if (!isOpen && !mostrarModalExito) return null;

  // Monto base
  const totalPrecio = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Recargo por tarjeta / MP (10%)
  const PORCENTAJE_RECARGO = 0.10;
  const totalConRecargo = Math.round(totalPrecio * (1 + PORCENTAJE_RECARGO));

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

        const { error: itemsError } = await supabase
          .from("pedido_items")
          .insert(itemsParaInsertar);

        if (itemsError) console.error("Error al insertar items:", itemsError);
      }
    } catch (err) {
      console.error("Excepción en DB:", err);
    }
  };

  // Procesar flujo de WhatsApp
  const procesarWhatsApp = async () => {
    if (!validarFormulario()) return;

    setGuardandoPedido(true);
    await guardarPedidoEnDB(totalPrecio, "WhatsApp / Transferencia");

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

    mensaje += `\n*Total a pagar (Transferencia / Efectivo):* $${totalPrecio}\n\n`;
    mensaje += `Quedo a la espera del alias para realizar la transferencia.`;

    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    vaciarCarrito();
    setGuardandoPedido(false);
    onClose();
    setMostrarModalExito(true);
  };

  // Procesar flujo de Mercado Pago
  const procesarMercadoPago = async () => {
    if (!validarFormulario()) return;

    setGuardandoPedido(true);
    await guardarPedidoEnDB(totalConRecargo, "Mercado Pago");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemsCarrito: carrito.map((item) => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
          })),
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
        const checkoutUrl = data.mobile_search_url || data.init_point;
        window.location.href = checkoutUrl;
      } else {
        alert("Error del servidor: " + (data.error || "Desconocido"));
      }
    } catch (error: any) {
      console.error("Error al procesar pago:", error);
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]">
          <div className="flex h-full w-full max-w-[420px] flex-col justify-between overflow-y-auto bg-white shadow-2xl animate-[slideIn_0.28s_cubic-bezier(0.16,1,0.3,1)]">

            {/* Cabecera */}
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
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-[#F7F7F5] hover:text-[#12151B] active:scale-90"
              >
                <span className="text-lg leading-none">✕</span>
              </button>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 px-5 py-4">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F7F7F5] text-4xl">
                    🛒
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    Tu carrito está vacío
                  </p>
                  <p className="max-w-[220px] text-xs text-gray-400">
                    Agregá productos para verlos reflejados acá.
                  </p>
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

            {/* Opciones de Pago y Formulario */}
            {carrito.length > 0 && (
              <div className="px-5 pb-5 space-y-4">

                {/* Selector de Método de Pago */}
                <div className="rounded-2xl border border-[#E7E5E0] p-3 bg-slate-50/60 space-y-2">
                  <label className="text-xs font-bold text-[#12151B] uppercase tracking-wider block">
                    Método de Pago
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMetodoPago("whatsapp")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
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
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        metodoPago === "mercadopago"
                          ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                          : "border-[#E7E5E0] bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>💳 Mercado Pago</span>
                      <span className="text-[10px] font-normal text-gray-500">Tarjetas / Cuotas (+10%)</span>
                    </button>
                  </div>
                </div>

                <FormularioEnvio
                  totalPrecio={metodoPago === "mercadopago" ? totalConRecargo : totalPrecio}
                  datosEnvio={datosEnvio}
                  setDatosEnvio={setDatosEnvio}
                  guardandoPedido={guardandoPedido}
                  metodoPago={metodoPago}
                  onConfirmar={manejarSubmit}
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
      `}</style>
    </>
  );
}