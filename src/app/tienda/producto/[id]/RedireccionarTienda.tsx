"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedireccionarTienda({ productoId }: { productoId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Redirige al cliente a la tienda con el producto seleccionado en la URL
    router.replace(`/tienda?producto=${productoId}`);
  }, [productoId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600">Cargando producto en la tienda...</p>
      </div>
    </div>
  );
}
