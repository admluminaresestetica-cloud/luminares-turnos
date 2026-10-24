'use client';

import React from "react";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";
import { useFavoritos } from "@/context/FavoritosContext";
import { useConfig } from "@/context/ConfigContext";
import { calcularCuotas } from "@/lib/precios";
import { Plus, Minus, Flame, ShoppingCart, Truck, Heart } from "lucide-react";

interface TarjetaProductoProps {
  producto: Producto & {
    permite_cuotas?: boolean;
    mostrar_ultimas_unidades?: boolean;
    ultimas_unidades?: boolean;
    envio_gratis?: boolean;
  };
  onVerDetalle?: (producto: Producto) => void;
}

export default function TarjetaProducto({
  producto,
  onVerDetalle,
}: TarjetaProductoProps) {
  const context = useCarrito();
  const { toggleFavorito, esFavorito } = useFavoritos();
  const { config } = useConfig();

  const esFav = esFavorito(producto.id);

  const agregarAlCarrito = context?.agregarAlCarrito;
  const actualizarCantidad = (context as any)?.actualizarCantidad;
  const eliminarDelCarrito = (context as any)?.eliminarDelCarrito;
  const items = context?.items || context?.carrito || [];

  const stockDisponible = producto.stock ?? 0;
  const sinStock = stockDisponible <= 0;

  const esUltimasUnidades = !sinStock && (
    producto.mostrar_ultimas_unidades === true ||
    producto.ultimas_unidades === true ||
    (producto as any).mostrarUltimasUnidades === true
  );

  const esEnvioGratis = producto.envio_gratis === true;

  const itemEnCarrito = Array.isArray(items)
    ? items.find((item: any) => item.id === producto.id)
    : null;
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  const limiteAlcanzado = cantidadEnCarrito >= stockDisponible;

  const precioFormateado = new Intl.NumberFormat("es-AR").format(
    producto.precio || 0
  );

  const precioBaseNum = Number(producto.precio_original ?? (producto as any).precio_anterior) || 0;
  const tieneOferta = precioBaseNum > producto.precio;

  const porcentajeDescuento = tieneOferta
    ? Math.round(((precioBaseNum - producto.precio) / precioBaseNum) * 100)
    : 0;

  const precioOriginalFormateado = tieneOferta
    ? new Intl.NumberFormat("es-AR").format(precioBaseNum)
    : null;

  // --- LÓGICA DINÁMICA DE CUOTAS ---
  const cuotasHabilitadas = config?.cuotas_habilitadas ?? true;
  const cantidadCuotasConfig = config?.cantidad_cuotas ?? 3;
  const porcentajeRecargoConfig = config?.porcentaje_recargo_cuotas ?? 25;
  const montoMinimoCuotas = config?.monto_minimo_cuotas ?? 0;

  const precioProducto = producto.precio || 0;
  const aplicaCuotas = 
    cuotasHabilitadas && 
    producto.permite_cuotas !== false && 
    !sinStock && 
    precioProducto >= montoMinimoCuotas;

  const datosCuotas = calcularCuotas(
    precioProducto, 
    cantidadCuotasConfig, 
    porcentajeRecargoConfig
  );

  const cuotaFormateada = new Intl.NumberFormat("es-AR").format(datosCuotas.montoCuota);

  const handleRestar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cantidadEnCarrito > 1 && actualizarCantidad) {
      actualizarCantidad(producto.id, cantidadEnCarrito - 1);
    } else if (eliminarDelCarrito) {
      eliminarDelCarrito(producto.id);
    } else if (actualizarCantidad) {
      actualizarCantidad(producto.id, 0);
    }
  };

  const handleSumar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!limiteAlcanzado) {
      if (cantidadEnCarrito > 0 && actualizarCantidad) {
        actualizarCantidad(producto.id, cantidadEnCarrito + 1);
      } else if (agregarAlCarrito) {
        (agregarAlCarrito as any)({
          ...producto,
          cantidad: 1,
        });
      }
    }
  };

  const handleToggleFavorito = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorito(producto as any);
  };

 return (
    <div
      onClick={() => onVerDetalle && onVerDetalle(producto)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 sm:p-3.5 shadow-2xs transition-all duration-200 active:scale-[0.97] hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer select-none"
    >
      {/* Badges superiores derechos (% OFF / Últimas Unidades) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1 pointer-events-none">
        {tieneOferta && !sinStock && (
          <span className="rounded-full bg-[#0E6E55] dark:bg-emerald-600 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-white shadow-xs tracking-tight">
            {porcentajeDescuento}% OFF
          </span>
        )}
        {esUltimasUnidades && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-white shadow-xs animate-pulse">
            <Flame className="h-3 w-3" /> Últimas unidades
          </span>
        )}
      </div>

      {/* Badge de Envío Gratis */}
      {esEnvioGratis && !sinStock && (
        <span className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-slate-900 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-xs">
          <Truck className="h-3 w-3" /> Envío gratis
        </span>
      )}

      {/* Imagen del Producto */}
      <div className="relative mb-2.5 aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-center">
        {producto?.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre || 'Producto'}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 dark:text-zinc-600">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>
        )}

        {sinStock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 dark:bg-zinc-950/60 backdrop-blur-[1px]">
            <PackageX className="h-6 w-6 text-white mb-0.5" />
            <span className="rounded-full bg-white/95 dark:bg-zinc-900 px-3 py-1 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-zinc-100 shadow-xs">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Información del Producto */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug tracking-tight">
            {producto?.nombre}
          </h3>
        </div>

        {/* Precios, Cuotas y Stock */}
        <div className="mt-2 mb-2.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              ${precioFormateado}
            </span>
            {tieneOferta && (
              <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 line-through">
                ${precioOriginalFormateado}
              </span>
            )}
          </div>

          {/* Badge dinámico de cuotas con icono Lucide */}
          {aplicaCuotas && (
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 rounded-lg border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/80 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                <CreditCard className="h-3 w-3 shrink-0 stroke-[2.2]" />
                <span>
                  {cantidadCuotasConfig} cuotas fijas de ${cuotaFormateada}
                </span>
              </span>
            </div>
          )}

          <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 mt-1">
            Stock: {producto?.stock ?? 0}
          </p>
        </div>

        {/* Botón Adaptativo estilo App Nativa */}
        {sinStock ? (
          <button
            disabled
            className="w-full py-2.5 px-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed opacity-80"
          >
            Agotado
          </button>
        ) : cantidadEnCarrito === 0 ? (
          <button
            type="button"
            onClick={handleSumar}
            className="w-full py-2.5 px-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-[#0E6E55] dark:bg-emerald-600 text-white hover:bg-[#0b5944] dark:hover:bg-emerald-500 active:scale-[0.96] shadow-2xs cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>Agregar</span>
          </button>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between w-full rounded-2xl border border-[#0E6E55]/30 dark:border-emerald-800/60 bg-[#0E6E55]/10 dark:bg-emerald-950/40 p-1"
          >
            <button
              type="button"
              onClick={handleRestar}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-xl bg-white dark:bg-zinc-800 text-[#0E6E55] dark:text-emerald-400 shadow-2xs hover:bg-[#0E6E55] dark:hover:bg-emerald-600 hover:text-white transition-all active:scale-90 cursor-pointer"
              title="Restar una unidad"
            >
              <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>

            <span className="text-xs font-black text-[#0E6E55] dark:text-emerald-400 px-1">
              {cantidadEnCarrito} en carrito
            </span>

            <button
              type="button"
              onClick={handleSumar}
              disabled={limiteAlcanzado}
              className={`flex h-7.5 w-7.5 items-center justify-center rounded-xl transition-all active:scale-90 ${
                limiteAlcanzado
                  ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                  : 'bg-[#0E6E55] dark:bg-emerald-600 text-white hover:bg-[#0b5944] dark:hover:bg-emerald-500 cursor-pointer shadow-2xs'
              }`}
              title={
                limiteAlcanzado
                  ? 'Stock máximo alcanzado'
                  : 'Sumar una unidad'
              }
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}