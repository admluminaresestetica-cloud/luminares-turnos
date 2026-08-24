"use client";
export default function CarritoModal({ carrito, onClose, onEliminar, onEnviar }: any) {
    const total = carrito.reduce(
    (acc: number, p: any) => acc + Number(p.precio) * (p.cantidad || 1),
    0
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-end bg-[#0B0F14]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[420px] flex-col bg-white shadow-[-20px_0_50px_rgba(11,15,20,0.15)] animate-[slideIn_0.3s_ease-out]"
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-[#E7E5E0] px-6 py-5">
          <h2
            className="m-0 text-lg font-bold text-[#12151B]"
            style={{ fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" }}
          >
            Tu carrito de compras
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F0EC] text-[#6B675F] transition-colors hover:bg-[#E7E5E0]"
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-[#A6A29B]">
              <span className="text-4xl">🛒</span>
              <p className="mt-3 text-[15px]">Tu carrito está vacío.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {carrito.map((p: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-3"
                >
                <div className="pr-3">
                    <p className="m-0 text-sm font-semibold text-[#12151B]">
                      {p.nombre} {p.cantidad > 1 && <span className="text-xs text-[#6B675F]">(x{p.cantidad})</span>}
                    </p>
                    <p className="m-0 mt-1 text-sm font-bold text-[#0E6E55]">
                      ${Number(p.precio) * (p.cantidad || 1)}
                    </p>
                  </div>
                  <button
                    onClick={() => onEliminar(index)}
                    className="shrink-0 rounded-lg bg-[#FBE7E7] px-3 py-1.5 text-xs font-semibold text-[#D14343] transition-colors hover:bg-[#F5D0D0]"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total y checkout */}
        {carrito.length > 0 && (
          <div className="border-t border-[#E7E5E0] px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#12151B]">Total a pagar</span>
              <span
                className="text-xl font-bold text-[#12151B]"
                style={{ fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" }}
              >
                ${total}
              </span>
            </div>
            <button
              onClick={onEnviar}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-[15px] font-bold text-white shadow-[0_10px_25px_-8px_rgba(37,211,102,0.6)] transition-transform hover:brightness-95 active:scale-[0.98]"
            >
              📲 Finalizar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}