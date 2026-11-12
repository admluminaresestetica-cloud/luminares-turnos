'use client';

import React from "react";
import { motion } from "framer-motion";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";
import { useFavoritos } from "@/context/FavoritosContext";
import { useConfig } from "@/context/ConfigContext";
import { calcularCuotas } from "@/lib/precios";
import { Heart, Flame, Truck, ShoppingCart, Minus, Plus, ShoppingBag, PackageX, CreditCard } from "lucide-react";

interface TarjetaProductoProps {
  producto: Producto & {
    permite_cuotas?: boolean;
    mostrar_ultimas_unidades?: boolean;
    ultimas_unidades?: boolean;
    envio_gratis?: boolean;
  };
  onVerDetalle?: (producto: Producto) => void;
}

const springTap = { type: "spring" as const, stiffness: 420, damping: 20 };

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
    <motion.div
      onClick={() => onVerDetalle && onVerDetalle(producto)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className="group relative flex cursor-pointer select-none flex-col justify-between overflow-hidden rounded-3xl border border-border bg-white p-2.5 shadow-lg shadow-black/5 transition-colors hover:border-primary/30 dark:bg-zinc-900 dark:shadow-black/20 sm:p-3.5"
    >
      {/* Botón Flotante de Favoritos (Esquina Superior Izquierda) */}
      <motion.button
        type="button"
        onClick={handleToggleFavorito}
        whileTap={{ scale: 0.85 }}
        transition={springTap}
        className="absolute left-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-white/80 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-zinc-800/80 dark:shadow-black/20"
        title={esFav ? "Quitar de favoritos" : "Guardar en favoritos"}
        aria-label={esFav ? "Quitar de favoritos" : "Guardar en favoritos"}
      >
        <motion.span
          key={esFav ? "fav" : "no-fav"}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 16 }}
          className="flex items-center justify-center"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              esFav ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-foreground"
            }`}
          />
        </motion.span>
      </motion.button>

      {/* Badges superiores derechos (% OFF / Últimas Unidades) */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-1">
        {tieneOferta && !sinStock && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-extrabold tracking-tight text-primary-foreground shadow-lg shadow-primary/20 sm:text-[11px]">
            {porcentajeDescuento}% OFF
          </span>
        )}
        {esUltimasUnidades && (
          <span className="flex animate-pulse items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-lg shadow-amber-500/20 sm:text-[11px]">
            <Flame className="h-3 w-3" /> Últimas unidades
          </span>
        )}
      </div>

      {/* Badge de Envío Gratis */}
      {esEnvioGratis && !sinStock && (
        <span className="absolute left-3 top-12 z-10 flex items-center gap-1 rounded-full border border-border bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-foreground shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-zinc-800/80 dark:shadow-black/20 sm:text-[11px]">
          <Truck className="h-3 w-3" /> Envío gratis
        </span>
      )}

      {/* Imagen del Producto o Icono Lucide por defecto */}
      <div className="relative mb-2.5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-zinc-800/60">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 dark:text-zinc-600">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>
        )}

        {sinStock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 backdrop-blur-[2px] dark:bg-zinc-950/60">
            <PackageX className="mb-0.5 h-6 w-6 text-white" />
            <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-slate-900 shadow-lg shadow-black/10 dark:bg-zinc-900 dark:text-zinc-100 sm:text-[11px]">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Información del Producto */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-bold leading-snug tracking-tight text-foreground sm:text-sm">
            {producto.nombre}
          </h3>
        </div>

        {/* Precios, Cuotas y Stock (Estructura de altura uniforme) */}
        <div className="mb-2.5 mt-2 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-base font-black tracking-tight text-foreground sm:text-lg">
                ${precioFormateado}
              </span>
              {tieneOferta && (
                <span className="text-[11px] font-medium text-muted-foreground line-through">
                  ${precioOriginalFormateado}
                </span>
              )}
            </div>

            {/* Contenedor con altura reservada para cuotas (evita saltos si no tiene cuotas) */}
            <div className="mt-1 flex min-h-[24px] items-center">
              {aplicaCuotas ? (
                <span className="inline-flex items-center gap-1 rounded-xl border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <CreditCard className="h-3 w-3 shrink-0 stroke-[2.2]" />
                  <span>{cantidadCuotasConfig} cuotas fijas de ${cuotaFormateada}</span>
                </span>
              ) : null}
            </div>
          </div>

          <p className="mt-2 text-[10px] font-medium text-muted-foreground">
            Stock: {producto.stock}
          </p>
        </div>

        {/* Botón Adaptativo estilo App Nativa (Siempre alineado abajo) */}
        {sinStock ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-2xl bg-muted px-2 py-2.5 text-xs font-bold text-muted-foreground opacity-80"
          >
            Agotado
          </button>
        ) : cantidadEnCarrito === 0 ? (
          <motion.button
            type="button"
            onClick={handleSumar}
            whileTap={{ scale: 0.95 }}
            transition={springTap}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-primary px-2 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            <ShoppingCart className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>Agregar</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 p-1"
          >
            <motion.button
              type="button"
              onClick={handleRestar}
              whileTap={{ scale: 0.88 }}
              transition={springTap}
              className="flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-xl bg-white text-primary shadow-lg shadow-black/5 transition-colors hover:bg-primary hover:text-primary-foreground dark:bg-zinc-800 dark:shadow-black/20"
              title="Restar una unidad"
              aria-label="Restar una unidad"
            >
              <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
            </motion.button>

            <motion.span
              key={cantidadEnCarrito}
              initial={{ scale: 0.85, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              className="px-1 text-xs font-black text-primary"
            >
              {cantidadEnCarrito} en carrito
            </motion.span>

            <motion.button
              type="button"
              onClick={handleSumar}
              disabled={limiteAlcanzado}
              whileTap={limiteAlcanzado ? undefined : { scale: 0.88 }}
              transition={springTap}
              className={`flex h-7.5 w-7.5 items-center justify-center rounded-xl transition-colors ${
                limiteAlcanzado
                  ? "cursor-not-allowed bg-muted text-muted-foreground/50"
                  : "cursor-pointer bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
              }`}
              title={limiteAlcanzado ? "Stock máximo alcanzado" : "Sumar una unidad"}
              aria-label={limiteAlcanzado ? "Stock máximo alcanzado" : "Sumar una unidad"}
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}