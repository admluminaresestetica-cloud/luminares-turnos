"use client";

import { useState } from "react";
import { MapPin, ShieldCheck, CreditCard, Lock, X, Wallet, MessageCircle, BadgeCheck } from "lucide-react";

export default function FooterTienda() {
  const [modalPoliticasAbierto, setModalPoliticasAbierto] = useState(false);
  const anioActual = new Date().getFullYear();

  return (
    <>
      <footer className="w-full border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-2xl mx-auto px-4 space-y-5">

          {/* Franja de Confianza Principal */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-center gap-1.5 mb-3.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-slate-700 uppercase">
                Pago 100% Seguro y Protegido
              </span>
            </div>

            {/* Insignias de Medios de Pago */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-sky-700 shadow-xs hover:shadow-sm transition-shadow">
                <Wallet className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                Mercado Pago
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-xs hover:shadow-sm transition-shadow">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                Visa · Mastercard
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-emerald-700 shadow-xs hover:shadow-sm transition-shadow">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Efectivo
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-teal-700 shadow-xs hover:shadow-sm transition-shadow">
                <MessageCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                WhatsApp
              </span>
            </div>

            {/* Detalle SSL */}
            <div className="flex items-center justify-center gap-1 mt-3 text-[10px] text-slate-400 font-medium">
              <ShieldCheck className="w-3 h-3 text-slate-300 shrink-0" />
              <span>Conexión cifrada SSL · Tus datos siempre protegidos</span>
            </div>
          </div>

          {/* Ubicación y FAQ */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-full border border-slate-200 shadow-xs hover:shadow-md hover:border-rose-200 transition-all duration-200"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Rosario, Santa Fe · Ver mapa</span>
            </a>

            <button
              type="button"
              onClick={() => setModalPoliticasAbierto(true)}
              className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-full border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Envíos y FAQ</span>
            </button>
          </div>

          {/* Copyright */}
          <p className="text-center text-[10px] text-slate-400 font-medium border-t border-slate-100/80 mt-1 pt-3">
            © {anioActual} Luminares Estética. Todos los derechos reservados.
          </p>

        </div>
      </footer>

      {/* Modal / Pop-up de Políticas y Envíos */}
      {modalPoliticasAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl text-left text-slate-800 text-sm border border-slate-100">

            {/* Encabezado del Modal */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm px-6 py-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                Políticas de Compra, Envíos y Devoluciones
              </h3>
              <button
                type="button"
                onClick={() => setModalPoliticasAbierto(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido de Políticas */}
            <div className="space-y-5 text-xs text-slate-600 leading-relaxed px-6 py-5">

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">1</span>
                  Formas de Pago
                </h4>
                <p className="pl-6">• <strong>Efectivo / Transferencia:</strong> Pagos sin recargo. Al elegir transferencia, el pedido se procesa una vez enviado el comprobante de pago vía WhatsApp.</p>
                <p className="pl-6">• <strong>Mercado Pago:</strong> Aceptamos tarjetas de débito, crédito y dinero en cuenta de forma 100% segura.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">2</span>
                  Envíos y Entregas
                </h4>
                <p className="pl-6">• <strong>Tiempos:</strong> Todas las compras con envío dentro de Rosario se entregan entre 24 y 48 horas hábiles posteriores a la confirmación del pago.</p>
                <p className="pl-6">• <strong>Envíos en Rosario:</strong> Sin cargo dentro del radio cercano al gabinete. Fuera del radio, se aplica una tarifa accesible de cadetería.</p>
                <p className="pl-6">• <strong>Otras localidades:</strong> Consultar costos y factibilidad de despacho por WhatsApp antes o después de comprar.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">3</span>
                  Retiro en Local (Gabinete)
                </h4>
                <p className="pl-6">• <strong>Retiro:</strong> En Rosario, Santa Fe, previa confirmación por WhatsApp de que el pedido está listo.</p>
                <p className="pl-6">• <strong>Requisitos:</strong> Presentar DNI (físico o digital) y comprobante/número de pedido.</p>
                <p className="pl-6">• <strong>Retiro por terceros:</strong> Si retira un tercero o cadete (Rappi/PedidosYa), avisar con anticipación por WhatsApp indicando Nombre, Apellido y DNI del autorizado.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">4</span>
                  Cambios y Devoluciones
                </h4>
                <p className="pl-6">• <strong>Plazo Legal:</strong> Conforme a la Ley N° 24.240, disponés de 10 días corridos desde la recepción para solicitar la devolución o cambio.</p>
                <p className="pl-6">• <strong>Condición Exclusiva:</strong> Por higiene y salud pública, solo se aceptan productos <strong>completamente cerrados, sin uso y con sello/precinto de seguridad intacto</strong>.</p>
                <p className="pl-6">• <strong>Fallas o Daños:</strong> Si el producto llega dañado, notifícalo dentro de las 48 hs con fotos/videos para gestionar el cambio sin cargo.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">5</span>
                  Atención al Cliente
                </h4>
                <p className="pl-6">Para consultas sobre productos o envíos, podés escribirnos directo a nuestro WhatsApp oficial o Instagram.</p>
              </div>

            </div>

            {/* Botón de Cierre al pie */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => setModalPoliticasAbierto(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shadow-sm hover:shadow-md transition-all"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}