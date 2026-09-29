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
import { useConfig } from '@/context/ConfigContext';

export default function MisTurnosPage() {
  const { config } = useConfig();
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

  // WhatsApp dinámico
  const rawNumber = config?.whatsapp_numero || '5493413954355';
  const numeroWhatsApp = rawNumber.replace(/[^0-9]/g, '');

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setReserva(null);

    // Validación básica previa
    if (!celular.trim() || !codigo.trim()) {
      setError('Por favor, completá ambos campos.');
      return;
    }

    setBuscando(true);

    try {
      const [found, configSys] = await Promise.all([
        buscarReserva(celular, codigo),
        getConfiguracionSistema(),
      ]);

      if (configSys) setVentanaHoras(configSys.ventana_horas_cancelacion);

      if (!found) {
        setError('No encontramos una reserva con esos datos. Verificá el celular y el código.');
        return;
      }

      setReserva(found);
    } catch (err) {
      console.error('Error durante la búsqueda:', err);
      setError('Ocurrió un inconveniente al consultar el turno. Por favor, reintentá.');
    } finally {
      setBuscando(false);
    }
  };

  const handleCancelar = async () => {
    if (!reserva) return;
    setCancelando(true);
    setError(null);
    setMensaje(null);

    try {
      const ok = await cancelarReserva(reserva.id);
      if (!ok) {
        setError('No pudimos cancelar la reserva. Intentá de nuevo.');
        return;
      }

      setReserva({ ...reserva, estado: 'cancelado' });
      setMensaje('Tu reserva fue cancelada correctamente.');
    } catch (err) {
      console.error('Error al cancelar:', err);
      setError('Ocurrió un error al procesar la cancelación.');
    } finally {
      setCancelando(false);
    }
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
  const urlWhatsAppReprogramar = `https://wa.me/${numeroWhatsApp}?text=${mensajeReprogramar}`;

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-12 relative font-sans selection:bg-muted">
      <div className="max-w-md mx-auto space-y-6">

        {/* Volver */}
        <Link 
          href="/turnos" 
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary block">
            Gestión de turnos
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Mis Turnos
          </h1>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Consultá o gestioná el estado de tu reserva de forma rápida.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleBuscar} className="bg-card border border-border rounded-[24px] p-5 shadow-xs space-y-4">
          <div className="space-y-3.5">
            <div>
              <label htmlFor="celular" className="block text-xs font-bold text-foreground mb-1.5">
                Celular (WhatsApp)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="celular"
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="Ej: 11 2345-6789"
                  required
                  className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="codigo" className="block text-xs font-bold text-foreground mb-1.5">
                Código de reserva
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="codigo"
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="#7842"
                  required
                  className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={buscando}
            className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 text-primary-foreground font-bold py-3.5 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-destructive leading-relaxed">{error}</p>
          </div>
        )}

        {mensaje && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 leading-relaxed">{mensaje}</p>
          </div>
        )}

        {/* Detalle del Turno */}
        {reserva && estadoInfo && (
          <div className="bg-card border border-border rounded-[24px] p-5 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                  Código
                </span>
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                  {reserva.codigo_unico}
                </h2>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs ${estadoInfo.className}`}>
                {estadoInfo.label}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-foreground bg-background p-3 rounded-xl border border-border shadow-xs">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Cliente: <strong className="text-foreground font-bold">{reserva.cliente_nombre}</strong></span>
              </div>

              <div className="flex items-center gap-2.5 text-foreground bg-background p-3 rounded-xl border border-border shadow-xs">
                <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Servicio: <strong className="text-foreground font-bold">{formatDetalleReservaDisplay(reserva)}</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-foreground bg-background p-3 rounded-xl border border-border shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate font-semibold text-foreground">{formatFechaDisplay(fechaStr)}</span>
                </div>

                <div className="flex items-center gap-2 text-foreground bg-background p-3 rounded-xl border border-border shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground">{horaStr} hs <span className="text-muted-foreground font-normal">({reserva.duracion_total}m)</span></span>
                </div>
              </div>

              <div className="pt-2.5 flex items-center justify-between border-t border-border px-1">
                <span className="text-xs font-semibold text-muted-foreground">Monto total:</span>
                <span className="text-base font-black text-foreground">
                  ${Number(reserva.precio_total).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Acciones para turnos activos */}
            {reserva.estado !== 'cancelado' && (
              <div className="pt-2 space-y-2.5">

                {/* Opción 1: Reprogramar vía WhatsApp */}
                <a
                  href={urlWhatsAppReprogramar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-border bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98] text-foreground font-bold py-3 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>Solicitar reprogramación</span>
                </a>

                {/* Opción 2: Cancelar turno (Activa el Modal) */}
                {puedeCancelar ? (
                  <button
                    type="button"
                    onClick={() => setModalCancelarOpen(true)}
                    disabled={cancelando}
                    className="w-full border border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20 active:scale-[0.98] font-bold py-3 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
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
                  <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground bg-background rounded-xl p-3 border border-border text-center shadow-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <HelpCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-foreground">¿Deseás cancelar tu turno?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Si cancelás tu turno dentro de las 48 hs previas, la seña abonada no contempla devolución. ¿Estás seguro/a de continuar?
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setModalCancelarOpen(false)}
                className="flex-1 py-3 px-3 bg-background border border-border hover:bg-accent hover:text-accent-foreground active:scale-95 text-foreground font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Volver atrás
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalCancelarOpen(false);
                  handleCancelar();
                }}
                className="flex-1 py-3 px-3 bg-destructive hover:bg-destructive/90 active:scale-95 text-destructive-foreground font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
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