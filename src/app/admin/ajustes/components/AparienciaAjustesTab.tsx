'use client';

import React, { useState, useEffect } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { guardarConfiguracion, TemaColores, TEMA_COLORES_DEFAULT } from '@/lib/supabase/configuracion-empresa';
import { obtenerColorTextoContraste } from '@/lib/utils/color';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Palette, RotateCcw, Check, Sparkles } from 'lucide-react';

const PLANTILLAS_TEMA: { nombre: string; descripcion: string; tema: Partial<TemaColores> }[] = [
  {
    nombre: 'Esmeralda & Spa',
    descripcion: 'Verdes elegantes ideales para estética y bienestar.',
    tema: {
      primary: '#059669',
      primary_foreground: '#ffffff',
      secondary: '#10b981',
      secondary_foreground: '#ffffff',
      accent: '#34d399',
      accent_foreground: '#064e3b',
      border: '#e2e8f0',
    },
  },
  {
    nombre: 'Rosa & Elegancia',
    descripcion: 'Tonos fucsia y rosa ideales para manicuría y cosmética.',
    tema: {
      primary: '#e11d48',
      primary_foreground: '#ffffff',
      secondary: '#f43f5e',
      secondary_foreground: '#ffffff',
      accent: '#fb7185',
      accent_foreground: '#881337',
      border: '#e2e8f0',
    },
  },
  {
    nombre: 'Violeta & Místico',
    descripcion: 'Púrpuras y violetas sofisticados para belleza integral.',
    tema: {
      primary: '#7c3aed',
      primary_foreground: '#ffffff',
      secondary: '#8b5cf6',
      secondary_foreground: '#ffffff',
      accent: '#a78bfa',
      accent_foreground: '#2e1065',
      border: '#e2e8f0',
    },
  },
  {
    nombre: 'Azul & Profesional',
    descripcion: 'Líneas limpias y corporativas en tonos azulados.',
    tema: {
      primary: '#2563eb',
      primary_foreground: '#ffffff',
      secondary: '#3b82f6',
      secondary_foreground: '#ffffff',
      accent: '#60a5fa',
      accent_foreground: '#1e3a8a',
      border: '#e2e8f0',
    },
  },
  {
    nombre: 'Cálido & Ámbar',
    descripcion: 'Dorados y cobres acogedores para estudio de cejas y piel.',
    tema: {
      primary: '#d97706',
      primary_foreground: '#ffffff',
      secondary: '#f59e0b',
      secondary_foreground: '#ffffff',
      accent: '#fbbf24',
      accent_foreground: '#78350f',
      border: '#e2e8f0',
    },
  },
];

export default function AparienciaAjustesTab() {
  const { config, refetchConfig, actualizarTema } = useConfig();
  
  const [temaLocal, setTemaLocal] = useState<TemaColores>(TEMA_COLORES_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    if (config?.tema_colores) {
      setTemaLocal(config.tema_colores);
    }
  }, [config]);

  const handleColorChange = (key: keyof TemaColores, value: string) => {
    const nuevoTema = { ...temaLocal, [key]: value };

    if (key === 'primary') {
      nuevoTema.primary_foreground = obtenerColorTextoContraste(value);
    } else if (key === 'secondary') {
      nuevoTema.secondary_foreground = obtenerColorTextoContraste(value);
    } else if (key === 'accent') {
      nuevoTema.accent_foreground = obtenerColorTextoContraste(value);
    }

    setTemaLocal(nuevoTema);
    actualizarTema(nuevoTema);
  };

  const aplicarPlantilla = (plantilla: Partial<TemaColores>) => {
    const nuevoTema = { ...temaLocal, ...plantilla };
    setTemaLocal(nuevoTema);
    actualizarTema(nuevoTema);
  };

  const handleRestablecer = () => {
    setTemaLocal(TEMA_COLORES_DEFAULT);
    actualizarTema(TEMA_COLORES_DEFAULT);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensajeExito(false);

    try {
      const exito = await guardarConfiguracion({
        tema_colores: temaLocal,
      });

      if (exito) {
        await refetchConfig();
        setMensajeExito(true);
        setTimeout(() => setMensajeExito(false), 3000);
      }
    } catch (error) {
      console.error('Error al guardar el tema:', error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Personalización de Marca</h3>
        <p className="text-sm text-muted-foreground">
          Ajustá los colores representativos de tu negocio. El fondo claro u oscuro se adaptará automáticamente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Plantillas Recomendadas
          </CardTitle>
          <CardDescription>
            Elegí una paleta prediseñada para aplicar al instante los colores de tu marca.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {PLANTILLAS_TEMA.map((plantilla) => (
              <button
                key={plantilla.nombre}
                type="button"
                onClick={() => aplicarPlantilla(plantilla.tema)}
                className="flex flex-col text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: plantilla.tema.primary }}
                  />
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: plantilla.tema.secondary }}
                  />
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: plantilla.tema.accent }}
                  />
                </div>
                <span className="font-medium text-xs group-hover:text-primary transition-colors">
                  {plantilla.nombre}
                </span>
                <span className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                  {plantilla.descripcion}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Colores Principales
          </CardTitle>
          <CardDescription>
            Personalizá manualmente cada token de color para ajustarlo a tu identidad visual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Color Primario */}
            <div className="space-y-2">
              <label className="text-xs font-semibold block">Color Primario</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={temaLocal.primary || '#000000'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange('primary', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer rounded-md border bg-background"
                />
                <input
                  type="text"
                  value={temaLocal.primary || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange('primary', e.target.value)}
                  placeholder="#000000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Botones principales, enlaces activos y destacados clave.
              </p>
            </div>

            {/* Color Secundario */}
            <div className="space-y-2">
              <label className="text-xs font-semibold block">Color Secundario</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={temaLocal.secondary || '#000000'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange('secondary', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer rounded-md border bg-background"
                />
                <input
                  type="text"
                  value={temaLocal.secondary || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange('secondary', e.target.value)}
                  placeholder="#000000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Botones secundarios, badges de estado y badges complementarios.
              </p>
            </div>

            {/* Color de Acento */}
            <div className="space-y-2">
              <label className="text-xs font-semibold block">Color de Acento</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={temaLocal.accent || '#000000'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange('accent', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer rounded-md border bg-background"
                />
                <input
                  type="text"
                  value={temaLocal.accent || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange('accent', e.target.value)}
                  placeholder="#000000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Efectos hover, selecciones y detalles de interacción.
              </p>
            </div>

          </div>

          <div className="pt-4 border-t space-y-3">
            <span className="text-xs font-semibold text-muted-foreground block">
              Vista previa de elementos interactivos
            </span>
            <div className="p-4 rounded-lg border bg-card flex flex-wrap items-center gap-3">
              <Button style={{ backgroundColor: temaLocal.primary, color: temaLocal.primary_foreground }}>
                Botón Primario
              </Button>
              <Button
                variant="outline"
                style={{ borderColor: temaLocal.primary, color: temaLocal.primary }}
              >
                Delineado
              </Button>
              <div
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: temaLocal.secondary, color: temaLocal.secondary_foreground }}
              >
                Badge Secundario
              </div>
              <div
                className="px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: temaLocal.accent, color: temaLocal.accent_foreground }}
              >
                Acento
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleRestablecer}
          className="text-xs gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer por defecto
        </Button>

        <div className="flex items-center gap-3">
          {mensajeExito && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> ¡Cambios guardados!
            </span>
          )}
          <Button onClick={handleGuardar} disabled={guardando} className="min-w-[120px]">
            {guardando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}