"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import FormularioProducto from "./components/FormularioProducto";
import ListaProductos from "./components/ListaProductos";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminTiendaPage() {
  const [mounted, setMounted] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [cargandoCat, setCargandoCat] = useState(false);

  // Cargar Productos
  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      console.error("Error al cargar productos:", error);
    } else {
      setProductos(data || []);
    }
  };

  // Cargar Categorías
  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre", { ascending: true });
    if (error) {
      console.error("Error al cargar categorías:", error);
    } else {
      setCategorias(data || []);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchProductos();
    fetchCategorias();
  }, []);

  // Prevenir renderizado en el servidor para evitar discrepancias de hidratación
  if (!mounted) {
    return null;
  }

  // Agregar Categoría
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

  // Eliminar Categoría
  const handleEliminarCategoria = async (cat: any) => {
    const productosAfectados = productos.filter((p) => p.categoria === cat.nombre);

    if (productosAfectados.length > 0) {
      const confirmar = confirm(
        `Hay ${productosAfectados.length} producto(s) usando la categoría "${cat.nombre}". ¿Deseás eliminarla de todas formas? (Los productos pasarán a categoría 'General')`
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
    if (error) {
      alert("Error al eliminar categoría");
    } else {
      fetchCategorias();
      fetchProductos();
    }
  };

  const handleDeleteProducto = async (id: number) => {
    if (!confirm("¿Estás segura de eliminar este producto?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar");
    } else {
      fetchProductos();
    }
  };

  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const ofertasActivas = productos.filter((p) => p.precio_original).length;

  const metricas = [
    { label: "Productos", valor: totalProductos, icono: "📦" },
    { label: "Categorías activas", valor: categorias.length, icono: "🏷️" },
    { label: "Unidades en stock", valor: stockTotal, icono: "📊" },
    { label: "Ofertas activas", valor: ofertasActivas, icono: "🔥" },
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
              <p className="m-0 text-2xl font-bold text-[#12151B]">
                {m.valor}
              </p>
              <p className="m-0 mt-1 text-xs font-medium text-[#6B675F]">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Sección de Gestión de Categorías */}
        <div className="mb-8 rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
          <h2 className="m-0 text-lg font-bold text-[#12151B]">
            🏷️ Gestión de Categorías
          </h2>

          <form onSubmit={handleCrearCategoria} className="mt-4 flex gap-3">
            <input
              type="text"
              placeholder="Nombre de la nueva categoría (ej: Perfumes)"
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

          {/* Listado de Categorías Existentes */}
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
                    className="ml-1 text-[#C84343] hover:text-red-700 font-bold"
                    title="Eliminar categoría"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Formulario de Producto */}
        <FormularioProducto
          onProductoAgregado={fetchProductos}
          supabase={supabase}
          categorias={categorias}
        />

        {/* Lista de Productos */}
        <ListaProductos productos={productos} onEliminar={handleDeleteProducto} />
      </div>
    </div>
  );
}