'use client';

import { useState, useEffect } from 'react';
import { X, Gift, Star, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Premio {
  id: string;
  titulo: string;
  descripcion: string;
  puntos_requeridos: number;
}

interface ModalCanjePremiosProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  puntosActuales: number;
  onCanjeExitoso: () => void;
}

export default function ModalCanjePremios({
  isOpen,
  onClose,
  userId,
  puntosActuales,
  onCanjeExitoso,
}: ModalCanjePremiosProps) {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<{ titulo: string; codigo: string } | null>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarPremiosDisponibles();
      setMensajeExito(null);
      setErrorMensaje(null);
    }
  }, [isOpen]);

  async function cargarPremiosDisponibles() {
    setCargando(true);
    const { data, error } = await supabase
      .from('premios_catalogo')
      .select('*')
      .eq('activo', true)
      .order('puntos_requeridos', { ascending: true });

    if (!error && data) {
      setPremios(data);
    }
    setCargando(false);
  }

  function generarCodigoCanje(): string {
    const aleatorio = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CANJE-${aleatorio}`;
  }

  const realizarCanje = async (premio: Premio) => {
    if (puntosActuales < premio.puntos_requeridos) {
      setErrorMensaje(`No tenés suficientes puntos para canjear "${premio.titulo}".`);
      return;
    }

    setProcesandoId(premio.id);
    setErrorMensaje(null);

try {
      const nuevosPuntos = puntosActuales - premio.puntos_requeridos;
      const codigoUnico = generarCodigoCanje();

      // 1. Descontar puntos del usuario
      const { error: errorUpdate } = await supabase
        .from('puntos_usuarios')
        .update({ puntos_totales: nuevosPuntos })
        .eq('user_id', userId);

      if (errorUpdate) throw errorUpdate;

      // 2. Insertar en puntos_historial (asignando const { error: errorHistorial })
      const { error: errorHistorial } = await supabase.from('puntos_historial').insert([
        {
          user_id: userId,
          puntos: -premio.puntos_requeridos,
          tipo: 'canje',
          descripcion: `Canje de premio: ${premio.titulo}`,
        },
      ]);

      if (errorHistorial) {
        console.error('Error al insertar en puntos_historial:', errorHistorial);
      }

      // 3. Registrar el canje en canjes_usuarios
      const { error: errorCanje } = await supabase.from('canjes_usuarios').insert([
        {
          user_id: userId,
          premio_id: premio.id,
          codigo_canje: codigoUnico,
          estado: 'pendiente',
        },
      ]);

      if (errorCanje) throw errorCanje;

      setMensajeExito({
        titulo: premio.titulo,
        codigo: codigoUnico,
      });
      onCanjeExitoso();
    } catch (err) {
      console.error('Error al procesar el canje:', err);
      setErrorMensaje('Ocurrió un error al procesar el canje. Intentá nuevamente.');
    } finally {
      setProcesandoId(null);
    }
  };

  if (!isOpen) return null;

return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 dark:bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full h-[90vh] sm:h-auto sm:max-h-[82vh] sm:max-w-md overflow-hidden rounded-t-[32px] sm:rounded-3xl bg-stone-50/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t sm:border border-stone-200/80 dark:border-zinc-800 shadow-2xl shadow-stone-900/30 dark:shadow-black/70 animate-in slide-in-from-bottom duration-300"
      >
        {/* Handle bar para móvil */}
        <div className="relative flex justify-center pt-3 pb-1 sm:hidden shrink-0" aria-hidden>
          <span className="h-1.5 w-12 rounded-full bg-stone-300 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 sm:pt-5 pb-4 border-b border-stone-200/60 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-stone-900 dark:text-zinc-50">
                Canjear Puntos Luminares
              </h3>
              <p className="text-xs font-medium text-stone-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" /> 
                <span>Tus puntos actuales:</span> 
                <strong className="text-stone-900 dark:text-zinc-100 font-extrabold">{puntosActuales} pts</strong>
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2.5 rounded-full bg-stone-200/60 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800 active:scale-90 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo con Scroll fluido */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4">
          {/* Mensaje de Éxito al Canjear */}
          {mensajeExito ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center space-y-4 shadow-lg">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-stone-900 dark:text-zinc-50">¡Canje realizado con éxito!</h4>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  Canjeaste tu premio: <strong className="text-stone-900 dark:text-zinc-100">{mensajeExito.titulo}</strong>
                </p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-1.5 shadow-inner">
                <span className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-wider block font-bold">Tu código único de retiro:</span>
                <span className="font-mono font-black text-lg text-primary tracking-widest block">{mensajeExito.codigo}</span>
                <p className="text-[10px] text-stone-500 dark:text-zinc-400">Mostrá este código en el local o por WhatsApp para recibir tu beneficio.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          ) : (
            /* Listado de Premios */
            <div className="space-y-3">
              {errorMensaje && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{errorMensaje}</span>
                </div>
              )}

              {cargando ? (
                <div className="flex items-center justify-center py-12 text-xs text-stone-500 gap-2.5 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> 
                  <span>Cargando premios disponibles...</span>
                </div>
              ) : premios.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Sparkles className="w-10 h-10 text-stone-300 dark:text-zinc-700 mx-auto" />
                  <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium">No hay premios disponibles para canjear en este momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {premios.map((premio) => {
                    const alcanza = puntosActuales >= premio.puntos_requeridos;
                    const procesando = procesandoId === premio.id;

                    return (
                      <div 
                        key={premio.id}
                        className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-sm hover:shadow-md transition-all"
                      >
                        {/* Info del Premio */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-zinc-100 tracking-tight">
                              {premio.titulo}
                            </h4>
                            
                            {/* Badge de puntos corregido en una sola línea estricta */}
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-black bg-primary/10 text-primary dark:bg-primary/20 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                              {premio.puntos_requeridos} pts
                            </span>
                          </div>

                          <p className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                            {premio.descripcion || 'Beneficio especial para clientes Luminares.'}
                          </p>
                        </div>

                        {/* Botón de Canje o Estado */}
                        <div className="shrink-0 flex items-center justify-end sm:justify-center pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-zinc-800/80">
                          <button
                            type="button"
                            onClick={() => realizarCanje(premio)}
                            disabled={!alcanza || procesando}
                            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                              alcanza 
                                ? 'bg-stone-900 hover:bg-stone-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white text-white shadow-sm' 
                                : 'bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-500 opacity-80 cursor-not-allowed'
                            }`}
                          >
                            {procesando ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Canjeando...</span>
                              </>
                            ) : alcanza ? (
                              <span>Canjear premio</span>
                            ) : (
                              <span>Te faltan puntos</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}