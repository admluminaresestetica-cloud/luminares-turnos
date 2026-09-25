'use client';

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useFavoritos } from "@/context/FavoritosContext";
import { useCarrito } from "@/context/CarritoContext";

export default function FavoritosPage() {
  const { favoritos, quitarFavorito, limpiarFavoritos } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 pt-4 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header de la sección */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/tienda"
            className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            Mis Favoritos
          </h1>
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
              Tocá el ícono del corazón en los productos de la tienda para guardarlos aquí y tenerlos siempre a mano.
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
            <div
              key={producto.id}
              className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm flex flex-col justify-between relative group"
            >
              {/* Botón Quitar Favorito Individual */}
              <button
                onClick={() => quitarFavorito(producto.id)}
                className="absolute top-5 right-5 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:scale-110 active:scale-95 transition-transform"
                title="Quitar de favoritos"
              >
                <Heart className="w-4 h-4 fill-red-500" />
              </button>

              <div>
                {/* Imagen */}
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-50 mb-3 border border-gray-100 flex items-center justify-center">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-3xl">🛍️</span>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                  {producto.nombre}
                </h3>
                <p className="text-base font-extrabold text-[#0E6E55] mb-3">
                  ${Number(producto.precio || 0).toLocaleString("es-AR")}
                </p>
              </div>

              {/* Acciones */}
              <button
                onClick={() => agregarAlCarrito(producto)}
                className="w-full bg-[#0E6E55] hover:bg-[#0b5643] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Agregar al Carrito
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
