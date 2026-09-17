"use client";

import { forwardRef } from "react";
import { Camera, MapPin } from "lucide-react";
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

const BADGE_MAP: Record<Exclude<BadgeTipo, "ninguno">, { texto: string; bg: string }> = {
  ultimas_unidades: { texto: "🔥 ¡ÚLTIMAS UNIDADES!", bg: "bg-amber-500 text-white" },
  mas_vendido: { texto: "⭐ MÁS VENDIDO", bg: "bg-yellow-400 text-gray-900" },
  oferta: { texto: "💥 OFERTA ESPECIAL", bg: "bg-red-600 text-white" },
  envio_gratis: { texto: "🚚 ENVÍO GRATIS", bg: "bg-blue-600 text-white" },
  nuevo: { texto: "✨ NUEVO INGRESO", bg: "bg-purple-600 text-white" },
};

interface LienzoStoryProps {
  producto: any;
  config: ConfiguracionEmpresa | null;
  opciones: OpcionesStory;
}

export const LienzoStory = forwardRef<HTMLDivElement, LienzoStoryProps>(
  ({ producto, config, opciones }, ref) => {
    const imagenPortada =
      producto.imagenes_urls && producto.imagenes_urls.length > 0
        ? producto.imagenes_urls[0]
        : producto.imagen_url || null;

    const cuotaInfo = calcularCuotas(producto.precio);

    const usuarioInstagram =
      config?.instagram_usuario ||
      `@${(config?.nombre_empresa || "luminares").toLowerCase().replace(/\s+/g, "")}`;

    const bgStyle = opciones.usarColorPersonalizado
      ? { backgroundColor: opciones.colorFondo }
      : undefined;

    const bgClass = !opciones.usarColorPersonalizado
      ? opciones.estiloPlantilla === "destacado"
        ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900"
        : "bg-white"
      : "";

    const colorTextoHex = opciones.usarColorPersonalizado
      ? obtenerColorTextoContraste(opciones.colorFondo)
      : opciones.estiloPlantilla === "destacado"
      ? "#ffffff"
      : "#111827";

    const esTextoOscuro = colorTextoHex === "#111827";

    // Dimensiones según formato
    const esFeed = opciones.formato === "feed";
    const dimensionesClase = esFeed
      ? "w-[380px] h-[380px]"
      : "w-[281px] h-[500px]";

    return (
      <div
        ref={ref}
        style={{ ...bgStyle, color: colorTextoHex }}
        className={`relative flex shrink-0 flex-col justify-between p-5 shadow-xl transition-all ${dimensionesClase} ${bgClass}`}
      >
        {/* Encabezado Marca */}
        <div className="flex items-center justify-between z-10 border-b border-black/10 pb-2">
          <span
            className="text-xs font-black tracking-widest uppercase"
            style={{ color: esTextoOscuro ? "#047857" : "#34d399" }}
          >
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

        {/* Contenedor e Imagen Central */}
        <div
          className={`relative my-auto flex w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50/80 shadow-inner border border-black/5 ${
            esFeed ? "h-40 my-1" : "h-48 my-2"
          }`}
        >
          {imagenPortada ? (
            <img
              src={imagenPortada}
              alt={producto.nombre}
              className={`h-full w-full ${
                opciones.fitImagen === "cover" ? "object-cover" : "object-contain p-2"
              }`}
            />
          ) : (
            <Camera className="h-10 w-10 text-gray-300" />
          )}

          {/* Badge Flotante */}
          {opciones.badge !== "ninguno" && BADGE_MAP[opciones.badge] && (
            <span
              className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black rounded-md shadow-md uppercase tracking-wider ${
                BADGE_MAP[opciones.badge].bg
              }`}
            >
              {BADGE_MAP[opciones.badge].texto}
            </span>
          )}
        </div>

        {/* Contenido Inferior */}
        <div className="space-y-1.5 z-10">
          {opciones.mostrarCategoria && (
            <span className="inline-block rounded-md bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-900 shadow-sm">
              {producto.categoria || "Producto"}
            </span>
          )}

          <h4 className="text-sm font-bold line-clamp-2 leading-tight">
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

          {/* Info Cuotas */}
          {opciones.mostrarCuotas && producto.permite_cuotas !== false && (
            <p className="text-[10px] font-semibold text-purple-700 bg-purple-50/90 px-2 py-0.5 rounded-md inline-block shadow-sm">
              💳 3 cuotas sin interés de ${cuotaInfo.montoCuota.toLocaleString("es-AR")}
            </p>
          )}

          {/* Footer Call To Action + Dirección */}
          <div className="pt-1.5 border-t border-black/10 text-center flex flex-col items-center gap-0.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: esTextoOscuro ? "#047857" : "#34d399" }}
            >
              📲 ¡Pedilo por Tienda Online!
            </span>

            {opciones.mostrarDireccion && config?.direccion_texto && (
              <span
                className="text-[9px] font-medium flex items-center gap-1 truncate max-w-full"
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