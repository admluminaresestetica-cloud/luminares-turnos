"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedireccionarTienda({ productoId }: { productoId: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/tienda?producto=${productoId}`);
  }, [productoId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0E6E55] border-t-transparent" />
        <p className="text-sm font-medium text-[#6B675F]">Cargando producto en la tienda...</p>
      </div>
    </div>
  );
}