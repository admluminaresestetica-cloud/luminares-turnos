"use client";

import React, { useState } from "react";
import { useCarrito } from "@/context/CarritoContext";

export default function CarritoDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { carrito, sumarUnidad, restarUnidad, eliminarProducto, vaciarCarrito } =
    useCarrito();

  const [nombre, setNombre] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"local" | "envio">("local");
  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  if (!isOpen) return null;

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const handleEnviarWhatsApp = () => {
    if (!nombre.trim()) {
      alert("Por favor, ingresá tu nombre completo antes de continuar.");
      return;
    }

    let mensaje = `*¡Hola! Quiero realizar un pedido desde la Tienda Online* 🛍️\n\n`;
    mensaje += `*Cliente:* ${nombre}\n`;
    mensaje += `*Entrega:* ${
      tipoEntrega === "local" ? "Retiro en Local" : "Envío a Domicilio"
    }\n\n`;
    mensaje += `*Detalle del pedido:*\n`;

    carrito.forEach((item) => {
      mensaje += `• ${item.nombre} x${item.cantidad} - $${
        item.precio * item.cantidad
      }\n`;
    });

    mensaje += `\n*Total a pagar: $${total}*`;

    const numeroWhatsApp = "5493416373376"; // Cambiar por tu número configurado
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensaje
    )}`;

    // Redirige a WhatsApp en nueva pestaña
    window.open(url, "_blank");

    // Muestra el modal de confirmación
    setMostrarModalExito(true);
  };

  const handleCerrarTodo = () => {
    vaciarCarrito();
    setMostrarModalExito(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {carrito.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-10">
              El carrito está vacío
            </p>
          ) : (
            carrito.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-3"
              >
                <div className="flex-1 pr-2">
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.nombre}
                  </h4>
                  <p className="text-xs text-gray-500">
                    ${item.precio} c/u
                  </p>
                </div>

                {/* Control de Cantidad Estilizado */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
                    <button
                      onClick={() => restarUnidad(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-800">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => sumarUnidad(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => eliminarProducto(item.id)}
                    className="p-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Datos del comprador */}
        {carrito.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Datos del Comprador
              </label>
              <input
                type="text"
                placeholder="Tu Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-gray-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="entrega"
                  checked={tipoEntrega === "local"}
                  onChange={() => setTipoEntrega("local")}
                  className="accent-emerald-600"
                />
                Retiro en Local
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="entrega"
                  checked={tipoEntrega === "envio"}
                  onChange={() => setTipoEntrega("envio")}
                  className="accent-emerald-600"
                />
                Envío a Domicilio
              </label>
            </div>

            <div className="flex items-center justify-between text-base font-bold text-gray-900 pt-2">
              <span>Total:</span>
              <span>${total}</span>
            </div>

            <button
              onClick={handleEnviarWhatsApp}
              className="w-full rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebd59] shadow-md"
            >
              Confirmar Pedido por WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* Pop-up Modal de Confirmación */}
      {mostrarModalExito && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¡Pedido preparado!
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Te redirigimos a WhatsApp para enviar el mensaje. Presioná aceptar para limpiar tu carrito.
            </p>
            <button
              onClick={handleCerrarTodo}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Aceptar y cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
