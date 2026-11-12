"use client";

import { useState, useEffect, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";

// Componentes modulares de la vista
import TiendaHeaderNav, { TabKey } from "./components/TiendaHeaderNav";
import ModalAnulacionPedido, { ItemAAnular } from "./components/ModalAnulacionPedido";
import MetricasHeader from "./components/MetricasHeader";
import FormularioProducto from "./components/FormularioProducto";
import ListaProductos from "./components/ListaProductos";
import PedidosTab from "./components/PedidosTab";
import CategoriasTab from "./components/CategoriasTab";
import TagsTab from "./components/TagsTab";
import SeccionEtiquetasPrecios from "./components/SeccionEtiquetasPrecios";
import PuntoVentaTab from "./components/pos/PuntoVentaTab";
import ControlCajaTab from "./components/ControlCajaTab";
import { usePerfil } from "@/hooks/usePerfil";
import { acreditarPuntosTransaccion } from "@/lib/supabase/puntos";

export interface Pedido {
  id: string;
  nombre_cliente: string;
  telefono_cliente?: string;
  estado: string;
  metodo_envio: string;
  metodo_pago: string;
  total: number;
  created_at: string;
  direccion?: string;
  preparado_por?: string;
  historial_estados?: any[];
  pedido_items?: any[];
  items?: any[];
  productos?: any[];
  nota_adicional?: string;
  payment_id?: string;
  user_id?: string;
}


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✨ Variantes de animación (solo UI)
const contenedorVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const seccionVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 26 },
  },
};

const heroVariants: Variants = {
  hidden: { opacity: 0, y: -14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

// Envoltorio animado para cada bloque de una pestaña (hereda el stagger del contenedor)
const Seccion = ({ children }: { children: ReactNode }) => (
  <motion.div variants={seccionVariants}>{children}</motion.div>
);

export default function AdminTiendaPage() {
  const { perfil } = usePerfil();
  const reducirMovimiento = useReducedMotion();
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


const handleActualizarPreciosMasivo = async (porcentaje: number, categoria?: string) => {
    const factor = 1 + porcentaje / 100; // Ej: 15% -> 1.15 | -10% -> 0.90

    try {
      // Filtramos los productos según la categoría seleccionada o todo el catálogo
      const productosAActualizar = categoria 
        ? productos.filter(p => p.categoria === categoria)
        : productos;

      if (productosAActualizar.length === 0) {
        alert("No hay productos para actualizar en este criterio.");
        return;
      }

      // Actualizamos cada producto en Supabase
      for (const prod of productosAActualizar) {
        const precioActual = Number(prod.precio) || 0;
        const nuevoPrecio = Math.round(precioActual * factor);

        // Objeto con los datos a actualizar
        const datosActualizacion: any = { precio: nuevoPrecio };

        // 🔍 Si el producto tiene un precio anterior (oferta), también lo actualizamos para mantener la proporción
        if (prod.precio_original && Number(prod.precio_original) > 0) {
          const precioOriginalActual = Number(prod.precio_original);
          datosActualizacion.precio_original = Math.round(precioOriginalActual * factor);
        }

        const { error } = await supabase
          .from("productos")
          .update(datosActualizacion)
          .eq("id", prod.id);

        if (error) throw error;
      }

      // Recargamos los productos para reflejar los cambios al instante
      await fetchProductos();
      alert("¡Precios y ofertas actualizados masivamente con éxito!");
    } catch (err: any) {
      console.error("Error al actualizar precios:", err);
      alert("Hubo un error al actualizar los precios: " + (err.message || err));
    }
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

// ─── NUEVA FUNCIÓN PARA EL TIMELINE Y CAMBIO DE ESTADOS ───
  const avanzarEstadoPedido = async (pedidoId: string, nuevoEstado: string) => {
    setProcesandoPedidoId(pedidoId);
    try {
      const pedidoActual = pedidos.find((p) => p.id === pedidoId);
      const historialPrevio = Array.isArray(pedidoActual?.historial_estados) 
        ? pedidoActual.historial_estados 
        : [];

      const nombreUsuario = perfil?.nombre || "Sistema / Admin";
      const nuevoEvento = {
        estado: nuevoEstado,
        fecha: new Date().toISOString(),
        usuario: nombreUsuario,
      };

      const historialActualizado = [...historialPrevio, nuevoEvento];

      // Si el pedido estaba pendiente y pasa a preparación/aprobado, 
      // ejecutamos tu función de stock de Supabase por seguridad:
      if (pedidoActual?.estado === 'pendiente' && (nuevoEstado === 'en_preparacion' || nuevoEstado === 'aprobado')) {
        const { error: errorRpc } = await supabase.rpc(
          "aprobar_pedido_y_descontar_stock",
          { p_pedido_id: pedidoId }
        );
        if (errorRpc) throw errorRpc;
      }

      // Actualizamos estado, responsable e historial en la base de datos
      const { error } = await supabase
        .from("pedidos")
        .update({
          estado: nuevoEstado,
          preparado_por: nombreUsuario,
          historial_estados: historialActualizado,
        })
        .eq("id", pedidoId);

      if (error) throw error;

      // ─── ACREDITACIÓN AUTOMÁTICA DE PUNTOS LUMINARES ───
      if (nuevoEstado === "completado" && pedidoActual?.user_id) {
        await acreditarPuntosTransaccion(
          pedidoActual.user_id,
          Number(pedidoActual.total || 0),
          "pedido",
          pedidoId
        );
      }
      // ──────────────────────────────────────────────────

      await Promise.all([fetchPedidos(), fetchProductos()]);
    } catch (err: any) {
      alert("Error al actualizar el estado: " + (err.message || err));
    } finally {
      setProcesandoPedidoId(null);
    }
  };

  if (!mounted) return null;

  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente").length;
  // 🔔 Solo UI: dato derivado de los productos ya cargados, para el chip de estado del hero
  const productosSinStock = productos.filter((p) => (Number(p.stock) || 0) <= 0).length;

return (
  <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 transition-colors pb-24 sm:pb-12">
    {/* 🟩 HERO FINTECH: DEGRADADO ESMERALDA → TEAL → CYAN CON ORBES DE LUZ */}
    <div className="relative bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-500 dark:from-emerald-950 dark:via-teal-950 dark:to-zinc-900 pt-6 pb-24 px-4 sm:px-10 shadow-lg transition-colors">
      {/* Orbes decorativos (capa recortada propia, no interactiva) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-lime-300/25 blur-3xl" />
        <div className="absolute -right-20 top-2 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="relative max-w-[1200px] mx-auto">
        {/* Solo opacidad: así no se altera el posicionamiento de elementos fijos de la navegación */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <TiendaHeaderNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pedidosPendientes={pedidosPendientes}
          />
        </motion.div>

        {/* Chips de estado en vivo */}
        <motion.div
          variants={contenedorVariants}
          initial="hidden"
          animate="show"
          className="mt-5 flex flex-wrap items-center gap-2"
        >
          <motion.div
            variants={heroVariants}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold backdrop-blur-md ${
              pedidosPendientes > 0
                ? "border-amber-200/40 bg-amber-400/20 text-amber-50"
                : "border-white/20 bg-white/10 text-white/90"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {pedidosPendientes > 0 && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  pedidosPendientes > 0 ? "bg-amber-300" : "bg-emerald-300"
                }`}
              />
            </span>
            {pedidosPendientes > 0 ? (
              <span className="flex items-center gap-1">
                <motion.span
                  key={pedidosPendientes}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="font-black tabular-nums"
                >
                  {pedidosPendientes}
                </motion.span>
                {pedidosPendientes === 1 ? "pedido pendiente" : "pedidos pendientes"}
              </span>
            ) : (
              <span>Pedidos al día</span>
            )}
          </motion.div>

          <AnimatePresence>
            {productosSinStock > 0 && (
              <motion.div
                key="sin-stock"
                variants={heroVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-500/25 px-3 py-1.5 text-[11px] font-bold text-rose-50 backdrop-blur-md"
              >
                <span className="h-2 w-2 rounded-full bg-rose-300" />
                <span className="flex items-center gap-1">
                  <motion.span
                    key={productosSinStock}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="font-black tabular-nums"
                  >
                    {productosSinStock}
                  </motion.span>
                  {productosSinStock === 1 ? "producto sin stock" : "productos sin stock"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {cargandoPedidos && (
              <motion.div
                key="sync"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-md"
              >
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Actualizando
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>

    {/* CONTENIDO PRINCIPAL FLOTANTE (-mt-14 sobre el hero) */}
    <div
      className={`relative mx-auto -mt-14 transition-all ${
        activeTab === "pos"
          ? "max-w-full px-2 sm:px-6 sm:max-w-[1200px]"
          : "max-w-[1200px] px-3 sm:px-10"
      }`}
    >
      {/* Métricas resumidas flotantes (excepto en vista POS) */}
      {activeTab !== "pos" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.15 }}
          whileHover={reducirMovimiento ? undefined : { y: -2 }}
          className="mb-6"
        >
          <MetricasHeader
            totalProductos={totalProductos}
            stockTotal={stockTotal}
            pedidosPendientes={pedidosPendientes}
            totalCategorias={categorias.length}
          />
        </motion.div>
      )}

      {/* Contenido según Pestaña Activa (transición suave al cambiar de pestaña) */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          variants={contenedorVariants}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
          className="space-y-4 sm:space-y-6"
        >
          {activeTab === "catalogo" && (
            <>
              <Seccion>
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
              </Seccion>

              <Seccion>
                <FormularioProducto
                  onProductoAgregado={fetchProductos}
                  supabase={supabase}
                  categorias={categorias}
                  productoEditando={productoEditando}
                  onCancelarEdicion={() => setProductoEditando(null)}
                />
              </Seccion>

              <Seccion>
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
                    window.scrollTo({ top: 180, behavior: "smooth" });
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
                  onActualizarPreciosMasivo={handleActualizarPreciosMasivo}
                />
              </Seccion>
            </>
          )}

          {activeTab === "pos" && (
            <Seccion>
              <PuntoVentaTab
                productos={productos}
                supabase={supabase}
                onActualizarProductos={() => {
                  fetchProductos();
                  fetchPedidos();
                }}
              />
            </Seccion>
          )}

          {activeTab === "caja" && (
            <Seccion>
              <ControlCajaTab supabase={supabase} />
            </Seccion>
          )}

          {activeTab === "pedidos" && (
            <Seccion>
              <PedidosTab
                pedidos={pedidos}
                cargandoPedidos={cargandoPedidos}
                procesandoPedidoId={procesandoPedidoId}
                onFetchPedidos={fetchPedidos}
                onCambiarEstado={avanzarEstadoPedido} // <-- Debe ser esta prop, no onAprobarPedido
                onCancelarPedido={(id) => {
                  const ped = pedidos.find((p) => p.id === id);
                  if (ped) iniciarAnulacion(ped);
                }}
                onEliminarPedido={(id) => {
                  const ped = pedidos.find((p) => p.id === id);
                  if (ped) iniciarAnulacion(ped);
                }}
              />
            </Seccion>
          )}

          {activeTab === "tags" && (
            <Seccion>
              <TagsTab />
            </Seccion>
          )}

          {activeTab === "etiquetas" && (
            <Seccion>
              <SeccionEtiquetasPrecios
                productos={productos}
                categorias={categorias}
              />
            </Seccion>
          )}
        </motion.div>
      </AnimatePresence>
    </div>

    {/* Modal de Anulación */}
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