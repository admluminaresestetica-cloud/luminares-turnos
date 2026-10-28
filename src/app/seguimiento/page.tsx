'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, PackageSearch, CheckCircle2, Clock, Truck, Search, AlertCircle, ShieldCheck, RefreshCw, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useConfig } from '@/context/ConfigContext';
import { useAuth } from '@/context/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pasos del flujo logístico para la línea de tiempo
const ESTADOS_MAP = [
  { key: 'pendiente', label: 'Pedido Recibido', icon: Clock },
  { key: 'en_preparacion', label: 'En Preparación', icon: PackageSearch },
  { key: 'listo', label: 'Listo para Entrega/Retiro', icon: CheckCircle2 },
  { key: 'en_camino', label: 'En Camino', icon: Truck },
  { key: 'completado', label: 'Entregado', icon: CheckCircle2 },
];

export default function SeguimientoPage() {
  const { config } = useConfig();
  const { user } = useAuth();

  const [codigo, setCodigo] = useState('');
  const [ultimos4Tel, setUltimos4Tel] = useState('');
  const [cargando, setCargando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Estados para manejar lista de compras e historial del usuario logueado
  const [pedidosLista, setPedidosLista] = useState<any[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any | null>(null);

  // 🔄 Carga automática del historial si el usuario inició sesión con Google
  useEffect(() => {
    async function cargarPedidosLogueado() {
      if (!user) {
        setPedidosLista([]);
        setPedidoSeleccionado(null);
        return;
      }
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setPedidosLista(data);
          setPedidoSeleccionado(data[0]); // Selecciona el pedido más reciente por defecto
        } else {
          setPedidosLista([]);
          setPedidoSeleccionado(null);
        }
      } catch (err) {
        console.error('Error al cargar historial de pedidos del usuario:', err);
      } finally {
        setCargando(false);
      }
    }

    cargarPedidosLogueado();
  }, [user]);

  // 📱 WhatsApp dinámico traído desde la configuración de Admin
  const rawNumber = config?.whatsapp_numero || '';
  const numeroWhatsApp = rawNumber.replace(/[^0-9]/g, '');
  const mensajeAyuda = encodeURIComponent("¡Hola! No recuerdo los datos de seguimiento de mi pedido o necesito asistencia. ¿Me podrán ayudar?");
  const urlWhatsAppAyuda = numeroWhatsApp ? `https://wa.me/${numeroWhatsApp}?text=${mensajeAyuda}` : '#';

  // Función para enmascarar el nombre por privacidad
  const enmascararNombre = (nombreCompleto?: string) => {
    if (!nombreCompleto) return 'Cliente';
    const partes = nombreCompleto.trim().split(/\s+/);
    if (partes.length === 1) return partes[0];
    const primerNombre = partes[0];
    const inicialApellido = partes[1].charAt(0).toUpperCase();
    return `${primerNombre} ${inicialApellido}.`;
  };

  const ejecutarBusqueda = async (codVal: string, tel4Val: string, esActualizacion = false) => {
    if (esActualizacion) {
      setActualizando(true);
    } else {
      setErrorMsg('');
      setPedidoSeleccionado(null);
      setCargando(true);
    }

    const codLimpio = codVal.trim().toUpperCase();
    const tel4Limpio = tel4Val.trim().replace(/\D/g, '');

    if (!codLimpio || tel4Limpio.length !== 4) {
      if (!esActualizacion) {
        setErrorMsg('Por favor ingresa el código del pedido y los últimos 4 dígitos de tu teléfono.');
      }
      setCargando(false);
      setActualizando(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (!data || data.length === 0) {
        if (!esActualizacion) setErrorMsg('No se encontraron pedidos registrados.');
        return;
      }

      const pedidoEncontrado = data.find((p: any) => {
        if (!p.id || !p.telefono_cliente) return false;
        const idCorto = p.id.toString().slice(0, 6).toUpperCase();
        const idCompleto = p.id.toString().toUpperCase();
        const coincideCodigo = idCorto === codLimpio || idCompleto === codLimpio;
        const telLimpio = p.telefono_cliente.replace(/\D/g, '');
        const coincideTel = telLimpio.endsWith(tel4Limpio);
        return coincideCodigo && coincideTel;
      });

      if (!pedidoEncontrado) {
        if (!esActualizacion) {
          setErrorMsg('El código o los 4 dígitos de validación del teléfono no coinciden.');
        }
        return;
      }

      setPedidoSeleccionado(pedidoEncontrado);
    } catch (err: any) {
      console.error("Error al consultar pedido:", err);
      if (!esActualizacion) {
        setErrorMsg('Ocurrió un error al consultar el pedido. Intenta nuevamente.');
      }
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  const buscarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutarBusqueda(codigo, ultimos4Tel, false);
  };

  // 🔄 Botón para actualizar el estado sin reingresar datos
  const handleActualizarEstado = () => {
    if (user) {
      setCargando(true);
      supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setPedidosLista(data);
            const actualId = pedidoSeleccionado?.id;
            const match = data.find((p: any) => p.id === actualId);
            setPedidoSeleccionado(match || data[0]);
          }
          setCargando(false);
        });
    } else if (codigo && ultimos4Tel) {
      ejecutarBusqueda(codigo, ultimos4Tel, true);
    }
  };

  const obtenerIndiceEstado = (estadoActual: string) => {
    if (estadoActual === 'cerca') return 3;
    const index = ESTADOS_MAP.findIndex((e) => e.key === estadoActual);
    return index !== -1 ? index : 0;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-28 pt-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-card border border-border text-foreground hover:bg-accent transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-primary" />
              Seguimiento de Pedido
            </h1>
            <p className="text-xs text-muted-foreground">
              Consulta el estado de tu compra en tiempo real
            </p>
          </div>
        </div>

        {/* 👤 Panel de usuario autenticado con selector de historial de compras */}
        {user && (
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Cuenta vinculada</p>
                <p className="text-sm font-bold text-foreground">{user.email || user.user_metadata?.full_name}</p>
              </div>
              {cargando && <span className="text-xs text-primary animate-pulse font-bold">Cargando tus compras...</span>}
            </div>

            {pedidosLista.length > 0 ? (
              <div className="pt-2 border-t border-border space-y-2">
                <label className="block text-xs font-bold text-muted-foreground">
                  Historial de compras ({pedidosLista.length}):
                </label>
                <select
                  value={pedidoSeleccionado?.id || ''}
                  onChange={(e) => {
                    const encontrado = pedidosLista.find((p) => p.id === e.target.value);
                    if (encontrado) setPedidoSeleccionado(encontrado);
                  }}
                  className="w-full bg-background border border-input rounded-xl text-xs font-bold px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {pedidosLista.map((p, index) => (
                    <option key={p.id} value={p.id}>
                      #{p.id.slice(0, 6).toUpperCase()} — {new Date(p.created_at).toLocaleDateString('es-AR')} (${p.total?.toLocaleString('es-AR')}) {index === 0 ? '★ (Más reciente)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : !cargando ? (
              <div className="p-4 rounded-2xl bg-muted/50 text-center text-xs text-muted-foreground">
                No encontramos compras registradas con esta cuenta de Google todavía.
              </div>
            ) : null}
          </div>
        )}

        {/* 🔍 Formulario de Búsqueda Manual (Solo si no hay sesión activa) */}
        {!user && (
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs">
            <form onSubmit={buscarPedido} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">
                    Código de Pedido
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 3FC124"
                    maxLength={10}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background font-mono text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">
                    Últimos 4 dígitos del celular
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 4978"
                    maxLength={4}
                    value={ultimos4Tel}
                    onChange={(e) => setUltimos4Tel(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {cargando ? (
                  <span>Consultando estado...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Buscar mi pedido</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 💬 Asistencia por WhatsApp */}
        <div className="text-center bg-card border border-border p-4 rounded-3xl space-y-2 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">
            ¿No recordás tu código o tenés dudas con tu pedido?
          </p>
          <a
            href={urlWhatsAppAyuda}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-xl hover:opacity-90 transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
            <span>Escribinos por WhatsApp</span>
          </a>
        </div>

        {/* 📊 Tarjeta de Progreso y Detalles del Pedido Seleccionado */}
        {pedidoSeleccionado && (
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="inline-block bg-primary/10 text-primary font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  #{pedidoSeleccionado.id.slice(0, 6).toUpperCase()}
                </span>
                <h3 className="text-base font-extrabold text-foreground mt-1">
                  Hola, {enmascararNombre(pedidoSeleccionado.nombre_cliente)}
                </h3>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={handleActualizarEstado}
                  disabled={actualizando}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-foreground bg-accent hover:bg-accent/80 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  title="Actualizar estado en tiempo real"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-primary ${actualizando ? 'animate-spin' : ''}`} />
                  <span>{actualizando ? 'Actualizando...' : 'Actualizar'}</span>
                </button>
                <p className="text-[11px] text-muted-foreground">
                  {pedidoSeleccionado.metodo_envio === 'envio' ? '📦 Envío a Domicilio' : '🏪 Retiro en Local'}
                </p>
              </div>
            </div>

            {/* Timeline gráfico de estados */}
            <div>
              <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-4">
                Progreso de tu pedido
              </h4>

              <div className="space-y-4">
                {ESTADOS_MAP.map((paso, idx) => {
                  const Icono = paso.icon;
                  const indiceActual = obtenerIndiceEstado(pedidoSeleccionado.estado);
                  const estaCompletado = idx <= indiceActual;
                  const esElActual = idx === indiceActual;

                  const eventoHistorial = Array.isArray(pedidoSeleccionado.historial_estados)
                    ? pedidoSeleccionado.historial_estados.find((h: any) => h.estado === paso.key)
                    : null;

                  return (
                    <div key={paso.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            estaCompletado
                              ? 'bg-primary text-primary-foreground font-bold'
                              : 'bg-muted text-muted-foreground'
                          } ${esElActual ? 'ring-4 ring-primary/20 scale-105' : ''}`}
                        >
                          <Icono className="w-4 h-4" />
                        </div>
                        {idx < ESTADOS_MAP.length - 1 && (
                          <div
                            className={`w-0.5 h-6 my-1 ${
                              idx < indiceActual ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>

                      <div className="pt-1">
                        <p
                          className={`text-xs font-bold ${
                            estaCompletado ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {paso.label}
                          {esElActual && (
                            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-extrabold">
                              En este paso
                            </span>
                          )}
                        </p>

                        {eventoHistorial ? (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(eventoHistorial.fecha).toLocaleString('es-AR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {estaCompletado ? 'Completado' : 'Pendiente'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-accent/50 border border-border flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Estado sincronizado directamente con la logística oficial del comercio.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}