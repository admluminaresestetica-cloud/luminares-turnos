"use client";

import { useState, useEffect } from "react";
import ScannerModal from "./ScannerModal";
import SeccionEtiquetas from "./SeccionEtiquetas";
import CargadorImagenes from "./CargadorImagenes";

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
  const [isOpen, setIsOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioOriginal, setPrecioOriginal] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("5");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [categoria, setCategoria] = useState("");
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [mostrarUltimasUnidades, setMostrarUltimasUnidades] = useState(false);
  const [permiteCuotas, setPermiteCuotas] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Estados para imágenes
  const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]);
  const [imagenesNuevasFiles, setImagenesNuevasFiles] = useState<File[]>([]);
  const [previewsNuevas, setPreviewsNuevas] = useState<string[]>([]);

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
      setEtiquetas(Array.isArray(productoEditando.etiquetas) ? productoEditando.etiquetas : []);
      setMostrarUltimasUnidades(productoEditando.mostrar_ultimas_unidades || false);
      setPermiteCuotas(productoEditando.permite_cuotas !== false);

      const fotosExistentes: string[] = productoEditando.imagenes_urls && productoEditando.imagenes_urls.length > 0
        ? productoEditando.imagenes_urls
        : productoEditando.imagen_url
        ? [productoEditando.imagen_url]
        : [];

      setImagenesExistentes(fotosExistentes);
      setImagenesNuevasFiles([]);
      setPreviewsNuevas([]);
      setIsOpen(true);
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
    setEtiquetas([]);
    setMostrarUltimasUnidades(false);
    setPermiteCuotas(true);
    setImagenesExistentes([]);
    setImagenesNuevasFiles([]);
    setPreviewsNuevas([]);
  };

  const generarCodigoBarras = () => {
    const randomCode = "779" + Math.floor(1000000000 + Math.random() * 9000000000);
    setCodigoBarras(randomCode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));

    setImagenesNuevasFiles((prev) => [...prev, ...filesArray]);
    setPreviewsNuevas((prev) => [...prev, ...newPreviews]);
  };

  const eliminarExistente = (index: number) => {
    setImagenesExistentes((prev) => prev.filter((_, i) => i !== index));
  };

  const eliminarNueva = (index: number) => {
    URL.revokeObjectURL(previewsNuevas[index]);
    setImagenesNuevasFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewsNuevas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) {
      alert("Por favor completa el nombre y el precio.");
      return;
    }

    setCargando(true);
    const urlsSubidas: string[] = [];

    for (const file of imagenesNuevasFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("productos")
        .upload(filePath, file);

      if (uploadError) {
        alert("Error al subir una de las imágenes: " + uploadError.message);
        setCargando(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("productos")
        .getPublicUrl(filePath);

      urlsSubidas.push(publicUrlData.publicUrl);
    }

    const imagenesFinales = [...imagenesExistentes, ...urlsSubidas];
    const portadaPrincipal = imagenesFinales.length > 0 ? imagenesFinales[0] : null;

    const productoData = {
      nombre,
      descripcion,
      precio: Number(precio),
      precio_original: precioOriginal ? Number(precioOriginal) : null,
      stock: stock ? Number(stock) : 0,
      stock_minimo: stockMinimo ? Number(stockMinimo) : 5,
      codigo_barras: codigoBarras ? codigoBarras.trim() : null,
      categoria: categoria || "General",
      etiquetas, // <-- Guardamos la lista de etiquetas
      imagen_url: portadaPrincipal,
      imagenes_urls: imagenesFinales,
      mostrar_ultimas_unidades: Boolean(mostrarUltimasUnidades),
      permite_cuotas: Boolean(permiteCuotas),
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
      setIsOpen(false);
    }

    setCargando(false);
  };

  const totalImagenes = imagenesExistentes.length + previewsNuevas.length;

  return (
    <div className="mb-8 rounded-2xl border border-[#E7E5E0] bg-white shadow-sm transition-all overflow-hidden">
      {/* Cabecera */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between p-5 hover:bg-[#F7F7F5] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0E6E55] text-white text-xs font-bold">
            {isOpen ? "−" : "+"}
          </div>
          <h2 className="m-0 text-base font-bold text-[#12151B]">
            {productoEditando ? "✏️ Editar Producto" : "➕ Agregar Nuevo Producto"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {productoEditando && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancelarEdicion();
              }}
              className="text-xs font-semibold text-[#C84343] hover:underline"
            >
              Cancelar Edición
            </button>
          )}
          <span className="text-xs font-medium text-[#6B675F]">
            {isOpen ? "Ocultar formulario" : "Desplegar formulario"}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="border-t border-[#E7E5E0] p-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#6B675F]">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B675F]">Código de Barras</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                placeholder="Ej: 779123456789"
                className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
              />
              <button
                type="button"
                onClick={generarCodigoBarras}
                className="rounded-xl bg-gray-100 px-3 text-xs font-bold text-[#12151B] hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                🎲 Generar
              </button>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center justify-center rounded-xl bg-[#12151B] px-3.5 text-base text-white hover:bg-[#2C323E]"
              >
                📷
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B675F]">Categoría Principal</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
            >
              <option value="" className="text-[#12151B]">General</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nombre} className="text-[#12151B]">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Subcomponente de Etiquetas */}
          <SeccionEtiquetas etiquetas={etiquetas} setEtiquetas={setEtiquetas} />

          <div>
            <label className="block text-xs font-medium text-[#6B675F]">Precio ($)</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B675F]">Precio Anterior / Oferta ($) (Opcional)</label>
            <input
              type="number"
              value={precioOriginal}
              onChange={(e) => setPrecioOriginal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B675F]">Stock Actual</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B675F]">Stock Mínimo (Alerta)</label>
            <input
              type="number"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
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

          <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3">
            <input
              type="checkbox"
              id="permiteCuotas"
              checked={permiteCuotas}
              onChange={(e) => setPermiteCuotas(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded accent-[#0E6E55]"
            />
            <label htmlFor="permiteCuotas" className="cursor-pointer text-xs font-medium text-[#12151B]">
              💳 Permitir financiación en <span className="font-bold text-[#0E6E55]">cuotas</span> para este producto
            </label>
          </div>

          {/* Subcomponente de Galería de Imágenes */}
          <CargadorImagenes
            totalImagenes={totalImagenes}
            imagenesExistentes={imagenesExistentes}
            previewsNuevas={previewsNuevas}
            handleFileChange={handleFileChange}
            eliminarExistente={eliminarExistente}
            eliminarNueva={eliminarNueva}
          />

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#6B675F]">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3 text-sm font-medium text-[#12151B] outline-none focus:border-[#0E6E55]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl bg-[#0E6E55] py-3 text-sm font-semibold text-white transition-all hover:bg-[#0A5340] disabled:opacity-50 cursor-pointer"
            >
              {cargando ? "Guardando..." : productoEditando ? "Actualizar Producto" : "Guardar Producto"}
            </button>
          </div>
        </form>
      )}

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => setCodigoBarras(code)}
      />
    </div>
  );
}
