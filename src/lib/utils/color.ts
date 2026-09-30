import { TemaColores } from '../supabase/configuracion-empresa';

export function obtenerColorTextoContraste(hexColor: string): "#ffffff" | "#111827" {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#111827" : "#ffffff";
}

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
 * Aplica los colores de marca/acento en el documento sin sobreescribir los fondos
 * neutros (background/card/border) para respetar el modo claro/oscuro de next-themes.
 */
export function aplicarTemaEnDocumento(tema: TemaColores) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Solo inyectamos colores de marca e identidad visual
  const mapaVariablesMarcas: Partial<Record<keyof TemaColores, string>> = {
    primary: '--primary',
    primary_foreground: '--primary-foreground',
    secondary: '--secondary',
    secondary_foreground: '--secondary-foreground',
    accent: '--accent',
    accent_foreground: '--accent-foreground',
  };

  Object.entries(mapaVariablesMarcas).forEach(([key, varName]) => {
    const valorHex = tema[key as keyof TemaColores];
    if (valorHex) {
      const hslVal = hexToHslChannels(valorHex);
      root.style.setProperty(varName, hslVal);
      root.style.setProperty(`${varName}-hex`, valorHex);
    }
  });

  if (tema.primary) {
    const primaryHsl = hexToHslChannels(tema.primary);
    root.style.setProperty('--ring', primaryHsl);
  }
}