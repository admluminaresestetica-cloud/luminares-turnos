"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, CameraOff } from "lucide-react";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export default function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Escuchar entrada de teclado USB / Lector de código de barras
  useEffect(() => {
    if (!isOpen) return;

    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = "";
      }
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (buffer.length >= 3) {
          onScan(buffer);
          onClose();
        }
        buffer = "";
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onScan, onClose]);

  // Manejar cámara con html5-qrcode
  useEffect(() => {
    if (isOpen && cameraActive) {
      const html5Qrcode = new Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      html5Qrcode
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            onScan(decodedText);
            stopCamera();
            onClose();
          },
          () => {}
        )
        .catch((err) => {
          console.error("Error al iniciar cámara:", err);
          setCameraActive(false);
        });
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, cameraActive]);

  const stopCamera = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => scannerRef.current?.clear());
    }
  };

  const handleClose = () => {
    stopCamera();
    setCameraActive(false);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 pb-20 sm:pb-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Handle de arrastre para móviles */}
        <div className="sm:hidden w-12 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#0E6E55] dark:text-emerald-400" /> Escanear Código
          </h3>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {!cameraActive ? (
            <button
              onClick={() => setCameraActive(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E6E55] py-3 text-xs font-bold text-white transition-all hover:bg-[#0A5340] active:scale-95 shadow-md"
            >
              <Camera className="h-4 w-4" /> Activar Cámara
            </button>
          ) : (
            <div>
              <div id="reader" className="overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800"></div>
              <button
                onClick={() => {
                  stopCamera();
                  setCameraActive(false);
                }}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 transition-all active:scale-95"
              >
                <CameraOff className="h-4 w-4" /> Detener Cámara
              </button>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="border-t border-gray-100 dark:border-zinc-800 pt-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
              Ingreso Manual / Probar Lector USB
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Código de barras..."
                className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0E6E55]"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-xl bg-[#12151B] dark:bg-zinc-100 px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-900 hover:bg-black active:scale-95 transition-all"
              >
                Usar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}