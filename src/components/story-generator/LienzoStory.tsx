"use client";

import { forwardRef } from "react";
import { Camera, MapPin, Sparkles } from "lucide-react";
import { calcularCuotas } from "@/lib/precios";
import { ConfiguracionEmpresa } from "@/lib/supabase/configuracion-empresa";
import { OpcionesStory, BadgeTipo } from "@/types/story";
import { obtenerColorTextoContraste } from "@/lib/utils/color";

const IconInstagram = ({
  className = "w-4 h-4",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    className={className}
    style={style}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const BADGE_MAP: Record<
  Exclude<BadgeTipo, "ninguno">,
  { texto: string; bg: string }
> = {
  ultimas_unidades: {
    texto: "🔥 ¡ÚLTIMAS UNIDADES!",
    bg: "bg-amber-500 text-white",
  },
  mas_vendido: { texto: "⭐ MÁS VENDIDO", bg: "bg-yellow-400 text-gray-900" },
  oferta: { texto: "💥 OFERTA ESPECIAL", bg: "bg-red-600 text-white" },
  envio_gratis: { texto: "🚚 ENVÍO GRATIS", bg: "bg-blue-600 text-white" },
  nuevo: { texto: "✨ NUEVO INGRESO", bg: "bg-purple-600 text-white" },
  cyberweek: { texto: "⚡ CYBER WEEK", bg: "bg-black text-amber-400 border border-amber-400" },
  descuento_20: { texto: "🏷️ 20% OFF", bg: "bg-emerald-600 text-white" },
  descuento_50: { texto: "🔥 50% OFF", bg: "bg-rose-600 text-white font-black" },
};

const MAPA_FUENTES: Record<string, string> = {
  modern: "font-sans",
  bold: "font-black tracking-tight",
  display: "font-mono tracking-wider uppercase",
  serif: "font-serif italic",
};

const MAPA_ALINEACION: Record<string, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

interface LienzoStoryProps {
  producto: any;
  config: ConfiguracionEmpresa | null;
  opciones: OpcionesStory;
}

export const LienzoStory = forwardRef<HTMLDivElement, LienzoStoryProps>(
  ({ producto, config, opciones }, ref) => {
    const imagenes =
      producto.imagenes_urls && producto.imagenes_urls.length > 0
        ? producto.imagenes_urls
        : producto.imagen_url
        ? [producto.imagen_url]
        : [];

    const imagenPortada = imagenes[0] || null;
    const imagenSecundaria = imagenes[1] || imagenes[0] || null;

    const cuotaInfo = calcularCuotas(producto.precio);

    const usuarioInstagram =
      config?.instagram_usuario ||
      `@${(config?.nombre_empresa || "luminares")
        .toLowerCase()
        .replace(/\s+/g, "")}`;

    const isGradientOrPattern =
      opciones.colorFondo.includes("gradient") ||
      opciones.colorFondo.includes("repeating") ||
      opciones.colorFondo.includes("radial-gradient");

    const tieneImagenFondo = Boolean(opciones.imagenFondo && opciones.imagenFondo.trim().length > 0);

    const bgStyle: React.CSSProperties = tieneImagenFondo
      ? {
          backgroundImage: `url("${opciones.imagenFondo}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
      : opciones.usarColorPersonalizado
      ? isGradientOrPattern
        ? { background: opciones.colorFondo }
        : { backgroundColor: opciones.colorFondo }
      : {};

    const bgClass = !tieneImagenFondo && !opciones.usarColorPersonalizado
      ? opciones.estiloPlantilla === "destacado"
        ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900"
        : "bg-white"
      : "";

    const colorTextoHex =
      opciones.colorTexto ||
      (opciones.imagenFondo
        ? "#ffffff"
        : opciones.usarColorPersonalizado
        ? isGradientOrPattern
          ? "#ffffff"
          : obtenerColorTextoContraste(opciones.colorFondo)
        : opciones.estiloPlantilla === "destacado"
        ? "#ffffff"
        : "#111827");

    const esTextoOscuro = colorTextoHex === "#111827" || colorTextoHex === "#0f172a";

    let dimensionesClase = "w-[281px] h-[500px]";
    if (opciones.formato === "feed") {
      dimensionesClase = "w-[380px] h-[380px]";
    } else if (opciones.formato === "banner") {
      dimensionesClase = "w-[480px] h-[270px]";
    }

    const filtros = opciones.filtrosImagen || {
      brillo: 100,
      contraste: 100,
      saturacion: 100,
      rotacion: 0,
    };

    const estiloFiltroImagen: React.CSSProperties = {
      filter: `brightness(${filtros.brillo}%) contrast(${filtros.contraste}%) saturate(${filtros.saturacion}%)`,
      transform: `rotate(${filtros.rotacion}deg)`,
      transition: "all 0.2s ease",
    };

    const claseFuente = MAPA_FUENTES[opciones.fuenteTipografica || "modern"];
    const claseAlineacion = MAPA_ALINEACION[opciones.alineacionTexto || "left"];

    return (
      <div
        ref={ref}
        style={{ ...bgStyle, color: colorTextoHex }}
        className={`relative flex shrink-0 flex-col justify-between p-5 shadow-2xl transition-all overflow-hidden ${dimensionesClase} ${bgClass} ${claseFuente}`}
      >
        {/* Capa de contraste si hay imagen de fondo */}
        {tieneImagenFondo && (
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] z-0 pointer-events-none" />
        )}

        {/* Encabezado Marca */}
        <div className="flex items-center justify-between z-10 border-b border-black/10 dark:border-white/10 pb-2 shrink-0">
          <span
            className="text-xs font-black tracking-widest uppercase flex items-center gap-1"
            style={{ color: esTextoOscuro ? "#047857" : "#34d399" }}
          >
            {opciones.estiloPlantilla === "ecommerce_modern" && (
              <Sparkles className="w-3 h-3" />
            )}
            {config?.nombre_empresa || "Luminares"}
          </span>
          <div className="flex items-center gap-1">
            <IconInstagram
              className="h-3.5 w-3.5"
              style={{ color: esTextoOscuro ? "#6b7280" : "#a1a1aa" }}
            />
            <span
              className="text-[10px] font-semibold"
              style={{ color: esTextoOscuro ? "#6b7280" : "#a1a1aa" }}
            >
              {usuarioInstagram}
            </span>
          </div>
        </div>

        {/* CONTENEDOR DE IMAGEN / COLLAGE */}
        <div
          className={`relative my-auto flex w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50/90 dark:bg-zinc-900/90 shadow-inner border border-black/5 z-10 ${
            opciones.formato === "feed"
              ? "h-44 my-1"
              : opciones.formato === "banner"
              ? "h-28 my-1"
              : "h-52 my-2"
          }`}
        >
          {opciones.estiloPlantilla === "collage" ? (
            <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
              <div className="relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                {imagenPortada ? (
                  <img
                    src={imagenPortada}
                    alt={producto.nombre}
                    style={estiloFiltroImagen}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-6 w-6 text-gray-300" />
                )}
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                {imagenSecundaria ? (
                  <img
                    src={imagenSecundaria}
                    alt={`${producto.nombre} - 2`}
                    style={estiloFiltroImagen}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-6 w-6 text-gray-300" />
                )}
              </div>
            </div>
          ) : (
            <>
              {imagenPortada ? (
                <img
                  src={imagenPortada}
                  alt={producto.nombre}
                  style={estiloFiltroImagen}
                  className={`h-full w-full ${
                    opciones.fitImagen === "cover"
                      ? "object-cover"
                      : "object-contain p-2"
                  }`}
                />
              ) : (
                <Camera className="h-10 w-10 text-gray-300" />
              )}
            </>
          )}

          {opciones.badge !== "ninguno" && BADGE_MAP[opciones.badge] && (
            <span
              className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black rounded-md shadow-md uppercase tracking-wider z-20 ${
                BADGE_MAP[opciones.badge].bg
              }`}
            >
              {BADGE_MAP[opciones.badge].texto}
            </span>
          )}
        </div>

        {/* CONTENIDO INFERIOR */}
        <div className={`space-y-1 z-10 flex flex-col ${claseAlineacion}`}>
          {opciones.mostrarCategoria && (
            <span className="inline-block rounded-md bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-900 shadow-sm">
              {producto.categoria || "Producto"}
            </span>
          )}

          <h4 className="text-sm font-bold line-clamp-2 leading-tight w-full">
            {producto.nombre}
          </h4>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-2xl font-black">${producto.precio}</span>
            {producto.precio_original && (
              <span
                className="text-xs line-through"
                style={{ color: esTextoOscuro ? "#9ca3af" : "#a1a1aa" }}
              >
                ${producto.precio_original}
              </span>
            )}
          </div>

          {opciones.mostrarCuotas && producto.permite_cuotas !== false && (
            <p className="text-[10px] font-semibold text-purple-700 bg-purple-50/90 px-2 py-0.5 rounded-md inline-block shadow-sm">
              💳 3 cuotas sin interés de ${cuotaInfo.montoCuota.toLocaleString("es-AR")}
            </p>
          )}

          <div className="pt-1 border-t border-black/10 dark:border-white/10 w-full flex flex-col gap-0.5">
            {opciones.mostrarDireccion && config?.direccion_texto && (
              <span
                className={`text-[9px] font-medium flex items-center gap-1 truncate w-full ${
                  opciones.alineacionTexto === "center"
                    ? "justify-center"
                    : opciones.alineacionTexto === "right"
                    ? "justify-end"
                    : "justify-start"
                }`}
                style={{ color: esTextoOscuro ? "#6b7280" : "#d4d4d8" }}
              >
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{config.direccion_texto}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

LienzoStory.displayName = "LienzoStory";