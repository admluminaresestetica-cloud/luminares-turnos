"use client";

import { useState } from "react";
import {
  X,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
  Landmark,
  MessageCircle,
  Trash2,
  Send,
  Check,
} from "lucide-react";

export default function CarritoModal({ carrito, onClose, onEliminar, onEnviar }: any) {
  const total = carrito.reduce(
    (acc: number, p: any) => acc + Number(p.precio) * (p.cantidad || 1),
    0
  );

  // Estado local para la experiencia de checkout (no altera la lógica existente)
  const [metodoEntrega, setMetodoEntrega] = useState<"retiro" | "envio">("retiro");
  const [metodoPago, setMetodoPago] = useState<"whatsapp" | "transferencia" | "mercadopago">(
    "whatsapp"
  );
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [direccion, setDireccion] = useState("");

  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-end bg-[#0B0F14]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[420px] flex-col bg-white shadow-[-20px_0_50px_rgba(11,15,20,0.15)] animate-[slideIn_0.3s_ease-out]"
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-[#E7E5E0] px-6 py-5">
          <h2
            className="m-0 text-lg font-bold text-[#12151B]"
            style={{ fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" }}
          >
            Tu carrito de compras
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F0EC] text-[#6B675F] transition-colors duration-200 hover:bg-[#E7E5E0]"
            aria-label="Cerrar carrito"
          >
            <X className="h-4 w-4" strokeWidth={2.3} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-[#A6A29B]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F7F5]">
                <ShoppingBag className="h-7 w-7 text-[#C7C3BB]" strokeWidth={1.7} />
              </div>
              <p className="mt-4 text-[15px]">Tu carrito está vacío.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              {/* Método de Entrega */}
              <section>
                <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#9E9A92]">
                  Método de entrega
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMetodoEntrega("retiro")}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-center transition-all duration-200 ${
                      metodoEntrega === "retiro"
                        ? "border-[#12151B] bg-[#12151B] text-white shadow-md shadow-[#12151B]/15"
                        : "border-[#E7E5E0] bg-white text-[#524F4A] hover:border-[#12151B]/25 hover:bg-[#FAF9F7]"
                    }`}
                  >
                    <Store className="h-4.5 w-4.5" strokeWidth={2} />
                    <span className="text-[13px] font-semibold">Retiro en local</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoEntrega("envio")}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-center transition-all duration-200 ${
                      metodoEntrega === "envio"
                        ? "border-[#12151B] bg-[#12151B] text-white shadow-md shadow-[#12151B]/15"
                        : "border-[#E7E5E0] bg-white text-[#524F4A] hover:border-[#12151B]/25 hover:bg-[#FAF9F7]"
                    }`}
                  >
                    <Truck className="h-4.5 w-4.5" strokeWidth={2} />
                    <span className="text-[13px] font-semibold">Envío a domicilio</span>
                  </button>
                </div>
              </section>

              {/* Datos del Cliente */}
              <section>
                <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#9E9A92]">
                  Tus datos
                </h3>
                <div className="flex flex-col gap-2.5">
                  <div>
                    <label className="mb-1 block px-1 text-[11px] font-medium text-[#9E9A92]">
                      Nombre y apellido
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Ana Torres"
                      className="w-full rounded-xl border border-[#E7E5E0] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#12151B] placeholder-[#B3AFA7] outline-none transition-all duration-200 focus:border-[#12151B] focus:bg-white focus:ring-4 focus:ring-[#12151B]/[0.06]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block px-1 text-[11px] font-medium text-[#9E9A92]">
                      Celular / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      placeholder="Ej: 341 555 5555"
                      className="w-full rounded-xl border border-[#E7E5E0] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#12151B] placeholder-[#B3AFA7] outline-none transition-all duration-200 focus:border-[#12151B] focus:bg-white focus:ring-4 focus:ring-[#12151B]/[0.06]"
                    />
                  </div>
                  {metodoEntrega === "envio" && (
                    <div>
                      <label className="mb-1 block px-1 text-[11px] font-medium text-[#9E9A92]">
                        Dirección de envío
                      </label>
                      <input
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Calle, número y barrio"
                        className="w-full rounded-xl border border-[#E7E5E0] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#12151B] placeholder-[#B3AFA7] outline-none transition-all duration-200 focus:border-[#12151B] focus:bg-white focus:ring-4 focus:ring-[#12151B]/[0.06]"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Método de Pago */}
              <section>
                <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#9E9A92]">
                  Método de pago
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { id: "whatsapp", label: "Coordinar por WhatsApp", icon: MessageCircle },
                    { id: "transferencia", label: "Transferencia / Alias", icon: Landmark },
                    { id: "mercadopago", label: "Mercado Pago", icon: Wallet },
                  ].map(({ id, label, icon: Icon }) => {
                    const activo = metodoPago === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMetodoPago(id as typeof metodoPago)}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-3 transition-all duration-200 ${
                          activo
                            ? "border-[#12151B] bg-[#FAF9F7] shadow-xs"
                            : "border-[#E7E5E0] bg-white hover:bg-[#FAF9F7]"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              activo ? "text-[#12151B]" : "text-[#9E9A92]"
                            }`}
                            strokeWidth={2}
                          />
                          <span
                            className={`text-[13px] font-semibold ${
                              activo ? "text-[#12151B]" : "text-[#524F4A]"
                            }`}
                          >
                            {label}
                          </span>
                        </span>
                        <span
                          className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                            activo
                              ? "border-[#12151B] bg-[#12151B]"
                              : "border-[#D8D5CE] bg-white"
                          }`}
                        >
                          {activo && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Lista de productos */}
              <section>
                <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#9E9A92]">
                  Productos ({carrito.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {carrito.map((p: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-[#E7E5E0] bg-[#FAF9F7] px-4 py-3 transition-all duration-200 hover:border-[#D8D5CE]"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="m-0 truncate text-sm font-semibold text-[#12151B]">
                          {p.nombre}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {p.cantidad > 1 && (
                            <span className="rounded-full bg-[#EFEDE8] px-2 py-0.5 text-[11px] font-semibold text-[#6B675F]">
                              x{p.cantidad}
                            </span>
                          )}
                          <p className="m-0 text-sm font-bold text-[#0E6E55]">
                            ${Number(p.precio) * (p.cantidad || 1)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onEliminar(index)}
                        aria-label="Quitar producto"
                        className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#FBE7E7] px-3 py-2 text-[#D14343] transition-all duration-200 hover:bg-[#F5D0D0] active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Total y checkout */}
        {carrito.length > 0 && (
          <div className="border-t border-[#E7E5E0] px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#12151B]">Total a pagar</span>
              <span
                className="text-xl font-bold text-[#12151B]"
                style={{ fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" }}
              >
                ${total}
              </span>
            </div>
            <button
              onClick={onEnviar}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12151B] py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#12151B]/25 transition-all duration-200 hover:bg-[#1E222B] active:scale-[0.98]"
            >
              <Send className="h-4 w-4" strokeWidth={2.2} />
              Finalizar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}