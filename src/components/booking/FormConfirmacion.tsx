'use client';

import { useState } from 'react';
import {
  User,
  Phone,
  Gift,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  CheckCircle2,
  Zap,
  Copy,
  Check,
  Building2,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  servicioDetalle: string;
  precioTotal: number;
  duracionTotal: number;
  fecha: string;
  hora: string;
  porcentajeSena: number;
  nombre: string;
  celular: string;
  codigoReferidoUsado: string;
  descuentoMonto: number;
  referidoValido: boolean | null;
  mensajeReferido: string | null;
  referidosActivo?: boolean;
  onNombreChange: (val: string) => void;
  onCelularChange: (val: string) => void;
  onCodigoReferidoChange: (val: string) => void;
  onConfirmar: (canjeId?: string) => void;
  confirmando: boolean;
  error: string | null;
  colorAccent?: 'violet' | 'indigo' | 'rose' | 'emerald';
  onPagarMercadoPago?: (montoAPagar: number, canjeId?: string) => void;
  cargandoMP?: boolean;
  onCancelarMP?: () => void;
  banco?: string;
  titularCuenta?: string;
  cbu?: string;
  alias?: string;
  tipo?: string;
}

export default function FormConfirmacion({
  tipo,
  servicioDetalle,
  precioTotal,
  duracionTotal,
  fecha,
  hora,
  porcentajeSena,
  nombre,
  celular,
  codigoReferidoUsado,
  descuentoMonto,
  referidoValido,
  mensajeReferido,
  referidosActivo = true,
  onNombreChange,
  onCelularChange,
  onCodigoReferidoChange,
  onConfirmar,
  confirmando,
  error,
  colorAccent = 'violet',
  onPagarMercadoPago,
  cargandoMP = false,
  onCancelarMP,
  banco,
  titularCuenta,
  cbu,
  alias,
}: Props) {
  const { user } = useAuth();
  const [opcionMP, setOpcionMP] = useState<'sena' | 'total'>('sena');
  const [metodoPago, setMetodoPago] = useState<'mercadopago' | 'whatsapp'>(
    onPagarMercadoPago ? 'mercadopago' : 'whatsapp'
  );

  const [copiadoCbu, setCopiadoCbu] = useState(false);
  const [copiadoAlias, setCopiadoAlias] = useState(false);
  const [cuponesDisponibles, setCuponesDisponibles] = useState<any[]>([]);
  const [cuponSeleccionado, setCuponSeleccionado] = useState<any | null>(null);

useEffect(() => {
    if (!user) return;
    const userId = user.id;

    // 🟢 Fuente de la verdad: Consultamos la tabla 'clientes' para autorrellenar con el nombre real guardado
    async function cargarDatosDesdeClientes() {
      try {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('nombre, celular')
          .eq('user_id', userId)
          .maybeSingle();

        if (cliente) {
          if (cliente.nombre && !nombre) {
            onNombreChange(cliente.nombre);
          }
          if (cliente.celular && !celular) {
            onCelularChange(cliente.celular);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos del cliente:', err);
      }
    }

    if (!nombre || !celular) {
      cargarDatosDesdeClientes();
    }
  }, [user, nombre, celular, onNombreChange, onCelularChange]);
  
useEffect(() => {
    if (!user) {
      console.log('🔴 [DEBUG]: No hay usuario logueado todavía.');
      return;
    }
    const userId = user.id;
    console.log('🟢 [DEBUG]: Usuario logueado ID:', userId);

async function cargarCuponesPendientes() {
      try {
        const { data, error } = await supabase
          .from('canjes_usuarios')
          .select('*, premios_catalogo(*)')
          .eq('user_id', userId)
          .ilike('estado', 'pendiente');

        console.log('📦 [DEBUG]: Respuesta de Supabase cupones:', { data, error });

        if (!error && data) {
          // 🛑 FILTRO DE HIERRO: Si estamos en servicios, bloqueamos explícitamente el ID de la tienda ("3000") 
          // y cualquier otro que no sea de servicios o todos.
          const cuponesFiltrados = data.filter((c: any) => {
            const tituloPremio = c.premios_catalogo?.titulo || '';
            const tipoApp = c.premios_catalogo?.tipo_aplicacion;

            console.log(`Evaluando cupón -> Título: "${tituloPremio}" | Tipo: "${tipoApp}" | Vista: "${tipo}"`);

            if (tipo === 'laser') {
              return tipoApp === 'laser' || tipoApp === 'todos';
            } else {
              // En Servicios Generales: Si el título es "3000" o el tipo es "tienda", LO RECHAZAMOS ROTUNDAMENTE
              if (tituloPremio === '3000' || tipoApp === 'tienda') {
                console.warn(`🚫 BLOQUEADO en servicios: El cupón "${tituloPremio}" (tipo: ${tipoApp}) no corresponde aquí.`);
                return false;
              }
              return tipoApp === 'servicios_general' || tipoApp === 'todos' || !tipoApp;
            }
          });

          console.log("✅ Cupones permitidos para esta vista:", cuponesFiltrados);
          setCuponesDisponibles(cuponesFiltrados);
        }
      } catch (err) {
        console.error('❌ [DEBUG] Error al cargar cupones:', err);
      }
    }
    cargarCuponesPendientes();
  }, [user, tipo]);

  const copiarAlPortapapeles = async (texto: string, tipo: 'cbu' | 'alias') => {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      if (tipo === 'cbu') {
        setCopiadoCbu(true);
        setTimeout(() => setCopiadoCbu(false), 2000);
      } else {
        setCopiadoAlias(true);
        setTimeout(() => setCopiadoAlias(false), 2000);
      }
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };


  // Fix de Zona Horaria: fijar mediodía (12:00) evita saltos de día por UTC offset
  const [year, month, day] = fecha.split('-').map(Number);
  const fechaObj = new Date(year, month - 1, day, 12, 0, 0);
  const fechaFormateada = fechaObj.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const extraerMontoDelTitulo = (texto?: string) => {
    if (!texto) return 0;
    const match = texto.replace(/\./g, '').match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

 // 🟢 REEMPLAZALO POR ESTO:
  const valorDescuentoCupon = cuponSeleccionado 
    ? Number(
        cuponSeleccionado.descuento_aplicado || 
        cuponSeleccionado.monto || 
        extraerMontoDelTitulo(cuponSeleccionado.premios_catalogo?.titulo) || 
        0
      ) 
    : 0;

  const precioFinalCalculado = Math.max(0, precioTotal - descuentoMonto - valorDescuentoCupon);
  const montoSenaBase = Math.round((precioFinalCalculado * porcentajeSena) / 100);

  // Cálculos de Mercado Pago con 10% de recargo por servicio
  const montoSenaMP = Math.round(montoSenaBase * 1.1);
  const montoTotalMP = Math.round(precioFinalCalculado * 1.1);

  const montoSeleccionadoMP = opcionMP === 'sena' ? montoSenaMP : montoTotalMP;
  const montoSinRecargoMP = opcionMP === 'sena' ? montoSenaBase : precioFinalCalculado;
  const recargoCalculadoMP = montoSeleccionadoMP - montoSinRecargoMP;

  const formValido = nombre.trim().length >= 3 && celular.replace(/\D/g, '').length >= 8;

 // Evaluar horario comercial (09:00 hs a 20:00 hs)
  const horaActual = new Date().getHours();
  const esHorarioComercial = horaActual >= 9 && horaActual < 23;


  console.log('👀 [DEBUG RENDER]: Estado actual ->', {
    userExistente: !!user,
    cantidadCupones: cuponesDisponibles.length,
    cupones: cuponesDisponibles
  });

  return (
    <div className="space-y-10 pb-4 animate-in fade-in duration-300">
      {/* TARJETA DE RESUMEN DEL TURNO */}
      <section className="bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-500 dark:text-zinc-400 block">
              Servicio seleccionado
            </span>
            <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-snug">
              {servicioDetalle}
            </p>
          </div>
          <span className="text-sm font-extrabold px-3 py-1.5 rounded-full border shrink-0 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]">
            {duracionTotal} min
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-800/80 px-5 py-4 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60 shadow-2xs">
          <span className="capitalize text-sm font-bold text-slate-700 dark:text-zinc-300">{fechaFormateada}</span>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-zinc-50 tabular-nums">{hora} hs</span>
        </div>

        {/* DESGLOSE DE PRECIOS */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-zinc-800 space-y-2.5 text-sm">
          {descuentoMonto > 0 && (
            <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
              <span>Precio original</span>
              <span className="line-through tabular-nums">${precioTotal.toLocaleString('es-AR')}</span>
            </div>
          )}

          {descuentoMonto > 0 && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Descuento por referido</span>
              <span className="tabular-nums">-${descuentoMonto.toLocaleString('es-AR')}</span>
            </div>
          )}

          {cuponSeleccionado && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Descuento por cupón ({cuponSeleccionado.codigo_canje})</span>
              <span className="tabular-nums">-${valorDescuentoCupon.toLocaleString('es-AR')}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline text-slate-900 dark:text-zinc-50 font-bold pt-1">
            <span>Total del servicio</span>
            <span className="text-2xl font-black tracking-tight tabular-nums">${precioFinalCalculado.toLocaleString('es-AR')}</span>
          </div>

          <div className="flex justify-between items-center gap-3 rounded-2xl bg-white/70 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 px-4 py-3 text-xs text-slate-500 dark:text-zinc-400">
            <span>Seña mínima para congelar turno ({porcentajeSena}%)</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 tabular-nums shrink-0">${montoSenaBase.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CUPONES DISPONIBLES */}
      {cuponesDisponibles.length > 0 && (
        <section className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-5 space-y-3.5">
          <div className="flex items-center gap-2.5 text-sm font-extrabold text-amber-900 dark:text-amber-300">
            <Gift className="w-5 h-5 text-amber-600" />
            <span>Tenés cupones de fidelización disponibles</span>
          </div>

          <select
            value={cuponSeleccionado ? cuponSeleccionado.id : ''}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) {
                setCuponSeleccionado(null);
              } else {
                const encontrado = cuponesDisponibles.find((c) => c.id === id);
                setCuponSeleccionado(encontrado || null);
              }
            }}
            className="w-full px-4 py-4 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-2xl text-base sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          >
            <option value="">-- No usar ningún cupón en este turno --</option>
            {cuponesDisponibles.map((cupon) => (
              <option key={cupon.id} value={cupon.id}>
                Cupón: {cupon.codigo_canje} {cupon.premios_catalogo?.titulo ? `- ${cupon.premios_catalogo.titulo}` : ''} ({cupon.descuento_aplicado ? `Descuento: $${Number(cupon.descuento_aplicado).toLocaleString('es-AR')}` : 'Sin descuento especificado'})
              </option>
            ))}
          </select>
        </section>
      )}

      {/* FORMULARIO DE DATOS DEL CLIENTE */}
      <section className="space-y-5">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
          Tus datos
        </h2>

        <div>
          <label htmlFor="input-nombre" className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2 ml-1">
            Nombre y apellido *
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="input-nombre"
              type="text"
              placeholder="Ej: María González"
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-base font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 shadow-2xs focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="input-celular" className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2 ml-1">
            Celular (WhatsApp) *
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-slate-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="input-celular"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Ej: 3411234567"
              value={celular}
              onChange={(e) => onCelularChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-base font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 shadow-2xs focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all tabular-nums"
            />
          </div>
        </div>

        {/* CÓDIGO DE REFERIDO */}
        {referidosActivo && (
          <div>
            <label htmlFor="input-referido" className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2 ml-1">
              ¿Tenés un código de recomendada? <span className="text-slate-400 dark:text-zinc-500 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <Gift className="w-5 h-5 text-slate-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="input-referido"
                type="text"
                placeholder="Ej: MARIA-A8F2"
                value={codigoReferidoUsado}
                onChange={(e) => onCodigoReferidoChange(e.target.value.toUpperCase())}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-base font-medium text-slate-900 dark:text-zinc-100 uppercase tracking-wider placeholder:text-slate-400 dark:placeholder:text-zinc-500 shadow-2xs focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] transition-all"
              />
            </div>
            {mensajeReferido && (
              <p className={`text-sm mt-2 ml-1 font-semibold ${referidoValido ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {mensajeReferido}
              </p>
            )}
          </div>
        )}
      </section>

{/* MENSAJE DE ERROR */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-sm font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* OPCIONES DE PAGO Y CONFIRMACIÓN */}
      <section className="space-y-5">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
          Elegí cómo confirmar
        </h2>

        {/* RADIO CARDS: una por fila, cómodas para el dedo */}
        <div className="grid grid-cols-1 gap-3.5">
          {onPagarMercadoPago && (
            <button
              type="button"
              onClick={() => setMetodoPago('mercadopago')}
              aria-pressed={metodoPago === 'mercadopago'}
              className={`relative flex items-center gap-4 text-left p-5 rounded-3xl border-2 transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                metodoPago === 'mercadopago'
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 shadow-md shadow-sky-500/10'
                  : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  metodoPago === 'mercadopago' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                }`}
              >
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-base font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">Mercado Pago</p>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  Acreditación instantánea
                </div>
              </div>
              {metodoPago === 'mercadopago' && (
                <CheckCircle2 className="w-6 h-6 text-sky-600 shrink-0" />
              )}
            </button>
          )}

          <button
            type="button"
            disabled={!esHorarioComercial}
            onClick={() => esHorarioComercial && setMetodoPago('whatsapp')}
            aria-pressed={metodoPago === 'whatsapp'}
            className={`relative flex items-center gap-4 text-left p-5 rounded-3xl border-2 transition-all duration-150 ${
              !esHorarioComercial
                ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900'
                : metodoPago === 'whatsapp'
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/10 cursor-pointer active:scale-[0.98]'
                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600 cursor-pointer active:scale-[0.98]'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                metodoPago === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-base font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">Transferencia / WhatsApp</p>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 leading-snug">
                Abonás por transferencia y enviás comprobante
              </p>
              {!esHorarioComercial && (
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 leading-snug pt-0.5">
                  ⚠️ Solo disponible de 09:00 a 20:00 hs. De noche utilizá Mercado Pago.
                </p>
              )}
            </div>
            {metodoPago === 'whatsapp' && (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            )}
          </button>
        </div>

        {/* PANEL MERCADO PAGO */}
        {onPagarMercadoPago && metodoPago === 'mercadopago' && (
          <div className="bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-3xl p-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOpcionMP('sena')}
                className={`py-3.5 px-3 rounded-2xl border text-sm font-extrabold transition-all text-center active:scale-95 cursor-pointer ${
                  opcionMP === 'sena'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
                }`}
              >
                Seña (${montoSenaMP.toLocaleString('es-AR')})
              </button>
              <button
                type="button"
                onClick={() => setOpcionMP('total')}
                className={`py-3.5 px-3 rounded-2xl border text-sm font-extrabold transition-all text-center active:scale-95 cursor-pointer ${
                  opcionMP === 'total'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
                }`}
              >
                Total (${montoTotalMP.toLocaleString('es-AR')})
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              * Los pagos con Mercado Pago incluyen un <strong>10% de recargo por servicio</strong> (${recargoCalculadoMP.toLocaleString('es-AR')}).
            </p>

            <button
              type="button"
              disabled={!formValido || confirmando || cargandoMP}
              onClick={() => onPagarMercadoPago && onPagarMercadoPago(montoSeleccionadoMP, cuponSeleccionado?.id)}
              className="w-full h-14 bg-[hsl(var(--primary))] hover:opacity-90 text-[hsl(var(--primary-foreground))] font-extrabold rounded-2xl shadow-md text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {cargandoMP ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generando pago Mercado Pago...
                </span>
              ) : (
                <span>Pagar con Mercado Pago (${montoSeleccionadoMP.toLocaleString('es-AR')})</span>
              )}
            </button>

            {cargandoMP && onCancelarMP && (
              <button
                type="button"
                onClick={onCancelarMP}
                className="w-full text-center text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 underline transition-colors py-2 block cursor-pointer"
              >
                Cancelar y elegir otro medio
              </button>
            )}
          </div>
        )}

        {/* PANEL WHATSAPP / TRANSFERENCIA */}
        {metodoPago === 'whatsapp' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {(banco || titularCuenta || cbu || alias) && (
              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-5 space-y-3.5 text-sm text-slate-700 dark:text-zinc-300">
                <div className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  <span>Datos para la transferencia bancaria</span>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-amber-200/60 dark:border-amber-900/40">
                  {banco && <p><strong>Banco:</strong> {banco}</p>}
                  {titularCuenta && <p><strong>Titular:</strong> {titularCuenta}</p>}

                  {cbu && (
                    <div className="flex items-center justify-between gap-2 bg-white/80 dark:bg-zinc-800/70 p-3 rounded-2xl border border-amber-200/50 dark:border-amber-900/30">
                      <span className="truncate pr-2"><strong>CBU:</strong> <span className="font-mono">{cbu}</span></span>
                      <button
                        type="button"
                        onClick={() => copiarAlPortapapeles(cbu, 'cbu')}
                        className="shrink-0 h-10 px-3.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        {copiadoCbu ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        {copiadoCbu ? '¡Copiado!' : 'Copiar CBU'}
                      </button>
                    </div>
                  )}

                  {alias && (
                    <div className="flex items-center justify-between gap-2 bg-white/80 dark:bg-zinc-800/70 p-3 rounded-2xl border border-amber-200/50 dark:border-amber-900/30">
                      <span className="truncate pr-2"><strong>Alias:</strong> <span className="font-mono text-emerald-800 dark:text-emerald-400 font-bold">{alias}</span></span>
                      <button
                        type="button"
                        onClick={() => copiarAlPortapapeles(alias, 'alias')}
                        className="shrink-0 h-10 px-3.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        {copiadoAlias ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        {copiadoAlias ? '¡Copiado!' : 'Copiar alias'}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 italic pt-0.5">
                  * Recordá enviar el comprobante por WhatsApp una vez realizada la transferencia.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={!formValido || confirmando || cargandoMP}
              onClick={async () => {
                // 🟢 Validación de seguridad para TypeScript y sesión activa
                if (!user) return;

                await supabase
                  .from('clientes')
                  .update({
                    nombre: nombre.trim(),
                    celular: celular.trim(),
                  })
                  .eq('user_id', user.id);

                // Ejecutamos la función original de confirmación
                onConfirmar(cuponSeleccionado ? cuponSeleccionado.id : undefined);
              }}
              className="w-full min-h-14 bg-[hsl(var(--primary))] hover:opacity-90 text-[hsl(var(--primary-foreground))] font-extrabold px-4 py-3.5 rounded-2xl shadow-md text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {confirmando ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando reserva...
                </span>
              ) : (
                <span className="flex items-center gap-2 text-center leading-tight">
                  <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                  Enviar comprobante y confirmar por WhatsApp
                </span>
              )}
            </button>
          </div>
        )}

        <p className="text-xs text-slate-400 dark:text-zinc-500 text-center flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <span>Tus datos se encuentran protegidos</span>
        </p>
      </section>
    </div>
  );
}