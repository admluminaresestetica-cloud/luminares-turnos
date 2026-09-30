"use client";

import { useState, useEffect } from "react";
import { MapPin, ShieldCheck, CreditCard, Lock, X, Wallet, MessageCircle, BadgeCheck } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export default function FooterTienda() {
  const [modalPoliticasAbierto, setModalPoliticasAbierto] = useState(false);
  const anioActual = new Date().getFullYear();
  
  // Consumimos el contexto global de configuración de la empresa
  const { config } = useConfig();

  const direccionTexto = config?.direccion_texto || "Rosario, Santa Fe";
  const mapsUrl = config?.google_maps_url || "https://maps.google.com";
  const nombreEmpresa = config?.nombre_empresa || "Luminares Estética";

  // Cierra modal con la tecla Escape y deshabilita el scroll del body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalPoliticasAbierto(false);
    };

    if (modalPoliticasAbierto) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalPoliticasAbierto]);

  return (
    <>
      <footer className="w-full border-t border-border bg-background py-8 mt-auto transition-colors">
        <div className="max-w-2xl mx-auto px-4 space-y-5">

          {/* Banner de confianza y pagos */}
          <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/50 to-card shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-center gap-1.5 mb-3.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-foreground uppercase">
                Pago 100% Seguro y Protegido
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-[11px] font-semibold text-sky-700 dark:text-sky-400 shadow-2xs hover:shadow-xs transition-shadow">
                <Wallet className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                Mercado Pago
              </span>
              <span className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-[11px] font-semibold text-foreground/90 shadow-2xs hover:shadow-xs transition-shadow">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                Visa · Mastercard
              </span>
              <span className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shadow-2xs hover:shadow-xs transition-shadow">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Efectivo
              </span>
              <span className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-[11px] font-semibold text-teal-700 dark:text-teal-400 shadow-2xs hover:shadow-xs transition-shadow">
                <MessageCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                WhatsApp
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 mt-3 text-[10px] text-muted-foreground font-medium">
              <ShieldCheck className="w-3 h-3 text-muted-foreground/70 shrink-0" />
              <span>Conexión cifrada SSL · Tus datos siempre protegidos</span>
            </div>
          </div>

          {/* Enlaces secundarios */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground hover:text-foreground bg-card px-3.5 py-2 rounded-full border border-border shadow-2xs hover:shadow-md hover:border-rose-400/50 transition-all duration-200 active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span>{direccionTexto} · Ver mapa</span>
            </a>

            <button
              type="button"
              onClick={() => setModalPoliticasAbierto(true)}
              className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground hover:text-foreground bg-card px-3.5 py-2 rounded-full border border-border shadow-2xs hover:shadow-md hover:border-emerald-400/50 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Envíos y FAQ</span>
            </button>
          </div>

          <p className="text-center text-[10px] text-muted-foreground font-medium border-t border-border/50 mt-1 pt-3">
            © {anioActual} {nombreEmpresa}. Todos los derechos reservados.
          </p>

        </div>
      </footer>

      {/* Modal de Políticas */}
      {modalPoliticasAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-politicas"
          onClick={() => setModalPoliticasAbierto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card shadow-2xl text-left text-foreground text-sm border border-border"
          >
            {/* Header Sticky */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-xs px-6 py-4">
              <h3 id="titulo-modal-politicas" className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Políticas de Compra, Envíos y Devoluciones
              </h3>
              <button
                type="button"
                onClick={() => setModalPoliticasAbierto(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-90 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="space-y-5 text-xs text-muted-foreground leading-relaxed px-6 py-5">
              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold shrink-0">1</span>
                  Formas de Pago
                </h4>
                <p className="pl-6">• <strong>Efectivo / Transferencia:</strong> Pagos sin recargo. Al elegir transferencia, el pedido se procesa una vez enviado el comprobante de pago vía WhatsApp.</p>
                <p className="pl-6">• <strong>Mercado Pago:</strong> Aceptamos tarjetas de débito, crédito y dinero en cuenta de forma 100% segura.</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold shrink-0">2</span>
                  Envíos y Entregas
                </h4>
                <p className="pl-6">• <strong>Tiempos:</strong> Todas las compras con envío dentro de la zona se entregan entre 24 y 48 horas hábiles posteriores a la confirmación del pago.</p>
                <p className="pl-6">• <strong>Envíos locales:</strong> Sin cargo dentro del radio cercano al gabinete. Fuera del radio, se aplica una tarifa accesible de cadetería.</p>
                <p className="pl-6">• <strong>Otras localidades:</strong> Consultar costos y factibilidad de despacho por WhatsApp antes o después de comprar.</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold shrink-0">3</span>
                  Retiro en Local (Gabinete)
                </h4>
                <p className="pl-6">• <strong>Retiro:</strong> En {direccionTexto}, previa confirmación por WhatsApp de que el pedido está listo.</p>
                <p className="pl-6">• <strong>Requisitos:</strong> Presentar DNI (físico o digital) y comprobante/número de pedido.</p>
                <p className="pl-6">• <strong>Retiro por terceros:</strong> Si retira un tercero o cadete (Rappi/PedidosYa), avisar con anticipación por WhatsApp indicando Nombre, Apellido y DNI del autorizado.</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold shrink-0">4</span>
                  Cambios y Devoluciones
                </h4>
                <p className="pl-6">• <strong>Plazo Legal:</strong> Conforme a la Ley N° 24.240, disponés de 10 días corridos desde la recepción para solicitar la devolución o cambio.</p>
                <p className="pl-6">• <strong>Condición Exclusiva:</strong> Por higiene y salud pública, solo se aceptan productos <strong>completamente cerrados, sin uso y con sello/precinto de seguridad intacto</strong>.</p>
                <p className="pl-6">• <strong>Fallas o Daños:</strong> Si el producto llega dañado, notifícalo dentro de las 48 hs con fotos/videos para gestionar el cambio sin cargo.</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold shrink-0">5</span>
                  Atención al Cliente
                </h4>
                <p className="pl-6">Para consultas sobre productos o envíos, podés escribirnos directo a nuestro WhatsApp oficial o Instagram.</p>
              </div>
            </div>

            {/* Footer Sticky */}
            <div className="sticky bottom-0 bg-card/95 backdrop-blur-xs border-t border-border px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => setModalPoliticasAbierto(false)}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
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