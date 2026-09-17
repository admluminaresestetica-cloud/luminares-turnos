"use client";

interface ColorPickerProps {
  colorSeleccionado: string;
  onChangeColor: (color: string) => void;
}

const PALETA_RAPIDA = [
  { nombre: "Blanco", hex: "#ffffff" },
  { nombre: "Negro", hex: "#0f172a" },
  { nombre: "Verde Esmeralda", hex: "#065f46" },
  { nombre: "Rosa Pastel", hex: "#fbcfe8" },
  { nombre: "Púrpura", hex: "#581c87" },
  { nombre: "Gris Suave", hex: "#f3f4f6" },
];

export function ColorPicker({
  colorSeleccionado,
  onChangeColor,
}: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Color de Fondo
      </span>

      {/* Swatches de acceso rápido */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PALETA_RAPIDA.map((item) => (
          <button
            key={item.hex}
            type="button"
            title={item.nombre}
            onClick={() => onChangeColor(item.hex)}
            className={`h-7 w-7 rounded-full border border-gray-300 transition-transform ${
              colorSeleccionado.toLowerCase() === item.hex.toLowerCase()
                ? "scale-110 ring-2 ring-emerald-500 ring-offset-1"
                : "hover:scale-105"
            }`}
            style={{ backgroundColor: item.hex }}
          />
        ))}

        {/* Input Picker Personalizado */}
        <div className="relative flex items-center">
          <input
            type="color"
            value={colorSeleccionado}
            onChange={(e) => onChangeColor(e.target.value)}
            className="h-7 w-7 cursor-pointer opacity-0 absolute inset-0 z-10"
            title="Elegir color personalizado"
          />
          <div
            className="h-7 w-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-[10px] font-bold text-gray-600 bg-white hover:bg-gray-50"
            style={{ backgroundColor: colorSeleccionado }}
          >
            🎨
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
        <span>HEX:</span>
        <span className="uppercase font-bold">{colorSeleccionado}</span>
      </div>
    </div>
  );
}