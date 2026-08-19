import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  // Reemplazá el número por el tuyo (con 549 y sin +, ni guiones, ni espacios)
  const whatsappUrl = "https://wa.me/5493410000000?text=Hola!%20Tengo%20una%20consulta%20sobre%20la%20reserva.";

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
