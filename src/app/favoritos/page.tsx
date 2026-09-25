'use client';

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useFavoritos } from "@/context/FavoritosContext";
import { useCarrito } from "@/context/CarritoContext";

// Componente individual para gestionar el gesto de swipe en cada tarjeta
function TarjetaFavorito({
  producto,
  onRemove,
  onAddToCart,
}: {
  producto: any;
  onRemove: (id: string | number) => void;
  onAddToCart: (producto: any) => void;
}) {
  const x = useMotionValue(0);
  // Cambia la opacidad de la tarjeta mientras se desplaza
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    // Si se desliza más de 100px a la derecha o izquierda, lo elimina
    if (Math.abs(info.offset.x) > 100) {
      onRemove(producto.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Fondo con tacho de basura que se revela al deslizar */}
      <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-between px-6 text-white font-bold">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          <span className="text-xs">Eliminar</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Eliminar</span>
          <Trash2 className="w-5 h-5" />
        </div>
      </div>

      {/* Tarjeta arrastrable */}
      <motion.div
        style={{ x, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm flex flex-col justify-between relative z-10 touch-pan-y"
      >
        <div>
          {/* Imagen */}
          <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-50 mb-3 border border-gray-100 flex items-center justify-center pointer-events-none select-none">
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <span className="text-3xl">🛍️</span>
            )}
          </div>

          {/* Info */}
          <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1 select-none">
            {producto.nombre}
          </h3>
          <p className="text-base font-extrabold text-[#0E6E55] mb-3 select-none">
            ${Number(producto.precio || 0).toLocaleString("es-AR")}
          </p>
        </div>

        {/* Acciones */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(producto);
          }}
          className="w-full bg-[#0E6E55] hover:bg-[#0b5643] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm relative z-20"
        >
          <ShoppingBag className="w-4 h-4" />
          Agregar al Carrito
        </button>
      </motion.div>
    </div>
  );
}

export default function FavoritosPage() {
  const { favoritos, quitarFavorito, limpiarFavoritos } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 pt-4 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/tienda"
            className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              Mis Favoritos
            </h1>
            {favoritos.length > 0 && (
              <p className="text-[11px] text-gray-400">
                Deslizá una tarjeta a un lado para quitarla
              </p>
            )}
          </div>
        </div>

        {favoritos.length > 0 && (
          <button
            onClick={limpiarFavoritos}
            className="text-xs font-semibold text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Vaciar lista
          </button>
        )}
      </div>

      {/* Contenido */}
      {favoritos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-400">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800">
              No tenés productos guardados
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Tocá el ícono del corazón en los productos de la tienda para guardarlos aquí.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 bg-[#0E6E55] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0b5643] transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar Tienda
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favoritos.map((producto) => (
            <TarjetaFavorito
              key={producto.id}
              producto={producto}
              onRemove={quitarFavorito}
              onAddToCart={agregarAlCarrito}
            />
          ))}
        </div>
      )}
    </div>
  );
}