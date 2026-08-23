"use client";

import React, { useState } from "react";
import { useCarrito } from "@/context/CarritoContext";
import { supabase } from "@/lib/supabase";

interface CarritoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarritoDrawer({ isOpen, onClose }: CarritoDrawerProps) {
  const {
    carrito,
    agregarAlCarrito,
    restarUnidad,
    eliminarDelCarrito,
    vaciarCarrito,
    totalPrecio,
    datosEnvio,
    setDatosEnvio,
  } = useCarrito();

  const [telefonoWhatsApp] = useState("549XXXXXXXXX"); // Tu número receptor con código de país
  const [procesando, setProcesando] = useState(false);

  if (!isOpen) return null;

  const enviarAWhatsApp = async () => {
    if (!datosEnvio.nombreCliente.trim()) {
      alert("Por favor, ingresá tu nombre completo.");
      return;
    }

    if (!datosEnvio.telefonoCliente.trim()) {
      alert("Por favor, ingresá tu número de celular / WhatsApp.");
      return;
    }

    if (datosEnvio.metodoEnvio === "envio" && !datosEnvio.direccion.trim()) {
      alert("Por favor, ingresá la dirección para el envío.");
      return;
    }

    setProcesando(true);

    try {
      // 1. Guardar el pedido en Supabase en estado pendiente
      const { data, error } = await supabase.rpc("registrar_pedido_pendiente", {
        p_nombre_cliente: `${datosEnvio.nombreCliente} (Tel: ${datosEnvio.telefonoCliente})`,
        p_metodo_envio: datosEnvio.metodoEnvio,
        p_direccion: datosEnvio.metodoEnvio === "envio" ? datosEnvio.direccion : "",
        p_nota_adicional: datosEnvio.notaAdicional || "",
        p_total: totalPrecio,
        p_items: carrito.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
        })),
      });

      if (error) {
        console.error("Error al registrar pedido:", error);
        alert(`Ocurrió un error al procesar el pedido: ${error.message}`);
        setProcesando(false);
        return;
      }

      // 2. Armar el mensaje de WhatsApp
      let mensaje = `*¡Hola! Quiero realizar el siguiente pedido:*\n\n`;
      mensaje += `*Cliente:* ${datosEnvio.nombreCliente}\n`;
      mensaje += `*Teléfono:* ${datosEnvio.telefonoCliente}\n`;
      mensaje += `*Método:* ${
        datosEnvio.metodoEnvio === "envio" ? "Envío a domicilio" : "Retiro en local"
      }\n`;

      if (datosEnvio.metodoEnvio === "envio" && datosEnvio.direccion) {
        mensaje += `*Dirección:* ${datosEnvio.direccion}\n`;
      }

      if (datosEnvio.notaAdicional) {
        mensaje += `*Nota:* ${datosEnvio.notaAdicional}\n`;
      }

      mensaje += `\n*Detalle del pedido:*\n`;
      carrito.forEach((item) => {
        mensaje += `- ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})\n`;
      });

      mensaje += `\n*Total a pagar:* $${totalPrecio}\n\n`;
      mensaje += `Quedo a la espera para coordinar el pago.`;

      // 3. Abrir WhatsApp, vaciar carrito y cerrar drawer
      const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank");

      vaciarCarrito();
      onClose();
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Ocurrió un error inesperado.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="flex h-full w-full max-w-md flex-col justify-between bg-white p-6 shadow-xl overflow-y-auto">
        {/* Cabecera */}
        <div>
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Tu Carrito</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
              ✕
            </button>
          </div>

          {/* Items */}
          {carrito.length === 0 ? (
            <p className="my-10 text-center text-sm text-gray-500">
              El carrito está vacío.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {carrito.map((item) => {
                const alcanzadoLimite = item.cantidad >= item.stock;

                return (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <strong className="text-sm text-gray-800">{item.nombre}</strong>
                      <div className="text-xs text-gray-500">
                        ${item.precio} c/u | Disponibles: {item.stock}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restarUnidad(item.id)}
                        className="rounded border px-2 py-0.5 text-xs font-bold hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold">{item.cantidad}</span>
                      <button
                        onClick={() => agregarAlCarrito(item)}
                        disabled={alcanzadoLimite}
                        className={`rounded border px-2 py-0.5 text-xs font-bold ${
                          alcanzadoLimite
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        title={alcanzadoLimite ? "Máximo stock disponible alcanzado" : ""}
                      >
                        +
                      </button>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="ml-2 text-xs text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulario de Checkout */}
        {carrito.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Datos del Comprador</h3>

            <input
              type="text"
              placeholder="Nombre y Apellido *"
              value={datosEnvio.nombreCliente || ""}
              onChange={(e) =>
                setDatosEnvio({ ...datosEnvio, nombreCliente: e.target.value })
              }
              className="mb-2 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-emerald-600"
            />

            <input
              type="tel"
              placeholder="Teléfono / WhatsApp (Ej: 1123456789) *"
              value={datosEnvio.telefonoCliente || ""}
              onChange={(e) =>
                setDatosEnvio({ ...datosEnvio, telefonoCliente: e.target.value })
              }
              className="mb-3 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-emerald-600"
            />

            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="metodoEnvio"
                  value="retiro"
                  checked={datosEnvio.metodoEnvio === "retiro"}
                  onChange={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "retiro" })}
                />
                Retiro en Local
              </label>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="metodoEnvio"
                  value="envio"
                  checked={datosEnvio.metodoEnvio === "envio"}
                  onChange={() => setDatosEnvio({ ...datosEnvio, metodoEnvio: "envio" })}
                />
                Envío a Domicilio
              </label>
            </div>

            {datosEnvio.metodoEnvio === "envio" && (
              <input
                type="text"
                placeholder="Dirección de entrega *"
                value={datosEnvio.direccion || ""}
                onChange={(e) =>
                  setDatosEnvio({ ...datosEnvio, direccion: e.target.value })
                }
                className="mb-3 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-emerald-600"
              />
            )}

            <div className="flex justify-between text-base font-bold text-gray-900 my-4">
              <span>Total:</span>
              <span>${totalPrecio}</span>
            </div>

            <button
              onClick={enviarAWhatsApp}
              disabled={procesando}
              className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {procesando ? "Procesando..." : "Confirmar Pedido por WhatsApp"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
