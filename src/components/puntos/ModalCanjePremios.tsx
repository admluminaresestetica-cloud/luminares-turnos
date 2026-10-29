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

  // Función para generar un código único de canje (ej: CANJE-X8F2)
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

      // 1. Actualizar el saldo de puntos totales del usuario
      const { error: errorUpdate } = await supabase
        .from('puntos_usuarios')
        .update({ puntos_totales: nuevosPuntos })
        .eq('user_id', userId);

      if (errorUpdate) throw errorUpdate;

      // 2. Registrar el movimiento negativo en el historial de puntos
      await supabase.from('puntos_historial').insert([
        {
          user_id: userId,
          puntos: -premio.puntos_requeridos,
          descripcion: `Canje de premio: ${premio.titulo}`,
        },
      ]);

      // 3. Registrar el canje en la tabla de canjes_usuarios
      const { error: errorCanje } = await supabase.from('canjes_usuarios').insert([
        {
          user_id: userId,
          premio_id: premio.id,
          codigo_canje: codigoUnico,
          estado: 'pendiente',
        },
      ]);

      if (errorCanje) throw errorCanje;

      // Éxito
      setMensajeExito({
        titulo: premio.titulo,
        codigo: codigoUnico,
      });
      onCanjeExitoso(); // Notifica al componente padre para actualizar los puntos en pantalla
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
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-background border border-border rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground leading-tight">
                Canjear Puntos Luminares
              </h3>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-primary fill-primary" /> Tus puntos actuales: <strong className="text-foreground">{puntosActuales} pts</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de Éxito al Canjear */}
        {mensajeExito ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center space-y-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">¡Canje realizado con éxito!</h4>
              <p className="text-[11px] text-muted-foreground">
                Canjeaste tu premio: <strong className="text-foreground">{mensajeExito.titulo}</strong>
              </p>
            </div>
            <div className="bg-background border border-border rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Tu código único de retiro:</span>
              <span className="font-mono font-black text-base text-primary tracking-widest">{mensajeExito.codigo}</span>
              <p className="text-[10px] text-muted-foreground">Mostrá este código en el local o por WhatsApp para recibir tu beneficio.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        ) : (
          /* Listado de Premios */
          <div className="space-y-3">
            {errorMensaje && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMensaje}</span>
              </div>
            )}

            {cargando ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando premios disponibles...
              </div>
            ) : premios.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">No hay premios disponibles para canjear en este momento.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {premios.map((premio) => {
                  const alcanza = puntosActuales >= premio.puntos_requeridos;
                  const procesando = procesandoId === premio.id;

                  return (
                    <div 
                      key={premio.id}
                      className="bg-card border border-border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 pr-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground">{premio.titulo}</h4>
                          <span className="font-mono text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                            {premio.puntos_requeridos} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {premio.descripcion || 'Beneficio especial para clientes Luminares.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => realizarCanje(premio)}
                        disabled={!alcanza || procesando}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          alcanza 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs' 
                            : 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {procesando ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Canjeando...</span>
                          </>
                        ) : alcanza ? (
                          <span>Canjear</span>
                        ) : (
                          <span>Te faltan puntos</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
