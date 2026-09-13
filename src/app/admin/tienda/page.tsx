"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import FormularioProducto from "./components/FormularioProducto";
import ListaProductos from "./components/ListaProductos";
import PedidosTab, { Pedido } from "./components/PedidosTab";
import MetricasHeader from "./components/MetricasHeader";
import CategoriasTab from "./components/CategoriasTab";
import BannersTab from "./components/BannersTab";
import TagsTab from "./components/TagsTab";
import PuntoVentaTab from "./components/PuntoVentaTab";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminTiendaPage() {
  const [activeTab, setActiveTab] = useState<"catalogo" | "pos" | "pedidos" | "banners" | "tags">("catalogo");
  const [mounted, setMounted] = useState(false);

  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [cargandoCat, setCargandoCat] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [procesandoPedidoId, setProcesandoPedidoId] = useState<string | null>(null);

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

  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente").length;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
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
          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 rounded-xl border border-[#E7E5E0] bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
            >
              ← Menú Admin
            </Link>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12151B] text-lg text-white">
              🛍️
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-6 py-8 sm:px-10">
        <MetricasHeader
          totalProductos={totalProductos}
          stockTotal={stockTotal}
          pedidosPendientes={pedidosPendientes}
          totalCategorias={categorias.length}
        />

        
                 {/* Pestañas con Scroll Horizontal para Mobile */}
        <div className="no-scrollbar -mx-6 mb-6 flex items-center gap-2 overflow-x-auto border-b border-[#E7E5E0] px-6 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab("catalogo")}
            className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-bold transition-all sm:text-sm ${
              activeTab === "catalogo"
                ? "border-[#0E6E55] text-[#0E6E55]"
                : "border-transparent text-[#6B675F] hover:text-[#12151B]"
            }`}
          >
            📦 Catálogo
          </button>

          <button
            onClick={() => setActiveTab("pos")}
            className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-bold transition-all sm:text-sm ${
              activeTab === "pos"
                ? "border-[#0E6E55] text-[#0E6E55]"
                : "border-transparent text-[#6B675F] hover:text-[#12151B]"
            }`}
          >
            📷 Escáner / POS
          </button>

          <button
            onClick={() => setActiveTab("pedidos")}
            className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-bold transition-all sm:text-sm ${
              activeTab === "pedidos"
                ? "border-[#0E6E55] text-[#0E6E55]"
                : "border-transparent text-[#6B675F] hover:text-[#12151B]"
            }`}
          >
            <span>📋 Historial de Pedidos</span>
            {pedidosPendientes > 0 && (
              <span className="flex h-5 min-w-[20px] animate-pulse items-center justify-center rounded-full bg-[#C84343] px-1.5 text-[11px] font-extrabold text-white">
                {pedidosPendientes}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("banners")}
            className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-bold transition-all sm:text-sm ${
              activeTab === "banners"
                ? "border-[#0E6E55] text-[#0E6E55]"
                : "border-transparent text-[#6B675F] hover:text-[#12151B]"
            }`}
          >
            🖼️ Banners
          </button>

          <button
            onClick={() => setActiveTab("tags")}
            className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-bold transition-all sm:text-sm ${
              activeTab === "tags"
                ? "border-[#0E6E55] text-[#0E6E55]"
                : "border-transparent text-[#6B675F] hover:text-[#12151B]"
            }`}
          >
            🏷️ Tags
          </button>
        </div>
 
 
        {activeTab === "catalogo" && (
          <>
            <CategoriasTab
              categorias={categorias}
              cargandoCat={cargandoCat}
              onCrearCategoria={async (nombre) => {
                setCargandoCat(true);
                await supabase.from("categorias").insert([{ nombre }]);
                fetchCategorias();
                setCargandoCat(false);
              }}
              onEliminarCategoria={async (cat) => {
                await supabase.from("categorias").delete().eq("id", cat.id);
                fetchCategorias();
              }}
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
              onEliminar={async (id) => {
                if (confirm("¿Eliminar producto?")) {
                  await supabase.from("productos").delete().eq("id", id);
                  fetchProductos();
                }
              }}
              onEditar={(prod) => {
                setProductoEditando(prod);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
            />
          </>
        )}

        {activeTab === "pos" && (
          <PuntoVentaTab
            productos={productos}
            supabase={supabase}
            onActualizarProductos={fetchProductos}
          />
        )}

        {activeTab === "pedidos" && (
          <PedidosTab
            pedidos={pedidos}
            cargandoPedidos={cargandoPedidos}
            procesandoPedidoId={procesandoPedidoId}
            onFetchPedidos={fetchPedidos}
            onAprobarPedido={async (id) => {
              await supabase.rpc("aprobar_pedido_y_descontar_stock", { p_pedido_id: id });
              fetchPedidos();
              fetchProductos();
            }}
            onCancelarPedido={async (id) => {
              await supabase.from("pedidos").update({ estado: "cancelado" }).eq("id", id);
              fetchPedidos();
            }}
            onEliminarPedido={async (id) => {
              await supabase.from("pedido_items").delete().eq("pedido_id", id);
              await supabase.from("pedidos").delete().eq("id", id);
              fetchPedidos();
            }}
          />
        )}

        {activeTab === "banners" && <BannersTab />}
        {activeTab === "tags" && <TagsTab />}
      </div>
    </div>
  );
}