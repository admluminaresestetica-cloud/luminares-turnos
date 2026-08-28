'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Gift, 
  Copy, 
  Check, 
  MessageCircle, 
  Loader2, 
  Calendar, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface ReservaDetalle {
  codigo_unico: string;
  cliente_nombre: string;
  cliente_celular: string;
  servicio_tipo: string;
  detalle_reserva: {
    detalle_texto?: string;
  };
  fecha_hora_inicio: string;
  precio_total: number;
}

function ContenidoReservaExitosa() {
  const searchParams = useSearchParams();
  const reservaId = searchParams.get('reserva_id');

  const [reserva, setReserva] = useState<ReservaDetalle | null>(null);
  const [codigoReferido, setCodigoReferido] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function obtenerDatos() {
      if (!reservaId) {
        setCargando(false);
        return;
      }

      // 1. Consultar reserva en Supabase
      const { data: reservaData } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', reservaId)
        .maybeSingle();

      if (reservaData) {
        setReserva(reservaData);

        // 2. Obtener el código de referido del cliente
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('codigo_referido')
          .eq('celular', reservaData.cliente_celular)
          .maybeSingle();

        if (clienteData) {
          setCodigoReferido(clienteData.codigo_referido);
        }
      }

      setCargando(false);
    }

    obtenerDatos();
  }, [reservaId]);

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
        <p className="text-slate-500 text-xs font-medium">Verificando tu reserva...</p>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-sm w-full text-center">
          <p className="text-slate-700 text-sm font-medium mb-4">
            No encontramos la información de esta reserva.
          </p>
          <Link href="/" className="text-xs font-bold text-violet-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Formatear Fecha y Hora
  const fechaObj = new Date(reserva.fecha_hora_inicio);
  const fechaFormateada = fechaObj.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
  const horaFormateada = fechaObj.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const detalleTexto = reserva.detalle_reserva?.detalle_texto || 'Servicio seleccionado';

  // Armar mensaje listo para enviar por WhatsApp
  const mensajeWS = `¡Hola! Acabo de señar mi turno por Mercado Pago 💳\n\n` +
    `📌 *Reserva:* #${reserva.codigo_unico}\n` +
    `👤 *Cliente:* ${reserva.cliente_nombre}\n` +
    `✨ *Servicio:* ${detalleTexto}\n` +
    `📅 *Fecha:* ${fechaFormateada} - ${horaFormateada} hs\n\n` +
    `Te adjunto por aquí mi comprobante de pago.`;

  const urlWhatsapp = buildWhatsAppUrl('5493413954355', mensajeWS);

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* ÍCONO DE ÉXITO */}
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3.5">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        {/* TÍTULO Y CÓDIGO */}
        <h3 className="text-lg font-bold text-slate-900">¡Turno Reservado!</h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">
          Código de reserva:{' '}
          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
            #{reserva.codigo_unico}
          </span>
        </p>

        {/* CAJA RESUMEN DEL TURNO */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-left space-y-2 mb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Servicio / Selección
            </span>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">{detalleTexto}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Fecha
              </span>
              <p className="text-xs text-slate-700 font-medium">{fechaFormateada}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Horario
              </span>
              <p className="text-xs text-slate-700 font-medium">{horaFormateada} hs</p>
            </div>
          </div>
        </div>

        {/* CÓDIGO DE DESCUENTO / REFERIDO */}
        {codigoReferido && (
          <div className="bg-violet-50/70 border border-violet-100 p-3 rounded-xl mb-3 text-left">
            <div className="flex items-center gap-1.5 text-violet-800 mb-1">
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-bold">¡Sumá descuentos!</span>
            </div>
            <p className="text-[10px] text-violet-600 mb-2 leading-tight">
              Compartí tu código con tus amigas. Si lo usan al reservar, ¡sumás un beneficio para tu próxima sesión!
            </p>
            <div className="flex items-center justify-between bg-white border border-violet-200/80 rounded-lg p-2">
              <span className="font-mono text-xs font-black text-violet-900 tracking-wide">
                {codigoReferido}
              </span>
              <button
                type="button"
                onClick={() => copiarCodigo(codigoReferido)}
                className="text-[10px] font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-md transition-colors"
              >
                {copiado ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TEXTO ACLARATORIO Y PEDIDO DE COMPROBANTE */}
        <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-2.5 mb-4 text-left">
          <p className="text-[11px] text-emerald-800 font-medium leading-snug">
            💳 <strong>Tu seña ha sido acreditada con éxito vía Mercado Pago.</strong>
          </p>
          <p className="text-[10px] text-emerald-700/90 mt-1 leading-tight">
            Por favor, envianos el comprobante a nuestro WhatsApp para finalizar la confirmación de tu turno.
          </p>
        </div>

        {/* BOTÓN WHATSAPP */}
        <a
          href={urlWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs mb-2"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Enviar comprobante por WhatsApp</span>
        </a>

        {/* BOTÓN INICIO */}
        <Link
          href="/"
          className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function ReservaExitosaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
        </div>
      }
    >
      <ContenidoReservaExitosa />
    </Suspense>
  );
}