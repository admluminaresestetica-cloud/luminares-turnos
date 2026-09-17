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
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white shadow-sm transition-all sm:mb-8 sm:rounded-3xl">
      {/* Cabecera */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[56px] cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:bg-[#F7F7F5] active:bg-[#F0F0EC] sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-colors ${
              productoEditando ? "bg-amber-500" : "bg-[#0E6E55]"
            }`}
          >
            {isOpen ? "−" : "+"}
          </div>
          <h2 className="m-0 truncate text-sm font-bold text-[#12151B] sm:text-base">
            {productoEditando ? "Editar Producto" : "Agregar Nuevo Producto"}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {productoEditando && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancelarEdicion();
              }}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-[#C84343] transition-colors hover:bg-red-50 active:scale-95"
            >
              Cancelar
            </button>
          )}
          <span className="hidden text-xs font-medium text-[#6B675F] sm:inline">
            {isOpen ? "Ocultar" : "Desplegar"}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="border-t border-[#E7E5E0]">
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-6">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Zapatillas Running Pro"
                className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white focus:ring-2 focus:ring-[#0E6E55]/10"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">Código de Barras</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  placeholder="Ej: 779123456789"
                  className="w-full min-w-0 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={generarCodigoBarras}
                  title="Generar código"
                  className="shrink-0 rounded-xl bg-gray-100 px-3 text-xs font-bold text-[#12151B] transition-colors hover:bg-gray-200 active:scale-95 whitespace-nowrap"
                >
                  🎲
                </button>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#12151B] text-base text-white transition-colors hover:bg-[#2C323E] active:scale-95"
                >
                  📷
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">Categoría Principal</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
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
              <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">Precio ($)</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">Precio Anterior / Oferta ($)</label>
              <input
                type="number"
                value={precioOriginal}
                onChange={(e) => setPrecioOriginal(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">Stock Actual</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
              />
            </div>

            {/* Toggle: últimas unidades */}
            <label
              htmlFor="mostrarUltimasUnidades"
              className="sm:col-span-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 transition-colors hover:border-amber-300"
            >
              <span className="text-xs font-medium text-[#12151B]">
                🔥 Mostrar distintivo <span className="font-bold text-[#D97706]">"¡Últimas unidades!"</span>
              </span>
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input
                  type="checkbox"
                  id="mostrarUltimasUnidades"
                  checked={mostrarUltimasUnidades}
                  onChange={(e) => setMostrarUltimasUnidades(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-amber-500" />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            {/* Toggle: cuotas */}
            <label
              htmlFor="permiteCuotas"
              className="sm:col-span-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 transition-colors hover:border-[#0E6E55]/40"
            >
              <span className="text-xs font-medium text-[#12151B]">
                💳 Permitir financiación en <span className="font-bold text-[#0E6E55]">cuotas</span>
              </span>
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input
                  type="checkbox"
                  id="permiteCuotas"
                  checked={permiteCuotas}
                  onChange={(e) => setPermiteCuotas(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-[#0E6E55]" />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

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
              <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                placeholder="Detalles, materiales, talles..."
                className="w-full resize-none rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-3.5 text-sm font-medium text-[#12151B] outline-none transition-colors focus:border-[#0E6E55] focus:bg-white"
              />
            </div>
          </div>

          {/* Botón: sticky en mobile para llegar cómodo con el pulgar */}
          <div className="sticky bottom-0 border-t border-[#E7E5E0] bg-white/95 p-4 backdrop-blur-sm sm:static sm:border-t-0 sm:px-6 sm:pb-6 sm:pt-0">
            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl bg-[#0E6E55] py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0A5340] active:scale-[0.98] disabled:opacity-50"
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