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
import PuntoVentaTab from "./components/pos/PuntoVentaTab";
import ControlCajaTab from "./components/ControlCajaTab";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminTiendaPage() {
  const [activeTab, setActiveTab] = useState<"catalogo" | "pos" | "caja" | "pedidos" | "banners" | "tags">("catalogo");
  const [mounted, setMounted] = useState(false);

  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // ESTADO PARA GUARDAR LA CONFIGURACIÓN DE LA EMPRESA DESDE SUPABASE
  const [configEmpresa, setConfigEmpresa] = useState<any | null>(null);

  const [cargandoCat, setCargandoCat] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [procesandoPedidoId, setProcesandoPedidoId] = useState<string | null>(null);

  // FETCH DE CONFIGURACIÓN DE LA EMPRESA
  const fetchConfigEmpresa = async () => {
    const { data, error } = await supabase
      .from("configuracion_empresa")
      .select("*")
      .maybeSingle();

    if (error) console.error("Error al cargar configuración empresa:", error);
    else if (data) setConfigEmpresa(data);
  };

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
    fetchConfigEmpresa();
    fetchProductos();
    fetchCategorias();
    fetchPedidos();
  }, []);

  if (!mounted) return null;

  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente").length;

  const TABS: { key: typeof activeTab; label: string; icono: string; badge?: number }[] = [
    { key: "catalogo", label: "Catálogo", icono: "📦" },
    { key: "pos", label: "Escáner / POS", icono: "📷" },
    { key: "caja", label: "Control de Caja", icono: "💵" },
    { key: "pedidos", label: "Pedidos", icono: "📋", badge: pedidosPendientes },
    { key: "banners", label: "Banners", icono: "🖼️" },
    { key: "tags", label: "Tags", icono: "🏷️" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* HEADER STICKY con blur tipo app nativa */}
      <header className="sticky top-0 z-30 border-b border-[#E7E5E0]/80 bg-white/80 backdrop-blur-md px-4 py-4 sm:px-10 sm:py-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#12151B] text-lg text-white shadow-sm">
              🛍️
            </span>
            <div>
              <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-[#0E6E55] sm:text-xs">
                Panel de administración
              </p>
              <h1 className="m-0 text-lg font-bold tracking-tight text-[#12151B] sm:text-2xl">
                Gestión de Tienda
              </h1>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E7E5E0] bg-gray-50 px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-100 active:scale-95 sm:px-4 sm:text-sm"
          >
            ← <span className="hidden sm:inline">Menú Admin</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-10 sm:py-8">
        <MetricasHeader
          totalProductos={totalProductos}
          stockTotal={stockTotal}
          pedidosPendientes={pedidosPendientes}
          totalCategorias={categorias.length}
        />

        {/* Pestañas tipo "pill", deslizables horizontalmente */}
        <div className="no-scrollbar -mx-4 mb-6 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-xs font-bold transition-all active:scale-95 sm:text-sm ${
                  isActive
                    ? "bg-[#0E6E55] text-white shadow-md shadow-[#0E6E55]/20"
                    : "bg-white text-[#6B675F] border border-[#E7E5E0] hover:border-[#0E6E55]/40 hover:text-[#12151B]"
                }`}
              >
                <span>{tab.icono}</span>
                <span>{tab.label}</span>
                {!!tab.badge && tab.badge > 0 && (
                  <span
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${
                      isActive ? "bg-white/25 text-white" : "animate-pulse bg-[#C84343] text-white"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido de cada pestaña */}
        <div className="space-y-6">
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
                config={configEmpresa}
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
                onRestock={async (id, cantidadASumar) => {
                  const prod = productos.find((p) => p.id === id);
                  if (!prod) return;

                  const nuevoStock = (Number(prod.stock) || 0) + cantidadASumar;

                  const { error } = await supabase
                    .from("productos")
                    .update({ stock: nuevoStock })
                    .eq("id", id);

                  if (!error) {
                    fetchProductos();
                  }
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

          {activeTab === "caja" && <ControlCajaTab supabase={supabase} />}

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
    </div>
  );
}