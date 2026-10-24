'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '@/context/ConfigContext';
import {
  TemaColores,
  TEMA_COLORES_DEFAULT,
  guardarTemaColores,
  guardarConfiguracion,
} from '@/lib/supabase/configuracion-empresa';
import { obtenerColorTextoContraste } from '@/lib/utils/color';
import { Palette, RefreshCw, Save, Check, Image as ImageIcon, Upload, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PALETAS_PREDEFINIDAS: { nombre: string; colores: TemaColores }[] = [
  {
    nombre: 'Original Dark Slate',
    colores: TEMA_COLORES_DEFAULT,
  },
  {
    nombre: 'Fucsia Luminares',
    colores: {
      primary: '#e11d48',
      primary_foreground: '#ffffff',
      secondary: '#ffe4e6',
      secondary_foreground: '#9f1239',
      accent: '#f43f5e',
      accent_foreground: '#ffffff',
      background: '#fafafa',
      foreground: '#18181b',
      border: '#fecdd3',
    },
  },
  {
    nombre: 'Rosa & Estética Chic',
    colores: {
      primary: '#ec4899',
      primary_foreground: '#ffffff',
      secondary: '#fbcfe8',
      secondary_foreground: '#831843',
      accent: '#f472b6',
      accent_foreground: '#ffffff',
      background: '#fff1f2',
      foreground: '#4c0519',
      border: '#fbcfe8',
    },
  },
  {
    nombre: 'Esmeralda & Spa',
    colores: {
      primary: '#059669',
      primary_foreground: '#ffffff',
      secondary: '#d1fae5',
      secondary_foreground: '#065f46',
      accent: '#34d399',
      accent_foreground: '#064e3b',
      background: '#f0fdf4',
      foreground: '#022c22',
      border: '#a7f3d0',
    },
  },
  {
    nombre: 'Azul Moderno',
    colores: {
      primary: '#2563eb',
      primary_foreground: '#ffffff',
      secondary: '#dbeafe',
      secondary_foreground: '#1e40af',
      accent: '#60a5fa',
      accent_foreground: '#1e3a8a',
      background: '#f8fafc',
      foreground: '#0f172a',
      border: '#bfdbfe',
    },
  },
  {
    nombre: 'Dorado & Glamour Luxury',
    colores: {
      primary: '#d97706',
      primary_foreground: '#ffffff',
      secondary: '#fef3c7',
      secondary_foreground: '#78350f',
      accent: '#f59e0b',
      accent_foreground: '#ffffff',
      background: '#fffbeb',
      foreground: '#451a03',
      border: '#fde68a',
    },
  },
  {
    nombre: 'Lila & Lavanda Relax',
    colores: {
      primary: '#8b5cf6',
      primary_foreground: '#ffffff',
      secondary: '#ede9fe',
      secondary_foreground: '#5b21b6',
      accent: '#a78bfa',
      accent_foreground: '#ffffff',
      background: '#fbfbfe',
      foreground: '#2e1065',
      border: '#ddd6fe',
    },
  },
  {
    nombre: 'Menta & Salvia Fresh',
    colores: {
      primary: '#0d9488',
      primary_foreground: '#ffffff',
      secondary: '#ccfbf1',
      secondary_foreground: '#115e59',
      accent: '#2dd4bf',
      accent_foreground: '#134e4a',
      background: '#f0fdfa',
      foreground: '#042f2e',
      border: '#99f6e4',
    },
  },
];

const DEGRADADOS_PREDEFINIDOS = [
  { nombre: 'Esmeralda Dinámico', value: 'from-emerald-700 via-teal-800 to-slate-900' },
  { nombre: 'Azul FinTech Elegante', value: 'from-blue-600 via-indigo-700 to-slate-900' },
  { nombre: 'Rosa & Fucsia Chic', value: 'from-rose-500 via-pink-600 to-slate-900' },
  { nombre: 'Dorado & Lujo', value: 'from-amber-600 via-yellow-700 to-slate-900' },
];

export default function AparienciaAjustesTab() {
  const { config, refetchConfig, actualizarTema, actualizarBanner } = useConfig();
  const [colores, setColores] = useState<TemaColores>(
    config?.tema_colores || TEMA_COLORES_DEFAULT
  );

  // Estados para el banner / hero
  const [bannerTipo, setBannerTipo] = useState<'solid' | 'gradient' | 'image'>(config?.banner_tipo || 'solid');
  const [bannerImagenUrl, setBannerImagenUrl] = useState(config?.banner_imagen_url || '');
  const [bannerDegradado, setBannerDegradado] = useState(config?.banner_degradado || DEGRADADOS_PREDEFINIDOS[0].value);
  const [bannerOpacidad, setBannerOpacidad] = useState(config?.banner_opacidad_overlay ?? 0.4);

  const [guardando, setGuardando] = useState(false);
  const [guardadoExito, setGuardadoExito] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config?.tema_colores) {
      setColores(config.tema_colores);
    }
    if (config?.banner_tipo) setBannerTipo(config.banner_tipo);
    if (config?.banner_imagen_url) setBannerImagenUrl(config.banner_imagen_url);
    if (config?.banner_degradado) setBannerDegradado(config.banner_degradado);
    if (config?.banner_opacidad_overlay !== undefined) setBannerOpacidad(config.banner_opacidad_overlay);
  }, [config]);

  // Modificar un color individual y actualizar instantáneamente en la interfaz
  const handleChangeColor = (clave: keyof TemaColores, valorHex: string) => {
    const nuevosColores = { ...colores, [clave]: valorHex };

    if (clave === 'primary') {
      nuevosColores.primary_foreground = obtenerColorTextoContraste(valorHex);
    } else if (clave === 'secondary') {
      nuevosColores.secondary_foreground = obtenerColorTextoContraste(valorHex);
    } else if (clave === 'accent') {
      nuevosColores.accent_foreground = obtenerColorTextoContraste(valorHex);
    }

    setColores(nuevosColores);
    actualizarTema(nuevosColores);
  };

  const aplicarPaletaPredefinida = (paleta: TemaColores) => {
    setColores(paleta);
    actualizarTema(paleta);
  };

  // Subir imagen al bucket config-assets
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('config-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('config-assets')
        .getPublicUrl(filePath);

      const urlFinal = publicUrlData.publicUrl;
      setBannerImagenUrl(urlFinal);
      setBannerTipo('image');
      actualizarBanner({ banner_tipo: 'image', banner_imagen_url: urlFinal });
    } catch (err) {
      console.error('Error al subir imagen:', err);
      alert('Error al subir la imagen al storage.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleRestablecer = () => {
    setColores(TEMA_COLORES_DEFAULT);
    setBannerTipo('solid');
    setBannerImagenUrl('');
    setBannerDegradado(DEGRADADOS_PREDEFINIDOS[0].value);
    setBannerOpacidad(0.4);
    actualizarTema(TEMA_COLORES_DEFAULT);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setGuardadoExito(false);

    const okTema = await guardarTemaColores(colores);
    const okConfig = await guardarConfiguracion({
      banner_tipo: bannerTipo,
      banner_imagen_url: bannerImagenUrl,
      banner_degradado: bannerDegradado,
      banner_opacidad_overlay: bannerOpacidad,
    });

    if (okTema && okConfig) {
      await refetchConfig();
      setGuardadoExito(true);
      setTimeout(() => setGuardadoExito(false), 3000);
    } else {
      alert('Hubo un error al guardar los cambios en Supabase.');
    }
    setGuardando(false);
  };

  return (
    <div className="space-y-8">
      {/* Encabezado y Acciones Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Personalización de Apariencia y Banner
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Ajusta los tonos y el diseño visual de la tienda pública y el encabezado principal.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRestablecer}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border text-foreground hover:bg-accent transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restablecer
          </button>

          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {guardadoExito ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                ¡Guardado!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECCIÓN NUEVA: Configuración del Banner Principal (Hero) */}
      <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <ImageIcon className="w-4 h-4 text-primary" />
          Estilo del Banner Principal (Hero Tienda)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setBannerTipo('solid');
              actualizarBanner({ banner_tipo: 'solid' });
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              bannerTipo === 'solid' ? 'border-primary bg-primary/5 shadow-2xs' : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-xs font-bold text-foreground">Color Sólido</span>
            <span className="text-[11px] text-muted-foreground mt-1">Usa el color primario configurado.</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBannerTipo('gradient');
              actualizarBanner({ banner_tipo: 'gradient' });
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              bannerTipo === 'gradient' ? 'border-primary bg-primary/5 shadow-2xs' : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-xs font-bold text-foreground">Degradado FinTech</span>
            <span className="text-[11px] text-muted-foreground mt-1">Combinaciones modernas con transiciones.</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBannerTipo('image');
              actualizarBanner({ banner_tipo: 'image' });
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              bannerTipo === 'image' ? 'border-primary bg-primary/5 shadow-2xs' : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-xs font-bold text-foreground">Imagen de Portada</span>
            <span className="text-[11px] text-muted-foreground mt-1">Sube una foto personalizada para el fondo.</span>
          </button>
        </div>

        {/* Opciones según el tipo elegido */}
        {bannerTipo === 'gradient' && (
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <label className="text-xs font-bold text-foreground block">Seleccionar Estilo de Degradado:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEGRADADOS_PREDEFINIDOS.map((deg) => (
                <button
                  key={deg.value}
                  type="button"
                  onClick={() => {
                    setBannerDegradado(deg.value);
                    actualizarBanner({ banner_degradado: deg.value });
                  }}
                  className={`h-12 rounded-lg bg-gradient-to-r ${deg.value} border-2 transition-all cursor-pointer flex items-center justify-center p-1 text-[10px] font-bold text-white text-center shadow-xs ${
                    bannerDegradado === deg.value ? 'border-white scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  {deg.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {bannerTipo === 'image' && (
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-foreground block">Imagen de Fondo Actual</span>
                <span className="text-[11px] text-muted-foreground">Sube una imagen horizontal de buena resolución.</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadImage}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoImagen}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary text-secondary-foreground border border-border hover:bg-accent transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {subiendoImagen ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {subiendoImagen ? 'Subiendo...' : 'Subir Imagen'}
              </button>
            </div>

            {bannerImagenUrl && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
                  <img src={bannerImagenUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Opacidad / Capa de Contraste ({Math.round(bannerOpacidad * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={bannerOpacidad}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setBannerOpacidad(val);
                      actualizarBanner({ banner_opacidad_overlay: val });
                    }}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground">Ajusta la oscuridad para asegurar que las letras blancas resalten bien sobre la foto.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paletas de Colores Rápidas */}
      <div className="bg-card border border-border p-5 rounded-2xl space-y-3 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          Plantillas de Marca Predefinidas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PALETAS_PREDEFINIDAS.map((p) => (
            <button
              key={p.nombre}
              type="button"
              onClick={() => aplicarPaletaPredefinida(p.colores)}
              className="p-3 rounded-xl border border-border hover:border-primary/50 text-left transition-all bg-background/50 hover:bg-card shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-1 mb-2">
                <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: p.colores.primary }} />
                <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: p.colores.secondary }} />
                <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: p.colores.accent }} />
                <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: p.colores.background }} />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                {p.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel de Controles de Color (Pickers) */}
        <div className="lg:col-span-7 bg-card border border-border p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border">
            Selectores de Color
          </h3>

          <div className="space-y-4">
            {/* Color Primario */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-background/30">
              <div>
                <span className="text-xs font-bold text-foreground block">Color Primario (Marca)</span>
                <span className="text-[11px] text-muted-foreground">Botones principales, íconos activos y destacados.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colores.primary}
                  onChange={(e) => handleChangeColor('primary', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={colores.primary}
                  onChange={(e) => handleChangeColor('primary', e.target.value)}
                  className="w-20 px-2 py-1 text-xs rounded-lg border border-border font-mono text-center uppercase bg-card text-foreground"
                />
              </div>
            </div>

            {/* Color Secundario */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-background/30">
              <div>
                <span className="text-xs font-bold text-foreground block">Color Secundario</span>
                <span className="text-[11px] text-muted-foreground">Tarjetas secundarias, fondos de insignias y selecciones.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colores.secondary}
                  onChange={(e) => handleChangeColor('secondary', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={colores.secondary}
                  onChange={(e) => handleChangeColor('secondary', e.target.value)}
                  className="w-20 px-2 py-1 text-xs rounded-lg border border-border font-mono text-center uppercase bg-card text-foreground"
                />
              </div>
            </div>

            {/* Color Acento */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-background/30">
              <div>
                <span className="text-xs font-bold text-foreground block">Color de Acento / Hover</span>
                <span className="text-[11px] text-muted-foreground">Estados al pasar el cursor y elementos interactivos.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colores.accent}
                  onChange={(e) => handleChangeColor('accent', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={colores.accent}
                  onChange={(e) => handleChangeColor('accent', e.target.value)}
                  className="w-20 px-2 py-1 text-xs rounded-lg border border-border font-mono text-center uppercase bg-card text-foreground"
                />
              </div>
            </div>

            {/* Fondo General */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-background/30">
              <div>
                <span className="text-xs font-bold text-foreground block">Fondo Principal</span>
                <span className="text-[11px] text-muted-foreground">Fondo general de toda la aplicación.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colores.background}
                  onChange={(e) => handleChangeColor('background', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={colores.background}
                  onChange={(e) => handleChangeColor('background', e.target.value)}
                  className="w-20 px-2 py-1 text-xs rounded-lg border border-border font-mono text-center uppercase bg-card text-foreground"
                />
              </div>
            </div>

            {/* Color de Texto */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-background/30">
              <div>
                <span className="text-xs font-bold text-foreground block">Texto General</span>
                <span className="text-[11px] text-muted-foreground">Color de letras y títulos principales.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colores.foreground}
                  onChange={(e) => handleChangeColor('foreground', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={colores.foreground}
                  onChange={(e) => handleChangeColor('foreground', e.target.value)}
                  className="w-20 px-2 py-1 text-xs rounded-lg border border-border font-mono text-center uppercase bg-card text-foreground"
                />
              </div>
            </div>

            {/* Bordes */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-background/30">
              <div>
                <span className="text-xs font-bold text-foreground block">Bordes y Separadores</span>
                <span className="text-[11px] text-muted-foreground">Líneas divisoras y contornos de tarjetas.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colores.border}
                  onChange={(e) => handleChangeColor('border', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={colores.border}
                  onChange={(e) => handleChangeColor('border', e.target.value)}
                  className="w-20 px-2 py-1 text-xs rounded-lg border border-border font-mono text-center uppercase bg-card text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Muestra / Live Preview Card */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Vista Previa en Vivo (Live Preview)
          </h3>

          <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm font-bold text-foreground">Vista Previa de Componentes</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-secondary text-secondary-foreground">
                Badge Activo
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Así se verán los textos, tarjetas, bordes y botones en tu tienda y sistema de agendamiento.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs hover:opacity-95 transition-all cursor-pointer"
              >
                Botón Principal de Reserva
              </button>

              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-secondary text-secondary-foreground border border-border hover:bg-accent transition-all cursor-pointer"
              >
                Botón Secundario
              </button>
            </div>

            <div className="p-3 rounded-xl border border-border bg-background/50 space-y-1">
              <span className="text-xs font-bold text-foreground block">Tarjeta de Servicio Simulación</span>
              <span className="text-[11px] text-muted-foreground">Depilación Láser Soprano Ice • 30 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}