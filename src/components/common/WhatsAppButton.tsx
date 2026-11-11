'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

export default function WhatsAppButton() {
  const { config } = useConfig();
  const pathname = usePathname();

  // Limpiamos espacios, guiones o signos '+'
  const rawNumber = config?.whatsapp_numero || '5493413954355';
  const numeroLimpio = rawNumber.replace(/\D/g, '');

  if (!numeroLimpio) return null;

  // Definimos el mensaje según la ruta actual
  const obtenerMensaje = () => {
    if (pathname.startsWith('/tienda')) {
      return '¡Hola! Tengo una consulta sobre los productos de la tienda.';
    }
    if (pathname.startsWith('/turnos') || pathname.startsWith('/reservas')) {
      return '¡Hola! Tengo una consulta sobre la reserva de turnos.';
    }
    return '¡Hola! Tengo una consulta.';
  };

  const mensaje = encodeURIComponent(obtenerMensaje());
  const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensaje}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 group"
      aria-label="Contactar por WhatsApp"
    >
      {/* Halo de pulso sutil */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping group-hover:animate-none -z-10" />
      
      <MessageCircle className="w-6 h-6 fill-current stroke-none" />
    </a>
  );
}