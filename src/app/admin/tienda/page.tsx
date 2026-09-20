"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Componentes modulares de la vista
import TiendaHeaderNav, { TabKey } from "./components/TiendaHeaderNav";
import ModalAnulacionPedido, { ItemAAnular } from "./components/ModalAnulacionPedido";
import MetricasHeader from "./components/MetricasHeader";
import FormularioProducto from "./components/FormularioProducto";
import ListaProductos from "./components/ListaProductos";
import PedidosTab, { Pedido } from "./components/PedidosTab";
import CategoriasTab from "./components/CategoriasTab";
import BannersTab from "../ajustes/components/BannersTab";
import TagsTab from "./components/TagsTab";
import PuntoVentaTab from "./components/pos/PuntoVentaTab";
import ControlCajaTab from "./components/ControlCajaTab";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminTiendaPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("catalogo");
  const [mounted, setMounted] = useState(false);

  // Estados de datos de la tienda
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [configEmpresa, setConfigEmpresa] = useState<any | null>(null);

  // Estados de interfaz y edición
  const [cargandoCat, setCargandoCat] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [procesandoPedidoId, setProcesandoPedidoId] = useState<string | null>(null);

  // Estados del Modal de Anulación
  const [pedidoAAnular, setPedidoAAnular] = useState<Pedido | null>(null);
  const [itemsAAnular, setItemsAAnular] = useState<ItemAAnular[]>([]);

  // CARGA DE DATOS DESDE SUPABASE
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

    const resPedidos = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    const resItems = await supabase.from("pedido_items").select("*");

    if (resPedidos.data) {
      const pedidosFormateados = resPedidos.data.map((pedido) => {
        const itemsPOS = resItems.data
          ? resItems.data.filter((item) => item.pedido_id === pedido.id)
          : [];

        let itemsWeb: any[] = [];
        if (pedido.items) {
          try {
            itemsWeb = typeof pedido.items === "string" ? JSON.parse(pedido.items) : pedido.items;
          } catch (e) {
            console.error("Error al parsear JSON de items web:", e);
          }
        } else if (pedido.productos) {
          try {
            itemsWeb = typeof pedido.productos === "string" ? JSON.parse(pedido.productos) : pedido.productos;
          } catch (e) {
            console.error("Error al parsear JSON de productos web:", e);
          }
        }

        return {
          ...pedido,
          pedido_items: itemsPOS.length > 0 ? itemsPOS : itemsWeb,
        };
      });

      setPedidos(pedidosFormateados);
    }

    setCargandoPedidos(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchConfigEmpresa();
    fetchProductos();
    fetchCategorias();
    fetchPedidos();
  }, []);

  // LÓGICA DE ANULACIÓN
  const iniciarAnulacion = (pedido: Pedido) => {
    const rawItems =
      pedido.pedido_items && pedido.pedido_items.length > 0
        ? pedido.pedido_items
        : (pedido as any).items || [];

    const itemsMapeados: ItemAAnular[] = rawItems.map((item: any) => {
      let rawProdId =
        item.producto_id ??
        item.id_producto ??
        item.id ??
        item.producto?.id;

      if (!rawProdId && item.nombre_producto) {
        const prodEncontrado = productos.find(
          (p) => p.nombre?.trim().toLowerCase() === item.nombre_producto?.trim().toLowerCase()
        );
        if (prodEncontrado) rawProdId = prodEncontrado.id;
      }

      const cantVendida = Number(item.cantidad) || 1;

      return {
        id: item.id || Math.random().toString(),
        producto_id: rawProdId !== undefined && rawProdId !== null ? Number(rawProdId) : null,
        nombre_producto:
          item.nombre_producto ||
          item.titulo ||
          item.nombre ||
          item.producto?.nombre ||
          "Producto",
        cantidadVendida: cantVendida,
        cantReponer: cantVendida,
        cantBaja: 0,
      };
    });

    setItemsAAnular(itemsMapeados);
    setPedidoAAnular(pedido);
  };

  const procesarAnulacionConfirmada = async () => {
    if (!pedidoAAnular) return;

    const pedidoId = pedidoAAnular.id;
    setProcesandoPedidoId(pedidoId);
    setPedidoAAnular(null);

    try {
      let totalReintegrado = 0;
      let totalBajas = 0;

      for (const item of itemsAAnular) {
        if (item.cantReponer > 0 && item.producto_id && !isNaN(item.producto_id)) {
          const { data: prod, error: errProd } = await supabase
            .from("productos")
            .select("stock")
            .eq("id", item.producto_id)
            .maybeSingle();

          if (!errProd && prod) {
            const stockActual = Number(prod.stock) || 0;
            const nuevoStock = stockActual + item.cantReponer;

            await supabase
              .from("productos")
              .update({ stock: nuevoStock })
              .eq("id", item.producto_id);
          }
        }

        totalReintegrado += item.cantReponer;
        totalBajas += item.cantBaja;
      }

      let notaFinal = "[Cancelado]";
      if (totalReintegrado > 0 && totalBajas === 0) {
        notaFinal = `[Cancelado: ${totalReintegrado} un. reintegradas al stock]`;
      } else if (totalReintegrado === 0 && totalBajas > 0) {
        notaFinal = `[Cancelado: ${totalBajas} un. dadas de baja por rotura/falla]`;
      } else if (totalReintegrado > 0 && totalBajas > 0) {
        notaFinal = `[Cancelado parcial: ${totalReintegrado} un. al stock / ${totalBajas} un. baja por rotura]`;
      }

      const { error: errorUpdate } = await supabase
        .from("pedidos")
        .update({
          estado: "cancelado",
          nota_adicional: notaFinal,
        })
        .eq("id", pedidoId);

      if (errorUpdate) throw errorUpdate;

      await Promise.all([fetchPedidos(), fetchProductos()]);
    } catch (err: any) {
      alert("Error al procesar la anulación: " + (err.message || err));
    } finally {
      setProcesandoPedidoId(null);
    }
  };

  if (!mounted) return null;

  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente").length;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Header y Pestañas */}
      <TiendaHeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pedidosPendientes={pedidosPendientes}
      />

      <div className="mx-auto max-w-[1200px] px-4 pb-12 sm:px-10">
        <MetricasHeader
          totalProductos={totalProductos}
          stockTotal={stockTotal}
          pedidosPendientes={pedidosPendientes}
          totalCategorias={categorias.length}
        />

        {/* Contenido según Pestaña Activa */}
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
              onActualizarProductos={() => {
                fetchProductos();
                fetchPedidos();
              }}
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
                setProcesandoPedidoId(id);
                const { error } = await supabase.rpc(
                  "aprobar_pedido_y_descontar_stock",
                  { p_pedido_id: id }
                );

                if (error) {
                  alert("Error al aprobar pedido: " + error.message);
                } else {
                  await Promise.all([fetchPedidos(), fetchProductos()]);
                }
                setProcesandoPedidoId(null);
              }}
              onCancelarPedido={(id) => {
                const ped = pedidos.find((p) => p.id === id);
                if (ped) iniciarAnulacion(ped);
              }}
              onEliminarPedido={(id) => {
                const ped = pedidos.find((p) => p.id === id);
                if (ped) iniciarAnulacion(ped);
              }}
            />
          )}

          {activeTab === "banners" && <BannersTab />}
          {activeTab === "tags" && <TagsTab />}
        </div>
      </div>

      {/* Modal de Anulación Modularizado */}
      <ModalAnulacionPedido
        pedidoAAnular={pedidoAAnular}
        itemsAAnular={itemsAAnular}
        setItemsAAnular={setItemsAAnular}
        onCerrar={() => setPedidoAAnular(null)}
        onConfirmar={procesarAnulacionConfirmada}
      />
    </div>
  );
}