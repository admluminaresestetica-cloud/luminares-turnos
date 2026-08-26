"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import FormularioProducto from "./components/FormularioProducto";
import ListaProductos from "./components/ListaProductos";
import PedidosTab, { Pedido } from "./components/PedidosTab";
import MetricasHeader from "./components/MetricasHeader";
import CategoriasTab from "./components/CategoriasTab";
import BannersTab from "./components/BannersTab";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminTiendaPage() {
  const [activeTab, setActiveTab] = useState<"catalogo" | "pedidos" | "banners">("catalogo");
  const [mounted, setMounted] = useState(false);

  // Estados de datos
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // Estados de carga e interacción
  const [cargandoCat, setCargandoCat] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [procesandoPedidoId, setProcesandoPedidoId] = useState<string | null>(null);

  // Fetchers
  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: false });
    if (error) console.error("Error al cargar productos:", error);
    else setProductos(data || []);
  };

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre", { ascending: true });
    if (error) console.error("Error al cargar categorías:", error);
    else setCategorias(data || []);
  };

  const fetchPedidos = async () => {
    setCargandoPedidos(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*, pedido_items(*)")
      .order("created_at", { ascending: false });

    if (error) console.error("Error al cargar pedidos:", error);
    else setPedidos(data || []);
    setCargandoPedidos(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchProductos();
    fetchCategorias();
    fetchPedidos();
  }, []);

  if (!mounted) return null;

  // Handlers Categorías
  const handleCrearCategoria = async (nombreLimpio: string) => {
    setCargandoCat(true);
    const { error } = await supabase
      .from("categorias")
      .insert([{ nombre: nombreLimpio }]);

    if (error) {
      alert("Error al crear categoría: " + error.message);
    } else {
      fetchCategorias();
    }
    setCargandoCat(false);
  };

  const handleEliminarCategoria = async (cat: any) => {
    const productosAfectados = productos.filter((p) => p.categoria === cat.nombre);

    if (productosAfectados.length > 0) {
      const confirmar = confirm(
        `Hay ${productosAfectados.length} producto(s) usando la categoría "${cat.nombre}". ¿Deseás eliminarla de todas formas?`
      );
      if (!confirmar) return;

      await supabase
        .from("productos")
        .update({ categoria: "General" })
        .eq("categoria", cat.nombre);
    } else {
      if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    }

    const { error } = await supabase.from("categorias").delete().eq("id", cat.id);
    if (error) alert("Error al eliminar categoría");
    else {
      fetchCategorias();
      fetchProductos();
    }
  };

  // Handlers Productos
  const handleDeleteProducto = async (id: any) => {
    if (!confirm("¿Estás segura de eliminar este producto?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) alert("Error al eliminar");
    else fetchProductos();
  };

  // Handler para sumar o restar unidades al stock (Restock/Ajuste)
  const handleRestock = async (id: any, cantidadAjuste: number) => {
    const productoActual = productos.find((p) => p.id === id);
    if (!productoActual) return;

    const stockActual = Number(productoActual.stock) || 0;
    const nuevoStock = Math.max(0, stockActual + Number(cantidadAjuste));

    const { error } = await supabase
      .from("productos")
      .update({ stock: nuevoStock })
      .eq("id", id);

    if (error) {
      console.error("Error al ajustar stock:", error);
      alert("No se pudo actualizar el stock.");
    } else {
      fetchProductos();
    }
  };

  // Handler para alternar entre Activo y Pausado
  const handleToggleActivo = async (id: any, estaPausado: boolean) => {
    const nuevoEstado = estaPausado;

    const { error } = await supabase
      .from("productos")
      .update({ activo: nuevoEstado })
      .eq("id", id);

    if (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado del producto.");
    } else {
      fetchProductos();
    }
  };

  // Handlers Pedidos
  const handleAprobarPedido = async (pedidoId: string) => {
    if (!confirm("¿Confirmás la aprobación del pedido? Esto descontará las unidades del stock actual.")) {
      return;
    }

    setProcesandoPedidoId(pedidoId);
    const { error } = await supabase.rpc("aprobar_pedido_y_descontar_stock", {
      p_pedido_id: pedidoId,
    });

    if (error) {
      alert(`Error al aprobar pedido: ${error.message}`);
    } else {
      alert("¡Pedido aprobado y stock descontado con éxito!");
      fetchPedidos();
      fetchProductos();
    }
    setProcesandoPedidoId(null);
  };

  const handleCancelarPedido = async (pedidoId: string) => {
    if (!confirm("¿Estás seguro de cancelar este pedido?")) return;

    setProcesandoPedidoId(pedidoId);
    const { error } = await supabase
      .from("pedidos")
      .update({ estado: "cancelado" })
      .eq("id", pedidoId);

    if (error) alert("Error al cancelar el pedido.");
    else fetchPedidos();

    setProcesandoPedidoId(null);
  };

  // NUEVO: Handler para eliminar pedidos definitivamente de la base de datos
  const handleEliminarPedido = async (pedidoId: string) => {
    try {
      // 1. Borrar los ítems asociados primero por la relación de llave foránea
      await supabase.from("pedido_items").delete().eq("pedido_id", pedidoId);

      // 2. Borrar el pedido principal
      const { error } = await supabase.from("pedidos").delete().eq("id", pedidoId);

      if (error) throw error;

      // 3. Actualizar la lista localmente
      setPedidos(pedidos.filter((p) => p.id !== pedidoId));
    } catch (error) {
      console.error("Error al eliminar el pedido:", error);
      alert("Hubo un error al intentar eliminar el pedido.");
    }
  };

  // Cálculo de Métricas
  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente").length;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Header */}
      <header className="border-b border-[#E7E5E0] bg-white px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[#0E6E55]">
              Panel de administración
            </p>
            <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-[#12151B]">
              Gestión de Tienda
            </h1>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12151B] text-lg text-white">
            🛍️
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-6 py-8 sm:px-10">
        {/* Métricas rápidas */}
        <MetricasHeader
          totalProductos={totalProductos}
          stockTotal={stockTotal}
          pedidosPendientes={pedidosPendientes}
          totalCategorias={categorias.length}
        />

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-4 border-b border-[#E7E5E0]">
          <button
            onClick={() => setActiveTab("catalogo")}
            className={`pb-3 text-sm font-bold transition-colors ${
              activeTab === "catalogo"
                ? "border-b-2 border-[#0E6E55] text-[#0E6E55]"
                : "text-[#6B675F] hover:text-[#12151B]"
            }`}
          >
            📦 Catálogo y Stock
          </button>
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`pb-3 text-sm font-bold transition-colors ${
              activeTab === "pedidos"
                ? "border-b-2 border-[#0E6E55] text-[#0E6E55]"
                : "text-[#6B675F] hover:text-[#12151B]"
            }`}
          >
            📋 Historial de Pedidos {pedidosPendientes > 0 && `(${pedidosPendientes})`}
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`pb-3 text-sm font-bold transition-colors ${
              activeTab === "banners"
                ? "border-b-2 border-[#0E6E55] text-[#0E6E55]"
                : "text-[#6B675F] hover:text-[#12151B]"
            }`}
          >
            🖼️ Banners Promocionales
          </button>
        </div>

        {/* Tab 1: Catálogo y Stock */}
        {activeTab === "catalogo" && (
          <>
            <CategoriasTab
              categorias={categorias}
              cargandoCat={cargandoCat}
              onCrearCategoria={handleCrearCategoria}
              onEliminarCategoria={handleEliminarCategoria}
            />

            <FormularioProducto
              onProductoAgregado={fetchProductos}
              supabase={supabase}
              categorias={categorias}
              productoEditando={productoEditando}
              onCancelarEdicion={() => setProductoEditando(null)}
            />

            <ListaProductos
              productos={productos}
              onEliminar={handleDeleteProducto}
              onEditar={(prod) => {
                setProductoEditando(prod);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              onRestock={handleRestock}
              onToggleActivo={handleToggleActivo}
            />
          </>
        )}

        {/* Tab 2: Historial de Pedidos */}
        {activeTab === "pedidos" && (
          <PedidosTab
            pedidos={pedidos}
            cargandoPedidos={cargandoPedidos}
            procesandoPedidoId={procesandoPedidoId}
            onFetchPedidos={fetchPedidos}
            onAprobarPedido={handleAprobarPedido}
            onCancelarPedido={handleCancelarPedido}
            onEliminarPedido={handleEliminarPedido}
          />
        )}

        {/* Tab 3: Banners Promocionales */}
        {activeTab === "banners" && <BannersTab />}
      </div>
    </div>
  );
}