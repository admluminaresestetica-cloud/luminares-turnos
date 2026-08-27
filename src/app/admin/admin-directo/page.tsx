"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDirecto() {
  const router = useRouter();

  useEffect(() => {
    // Redirige inmediatamente al panel de administración
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#024128] flex flex-col items-center justify-center text-white">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-light tracking-widest uppercase">Abriendo Administrador...</p>
    </div>
  );
}