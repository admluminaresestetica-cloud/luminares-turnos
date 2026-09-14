"use client";
import { useState } from "react";
import ScannerModal from "../ScannerModal";
import { FileText } from "lucide-react";

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
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      {/* Buscador global */}
      <div className="relative flex-1">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto por nombre, categoría o código..."
          className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] py-2.5 pl-10 pr-10 text-sm font-medium text-[#12151B] outline-none transition-all placeholder:text-gray-400 focus:border-[#0E6E55]"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Botones de acción rápido */}
      <div className="flex items-center gap-2">
        {onAbrirHistorial && (
          <button
            type="button"
            onClick={onAbrirHistorial}
            className="flex items-center gap-1.5 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-3.5 py-2.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-100 active:scale-95"
            title="Ver Historial de Ventas del Día"
          >
            <FileText className="h-4 w-4 text-[#0E6E55]" />
            <span>Historial</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#12151B] px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#2C323E]"
        >
          📷 Escanear
        </button>

        {onAbrirCajaModal && (
          <button
            type="button"
            onClick={onAbrirCajaModal}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
              cajaAbierta
                ? "border-[#0E6E55]/30 bg-[#0E6E55]/10 text-[#0E6E55]"
                : "border-[#C84343]/30 bg-[#C84343]/10 text-[#C84343]"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${cajaAbierta ? "bg-[#0E6E55]" : "bg-[#C84343]"}`} />
            {cajaAbierta ? "Caja Abierta" : "Caja Cerrada"}
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
