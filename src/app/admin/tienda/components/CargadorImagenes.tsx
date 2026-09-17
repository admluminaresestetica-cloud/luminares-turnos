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
      <label className="mb-1.5 block text-xs font-semibold text-[#6B675F]">
        Imágenes del Producto <span className="font-normal text-[#A6A29B]">({totalImagenes} cargadas)</span>
      </label>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="w-full rounded-xl border border-dashed border-[#E7E5E0] bg-[#F7F7F5] p-3 text-xs text-[#12151B] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#12151B] file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#2C323E]"
      />

      {totalImagenes > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {imagenesExistentes.map((url, idx) => (
            <div
              key={`exist-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-[#F7F7F5]"
            >
              <img src={url} alt={`Imagen ${idx + 1}`} className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                #{idx + 1} {idx === 0 && "★"}
              </span>
              <button
                type="button"
                onClick={() => eliminarExistente(idx)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-90 transition-opacity hover:opacity-100 active:scale-95"
                title="Eliminar imagen"
              >
                ✕
              </button>
            </div>
          ))}

          {previewsNuevas.map((previewUrl, idx) => {
            const numeroImg = imagenesExistentes.length + idx + 1;
            return (
              <div
                key={`new-${idx}`}
                className="group relative aspect-square overflow-hidden rounded-xl border-2 border-[#0E6E55]/40 bg-[#F7F7F5]"
              >
                <img src={previewUrl} alt={`Nueva ${numeroImg}`} className="h-full w-full object-cover" />
                <span className="absolute left-1 top-1 rounded-md bg-[#0E6E55] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  #{numeroImg} {numeroImg === 1 && "★"}
                </span>
                <button
                  type="button"
                  onClick={() => eliminarNueva(idx)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-90 transition-opacity hover:opacity-100 active:scale-95"
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