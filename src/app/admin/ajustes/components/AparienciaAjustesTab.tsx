'use client';

import React, { useState, useEffect } from 'react';
import { useConfig } from '@/context/ConfigContext';
import {
  TemaColores,
  TEMA_COLORES_DEFAULT,
  guardarTemaColores,
} from '@/lib/supabase/configuracion-empresa';
import { obtenerColorTextoContraste } from '@/lib/utils/color';
import { Palette, RefreshCw, Save, Check } from 'lucide-react';

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

export default function AparienciaAjustesTab() {
  const { config, refetchConfig, actualizarTema } = useConfig();
  const [colores, setColores] = useState<TemaColores>(
    config?.tema_colores || TEMA_COLORES_DEFAULT
  );
  const [guardando, setGuardando] = useState(false);
  const [guardadoExito, setGuardadoExito] = useState(false);

  useEffect(() => {
    if (config?.tema_colores) {
      setColores(config.tema_colores);
    }
  }, [config]);

  // Modificar un color individual y actualizar instantáneamente en la interfaz
  const handleChangeColor = (clave: keyof TemaColores, valorHex: string) => {
    const nuevosColores = { ...colores, [clave]: valorHex };

    // Auto-calcular color de texto de contraste al cambiar colores de fondo clave
    if (clave === 'primary') {
      nuevosColores.primary_foreground = obtenerColorTextoContraste(valorHex);
    } else if (clave === 'secondary') {
      nuevosColores.secondary_foreground = obtenerColorTextoContraste(valorHex);
    } else if (clave === 'accent') {
      nuevosColores.accent_foreground = obtenerColorTextoContraste(valorHex);
    }

    setColores(nuevosColores);
    actualizarTema(nuevosColores); // Live preview instantáneo
  };

  const aplicarPaletaPredefinida = (paleta: TemaColores) => {
    setColores(paleta);
    actualizarTema(paleta);
  };

  const handleRestablecer = () => {
    setColores(TEMA_COLORES_DEFAULT);
    actualizarTema(TEMA_COLORES_DEFAULT);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setGuardadoExito(false);

    const ok = await guardarTemaColores(colores);
    if (ok) {
      await refetchConfig();
      setGuardadoExito(true);
      setTimeout(() => setGuardadoExito(false), 3000);
    } else {
      alert('Hubo un error al guardar los colores en Supabase.');
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
            Personalización de Colores de la App
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Ajusta los tonos principales de tu marca. Los cambios se muestran en vivo a medida que los seleccionas.
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