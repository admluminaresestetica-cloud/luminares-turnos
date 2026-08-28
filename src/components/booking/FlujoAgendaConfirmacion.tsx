'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CreditCard, Send, Loader2, ArrowLeft } from 'lucide-react';
import { buildWhatsAppUrl, buildMensajeReserva, calcularMontoSena } from '@/lib/whatsapp';
import type { DetalleReservaGeneral } from '@/lib/types';

interface Props {
  tipo: 'general' | 'depilacion';
  precioTotal: number;
  duracionTotal: number;
  detalleTexto: string;
  detalleReserva: DetalleReservaGeneral | any;
  onVolver: () => void;
  volverLabel?: string;
  titulo?: string;
  colorAccent?: string;
  porcentajeSena?: number;
}

export default function FlujoAgendaConfirmacion({
  tipo,
  precioTotal,
  duracionTotal,
  detalleTexto,
  detalleReserva,
  onVolver,
  volverLabel = '← Volver a servicios',
  titulo = 'Agenda y Confirmación',
  colorAccent = 'rose',
  porcentajeSena = 30,
}: Props) {
  // Estados para fecha, hora y datos del cliente
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  // Estado para la opción de pago en Mercado Pago (seña o total)
  const [opcionPago, setOpcionPago] = useState<'sena' | 'total'>('sena');
  const [cargandoMP, setCargandoMP] = useState(false);

  // Cálculos de seña y monto seleccionado
  const montoSena = calcularMontoSena(precioTotal, porcentajeSena);
  const montoAPagar = opcionPago === 'sena' ? montoSena : precioTotal;

  // LÓGICA DE WHATSAPP (Tal cual como la tenías)
  const mensajeWS = buildMensajeReserva({
    codigo: `RES-${Date.now().toString().slice(-4)}`,
    clienteNombre: nombre || 'Cliente',
    servicioDetalle: detalleTexto,
    fecha: fecha || 'A coordinar',
    hora: hora || 'A coordinar',
    precioTotal,
    montoSena,
  });

  // Reemplazar con el número oficial de tu estética si no está configurado
  const numeroWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493410000000';
  const urlWhatsApp = buildWhatsAppUrl(numeroWhatsApp, mensajeWS);

  // LÓGICA DE MERCADO PAGO
  const handlePagarMercadoPago = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !telefono.trim() || !fecha || !hora) {
      alert('Por favor completá tu nombre, teléfono, fecha y hora antes de pagar.');
      return;
    }

    try {
      setCargandoMP(true);
      const res = await fetch('/api/checkout-reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre: nombre,
          clienteEmail: email,
          clienteTelefono: telefono,
          servicioDetalle: detalleTexto,
          fecha,
          hora,
          montoAPagar,
          tipoPago: opcionPago,
        }),
      });

      const data = await res.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Ocurrió un error al generar el pago con Mercado Pago.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al intentar conectar con Mercado Pago.');
    } finally {
      setCargandoMP(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <div className="max-w-2xl mx-auto p-6 md:p-10">
        <button
          type="button"
          onClick={onVolver}
          className="text-sm text-rose-600 font-semibold hover:underline inline-flex items-center gap-1 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {volverLabel}
        </button>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{titulo}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Completá tus datos y elegí cómo querés confirmar tu turno.
          </p>
        </header>

        {/* Resumen del turno */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-6">
          <h2 className="font-bold text-slate-800 mb-2">Resumen de la reserva</h2>
          <p className="text-sm font-semibold text-rose-600">{detalleTexto}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
            <span>Duración: {duracionTotal} min</span>
            <span>•</span>
            <span>Total: ${precioTotal.toLocaleString('es-AR')}</span>
            <span>•</span>
            <span>Seña ({porcentajeSena}%): ${montoSena.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Formulario de Fecha, Hora y Datos */}
        <form onSubmit={handlePagarMercadoPago} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6">
          <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">1. Elegí Fecha y Hora</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hora</label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
          </div>

          <h3 className="font-bold text-slate-800 border-b pb-2 pt-4 mb-4">2. Tus Datos</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre completo *</label>
            <input
              type="text"
              required
              placeholder="Ej: María García"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono (WhatsApp) *</label>
              <input
                type="tel"
                required
                placeholder="Ej: 3411234567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email (Opcional)</label>
              <input
                type="email"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
          </div>

          {/* Opción de Pagar por Mercado Pago */}
          <h3 className="font-bold text-slate-800 border-b pb-2 pt-4 mb-3">3. Confirmación y Pago</h3>
          
          <p className="text-xs text-slate-500 mb-3">
            Elegí qué monto preferís abonar online si vas a pagar con Mercado Pago:
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setOpcionPago('sena')}
              className={`py-3 px-3 rounded-xl border text-sm font-semibold text-center transition-all cursor-pointer ${
                opcionPago === 'sena'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Pagar Seña (${montoSena.toLocaleString('es-AR')})
            </button>
            <button
              type="button"
              onClick={() => setOpcionPago('total')}
              className={`py-3 px-3 rounded-xl border text-sm font-semibold text-center transition-all cursor-pointer ${
                opcionPago === 'total'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Pagar Total (${precioTotal.toLocaleString('es-AR')})
            </button>
          </div>

          {/* BOTÓN 1: MERCADO PAGO */}
          <button
            type="submit"
            disabled={cargandoMP}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cargandoMP ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pagar con Mercado Pago (${montoAPagar.toLocaleString('es-AR')})
              </>
            )}
          </button>

          {/* BOTÓN 2: WHATSAPP (ORIGINAL) */}
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-center inline-flex justify-center items-center cursor-pointer mt-3"
          >
            <Send className="w-5 h-5" />
            Reservar por WhatsApp sin Pagar
          </a>
        </form>
      </div>
    </main>
  );
}