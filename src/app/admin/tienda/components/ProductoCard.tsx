"use client";

interface ProductoCardProps {
  producto: any;
  onAgregar: (p: any) => void;
}

export default function ProductoCard({ producto, onAgregar }: ProductoCardProps) {
  const tieneOferta = producto.precio_original && producto.precio_original > producto.precio;
  
  // Calcular porcentaje de descuento automático
  const descuento = tieneOferta 
    ? Math.round(((producto.precio_original - producto.precio) / producto.precio_original) * 100) 
    : 0;

  return (
    <div style={{ 
      background: "#ffffff", 
      border: "1px solid #e5e7eb", 
      borderRadius: "12px", 
      overflow: "hidden", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "space-between",
      transition: "all 0.2s ease-in-out",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
    }}>
      <div>
        {/* Contenedor de la Imagen con la etiqueta de oferta */}
        <div style={{ position: "relative", width: "100%", height: "180px", background: "#f3f4f6" }}>
          {producto.imagen_url ? (
            <img 
              src={producto.imagen_url} 
              alt={producto.nombre} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: "14px" }}>
              Sin imagen
            </div>
          )}
          
          {tieneOferta && (
            <span style={{ 
              position: "absolute", 
              top: "10px", 
              left: "10px", 
              background: "#16a34a", 
              color: "white", 
              padding: "4px 8px", 
              borderRadius: "6px", 
              fontSize: "12px", 
              fontWeight: "bold" 
            }}>
              {descuento}% OFF
            </span>
          )}
        </div>

        {/* Información del producto */}
        <div style={{ padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {producto.categoria}
          </span>
          <h3 style={{ margin: "4px 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
            {producto.nombre}
          </h3>
          <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#4b5563", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {producto.descripcion}
          </p>

          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>
              ${producto.precio}
            </span>
            {tieneOferta && (
              <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "13px" }}>
                ${producto.precio_original}
              </span>
            )}
          </div>
          
          <div style={{ fontSize: "12px", color: producto.stock > 0 ? "#059669" : "#dc2626", fontWeight: "500" }}>
            {producto.stock > 0 ? `Stock disponible: ${producto.stock}` : "Sin stock"}
          </div>
        </div>
      </div>

      {/* Botón de compra */}
      <div style={{ padding: "0 16px 16px 16px" }}>
        <button 
          onClick={() => onAgregar(producto)}
          disabled={producto.stock <= 0}
          style={{ 
            width: "100%", 
            background: producto.stock > 0 ? "#2563eb" : "#9ca3af", 
            color: "white", 
            border: "none", 
            padding: "10px", 
            borderRadius: "8px", 
            cursor: producto.stock > 0 ? "pointer" : "not-allowed", 
            fontWeight: "600",
            fontSize: "14px",
            transition: "background 0.2s"
          }}
        >
          {producto.stock > 0 ? "Agregar al carrito" : "Agotado"}
        </button>
      </div>
    </div>
  );
}