"use client";
import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

interface Categoria {
  id: number;
  nombre: string;
}

interface FormularioProductoProps {
  onProductoAgregado: () => void;
  supabase: SupabaseClient;
  categorias?: Categoria[];
}

export default function FormularioProducto({
  onProductoAgregado,
  supabase,
  categorias = [],
}: FormularioProductoProps) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioOriginal, setPrecioOriginal] = useState("");
  const [categoria, setCategoria] = useState("");
  const [stock, setStock] = useState("10");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [destacado, setDestacado] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Subir imagen a Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setSubiendo(true);
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes-tienda")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("imagenes-tienda")
        .getPublicUrl(filePath);

      setImagenUrl(data.publicUrl);
    } catch (error: any) {
      alert("Error subiendo la imagen: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) {
      alert("El nombre y el precio son obligatorios");
      return;
    }

    setGuardando(true);

    const { error } = await supabase.from("productos").insert([
      {
        nombre,
        precio: parseFloat(precio),
        precio_original: precioOriginal ? parseFloat(precioOriginal) : null,
        categoria: categoria || "General",
        stock: parseInt(stock) || 0,
        descripcion,
        imagen_url: imagenUrl,
        destacado,
      },
    ]);

    setGuardando(false);

    if (error) {
      alert("Error al guardar producto: " + error.message);
    } else {
      // Limpiar formulario
      setNombre("");
      setPrecio("");
      setPrecioOriginal("");
      setCategoria("");
      setStock("10");
      setDescripcion("");
      setImagenUrl("");
      setDestacado(false);
      onProductoAgregado();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-[#E7E5E0] bg-white p-6 shadow-sm"
    >
      <h2
        className="m-0 mb-6 text-xl font-bold text-[#12151B]"
        style={{ fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" }}
      >
        ➕ Agregar Nuevo Producto
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Nombre */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B675F]">
            Nombre del Producto *
          </label>
          <input
            type="text"
            required
            placeholder="ej: Crema Hidratante Facial"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-2.5 text-sm outline-none focus:border-[#0E6E55] focus:bg-white"
          />
        </div>

        {/* Categoría Selector Dinámico */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B675F]">
            Categoría
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-2.5 text-sm outline-none focus:border-[#0E6E55] focus:bg-white"
          >
            <option value="">Seleccionar Categoría...</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.nombre}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B675F]">
            Precio ($) *
          </label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="ej: 2500"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-2.5 text-sm outline-none focus:border-[#0E6E55] focus:bg-white"
          />
        </div>

        {/* Precio Oferta / Anterior */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B675F]">
            Precio Sin Descuento (Opcional)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="ej: 3000 (para mostrar tachado)"
            value={precioOriginal}
            onChange={(e) => setPrecioOriginal(e.target.value)}
            className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-2.5 text-sm outline-none focus:border-[#0E6E55] focus:bg-white"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B675F]">
            Stock Inicial
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] px-4 py-2.5 text-sm outline-none focus:border-[#0E6E55] focus:bg-white"
          />
        </div>

        {/* Carga de Imagen */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B675F]">
            Imagen del Producto
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={subiendo}
            className="w-full text-xs file:mr-4 file:rounded-xl file:border-0 file:bg-[#12151B] file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-white hover:file:bg-black"
          />
          {subiendo && <p className="mt-1 text-xs text-[#0E6E55]">Subiendo imagen...</p>}
        </div>
      </div>

      {/* Descripción */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold uppercase text-[#6B675F]">
          Descripción
        </label>
        <textarea
          rows={3}
          placeholder="Detalles del producto..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55] focus:bg-white"
        />
      </div>

      {/* Checkbox Destacado */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="destacado"
          checked={destacado}
          onChange={(e) => setDestacado(e.target.checked)}
          className="h-4 w-4 rounded border-[#E7E5E0] text-[#0E6E55] focus:ring-[#0E6E55]"
        />
        <label htmlFor="destacado" className="text-sm text-[#12151B]">
          Destacar este producto en la portada
        </label>
      </div>

      {/* Botón Guardar */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={guardando || subiendo}
          className="rounded-xl bg-[#12151B] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-black disabled:opacity-50"
        >
          {guardando ? "Guardando Producto..." : "Guardar Producto"}
        </button>
      </div>
    </form>
  );
}