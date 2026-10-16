"use client";

import { useState } from "react";
import ScannerModal from "../ScannerModal";
import { Search, X, Camera, FileText } from "lucide-react";

interface PosHeaderProps {
  busqueda: string;
  setBusqueda: (v: string) => void;
  onBarcodeScanned: (code: string) => void;
  totalItemsCarrito: number;
  onAbrirCajaModal?: () => void;
  cajaAbierta?: boolean;
  onAbrirHistorial?: () => void;
}

export default function PosHeader({
  busqueda,
  setBusqueda,
  onBarcodeScanned,
  totalItemsCarrito,
  onAbrirCajaModal,
  cajaAbierta = true,
  onAbrirHistorial,
}: PosHeaderProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 shadow-xs transition-colors sm:flex-row sm:items-center sm:justify-between">
      {/* Buscador global */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto por nombre, categoría o código..."
          className="w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800/80 py-2.5 pl-10 pr-10 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Botones de acción rápido */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {onAbrirHistorial && (
          <button
            type="button"
            onClick={onAbrirHistorial}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 cursor-pointer"
            title="Ver Historial de Ventas del Día"
          >
            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Historial</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-zinc-100 px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-900 transition-all hover:bg-slate-800 dark:hover:bg-zinc-200 active:scale-95 cursor-pointer shadow-xs"
        >
          <Camera className="h-4 w-4" />
          <span>Escanear</span>
        </button>

        {onAbrirCajaModal && (
          <button
            type="button"
            onClick={onAbrirCajaModal}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              cajaAbierta
                ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                : "border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                cajaAbierta ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span>{cajaAbierta ? "Caja Abierta" : "Caja Cerrada"}</span>
          </button>
        )}
      </div>

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => {
          onBarcodeScanned(code);
          setIsScannerOpen(false);
        }}
      />
    </div>
  );
}