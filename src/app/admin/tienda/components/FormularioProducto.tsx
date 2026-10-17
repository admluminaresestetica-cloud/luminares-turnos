"use client";

import { useState, useEffect } from "react";
import ScannerModal from "./ScannerModal";
import SeccionEtiquetas from "./SeccionEtiquetas";
import CargadorImagenes from "./CargadorImagenes";

import { 
  Plus, 
  Minus, 
  Search, 
  Barcode, 
  Camera, 
  Package, 
  Tag, 
  DollarSign, 
  Layers, 
  FileText, 
  Loader2,
  Flame,
  CreditCard
} from "lucide-react";

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
  const [productoExistenteAviso, setProductoExistenteAviso] = useState<string | null>(null);

  const verificarCodigoEnSupabase = async (codigo: string) => {
    if (!codigo || codigo.trim() === "") {
      setProductoExistenteAviso(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("codigo_barras", codigo.trim())
        .maybeSingle();

      if (data && !error) {
        // Autocompleta los estados
        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setPrecio(data.precio || "");
        setPrecioOriginal(data.precio_original || "");
        setStock(data.stock || "");
        setStockMinimo(data.stock_minimo ?? "5");
        setCategoria(data.categoria || "");
        setEtiquetas(Array.isArray(data.etiquetas) ? data.etiquetas : []);
        setMostrarUltimasUnidades(data.mostrar_ultimas_unidades || false);
        setPermiteCuotas(data.permite_cuotas !== false);

        const fotosExistentes: string[] = data.imagenes_urls && data.imagenes_urls.length > 0
          ? data.imagenes_urls
          : data.imagen_url
          ? [data.imagen_url]
          : [];

        setImagenesExistentes(fotosExistentes);

        // ¡En vez de alert, seteamos un aviso visual sutil!
        setProductoExistenteAviso(`Producto existente encontrado: "${data.nombre}". Se cargaron sus datos para edición.`);
      } else {
        setProductoExistenteAviso(null);
      }
    } catch (err) {
      console.error("Error al buscar el código de barras:", err);
    }
  };

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
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-all sm:mb-8 sm:rounded-3xl">
      {/* Cabecera Desplegable */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[56px] cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50 active:bg-slate-100 dark:active:bg-zinc-800 sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white font-bold transition-transform shadow-xs ${
              productoEditando ? "bg-amber-500" : "bg-emerald-600 dark:bg-emerald-500"
            }`}
          >
            {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
          <h2 className="m-0 truncate text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
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
              className="rounded-xl px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-95 cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <span className="hidden text-xs font-medium text-slate-500 dark:text-zinc-400 sm:inline">
            {isOpen ? "Ocultar" : "Desplegar"}
          </span>
        </div>
      </div>

      {/* Cuerpo del Formulario */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="border-t border-slate-200/80 dark:border-zinc-800">
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-6">

            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                Nombre del Producto
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Zapatillas Running Pro"
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            {/* Código de Barras */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Código de Barras
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={(e) => {
                    setCodigoBarras(e.target.value);
                    setProductoExistenteAviso(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      verificarCodigoEnSupabase(codigoBarras);
                    }
                  }}
                  placeholder="Ej: 779123456789"
                  className="w-full min-w-0 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800"
                />

                <button
                  type="button"
                  onClick={() => verificarCodigoEnSupabase(codigoBarras)}
                  title="Buscar código en la base"
                  className="shrink-0 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 px-3.5 text-slate-700 dark:text-zinc-200 transition-all hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  <Search className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    generarCodigoBarras();
                    setProductoExistenteAviso(null);
                  }}
                  title="Generar código aleatorio"
                  className="shrink-0 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 px-3.5 text-slate-700 dark:text-zinc-200 transition-all hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  <Barcode className="w-4 h-4 text-amber-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  title="Escanear con cámara"
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition-all hover:bg-slate-800 dark:hover:bg-zinc-200 active:scale-95 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Aviso visual integrado y sutil debajo del campo */}
              {productoExistenteAviso && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-3 text-xs font-medium text-amber-800 dark:text-amber-300">
                  <span>⚠️</span>
                  <p>{productoExistenteAviso}</p>
                </div>
              )}
            </div>

            {/* Categoría Principal */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Categoría Principal
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-zinc-900">General</option>
                {categorias.map((c: any) => (
                  <option key={c.id} value={c.nombre} className="bg-white dark:bg-zinc-900">
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcomponente de Etiquetas */}
            <SeccionEtiquetas etiquetas={etiquetas} setEtiquetas={setEtiquetas} />

            {/* Precio */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Precio ($)
              </label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800 p-3.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800"
                required
              />
            </div>

            {/* Precio Anterior / Oferta */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Precio Anterior / Oferta ($)
              </label>
              <input
                type="number"
                value={precioOriginal}
                onChange={(e) => setPrecioOriginal(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800"
              />
            </div>

            {/* Stock Actual */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                Stock Actual
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800"
              />
            </div>

{/* Stock Mínimo */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                Stock Mínimo (Alerta)
              </label>
              <input
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800"
              />
            </div>

            {/* Toggle: últimas unidades */}
            <label
              htmlFor="mostrarUltimasUnidades"
              className="sm:col-span-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/60 p-3.5 transition-colors hover:border-amber-300 dark:hover:border-amber-800"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Mostrar distintivo <span className="font-extrabold text-amber-600 dark:text-amber-400">"¡Últimas unidades!"</span></span>
              </span>
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input
                  type="checkbox"
                  id="mostrarUltimasUnidades"
                  checked={mostrarUltimasUnidades}
                  onChange={(e) => setMostrarUltimasUnidades(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-slate-300 dark:bg-zinc-700 transition-colors peer-checked:bg-amber-500" />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            {/* Toggle: cuotas */}
            <label
              htmlFor="permiteCuotas"
              className="sm:col-span-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/60 p-3.5 transition-colors hover:border-emerald-500/40"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Permitir financiación en <span className="font-extrabold text-emerald-600 dark:text-emerald-400">cuotas</span></span>
              </span>
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input
                  type="checkbox"
                  id="permiteCuotas"
                  checked={permiteCuotas}
                  onChange={(e) => setPermiteCuotas(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-slate-300 dark:bg-zinc-700 transition-colors peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500" />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            {/* Subcomponente de Galería de Imágenes */}
            <div className="sm:col-span-2">
              <CargadorImagenes
                totalImagenes={totalImagenes}
                imagenesExistentes={imagenesExistentes}
                previewsNuevas={previewsNuevas}
                handleFileChange={handleFileChange}
                eliminarExistente={eliminarExistente}
                eliminarNueva={eliminarNueva}
              />
            </div>

            {/* Descripción */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                placeholder="Detalles, materiales, talles..."
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800"
              />
            </div>
          </div>

          {/* Botón Guardar / Actualizar */}
          <div className="sticky bottom-0 border-t border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-4 backdrop-blur-sm sm:static sm:border-t-0 sm:px-6 sm:pb-6 sm:pt-0">
            <button
              type="submit"
              disabled={cargando}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs sm:text-sm font-bold text-white shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{productoEditando ? "Actualizar Producto" : "Guardar Producto"}</span>
              )}
            </button>
          </div>
        </form>
      )}

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code: string) => {
          setCodigoBarras(code);
          verificarCodigoEnSupabase(code);
        }}
      />
    </div>
  );
}