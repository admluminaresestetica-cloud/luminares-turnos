"use client";

interface CargadorImagenesProps {
  totalImagenes: number;
  imagenesExistentes: string[];
  previewsNuevas: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  eliminarExistente: (index: number) => void;
  eliminarNueva: (index: number) => void;
}

export default function CargadorImagenes({
  totalImagenes,
  imagenesExistentes,
  previewsNuevas,
  handleFileChange,
  eliminarExistente,
  eliminarNueva,
}: CargadorImagenesProps) {
  return (
    <div className="sm:col-span-2">
      <label className="block text-xs font-medium text-[#6B675F] mb-1">
        Imágenes del Producto ({totalImagenes} cargadas)
      </label>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="w-full rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-2.5 text-sm text-[#12151B] outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[#12151B] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#2C323E]"
      />

      {totalImagenes > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {imagenesExistentes.map((url, idx) => (
            <div key={`exist-${idx}`} className="relative group aspect-square rounded-xl border border-gray-200 overflow-hidden bg-[#F7F7F5]">
              <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                #{idx + 1} {idx === 0 && "(Portada)"}
              </span>
              <button
                type="button"
                onClick={() => eliminarExistente(idx)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                title="Eliminar imagen"
              >
                ✕
              </button>
            </div>
          ))}

          {previewsNuevas.map((previewUrl, idx) => {
            const numeroImg = imagenesExistentes.length + idx + 1;
            return (
              <div key={`new-${idx}`} className="relative group aspect-square rounded-xl border border-[#0E6E55]/40 overflow-hidden bg-[#F7F7F5]">
                <img src={previewUrl} alt={`Nueva ${numeroImg}`} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 bg-[#0E6E55] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  #{numeroImg} {numeroImg === 1 && "(Portada)"}
                </span>
                <button
                  type="button"
                  onClick={() => eliminarNueva(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
