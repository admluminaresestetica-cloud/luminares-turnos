"use client";
import { useState } from "react";
import PosHeader from "./PosHeader";
import PosGridProductos from "./PosGridProductos";
import PosCarrito from "./PosCarrito";
import ModalCobro from "./ModalCobro";
import TicketVenta from "./TicketVenta"; // 1. Importamos el ticket
import { ProductoPOS, PosCartItem } from "./types";

interface PuntoVentaTabProps {
  productos: ProductoPOS[];
  supabase: any;
  onActualizarProductos: () => void;
}

export default function PuntoVentaTab({
  productos,
  supabase,
  onActualizarProductos,
}: PuntoVentaTabProps) {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<PosCartItem[]>([]);
  
  // Estado para el Modal de Cobro
  const [isModalCobroOpen, setIsModalCobroOpen] = useState(false);
  const [datosCobro, setDatosCobro] = useState({ subtotal: 0, descuentoCalculado: 0, totalFinal: 0 });

  // 2. Estados para controlar la visualización del Ticket
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [datosTicket, setDatosTicket] = useState<{
    pedidoId: string;
    items: PosCartItem[];
    total: number;
    metodoPago: string;
    pagoCon: number;
    vuelto: number;
    nombreCliente: string;
  } | null>(null);

  const handleAgregarAlCarrito = (prod: ProductoPOS) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto_id === prod.id);
      if (existe) {
        if (existe.cantidad >= prod.stock) return prev;
        return prev.map((item) =>
          item.producto_id === prod.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          producto_id: prod.id,
          titulo: prod.nombre,
          precio_unitario: prod.precio,
          cantidad: 1,
          imagen_url: prod.imagen_url,
          stock_disponible: prod.stock,
        },
      ];
    });
  };

  const handleBarcodeScanned = (code: string) => {
    const encontrado = productos.find((p) => p.codigo_barras === code.trim());
    if (encontrado) {
      handleAgregarAlCarrito(encontrado);
    } else {
      alert(`No se encontró ningún producto con el código: ${code}`);
    }
  };

  const handleModificarCantidad = (productoId: number, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.producto_id === productoId) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter(Boolean) as PosCartItem[]
    );
  };

  const handleEliminarItem = (productoId: number) => {
    setCarrito((prev) => prev.filter((item) => item.producto_id !== productoId));
  };

  const handleIniciarCobro = (subtotal: number, descuentoCalculado: number, totalFinal: number) => {
    setDatosCobro({ subtotal, descuentoCalculado, totalFinal });
    setIsModalCobroOpen(true);
  };

  // 3. Recibe la info del pedido completado desde ModalCobro
  const handleVentaExitosa = (infoTicket: {
    pedidoId: string;
    items: PosCartItem[];
    total: number;
    metodoPago: string;
    pagoCon: number;
    vuelto: number;
    nombreCliente: string;
  }) => {
    setDatosTicket(infoTicket);
    setIsTicketOpen(true); // Abre el modal del ticket
    setCarrito([]); // Vacía el carrito
    onActualizarProductos(); // Refresca el stock real en pantalla
  };

  return (
    <div className="flex flex-col gap-4">
      <PosHeader
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onBarcodeScanned={handleBarcodeScanned}
        totalItemsCarrito={carrito.reduce((acc, i) => acc + i.cantidad, 0)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PosGridProductos
            productos={productos}
            busqueda={busqueda}
            onAgregarAlCarrito={handleAgregarAlCarrito}
          />
        </div>

        <div className="lg:col-span-1">
          <PosCarrito
            carrito={carrito}
            onModificarCantidad={handleModificarCantidad}
            onEliminarItem={handleEliminarItem}
            onVaciarCarrito={() => setCarrito([])}
            onIniciarCobro={handleIniciarCobro}
          />
        </div>
      </div>

      {/* Modal de Cobro */}
      <ModalCobro
        isOpen={isModalCobroOpen}
        onClose={() => setIsModalCobroOpen(false)}
        carrito={carrito}
        subtotal={datosCobro.subtotal}
        descuentoCalculado={datosCobro.descuentoCalculado}
        totalFinal={datosCobro.totalFinal}
        supabase={supabase}
        onVentaExitosa={handleVentaExitosa}
      />

      {/* 4. Modal de Comprobante / Ticket de Venta */}
      {datosTicket && (
        <TicketVenta
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
          pedidoId={datosTicket.pedidoId}
          items={datosTicket.items}
          total={datosTicket.total}
          metodoPago={datosTicket.metodoPago}
          pagoCon={datosTicket.pagoCon}
          vuelto={datosTicket.vuelto}
          nombreCliente={datosTicket.nombreCliente}
        />
      )}
    </div>
  );
}