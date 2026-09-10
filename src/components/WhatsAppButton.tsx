'use client';

import { MessageCircle } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

export default function WhatsAppButton() {
  const { config } = useConfig();

  // Limpiamos espacios, guiones o signos '+' por si el cliente ingresa el número con formato
  const rawNumber = config?.whatsapp_numero || '5493413954355';
  const numeroLimpio = rawNumber.replace(/[^0-9]/g, '');

  const whatsappUrl = `https://wa.me/${numeroLimpio}?text=Hola!%20Tengo%20una%20consulta%20sobre%20la%20reserva.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}