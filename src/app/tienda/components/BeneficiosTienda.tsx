'use client';

import React from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, CreditCard, MessageCircle } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export default function BeneficiosTienda() {
  const { config } = useConfig();

  // Limpieza y resguardo del número de WhatsApp
  const rawNumber = config?.whatsapp_numero || "5493413954355";
  const numeroTelefono = rawNumber.replace(/[^0-9]/g, "") || "5493413954355";
  const mensajePredeterminado = encodeURIComponent("¡Hola! Tengo una consulta sobre la tienda.");
  const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajePredeterminado}`;

  const beneficios = [
    {
      icon: Truck,
      titulo: "Envíos a domicilio",
      sub: "En toda la zona",
    },
    {
      icon: ShieldCheck,
      titulo: "Pagos seguros",
      sub: "Datos protegidos",
    },
    {
      icon: CreditCard,
      titulo: "Cuotas / Transferencia",
      sub: "Elegí cómo pagar",
    },
  ];

  const entrada = (index: number) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring" as const, stiffness: 320, damping: 28, delay: index * 0.06 },
  });

  return (
    <section className="no-scrollbar mb-4 w-full snap-x snap-mandatory overflow-x-auto px-0.5 py-2">
      <div className="flex min-w-max items-stretch gap-2.5 sm:grid sm:min-w-0 sm:grid-cols-4">
        {beneficios.map(({ icon: Icon, titulo, sub }, index) => (
          <motion.div
            key={titulo}
            {...entrada(index)}
            className="flex w-[190px] shrink-0 select-none snap-start items-center gap-2.5 rounded-2xl border border-border bg-white px-3.5 py-3 shadow-lg shadow-black/5 dark:bg-zinc-900 dark:shadow-black/20 sm:w-auto"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-xs font-bold tracking-tight text-slate-900 dark:text-zinc-100">{titulo}</p>
              <p className="m-0 truncate text-[10px] font-medium text-slate-500 dark:text-zinc-400">{sub}</p>
            </div>
          </motion.div>
        ))}

        {/* Tarjeta interactiva de WhatsApp */}
        <motion.a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          {...entrada(beneficios.length)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="group flex w-[190px] shrink-0 cursor-pointer select-none snap-start items-center gap-2.5 rounded-2xl border border-[#25D366]/30 bg-white px-3.5 py-3 shadow-lg shadow-[#25D366]/10 transition-colors hover:bg-[#25D366]/5 dark:border-emerald-800/40 dark:bg-zinc-900 dark:shadow-black/20 dark:hover:bg-emerald-950/30 sm:w-auto"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C4A] transition-colors group-hover:bg-[#25D366] group-hover:text-white dark:bg-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-500 dark:group-hover:text-zinc-950">
            <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-xs font-bold tracking-tight text-slate-900 dark:text-zinc-100">Atención por WhatsApp</p>
            <p className="m-0 truncate text-[10px] font-medium text-[#128C4A] dark:text-emerald-400">Escribinos ahora</p>
          </div>
        </motion.a>
      </div>
    </section>
  );
}