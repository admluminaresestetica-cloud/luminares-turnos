import { TemaColores } from '../supabase/configuracion-empresa';

/**
 * Calcula si un color hexadecimal es claro u oscuro y devuelve el color de texto adecuado.
 */
export function obtenerColorTextoContraste(hexColor: string): "#ffffff" | "#111827" {
  // Limpiar el caracter # si viene
  const hex = hexColor.replace("#", "");

  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  // Fórmula de luminancia (estándar YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Si la luminancia es mayor o igual a 128 el fondo es claro, devolvemos texto oscuro
  return yiq >= 128 ? "#111827" : "#ffffff";
}

/**
 * Convierte un HEX (ej: #3b82f6) a formato HSL espacio-separado (ej: "217 91% 60%")
 * Requerido por Tailwind CSS para la sintaxis hsl(var(--variable))
 */
export function hexToHslChannels(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16) || 0;
  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

/**
 * Aplica la paleta de colores directamente a las variables CSS en :root
 * convirtiendo los valores HEX al formato de canales HSL que espera Tailwind.
 */
export function aplicarTemaEnDocumento(tema: TemaColores) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  const mapaVariables: Record<keyof TemaColores, string> = {
    primary: '--primary',
    primary_foreground: '--primary-foreground',
    secondary: '--secondary',
    secondary_foreground: '--secondary-foreground',
    accent: '--accent',
    accent_foreground: '--accent-foreground',
    background: '--background',
    foreground: '--foreground',
    border: '--border',
  };

  Object.entries(mapaVariables).forEach(([key, varName]) => {
    const valorHex = tema[key as keyof TemaColores];
    if (valorHex) {
      // Convertir el HEX a canales HSL compatibles con Tailwind (ej: "270 76% 53%")
      const hslVal = hexToHslChannels(valorHex);
      
      // La variable principal recibe la sintaxis HSL que consume tailwind.config.ts
      root.style.setProperty(varName, hslVal);
      
      // Guardar el valor Hexadecimal crudo por si se necesita en controles nativos (<input type="color">)
      root.style.setProperty(`${varName}-hex`, valorHex);
    }
  });

  // Derivar variables secundarias para que tarjetas, popovers y anillos concuerden con el fondo
  if (tema.background) {
    const bgHsl = hexToHslChannels(tema.background);
    root.style.setProperty('--card', bgHsl);
    root.style.setProperty('--popover', bgHsl);
  }

  if (tema.foreground) {
    const fgHsl = hexToHslChannels(tema.foreground);
    root.style.setProperty('--card-foreground', fgHsl);
    root.style.setProperty('--popover-foreground', fgHsl);
  }

  if (tema.border) {
    const borderHsl = hexToHslChannels(tema.border);
    root.style.setProperty('--input', borderHsl);
  }

  if (tema.primary) {
    const primaryHsl = hexToHslChannels(tema.primary);
    root.style.setProperty('--ring', primaryHsl);
  }
}