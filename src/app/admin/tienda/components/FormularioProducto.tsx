"use client";
import { useState, useEffect } from "react";

interface FormularioProductoProps {
  onProductoAgregado: () => void;
  supabase: any;
  categorias: any[];
  productoEditando: any | null;
  onCancelarEdicion: () => void;
}

export default function FormularioProducto({
  onProductoAgregado,
  supabase,
  categorias,
  productoEditando,
  onCancelarEdicion,
}: FormularioProductoProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioOriginal, setPrecioOriginal] = useState("");
  const [stock, setStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [cargando, setCargando] = useState(false);

  // Cargar datos en los inputs si se selecciona editar un producto
  useEffect(() => {
    if (productoEditando) {
      setNombre(productoEditando.nombre || "");
      setDescripcion(productoEditando.descripcion || "");
      setPrecio(productoEditando.precio || "");
      setPrecioOriginal(productoEditando.precio_original || "");
      setStock(productoEditando.stock || "");
      setCategoria(productoEditando.categoria || "");
      setImagenUrl(productoEditando.imagen_url || "");
    } else {
      limpiarFormulario();
    }
  }, [productoEditando]);

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setPrecioOriginal("");
    setStock("");
    setCategoria("");
    setImagenUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) {
      alert("Por favor completa el nombre y el precio.");
      return;
    }

    setCargando(true);

    const productoData = {
      nombre,
      descripcion,
      precio: Number(precio),
      precio_original: precioOriginal ? Number(precioOriginal) : null,
      stock: stock ? Number(stock) : 0,
      categoria: categoria || "General",
      imagen_url: imagenUrl || null,
    };

    let error;

    if (productoEditando) {
      // Editar en Supabase
      const res = await supabase
        .from("productos")
        .update(productoData)
        .eq("id", productoEditando.id);
      error = res.error;
    } else {
      // Crear en Supabase
      const res = await supabase.from("productos").insert([productoData]);
      error = res.error;
    }

    if (error) {
      alert("Error al guardar producto: " + error.message);
    } else {
      limpiarFormulario();
      onCancelarEdicion();
      onProductoAgregado();
    }

    setCargando(false);
  };

  return (
    <div className="mb-8 rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-lg font-bold text-[#12151B]">
          {productoEditando ? "✏️ Editar Producto" : "➕ Agregar Nuevo Producto"}
        </h2>
        {productoEditando && (
          <button
            onClick={onCancelarEdicion}
            className="text-xs font-semibold text-[#C84343] hover:underline"
          >
            Cancelar Edición
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#6B675F]">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B675F]">Precio ($)</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B675F]">
            Precio Anterior / Oferta ($) (Opcional)
          </label>
          <input
            type="number"
            value={precioOriginal}
            onChange={(e) => setPrecioOriginal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B675F]">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B675F]">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
          >
            <option value="">General</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#6B675F]">URL Imagen</label>
          <input
            type="text"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#6B675F]">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
          />
        </div>

        <div className="sm:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 rounded-xl bg-[#0E6E55] py-3 text-sm font-semibold text-white transition-all hover:bg-[#0A5340] disabled:opacity-50"
          >
            {cargando
              ? "Guardando..."
              : productoEditando
              ? "Actualizar Producto"
              : "Guardar Producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
