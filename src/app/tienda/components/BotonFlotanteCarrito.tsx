'use client';

import React, { useEffect, useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useCarrito } from "@/context/CarritoContext";
import { obtenerConfiguracion } from "@/lib/supabase/configuracion-empresa";

interface ItemCarrito {
  id: string | number;
  nombre?: string;
  imagen_url?: string;
  precio?: number;
  cantidad?: number;
}

interface BotonFlotanteCarritoProps {
  onOpenCarrito: () => void;
}

export default function BotonFlotanteCarrito({ onOpenCarrito }: BotonFlotanteCarritoProps) {
  const context = useCarrito();
  const items: ItemCarrito[] = context?.items || context?.carrito || [];

  const [montoEnvioGratis, setMontoEnvioGratis] = useState<number>(0);
  const [envioGratisActivo, setEnvioGratisActivo] = useState<boolean>(false);
  const [animando, setAnimando] = useState(false);

  useEffect(() => {
    async function cargarConfig() {
      try {
        const config = await obtenerConfiguracion();
        if (config) {
          setMontoEnvioGratis(Number(config.monto_envio_gratis) || 0);
          setEnvioGratisActivo(Boolean(config.envio_gratis_activo));
        }
      } catch (e) {
        console.error("Error cargando configuración del carrito:", e);
      }
    }
    cargarConfig();
  }, []);

  // Cálculos memoizados para evitar re-cálculos innecesarios en re-renders
  const { totalItems, totalPrecio } = useMemo(() => {
    if (!Array.isArray(items)) return { totalItems: 0, totalPrecio: 0 };

    return items.reduce(
      (acc, item) => {
        const cant = Number(item?.cantidad) || 0;
        const prec = Number(item?.precio) || 0;
        acc.totalItems += cant;
        acc.totalPrecio += prec * (cant || 1);
        return acc;
      },
      { totalItems: 0, totalPrecio: 0 }
    );
  }, [items]);

  // Microanimación de pop cuando cambia la cantidad total
  useEffect(() => {
    if (totalItems > 0) {
      setAnimando(true);
      const timer = setTimeout(() => setAnimando(false), 600);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (totalItems === 0) return null;

  const faltaParaEnvioGratis = Math.max(0, montoEnvioGratis - totalPrecio);
  const tieneEnvioGratis = totalPrecio >= montoEnvioGratis;

  const itemsAbanico = items.slice(0, 3);
  const productosRestantes = items.length - itemsAbanico.length;

  return (
    // CAMBIO AQUÍ: Se cambió bottom-4 por bottom-20 para despegar el botón del BottomNav
    <div className="fixed bottom-20 left-4 right-4 z-40 sm:hidden animate-in slide-in-from-bottom-4 duration-300">
      <button
        type="button"
        onClick={onOpenCarrito}
        className={`flex w-full items-center justify-between rounded-2xl bg-[#0E6E55] px-3.5 py-3 text-white shadow-2xl shadow-[#0E6E55]/30 backdrop-blur-xl active:scale-95 transition-all duration-300 cursor-pointer border border-white/20 ${
          animando ? "scale-105 ring-4 ring-white/30" : "scale-100"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">

          {/* Abanico de miniaturas */}
          <div className="flex items-center -space-x-3.5 shrink-0 pl-0.5">
            {itemsAbanico.map((item, index) => {
              const rotaciones = ["-rotate-6", "rotate-3", "-rotate-3"];
              const rotacionClase = rotaciones[index % rotaciones.length];

              return (
                <div
                  key={`${item.id || 'item'}-${index}`}
                  style={{ zIndex: 10 - index }}
                  className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-900 ring-2 ring-white shadow-md transition-transform duration-300 transform ${rotacionClase} ${
                    animando ? "scale-110" : ""
                  }`}
                >
                  {item.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre || "Producto"}
                      className="h-full w-full object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs bg-slate-800">
                      🛍️
                    </div>
                  )}
                </div>
              );
            })}

            {productosRestantes > 0 && (
              <div className="relative z-20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#12151B] ring-2 ring-white text-[9px] font-extrabold text-white shadow-md">
                +{productosRestantes}
              </div>
            )}
          </div>

          {/* Textos Informativos */}
          <div className="flex flex-col text-left min-w-0 pl-1">
            <span className="text-xs font-extrabold text-white tracking-tight whitespace-nowrap">
              Ver carrito ({totalItems} {totalItems === 1 ? 'prod.' : 'prods.'})
            </span>
            {envioGratisActivo && montoEnvioGratis > 0 && (
              <span className="text-[10px] font-semibold text-emerald-100 truncate">
                {tieneEnvioGratis ? (
                  <span>✨ ¡Envío gratis conseguido!</span>
                ) : (
                  <span>
                    Faltan <strong className="text-white">${faltaParaEnvioGratis.toLocaleString("es-AR")}</strong> para envío gratis
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Total y Flecha */}
        <div className="flex items-center gap-2 shrink-0 pl-2">
          <span className="text-sm font-extrabold text-white tracking-tight">
            ${totalPrecio.toLocaleString("es-AR")}
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-white">
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </div>
        </div>
      </button>
    </div>
  );
}
