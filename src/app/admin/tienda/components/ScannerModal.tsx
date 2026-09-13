"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
          <h3 className="text-base font-bold text-[#12151B]">📷 Escanear Código de Barras</h3>
          <button onClick={handleClose} className="text-xs font-semibold text-[#6B675F] hover:text-[#12151B]">
            ✕ Cerrar
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {!cameraActive ? (
            <button
              onClick={() => setCameraActive(true)}
              className="w-full rounded-xl bg-[#0E6E55] py-3 text-xs font-bold text-white transition-all hover:bg-[#0A5340]"
            >
              🎥 Activar Cámara
            </button>
          ) : (
            <div>
              <div id="reader" className="overflow-hidden rounded-xl border border-[#E7E5E0]"></div>
              <button
                onClick={() => {
                  stopCamera();
                  setCameraActive(false);
                }}
                className="mt-2 w-full rounded-xl bg-[#FEF2F2] py-2 text-xs font-semibold text-[#C84343]"
              >
                Detener Cámara
              </button>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="border-t border-[#E7E5E0] pt-4">
            <label className="block text-xs font-medium text-[#6B675F]">Ingreso Manual / Probar Lector USB</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Código de barras..."
                className="flex-1 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-2.5 text-xs outline-none focus:border-[#0E6E55]"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-xl bg-[#12151B] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#2C323E]"
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