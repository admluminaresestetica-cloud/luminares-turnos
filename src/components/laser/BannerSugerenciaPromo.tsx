import type { PromoLaser } from '@/lib/types';

interface Props {
  promo: PromoLaser;
  ahorro: number;
  precioIndividual: number;
  onAplicarPromo: () => void;
  onDismiss: () => void;
}

export default function BannerSugerenciaPromo({
  promo,
  ahorro,
  precioIndividual,
  onAplicarPromo,
  onDismiss,
}: Props) {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-emerald-800 text-sm">
            ¡Encontramos una promo que coincide!
          </p>
          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
            Tus zonas equivalen a <strong>{promo.nombre_promo}</strong>.
            Pagás ${Number(promo.precio_promo).toLocaleString()} en lugar de ${precioIndividual.toLocaleString()}
            {ahorro > 0 && (
              <span className="font-semibold"> — ahorrás ${ahorro.toLocaleString()}</span>
            )}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={onAplicarPromo}
              className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700"
            >
              Cambiar a promo
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs font-semibold text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
            >
              Seguir con zonas sueltas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
