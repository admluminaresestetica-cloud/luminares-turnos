import type {
  DetalleReservaGeneral,
  DetalleReservaLaser,
  Reserva,
  ServicioGeneral,
  ServicioLaser,
  PromoLaser,
} from '../types';
import { getZonaById, getZonasPromoResueltas } from '../laser/calculos';
import type { SwapsMap } from '../laser/calculos';

export function buildDetalleTextoLaser(
  detalle: DetalleReservaLaser,
  zonas: ServicioLaser[],
  promos: PromoLaser[]
): string {
  if (detalle.modo === 'promo' || detalle.modo === 'promo_mas_extra') {
    const promo = promos.find((p) => p.id === detalle.promo_id);
    const swaps = (detalle.swaps ?? {}) as SwapsMap;
    const nombresPromo = promo
      ? getZonasPromoResueltas(promo, zonas, swaps).map((z) => z.nombre_zona)
      : [];
    const extras = (detalle.zonas_extra_ids ?? [])
      .map((id) => getZonaById(zonas, id)?.nombre_zona)
      .filter(Boolean);
    const base = promo ? promo.nombre_promo : 'Promo láser';
    return extras.length > 0 ? `${base} + ${extras.join(', ')}` : base;
  }

  return detalle.zonas_ids
    .map((id) => getZonaById(zonas, id)?.nombre_zona)
    .filter(Boolean)
    .join(' · ');
}

export function buildDetalleTextoGeneral(detalle: DetalleReservaGeneral): string {
  return detalle.servicios.map((s) => s.subtipo).join(' · ');
}

export function formatEstadoReserva(estado: string): { label: string; className: string } {
  switch (estado) {
    case 'confirmado':
      return { label: 'Confirmado', className: 'bg-emerald-100 text-emerald-700' };
    case 'cancelado':
      return { label: 'Cancelado', className: 'bg-slate-100 text-slate-600' };
    default:
      return { label: 'Pendiente de seña', className: 'bg-amber-100 text-amber-700' };
  }
}

export function formatDetalleReservaDisplay(
  reserva: Reserva,
  zonas?: ServicioLaser[],
  promos?: PromoLaser[],
  servicios?: ServicioGeneral[]
): string {
  const detalle = reserva.detalle_reserva as Record<string, unknown>;

  if (typeof detalle.detalle_texto === 'string' && detalle.detalle_texto) {
    return detalle.detalle_texto;
  }

  if (reserva.servicio_tipo === 'laser' && zonas && promos) {
    return buildDetalleTextoLaser(detalle as DetalleReservaLaser, zonas, promos);
  }

  if (reserva.servicio_tipo === 'general') {
    const d = detalle as DetalleReservaGeneral;
    if (d.servicios?.length) return buildDetalleTextoGeneral(d);
    if (servicios) {
      const ids = (detalle as { servicios_ids?: string[] }).servicios_ids ?? [];
      return servicios.filter((s) => ids.includes(s.id)).map((s) => s.subtipo).join(' · ');
    }
  }

  return reserva.servicio_tipo === 'laser' ? 'Depilación láser' : 'Servicio general';
}
