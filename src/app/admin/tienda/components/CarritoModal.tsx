"use client";

export default function CarritoModal({ carrito, onClose, onEliminar, onEnviar }: any) {
  const total = carrito.reduce((acc: number, p: any) => acc + Number(p.precio), 0);

  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "90%", maxWidth: "400px", background: "white", height: "100%", padding: "24px", display: "flex", flexDirection: "column", boxShadow: "-5px 0 15px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Tu Pedido</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #eee", paddingTop: "15px" }}>
          {carrito.length === 0 ? <p>Tu carrito está vacío.</p> : carrito.map((p: any, index: number) => (
            <div key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "600" }}>{p.nombre}</p>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>${p.precio}</p>
              </div>
              <button onClick={() => onEliminar(index)} style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>Eliminar</button>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "2px solid #eee", paddingTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
            <span>Total:</span>
            <span>${total}</span>
          </div>
          <button onClick={onEnviar} style={{ width: "100%", padding: "15px", background: "#25D366", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
            Confirmar Pedido por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}