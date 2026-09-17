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