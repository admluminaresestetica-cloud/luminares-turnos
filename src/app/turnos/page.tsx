"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TurnosRedirectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    } else {
      router.replace("/");
    }
  }, [isAdmin, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center text-slate-800 font-sans">
      <div className="w-8 h-8 border-3 border-[#2d5747] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-xs font-bold tracking-widest uppercase text-stone-500 dark:text-zinc-400">
        Redirigiendo...
      </p>
    </div>
  );
}

export default function TurnosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#2d5747] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TurnosRedirectionContent />
    </Suspense>
  );
}
