"use client";

import { useRef, useState } from "react";
import {
  Smartphone,
  X,
  Share2,
  Download,
  Loader2,
  PlusCircle,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { toPng } from "html-to-image";
import { ConfiguracionEmpresa } from "@/lib/supabase/configuracion-empresa";
import { LayoutCollage, OpcionesStory, PiezaTandaStory } from "@/types/story";

import {
  SelectorCollage,
  OpcionImagenCollage,
} from "./subcomponents/SelectorCollage";

import { LienzoStory } from "./LienzoStory";
import { ControlesEditor } from "./ControlesEditor";
import { BandejaTandaStory } from "./BandejaTandaStory";
import {
  compartirMultiplesImagenes,
  descargarMultiplesImagenes,
} from "@/utils/shareImage";

interface ModalGeneradorStoryProps {
  isOpen: boolean;
  onClose: () => void;
  producto: any | null;
  config: ConfiguracionEmpresa | null;
}

export function ModalGeneradorStory({
  isOpen,
  onClose,
  producto,
  config,
}: ModalGeneradorStoryProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [tanda, setTanda] = useState<PiezaTandaStory[]>([]);
  const [piezaInspeccionada, setPiezaInspeccionada] = useState<PiezaTandaStory | null>(null);
  const [textoCopiado, setTextoCopiado] = useState(false);

  const [opciones, setOpciones] = useState<OpcionesStory>({
    estiloPlantilla: "minimal",
    formato: "story",
    fitImagen: "contain",
    colorFondo: "#ffffff",
    usarColorPersonalizado: false,
    fuenteTipografica: "modern",
    alineacionTexto: "left",
    badge: "ninguno",
    mostrarCuotas: true,
    mostrarDireccion: true,
    mostrarCategoria: true,
    filtrosImagen: {
      brillo: 100,
      contraste: 100,
      saturacion: 100,
      rotacion: 0,
    },
  });

  if (!isOpen || !producto) return null;

  const fotosProducto: string[] =
    producto?.imagenes_urls && producto.imagenes_urls.length > 0
      ? producto.imagenes_urls
      : producto?.imagen_url
      ? [producto.imagen_url]
      : [];

  const opcionesImagenCollage: OpcionImagenCollage[] = [
    ...fotosProducto.map((url, idx) => ({
      id: `prod-${idx}`,
      etiqueta: `Foto producto ${idx + 1}`,
      origen: "producto" as const,
      url,
    })),
    ...tanda.map((pieza, idx) => ({
      id: `tanda-${pieza.id}`,
      etiqueta: `Tanda #${idx + 1}`,
      origen: "tanda" as const,
      url: pieza.dataUrl,
    })),
  ];

  const handleChangeLayoutCollage = (nuevoLayout: LayoutCollage) => {
    const cantidad = nuevoLayout === "4-grid" ? 4 : nuevoLayout === "3-mix" ? 3 : 2;
    const basePool =
      opcionesImagenCollage.length > 0
        ? opcionesImagenCollage.map((o) => o.url)
        : [];

    const celdasActuales = opciones.collageConfig?.celdas || [];
    const nuevasCeldas = Array.from({ length: cantidad }).map(
      (_, idx) =>
        celdasActuales[idx] ||
        basePool[idx % Math.max(basePool.length, 1)] ||
        ""
    );

    setPiezaInspeccionada(null);
    setOpciones((prev) => ({
      ...prev,
      estiloPlantilla: "collage",
      collageConfig: {
        layout: nuevoLayout,
        celdas: nuevasCeldas,
      },
    }));
  };

  const handleChangeCeldaCollage = (indiceCelda: number, url: string) => {
    const layoutActual = opciones.collageConfig?.layout || "2-cols";
    const cantidad =
      layoutActual === "4-grid" ? 4 : layoutActual === "3-mix" ? 3 : 2;
    const basePool =
      opcionesImagenCollage.length > 0
        ? opcionesImagenCollage.map((o) => o.url)
        : [];

    const celdasActuales = Array.from({ length: cantidad }).map(
      (_, idx) =>
        opciones.collageConfig?.celdas?.[idx] ||
        basePool[idx % Math.max(basePool.length, 1)] ||
        ""
    );
    celdasActuales[indiceCelda] = url;

    setPiezaInspeccionada(null);
    setOpciones((prev) => ({
      ...prev,
      estiloPlantilla: "collage",
      collageConfig: {
        layout: layoutActual,
        celdas: celdasActuales,
      },
    }));
  };

  const textoSugerido = `¡Mirá esta oferta de ${producto.nombre || "nuestra tienda"}${
    producto.precio ? ` a $${producto.precio}` : ""
  }!`;

  const nombreLimpio = (producto.nombre || "producto")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const generarDataUrlActual = async (): Promise<string | null> => {
    // Si está inspeccionando una pieza ya guardada, devolvemos su dataUrl
    if (piezaInspeccionada) {
      return piezaInspeccionada.dataUrl;
    }
    if (!cardRef.current) return null;
    try {
      return await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
    } catch (err) {
      console.error("Error al generar la imagen:", err);
      return null;
    }
  };

  const construirNombreArchivo = (formato: OpcionesStory["formato"], indice?: number) => {
    const sufijoIndice = typeof indice === "number" ? `-${indice + 1}` : "";
    return `${formato}-${nombreLimpio}${sufijoIndice}.png`;
  };

  const agregarPiezaATanda = async () => {
    setProcesando(true);
    const dataUrl = await generarDataUrlActual();
    if (dataUrl) {
      const nuevaPieza: PiezaTandaStory = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        dataUrl,
        formato: opciones.formato,
        nombreArchivo: construirNombreArchivo(opciones.formato, tanda.length),
        etiqueta: `${producto.nombre || "Pieza"} (${opciones.estiloPlantilla})`,
        textoSugerido,
      };
      setTanda((prev) => [...prev, nuevaPieza]);
      setPiezaInspeccionada(null);
    }
    setProcesando(false);
  };

  const eliminarPiezaDeTanda = (id: string) => {
    setTanda((prev) => prev.filter((item) => item.id !== id));
    if (piezaInspeccionada?.id === id) {
      setPiezaInspeccionada(null);
    }
  };

  const limpiarTanda = () => {
    setTanda([]);
    setPiezaInspeccionada(null);
  };

  const copiarTexto = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textoSugerido);
        setTextoCopiado(true);
        setTimeout(() => setTextoCopiado(false), 2000);
      } catch {
        // Ignorar error de portapapeles
      }
    }
  };

  const obtenerLoteParaExportar = async (): Promise<{
    dataUrls: string[];
    nombresArchivo: string[];
  } | null> => {
    if (opciones.estiloPlantilla === "mosaico_stories") {
      if (!cardRef.current) return null;
      try {
        const dataUrlMosaico = await toPng(cardRef.current, {
          pixelRatio: 3,
          cacheBust: true,
        });
        return {
          dataUrls: [dataUrlMosaico],
          nombresArchivo: [construirNombreArchivo("story")],
        };
      } catch (err) {
        console.error("Error al generar mosaico:", err);
        return null;
      }
    }

    if (tanda.length > 0) {
      return {
        dataUrls: tanda.map((p) => p.dataUrl),
        nombresArchivo: tanda.map((p) => p.nombreArchivo),
      };
    }

    const actual = await generarDataUrlActual();
    if (!actual) return null;
    return {
      dataUrls: [actual],
      nombresArchivo: [construirNombreArchivo(opciones.formato)],
    };
  };

  const compartirStory = async () => {
    setProcesando(true);
    const lote = await obtenerLoteParaExportar();
    if (lote) {
      await compartirMultiplesImagenes({
        dataUrls: lote.dataUrls,
        nombresArchivo: lote.nombresArchivo,
        nombreBase: `${opciones.formato}-${nombreLimpio}`,
        titulo: producto.nombre || "Promoción",
        texto: textoSugerido,
        copiarTextoAlPortapapeles: true,
      });
    }
    setProcesando(false);
  };

  const descargarStory = async () => {
    setProcesando(true);
    const lote = await obtenerLoteParaExportar();
    if (lote) {
      descargarMultiplesImagenes(
        lote.dataUrls,
        lote.nombresArchivo,
        `${opciones.formato}-${nombreLimpio}`
      );
    }
    setProcesando(false);
  };

  const cantidadLista =
    opciones.estiloPlantilla === "mosaico_stories"
      ? 1
      : tanda.length > 0
      ? tanda.length
      : 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 p-2 sm:p-4 backdrop-blur-sm transition-all pb-16 sm:pb-4">
      <div className="relative flex max-h-[90vh] sm:max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Generador de Imagen Promocional
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Armá una o varias piezas en la tanda y compartilas juntas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-90 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo: Controles + Vista Previa + Bandeja de Tanda */}
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3 sm:p-5 bg-slate-50 dark:bg-zinc-950/50 overflow-y-auto">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 sm:gap-5 items-stretch sm:items-center justify-start sm:justify-center">
            {/* Editor de controles */}
            <div className="w-full sm:w-[360px] lg:w-[400px] shrink-0 h-full max-h-[60vh] sm:max-h-[62vh] flex flex-col overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex-1 overflow-y-auto p-2 sm:p-3">
                <ControlesEditor
                  opciones={opciones}
                  onChangeOpciones={(nuevas) => {
                    setPiezaInspeccionada(null);
                    setOpciones(nuevas);
                  }}
                />
              </div>
            </div>

            {/* Área de vista previa */}
            <div className="relative flex-1 flex flex-col justify-center items-center p-2 sm:p-3 w-full min-h-[280px] sm:min-h-[420px] overflow-hidden bg-slate-200/50 dark:bg-zinc-900/80 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              {piezaInspeccionada && (
                <div className="mb-2 flex items-center gap-2 rounded-full bg-emerald-600/90 px-3 py-1 text-[11px] font-bold text-white shadow-xs z-20">
                  <span>Viendo pieza guardada: {piezaInspeccionada.etiqueta}</span>
                  <button
                    type="button"
                    onClick={() => setPiezaInspeccionada(null)}
                    className="inline-flex items-center gap-1 underline hover:text-emerald-100 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    Volver al editor
                  </button>
                </div>
              )}

              <div
                className={`transform transition-transform origin-center flex items-center justify-center ${
                  opciones.formato === "story"
                    ? "scale-[0.58] xs:scale-[0.68] sm:scale-90"
                    : opciones.formato === "feed"
                    ? "scale-[0.68] xs:scale-[0.78] sm:scale-95"
                    : "scale-[0.62] xs:scale-[0.72] sm:scale-90"
                }`}
              >
                {piezaInspeccionada ? (
                  <img
                    src={piezaInspeccionada.dataUrl}
                    alt={piezaInspeccionada.etiqueta}
                    className="rounded-xl shadow-2xl max-h-[440px] w-auto object-contain"
                  />
                ) : (
                  <LienzoStory
                   ref={cardRef}
                   producto={producto}
                   config={config}
                   opciones={opciones}
                   piezasTanda={tanda}
                   />
                )}
              </div>
            </div>
          </div>

          {/* Bandeja inferior con las imágenes creadas */}
          <BandejaTandaStory
            piezas={tanda}
            piezaSeleccionadaId={piezaInspeccionada?.id ?? null}
            onSeleccionarPieza={(pieza) => setPiezaInspeccionada(pieza)}
            onEliminarPieza={eliminarPiezaDeTanda}
            onLimpiarTanda={limpiarTanda}
          />

          {tanda.length >= 2 && (
  <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 px-3.5 py-2">
    <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
      Tenés {tanda.length} piezas creadas. ¿Querés juntar hasta 4 en una sola Story?
    </span>
    <button
      type="button"
      onClick={() => {
        setPiezaInspeccionada(null);
        setOpciones((prev) => ({
          ...prev,
          estiloPlantilla:
            prev.estiloPlantilla === "mosaico_stories"
              ? "minimal"
              : "mosaico_stories",
          formato: "story",
        }));
      }}
      className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition-all cursor-pointer"
    >
      {opciones.estiloPlantilla === "mosaico_stories"
        ? "Volver a edición normal"
        : "Combinar 4 en 1 Story"}
        </button>
        </div>
        )}
        </div>

        {/* Pie de acciones */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-zinc-800 px-4 py-3 sm:px-6 sm:py-3.5 gap-2 bg-white dark:bg-zinc-900 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={agregarPiezaATanda}
              disabled={procesando || Boolean(piezaInspeccionada)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Agregar a la tanda</span>
            </button>

            <button
              type="button"
              onClick={copiarTexto}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
            >
              {textoCopiado ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Texto copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={descargarStory}
              disabled={procesando}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>
                {cantidadLista > 1 ? `Descargar (${cantidadLista})` : "Descargar"}
              </span>
            </button>

            <button
              type="button"
              onClick={compartirStory}
              disabled={procesando}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {procesando ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              <span>
                {procesando
                  ? "Generando..."
                  : cantidadLista > 1
                  ? `Compartir (${cantidadLista})`
                  : "Compartir"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}