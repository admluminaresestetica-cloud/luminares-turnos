"use client";

import { useState } from "react";
import ScannerModal from "./ScannerModal";

interface PuntoVentaTabProps {
  productos: any[];
  supabase: any;
  onActualizarProductos: () => void;
}

export default function PuntoVentaTab({ productos, supabase, onActualizarProductos }: PuntoVentaTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cantidad, setCantidad] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleScanCode = (code: string) => {
    const found = productos.find((p) => p.codigo_barras === code);
    if (found) {
      setSelectedProduct(found);
    } else {
      alert(`No se encontró ningún producto con el código: ${code}`);
    }
  };

  const handleAjustarStock = async (modo: "venta" | "restock") => {
    if (!selectedProduct) return;
    const num = Number(cantidad);
    if (isNaN(num) || num <= 0) return;

    setLoading(true);
    const stockActual = Number(selectedProduct.stock) || 0;
    const nuevoStock = modo === "venta" ? Math.max(0, stockActual - num) : stockActual + num;

    const { error } = await supabase
      .from("productos")
      .update({ stock: nuevoStock })
      .eq("id", selectedProduct.id);

    if (error) {
      alert("Error al actualizar el stock: " + error.message);
    } else {
      alert(`Stock actualizado correctamente. Nuevo stock: ${nuevoStock}`);
      setSelectedProduct({ ...selectedProduct, stock: nuevoStock });
      onActualizarProductos();
    }
    setLoading(false);
  };

  const productosStockBajo = productos.filter(
    (p) => Number(p.stock) <= (Number(p.stock_minimo) || 5)
  );

  return (
    <div className="space-y-6">
      {/* Sección Escáner POS */}
      <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#12151B]">🛒 Punto de Venta / Escaneo Rápido</h2>
            <p className="text-xs text-[#6B675F]">Escanéa con la cámara o pasa el producto por el lector USB.</p>
          </div>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0E6E55] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0A5340]"
          >
            📷 Abrir Lector
          </button>
        </div>

        {selectedProduct && (
          <div className="mt-6 rounded-xl border border-[#0E6E55]/30 bg-[#E6F4F1]/40 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0E6E55]">CÓDIGO: {selectedProduct.codigo_barras}</span>
                <h3 className="text-base font-bold text-[#12151B]">{selectedProduct.nombre}</h3>
                <p className="text-xs font-bold text-[#12151B]">Precio: ${selectedProduct.precio} | Stock actual: {selectedProduct.stock}</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-16 rounded-lg border border-[#E7E5E0] p-2 text-center text-xs font-bold"
                  min="1"
                />
                <button
                  onClick={() => handleAjustarStock("venta")}
                  disabled={loading}
                  className="rounded-lg bg-[#C84343] px-3 py-2 text-xs font-bold text-white hover:bg-[#A33434]"
                >
                  Descontar Venta
                </button>
                <button
                  onClick={() => handleAjustarStock("restock")}
                  disabled={loading}
                  className="rounded-lg bg-[#0E6E55] px-3 py-2 text-xs font-bold text-white hover:bg-[#0A5340]"
                >
                  Sumar Stock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alertas de Stock Bajo */}
      <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#12151B]">⚠️ Alertas de Stock Bajo ({productosStockBajo.length})</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {productosStockBajo.map((p) => (
            <div key={p.id} className="rounded-xl border border-[#F87171]/30 bg-[#FEF2F2] p-3">
              <h4 className="text-xs font-bold text-[#12151B]">{p.nombre}</h4>
              <p className="text-[11px] font-medium text-[#C84343]">
                Stock: {p.stock} (Mínimo: {p.stock_minimo ?? 5})
              </p>
            </div>
          ))}
        </div>
      </div>

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanCode}
      />
    </div>
  );
}