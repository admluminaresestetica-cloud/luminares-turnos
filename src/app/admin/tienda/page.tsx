"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import FormularioProducto from "./components/FormularioProducto";
import ListaProductos from "./components/ListaProductos";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PedidoItem {
  id: string;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
}

interface Pedido {
  id: string;
  created_at: string;
  nombre_cliente: string;
  metodo_envio: string;
  direccion: string | null;
  nota_adicional: string | null;
  total: number;
  estado: string;
  pedido_items: PedidoItem[];
}

export default function AdminTiendaPage() {
  const [activeTab, setActiveTab] = useState<"catalogo" | "pedidos">("catalogo");
  const [mounted, setMounted] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [cargandoCat, setCargandoCat] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);

  // Estados de Pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
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

  // Lógica de Categorías
  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreLimpio = nuevaCategoria.trim();
    if (!nombreLimpio) return;

    setCargandoCat(true);
    const { error } = await supabase
      .from("categorias")
      .insert([{ nombre: nombreLimpio }]);

    if (error) {
      alert("Error al crear categoría: " + error.message);
    } else {
      setNuevaCategoria("");
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

  const handleDeleteProducto = async (id: number) => {
    if (!confirm("¿Estás segura de eliminar este producto?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) alert("Error al eliminar");
    else fetchProductos();
  };

  // Lógica de Pedidos
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
      fetchProductos(); // Actualizar productos para ver el stock restado
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

  // Métricas
  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente").length;

  const metricas = [
    { label: "Productos", valor: totalProductos, icono: "📦" },
    { label: "Unidades en stock", valor: stockTotal, icono: "📊" },
    { label: "Pedidos Pendientes", valor: pedidosPendientes, icono: "⏳" },
    { label: "Categorías activas", valor: categorias.length, icono: "🏷️" },
  ];

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
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {metricas.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-[#E7E5E0] bg-white p-4 transition-shadow hover:shadow-[0_10px_25px_-12px_rgba(11,15,20,0.15)]"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg">{m.icono}</span>
              </div>
              <p className="m-0 text-2xl font-bold text-[#12151B]">{m.valor}</p>
              <p className="m-0 mt-1 text-xs font-medium text-[#6B675F]">{m.label}</p>
            </div>
          ))}
        </div>

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
        </div>

        {/* Tab 1: Catálogo y Stock */}
        {activeTab === "catalogo" && (
          <>
            {/* Sección Categorías */}
            <div className="mb-8 rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
              <h2 className="m-0 text-lg font-bold text-[#12151B]">
                🏷️ Gestión de Categorías
              </h2>

              <form onSubmit={handleCrearCategoria} className="mt-4 flex gap-3">
                <input
                  type="text"
                  placeholder="Nombre de la nueva categoría"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="flex-1 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-2.5 text-sm outline-none focus:border-[#0E6E55] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={cargandoCat || !nuevaCategoria.trim()}
                  className="rounded-xl bg-[#0E6E55] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0A5340] disabled:opacity-50"
                >
                  {cargandoCat ? "Guardando..." : "Guardar Categoría"}
                </button>
              </form>

              <div className="mt-5 flex flex-wrap gap-2">
                {categorias.length === 0 ? (
                  <p className="text-xs text-[#6B675F]">No hay categorías creadas aún.</p>
                ) : (
                  categorias.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#E7E5E0] bg-[#F7F7F5] px-3 py-1.5 text-xs font-medium text-[#12151B]"
                    >
                      {cat.nombre}
                      <button
                        onClick={() => handleEliminarCategoria(cat)}
                        className="ml-1 font-bold text-[#C84343] hover:text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Formulario */}
            <FormularioProducto
              onProductoAgregado={fetchProductos}
              supabase={supabase}
              categorias={categorias}
              productoEditando={productoEditando}
              onCancelarEdicion={() => setProductoEditando(null)}
            />

            {/* Lista con botón de Editar */}
            <ListaProductos
              productos={productos}
              onEliminar={handleDeleteProducto}
              onEditar={(prod) => {
                setProductoEditando(prod);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
            />
          </>
        )}

        {/* Tab 2: Historial de Pedidos */}
        {activeTab === "pedidos" && (
          <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="m-0 text-lg font-bold text-[#12151B]">📋 Pedidos Recibidos</h2>
              <button
                onClick={fetchPedidos}
                className="rounded-xl border border-[#E7E5E0] px-4 py-2 text-xs font-semibold text-[#12151B] hover:bg-[#F7F7F5]"
              >
                🔄 Actualizar lista
              </button>
            </div>

            {cargandoPedidos ? (
              <p className="text-sm text-[#6B675F]">Cargando pedidos...</p>
            ) : pedidos.length === 0 ? (
              <p className="text-sm text-[#6B675F]">No hay pedidos registrados aún.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-5 transition-all"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="m-0 text-base font-bold text-[#12151B]">
                          {pedido.nombre_cliente}
                        </h3>
                        <p className="m-0 mt-0.5 text-xs text-[#6B675F]">
                          {new Date(pedido.created_at).toLocaleString("es-AR")}
                        </p>
                      </div>

                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-bold uppercase ${
                          pedido.estado === "completado"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : pedido.estado === "cancelado"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : "bg-[#FEF3C7] text-[#92400E]"
                        }`}
                      >
                        {pedido.estado}
                      </span>
                    </div>

                    <div className="mb-3 text-xs text-[#12151B]">
                      <strong>Método:</strong>{" "}
                      {pedido.metodo_envio === "envio" ? "Envío a domicilio" : "Retiro en local"}
                      {pedido.direccion && (
                        <span> | <strong>Dirección:</strong> {pedido.direccion}</span>
                      )}
                      {pedido.nota_adicional && (
                        <p className="mt-1 italic text-[#6B675F]">
                          Nota: "{pedido.nota_adicional}"
                        </p>
                      )}
                    </div>

                    <div className="border-t border-[#E7E5E0] pt-3">
                      <p className="m-0 text-xs font-bold text-[#6B675F]">Detalle del pedido:</p>
                      <ul className="my-2 list-disc pl-5 text-xs text-[#12151B]">
                        {pedido.pedido_items.map((item) => (
                          <li key={item.id}>
                            {item.cantidad}x {item.nombre_producto} - ${item.precio_unitario} c/u
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E7E5E0] pt-3">
                      <span className="text-base font-bold text-[#12151B]">
                        Total: ${pedido.total}
                      </span>

                      {pedido.estado === "pendiente" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelarPedido(pedido.id)}
                            disabled={procesandoPedidoId === pedido.id}
                            className="rounded-lg border border-[#C84343] px-3 py-1.5 text-xs font-semibold text-[#C84343] hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleAprobarPedido(pedido.id)}
                            disabled={procesandoPedidoId === pedido.id}
                            className="rounded-lg bg-[#0E6E55] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0A5340] disabled:opacity-50"
                          >
                            {procesandoPedidoId === pedido.id ? "Aprobando..." : "Aprobar Compra"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}