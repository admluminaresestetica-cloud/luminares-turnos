"use client";
import { useState, useEffect } from "react";
import ScannerModal from "./ScannerModal";

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
  const [stockMinimo, setStockMinimo] = useState("5");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [mostrarUltimasUnidades, setMostrarUltimasUnidades] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (productoEditando) {
      setNombre(productoEditando.nombre || "");
      setDescripcion(productoEditando.descripcion || "");
      setPrecio(productoEditando.precio || "");
      setPrecioOriginal(productoEditando.precio_original || "");
      setStock(productoEditando.stock || "");
      setStockMinimo(productoEditando.stock_minimo ?? "5");
      setCodigoBarras(productoEditando.codigo_barras || "");
      setCategoria(productoEditando.categoria || "");
      setImagenUrl(productoEditando.imagen_url || "");
      setMostrarUltimasUnidades(productoEditando.mostrar_ultimas_unidades || false);
      setImagenFile(null);
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
    setStockMinimo("5");
    setCodigoBarras("");
    setCategoria("");
    setImagenUrl("");
    setMostrarUltimasUnidades(false);
    setImagenFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) {
      alert("Por favor completa el nombre y el precio.");
      return;
    }

    setCargando(true);
    let finalImagenUrl = imagenUrl;

    if (imagenFile) {
      const fileExt = imagenFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("productos")
        .upload(filePath, imagenFile);

      if (uploadError) {
        alert("Error al subir imagen: " + uploadError.message);
        setCargando(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("productos")
        .getPublicUrl(filePath);

      finalImagenUrl = publicUrlData.publicUrl;
    }

    const productoData = {
      nombre,
      descripcion,
      precio: Number(precio),
      precio_original: precioOriginal ? Number(precioOriginal) : null,
      stock: stock ? Number(stock) : 0,
      stock_minimo: stockMinimo ? Number(stockMinimo) : 5,
      codigo_barras: codigoBarras ? codigoBarras.trim() : null,
      categoria: categoria || "General",
      imagen_url: finalImagenUrl || null,
      mostrar_ultimas_unidades: mostrarUltimasUnidades,
    };

    let error;

    if (productoEditando) {
      const res = await supabase
        .from("productos")
        .update(productoData)
        .eq("id", productoEditando.id);
      error = res.error;
    } else {
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
            type="button"
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

        {/* Código de Barras y Botón Escáner */}
        <div>
          <label className="block text-xs font-medium text-[#6B675F]">Código de Barras</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              placeholder="Ej: 779123456789"
              className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
            />
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center justify-center rounded-xl bg-[#12151B] px-3.5 text-base text-white hover:bg-[#2C323E]"
              title="Escanear con cámara o lector USB"
            >
              📷
            </button>
          </div>
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
          <label className="block text-xs font-medium text-[#6B675F]">Stock Actual</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B675F]">Stock Mínimo (Alerta)</label>
          <input
            type="number"
            value={stockMinimo}
            onChange={(e) => setStockMinimo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm outline-none focus:border-[#0E6E55]"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3">
          <input
            type="checkbox"
            id="mostrarUltimasUnidades"
            checked={mostrarUltimasUnidades}
            onChange={(e) => setMostrarUltimasUnidades(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded accent-[#0E6E55]"
          />
          <label htmlFor="mostrarUltimasUnidades" className="cursor-pointer text-xs font-medium text-[#12151B]">
            🔥 Mostrar distintivo <span className="font-bold text-[#D97706]">"¡Últimas unidades!"</span> en la tarjeta del producto
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#6B675F]">
            Imagen del Producto {productoEditando && "(Opcional si ya tiene una)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
            className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-2.5 text-sm text-[#6B675F] outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[#12151B] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#2C323E]"
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

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-[#0E6E55] py-3 text-sm font-semibold text-white transition-all hover:bg-[#0A5340] disabled:opacity-50"
          >
            {cargando
              ? "Guardando..."
              : productoEditando
              ? "Actualizar Producto"
              : "Guardar Producto"}
          </button>
        </div>
      </form>

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => setCodigoBarras(code)}
      />
    </div>
  );
}