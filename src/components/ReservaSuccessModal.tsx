'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, ShoppingBag, X } from 'lucide-react';

export default function ReservaSuccessModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState<'reserva' | 'tienda' | null>(null);
  const [codigoReserva, setCodigoReserva] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get('status');
    const codigo = searchParams.get('codigo');

    if (status === 'success_reserva') {
      setTipoMensaje('reserva');
      setCodigoReserva(codigo);
      setIsOpen(true);
    } else if (status === 'success') {
      setTipoMensaje('tienda');
      setIsOpen(true);
    }
  }, [searchParams]);

  const cerrarModal = () => {
    setIsOpen(false);
    // Limpia los query params de la URL sin recargar la página
    router.replace('/', { scroll: false });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
        <button
          onClick={cerrarModal}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        {tipoMensaje === 'reserva' ? (
          <>
            <h3 className="text-2xl font-bold text-gray-900">¡Turno Confirmado!</h3>
            <p className="mt-2 text-sm text-gray-600">
              Recibimos tu pago correctamente. Tu reserva ha sido agendada con éxito.
            </p>

            {codigoReserva && (
              <div className="mt-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                <span className="block text-xs uppercase tracking-wider text-gray-500 font-medium">
                  Código de Reserva
                </span>
                <span className="mt-1 block text-2xl font-mono font-bold text-emerald-600 tracking-widest">
                  {codigoReserva}
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={cerrarModal}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Calendar className="h-4 w-4" /> Entendido
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900">¡Compra Registrada!</h3>
            <p className="mt-2 text-sm text-gray-600">
              Procesamos tu pago de la tienda online con éxito. Nos pondremos en contacto para coordinar la entrega.
            </p>

            <div className="mt-6">
              <button
                onClick={cerrarModal}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <ShoppingBag className="h-4 w-4" /> Volver al Inicio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}