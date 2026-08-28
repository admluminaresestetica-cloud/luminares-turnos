import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const topic = searchParams.get('topic') || searchParams.get('type');
    const paymentId = searchParams.get('data.id') || searchParams.get('id');

    if (topic !== 'payment' || !paymentId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Obtener detalles del pago desde Mercado Pago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status === 'approved') {
      const metadata = paymentData.metadata;
      const origen = metadata?.origen;
      const reservaId = metadata?.reserva_id;
      const pedidoId = metadata?.pedido_id;

      // CASO A: RESERVA DE TURNO
      if (origen === 'reserva' && reservaId) {
        const { error } = await supabase
          .from('reservas')
          .update({
            estado: 'confirmada',
            estado_pago: 'pagado',
            mp_payment_id: String(paymentId),
            updated_at: new Date().toISOString(),
          })
          .eq('id', reservaId);

        if (error) console.error('Error actualizando reserva:', error);
      }

      // CASO B: TIENDA ONLINE
      if (origen === 'tienda' && pedidoId) {
        const { error } = await supabase
          .from('pedidos')
          .update({
            estado: 'pagado',
            estado_pago: 'pagado',
            mp_payment_id: String(paymentId),
            updated_at: new Date().toISOString(),
          })
          .eq('id', pedidoId);

        if (error) console.error('Error actualizando pedido:', error);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error en Webhook de Mercado Pago:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 200 });
  }
}