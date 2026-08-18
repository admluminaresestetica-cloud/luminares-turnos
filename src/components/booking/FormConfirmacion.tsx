'use client';

import { calcularMontoSena } from '@/lib/whatsapp';
import { formatFechaDisplay } from '@/lib/calendario/slots';

interface Props {
  servicioDetalle: string;
  precioTotal: number;
  duracionTotal: number;
  fecha: string;
  hora: string;
  porcentajeSena: number;
  nombre: string;
  celular: string;
  onNombreChange: (v: string) => void;
  onCelularChange: (v: string) => void;
  onConfirmar: () => void;
  confirmando?: boolean;
  error?: string | null;
  colorAccent?: 'violet' | 'indigo' | 'rose';
}

export default function FormConfirmacion({
  servicioDetalle,
  precioTotal,
  duracionTotal,
  fecha,
  hora,
  porcentajeSena,
  nombre,
  celular,
  onNombreChange,
  onCelularChange,
  onConfirmar,
  confirmando,
  error,
  colorAccent = 'violet',
}: Props) {
  const montoSena = calcularMontoSena(precioTotal, porcentajeSena);
  const btnClass =
    colorAccent === 'rose'
      ? 'bg-rose-600 hover:bg-rose-500'
      : colorAccent === 'indigo'
        ? 'bg-indigo-600 hover:bg-indigo-500'
        : 'bg-violet-600 hover:bg-violet-500';

  const puedeConfirmar = nombre.trim().length >= 2 && celular.replace(/\D/g, '').length >= 8;

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
        <p><span className="text-slate-500">Servicio:</span> <strong>{servicioDetalle}</strong></p>
        <p><span className="text-slate-500">Fecha:</span> <strong>{formatFechaDisplay(fecha)}</strong></p>
        <p><span className="text-slate-500">Hora:</span> <strong>{hora}</strong></p>
        <p><span className="text-slate-500">Duración:</span> <strong>{duracionTotal} min</strong></p>
        <div className="pt-2 border-t border-slate-200">
          <p className="text-lg font-bold text-slate-800">${precioTotal.toLocaleString('es-AR')}</p>
          <p className="text-violet-700 font-semibold mt-1">
            Seña ({porcentajeSena}%): ${montoSena.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Ej: María García"
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
        <div>
          <label htmlFor="celular" className="block text-sm font-semibold text-slate-700 mb-2">
            Celular (WhatsApp)
          </label>
          <input
            id="celular"
            type="tel"
            value={celular}
            onChange={(e) => onCelularChange(e.target.value)}
            placeholder="Ej: 11 2345-6789"
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>
      )}

      <button
        type="button"
        onClick={onConfirmar}
        disabled={!puedeConfirmar || confirmando}
        className={`w-full text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
      >
        {confirmando ? 'Confirmando...' : 'Confirmar y enviar por WhatsApp'}
      </button>

      <p className="text-xs text-center text-slate-400">
        Al confirmar se crea tu reserva y te redirigimos a WhatsApp para abonar la seña.
      </p>
    </div>
  );
}
