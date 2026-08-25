'use client';

import React, { useState } from "react";
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

  const [telefonoWhatsApp] = useState("5493413954355");
  const [guardandoPedido, setGuardandoPedido] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  const [datosEnvio, setDatosEnvio] = useState({
    nombreCliente: "",
    telefonoCliente: "",
    metodoEnvio: "retiro" as "retiro" | "envio",
    direccion: "",
    notaAdicional: "",
  });

  if (!isOpen && !mostrarModalExito) return null;

  const totalPrecio = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const enviarAWhatsApp = async () => {
    if (!datosEnvio.nombreCliente.trim()) {
      alert("Por favor, ingresá tu nombre para continuar.");
      return;
    }

    if (datosEnvio.metodoEnvio === "envio" && !datosEnvio.direccion.trim()) {
      alert("Por favor, ingresá tu dirección de envío.");
      return;
    }

    setGuardandoPedido(true);

    try {
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            nombre_cliente: datosEnvio.nombreCliente.trim(),
            telefono_cliente: datosEnvio.telefonoCliente.trim() || null,
            metodo_envio: datosEnvio.metodoEnvio,
            total: totalPrecio,
            estado: "pendiente",
            direccion: datosEnvio.metodoEnvio === "envio" ? datosEnvio.direccion.trim() : null,
            nota_adicional: datosEnvio.notaAdicional.trim() || null,
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
      console.error("Excepción:", err);
    }

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

    mensaje += `\n*Total a pagar:* $${totalPrecio}\n\n`;
    mensaje += `Quedo a la espera de los datos para concretar la compra.`;

    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    vaciarCarrito();
    setGuardandoPedido(false);
    onClose();
    setMostrarModalExito(true);
  };

  return (
    <>
      <ModalExito
        mostrar={mostrarModalExito}
        onAceptar={() => setMostrarModalExito(false)}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]"
        >
          <div
            className="flex h-full w-full max-w-[420px] flex-col justify-between overflow-y-auto bg-white shadow-2xl animate-[slideIn_0.28s_cubic-bezier(0.16,1,0.3,1)]"
          >
            {/* Cabecera fija */}
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

            {carrito.length > 0 && (
              <div className="px-5 pb-5">
                <FormularioEnvio
                  totalPrecio={totalPrecio}
                  datosEnvio={datosEnvio}
                  setDatosEnvio={setDatosEnvio}
                  guardandoPedido={guardandoPedido}
                  onConfirmar={enviarAWhatsApp}
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
