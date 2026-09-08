'use client';

import React from "react";

export default function ProductoSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white p-3 shadow-sm animate-pulse h-full justify-between">
      {/* 1. Silueta de la imagen del producto */}
      <div className="relative aspect-square w-full rounded-xl bg-[#EBE9E4] mb-3" />

      {/* 2. Silueta de la información (Categoría, Título y Precio) */}
      <div className="flex flex-col gap-2 flex-grow justify-between">
        <div className="space-y-1.5">
          {/* Categoría */}
          <div className="h-3 w-1/3 rounded-md bg-[#EBE9E4]" />
          {/* Título (2 líneas) */}
          <div className="h-4 w-full rounded-md bg-[#EBE9E4]" />
          <div className="h-4 w-2/3 rounded-md bg-[#EBE9E4]" />
        </div>

        {/* Precio y botón de agregar */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#F2F1EC]">
          <div className="h-5 w-1/2 rounded-md bg-[#EBE9E4]" />
          <div className="h-8 w-8 rounded-full bg-[#EBE9E4]" />
        </div>
      </div>
    </div>
  );
}