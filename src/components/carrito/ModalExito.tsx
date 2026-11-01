'use client';

import React from "react";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface ItemComprado {
  id?: string | number;
  nombre_producto?: string;
  nombre?: string;
  title?: string;
  cantidad?: number;
  precio_unitario?: number;
  precio?: number;
  unit_price?: number;
}

interface ModalExitoProps {
  mostrar: boolean;
  onAceptar: () => void;
  esMercadoPago?: boolean;
  codigoPedido?: string;
  items?: ItemComprado[];
  total?: number;
}

export default function ModalExito({ 
  mostrar, 
  onAceptar, 
  esMercadoPago = false, 
  codigoPedido,
  items = [],
  total = 0 
}: ModalExitoProps) {
  const router = useRouter();

  if (!mostrar) return null;

  const handleIrASeguimiento = () => {
    onAceptar();
    // Redirige a la pantalla de seguimiento (puedes pasar el código por query param si tu página lo lee)
    if (codigoPedido) {
      router.push(`/seguimiento?codigo=${codigoPedido}`);
    } else {
      router.push('/seguimiento');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B0F14]/60 p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(11,15,20,0.25)] animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">

        {/* Encabezado tipo ticket */}
        <div className="flex flex-col items-center bg-[#F7F7F5] px-6 pb-5 pt-7 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0E6E55]/10">
            <CheckCircle2 className="h-8 w-8 text-[#0E6E55]" strokeWidth={1.8} />
          </div>
          <h3 className="mt-3 text-lg font-bold text-[#12151B]">
            {esMercadoPago ? "¡Pago aprobado con éxito! 🎉" : "¡Pedido enviado!"}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#6B675F]">
            {esMercadoPago
              ? "Tu pago a través de Mercado Pago se procesó de forma segura."
              : "Tu pedido fue registrado con éxito."}
          </p>

          {/* Código de pedido destacado */}
          {codigoPedido && (
            <div className="mt-3.5 w-full rounded-2xl bg-white p-3 border border-[#E7E5E0] shadow-2xs flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Código de pedido
              </span>
              <span className="font-mono text-sm font-extrabold text-[#0E6E55]">
                #{codigoPedido.slice(0, 6).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Línea de recorte tipo ticket */}
        <div className="relative flex items-center px-6">
          <div className="h-4 w-4 -translate-x-1/2 rounded-full bg-[#0B0F14]/60 absolute left-0" />
          <div className="h-4 w-4 translate-x-1/2 rounded-full bg-[#0B0F14]/60 absolute right-0" />
          <div className="w-full border-t border-dashed border-[#E7E5E0]" />
        </div>

        {/* Resumen de productos comprados */}
        {items.length > 0 && (
          <div className="px-6 py-3.5 bg-white max-h-[150px] overflow-y-auto space-y-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <ShoppingBag className="w-3.5 h-3.5 text-[#0E6E55]" />
              <span>Resumen de tu compra:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-600 pl-1">
              {items.map((item, idx) => {
                const nombre = item.nombre_producto || item.nombre || item.title || "Producto";
                const cantidad = item.cantidad || 1;
                const precio = item.precio_unitario || item.precio || item.unit_price || 0;
                return (
                  <li key={item.id || idx} className="flex items-center justify-between">
                    <span className="truncate pr-2">
                      <strong className="text-[#0E6E55]">{cantidad}x</strong> {nombre}
                    </span>
                    <span className="font-mono text-gray-500 shrink-0">
                      ${(precio * cantidad).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
            {total > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200 text-xs font-extrabold text-[#12151B]">
                <span>Total pagado:</span>
                <span className="font-mono text-sm text-[#0E6E55]">${total.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Explicación de seguimiento */}
        <div className="px-6 py-3 bg-white text-left">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Package className="w-4 h-4 text-[#0E6E55] shrink-0 mt-0.5" />
            <span>Podrás ver el estado en tiempo real desde la sección <strong>Seguimiento</strong>.</span>
          </div>
        </div>

        {/* Acción */}
        <div className="px-6 pb-6 pt-2 bg-white">
          <button
            onClick={handleIrASeguimiento}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12151B] py-3.5 text-[15px] font-bold text-white shadow-md shadow-[#12151B]/20 transition-all duration-200 hover:bg-[#1E222B] active:scale-[0.98] cursor-pointer"
          >
            <span>Ver mi pedido en Seguimiento</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}