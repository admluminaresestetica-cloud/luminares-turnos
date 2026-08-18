interface Props {
  precio: number;
  duracion: number;
  puedeContinuar: boolean;
  onContinuar: () => void;
  detalle?: string;
}

export default function BarraFlotanteLaser({
  precio,
  duracion,
  puedeContinuar,
  onContinuar,
  detalle,
}: Props) {
  const visible = precio > 0 || duracion > 0;
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold">${precio.toLocaleString()}</p>
              <p className="text-slate-400 text-sm">{duracion} min</p>
            </div>
            {detalle && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{detalle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onContinuar}
            disabled={!puedeContinuar}
            className="shrink-0 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
