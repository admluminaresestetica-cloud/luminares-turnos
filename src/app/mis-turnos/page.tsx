'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Phone, 
  Hash, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  XCircle,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { formatDetalleReservaDisplay, formatEstadoReserva } from '@/lib/booking/detalle';
import { formatFechaDisplay, puedeCancelarReserva } from '@/lib/calendario/slots';
import { getConfiguracionSistema } from '@/lib/supabase/configuracion';
import { buscarReserva, cancelarReserva } from '@/lib/supabase/reservas';
import type { Reserva } from '@/lib/types';

// Reemplazá con el número de WhatsApp de tu estética (con código de país sin +)
const NUMERO_WHATSAPP = '5493413954355'; 

export default function MisTurnosPage() {
  const [celular, setCelular] = useState('');
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ventanaHoras, setVentanaHoras] = useState(24);
  
  // Estado para controlar la apertura del modal (pop-up)
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setReserva(null);
    setBuscando(true);

    const [found, config] = await Promise.all([
      buscarReserva(celular, codigo),
      getConfiguracionSistema(),
    ]);

    if (config) setVentanaHoras(config.ventana_horas_cancelacion);

    setBuscando(false);

    if (!found) {
      setError('No encontramos una reserva con esos datos. Verificá el celular y el código.');
      return;
    }

    setReserva(found);
  };

  const handleCancelar = async () => {
    if (!reserva) return;
    setCancelando(true);
    setError(null);
    setMensaje(null);

    const ok = await cancelarReserva(reserva.id);
    setCancelando(false);

    if (!ok) {
      setError('No pudimos cancelar la reserva. Intentá de nuevo.');
      return;
    }

    setReserva({ ...reserva, estado: 'cancelado' });
    setMensaje('Tu reserva fue cancelada correctamente.');
  };

  const fechaReserva = reserva ? new Date(reserva.fecha_hora_inicio) : null;

  const fechaStr = fechaReserva
    ? `${fechaReserva.getFullYear()}-${String(fechaReserva.getMonth() + 1).padStart(2, '0')}-${String(fechaReserva.getDate()).padStart(2, '0')}`
    : '';

  const horaStr = fechaReserva
    ? `${String(fechaReserva.getHours()).padStart(2, '0')}:${String(fechaReserva.getMinutes()).padStart(2, '0')}`
    : '';

  const estadoInfo = reserva ? formatEstadoReserva(reserva.estado) : null;
  const puedeCancelar = reserva
    ? puedeCancelarReserva(reserva.fecha_hora_inicio, ventanaHoras, reserva.estado)
    : false;

  // Generar link directo a WhatsApp para Reprogramar
  const mensajeReprogramar = reserva
    ? encodeURIComponent(`Hola! Quisiera reprogramar mi turno (Código: ${reserva.codigo_unico}) reservado a nombre de ${reserva.cliente_nombre}.`)
    : '';
  const urlWhatsAppReprogramar = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeReprogramar}`;

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-12 relative">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Volver */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Mis Turnos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Consultá o gestioná el estado de tu reserva de forma rápida.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleBuscar} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-3.5">
            <div>
              <label htmlFor="celular" className="block text-xs font-bold text-slate-800 mb-1.5">
                Celular (WhatsApp)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="celular"
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="Ej: 11 2345-6789"
                  required
                  className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-white border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="codigo" className="block text-xs font-bold text-slate-800 mb-1.5">
                Código de reserva
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="codigo"
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="#7842"
                  required
                  className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-white border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={buscando}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs"
          >
            {buscando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buscando turno...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Buscar mi turno</span>
              </>
            )}
          </button>
        </form>

        {/* Alertas */}
        {error && (
          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-rose-800 leading-relaxed">{error}</p>
          </div>
        )}

        {mensaje && (
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-emerald-800 leading-relaxed">{mensaje}</p>
          </div>
        )}

        {/* Detalle del Turno */}
        {reserva && estadoInfo && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Código
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {reserva.codigo_unico}
                </h2>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${estadoInfo.className}`}>
                {estadoInfo.label}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Cliente: <strong className="text-slate-900">{reserva.cliente_nombre}</strong></span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Servicio: <strong className="text-slate-900">{formatDetalleReservaDisplay(reserva)}</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-semibold text-slate-900">{formatFechaDisplay(fechaStr)}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-900">{horaStr} hs <span className="text-slate-400 font-normal">({reserva.duracion_total}m)</span></span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500">Monto total:</span>
                <span className="text-base font-black text-slate-900">
                  ${Number(reserva.precio_total).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Acciones para turnos activos */}
            {reserva.estado !== 'cancelado' && (
              <div className="pt-2 space-y-2">
                
                {/* Opción 1: Reprogramar vía WhatsApp */}
                <a
                  href={urlWhatsAppReprogramar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>Reprogramar por WhatsApp</span>
                </a>

                {/* Opción 2: Cancelar turno (Activa el Modal) */}
                {puedeCancelar ? (
                  <button
                    type="button"
                    onClick={() => setModalCancelarOpen(true)}
                    disabled={cancelando}
                    className="w-full border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold py-3 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cancelando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cancelando reserva...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Cancelar reserva</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-center">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>No podés cancelar: faltan menos de {ventanaHoras} horas para el turno.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* POP-UP / MODAL DE CONFIRMACIÓN DE CANCELACIÓN */}
      {modalCancelarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-amber-50 rounded-full border border-amber-200/60 text-amber-600">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">¿Deseás cancelar tu turno?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Si cancelás tu turno dentro de las 48 hs previas, la seña abonada no contempla devolución. ¿Estás seguro/a de continuar?
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalCancelarOpen(false)}
                className="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Volver atrás
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalCancelarOpen(false);
                  handleCancelar();
                }}
                className="flex-1 py-3 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Cancelar igual
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}