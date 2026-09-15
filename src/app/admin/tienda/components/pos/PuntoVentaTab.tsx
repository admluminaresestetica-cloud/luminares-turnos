"use client";
import { useState, useEffect } from "react";
import PosHeader from "./PosHeader";
import PosGridProductos from "./PosGridProductos";
import PosCarrito from "./PosCarrito";
import ModalCobro from "./ModalCobro";
import TicketVenta from "./TicketVenta";
import ModalHistorialVentas from "./ModalHistorialVentas";
import { ProductoPOS, PosCartItem } from "./types";
import { Keyboard, X, Info } from "lucide-react";

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

  // Estados para controlar la visualización del Ticket
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [datosTicket, setDatosTicket] = useState<{
    pedidoId: string | null;
    items: PosCartItem[];
    subtotalInicial?: number;
    descuentoMonto?: number;
    recargoMonto?: number;
    total: number;
    metodoPago: string;
    pagoCon: number;
    vuelto: number;
    nombreCliente: string;
  } | null>(null);

  // Estado para Modal de Historial de Ventas del Día
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);

  // Estado para Pop-up / Modal de Atajos de Teclado
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // --------------------------------------------------------
  // LÓGICA DE AGREGAR AL CARRITO
  // --------------------------------------------------------
  const handleAgregarAlCarrito = (prod: ProductoPOS) => {
    if (prod.stock <= 0) {
      alert(`El producto "${prod.nombre}" no tiene stock disponible.`);
      return;
    }

    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto_id === prod.id);
      if (existe) {
        if (existe.cantidad >= prod.stock) {
          alert(`Límite de stock alcanzado para "${prod.nombre}".`);
          return prev;
        }
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

  // --------------------------------------------------------
  // LÓGICA DE ESCANEO DIRECTO CON PISTOLA USB
  // --------------------------------------------------------
  const handleBarcodeScanned = (code: string) => {
    const q = code.trim().toLowerCase();
    if (!q) return;

    const encontrado = productos.find(
      (p) => p.codigo_barras && p.codigo_barras.trim().toLowerCase() === q
    );

    if (encontrado) {
      handleAgregarAlCarrito(encontrado);
      setBusqueda("");
    } else {
      alert(`No se encontró ningún producto con el código: ${code}`);
    }
  };

  // --------------------------------------------------------
  // LÓGICA DE ATAJOS DE TECLADO Y ENTER EN BÚSQUEDA
  // --------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTypingInInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (e.key === "Enter" && isTypingInInput) {
        const inputElem = target as HTMLInputElement;
        const queryVal = inputElem.value.trim().toLowerCase();

        if (queryVal) {
          const prodExacto = productos.find(
            (p) => p.codigo_barras && p.codigo_barras.trim().toLowerCase() === queryVal
          );

          if (prodExacto) {
            e.preventDefault();
            handleAgregarAlCarrito(prodExacto);
            setBusqueda("");
            return;
          }
        }
      }

      if (e.key === "F4" || (e.key === "/" && !isTypingInInput)) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>("input[type='text']");
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (
        (e.key === "F2" || (e.key === "Enter" && !isTypingInInput)) &&
        carrito.length > 0 &&
        !isModalCobroOpen &&
        !isTicketOpen &&
        !isHistorialOpen
      ) {
        e.preventDefault();
        const subtotalCalc = carrito.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);
        handleIniciarCobro(subtotalCalc, 0, subtotalCalc);
        return;
      }

      if (e.key === "Escape") {
        if (isHelpOpen) {
          setIsHelpOpen(false);
        } else if (isHistorialOpen) {
          setIsHistorialOpen(false);
        } else if (isModalCobroOpen) {
          setIsModalCobroOpen(false);
        } else if (isTicketOpen) {
          setIsTicketOpen(false);
        } else if (carrito.length > 0) {
          if (confirm("¿Deseas vaciar el carrito actual?")) {
            setCarrito([]);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [carrito, isModalCobroOpen, isTicketOpen, isHelpOpen, isHistorialOpen, productos]);

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

  const handleVentaExitosa = (infoTicket: {
    pedidoId: string | null;
    items: PosCartItem[];
    subtotalInicial?: number;
    descuentoMonto?: number;
    recargoMonto?: number;
    total: number;
    metodoPago: string;
    pagoCon: number;
    vuelto: number;
    nombreCliente: string;
  }) => {
    setDatosTicket(infoTicket);
    setIsTicketOpen(true);
    setIsModalCobroOpen(false);
    setCarrito([]);
    onActualizarProductos();
  };

  return (
    <div className="relative flex flex-col gap-4">
      <PosHeader
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onBarcodeScanned={handleBarcodeScanned}
        totalItemsCarrito={carrito.reduce((acc, i) => acc + i.cantidad, 0)}
        onAbrirHistorial={() => setIsHistorialOpen(true)}
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

      {/* Botón Flotante de Ayuda de Atajos */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#12151B] px-3.5 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:bg-[#0E6E55] hover:scale-105 active:scale-95"
        title="Ver Atajos de Teclado"
      >
        <Keyboard className="h-4 w-4 text-emerald-400" />
        <span>Atajos</span>
      </button>

      {/* Pop-up de Ayuda */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-[#0E6E55]">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Atajos de Teclado Rápidos</h3>
                <p className="text-xs text-gray-500">Agilizá las ventas en la caja sin usar el mouse</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-emerald-600" /> Escanear / Buscar Producto
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-mono font-bold text-gray-800 border border-gray-200 shadow-sm">
                  / <span className="text-gray-400">o</span> F4
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-emerald-600" /> Abrir Modal de Cobro
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-mono font-bold text-gray-800 border border-gray-200 shadow-sm">
                  F2 <span className="text-gray-400">o</span> Enter
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-emerald-600" /> Cerrar / Vaciar Carrito
                </span>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-mono font-bold text-gray-800 border border-gray-200 shadow-sm">
                  Esc
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#12151B] text-white text-xs font-bold hover:bg-[#0E6E55] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial y Anulación de Ventas */}
<ModalHistorialVentas
  isOpen={isHistorialOpen}
  onClose={() => setIsHistorialOpen(false)}
  supabase={supabase}
  onVentaAnulada={onActualizarProductos}
/>

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

      {/* Modal de Comprobante / Ticket de Venta */}
      {datosTicket && (
        <TicketVenta
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
          pedidoId={datosTicket.pedidoId}
          items={datosTicket.items}
          subtotalInicial={datosTicket.subtotalInicial}
          descuentoMonto={datosTicket.descuentoMonto}
          recargoMonto={datosTicket.recargoMonto}
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
