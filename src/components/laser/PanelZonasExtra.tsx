import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA, precioZonaExtraConDescuento } from '@/lib/laser/calculos';

interface Props {
  zonas: ServicioLaser[];
  zonasPromoIds: string[];
  zonasExtraIds: string[];
  onToggleExtra: (zonaId: string) => void;
}

export default function PanelZonasExtra({
  zonas,
  zonasPromoIds,
  zonasExtraIds,
  onToggleExtra,
}: Props) {
  const disponibles = zonas.filter((z) => !zonasPromoIds.includes(z.id));

  if (disponibles.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <p className="text-sm font-semibold text-slate-700 mb-1">Agregar zona extra</p>
      <p className="text-xs text-slate-500 mb-3">10% OFF sobre el precio de lista</p>
      <div className="space-y-2">
        {disponibles.map((zona) => {
          const activa = zonasExtraIds.includes(zona.id);
          const precioConDesc = precioZonaExtraConDescuento(zona);
          return (
            <button
              key={zona.id}
              type="button"
              onClick={() => onToggleExtra(zona.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                activa
                  ? 'border-violet-400 bg-violet-50/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
                  activa ? 'border-violet-600 bg-violet-600' : 'border-slate-300'
                }`}
              >
                {activa && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{zona.nombre_zona}</p>
                <p className="text-xs text-slate-400">
                  {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 line-through">
                  ${Number(zona.precio_lista).toLocaleString()}
                </p>
                <p className="text-sm font-bold text-violet-600">
                  ${Math.round(precioConDesc).toLocaleString()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
