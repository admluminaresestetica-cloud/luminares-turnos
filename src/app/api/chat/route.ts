import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { aiTools } from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('1. Mensajes recibidos en /api/chat:', JSON.stringify(body.messages, null, 2));

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: body.messages,
      tools: aiTools,
    });

    console.log('2. Stream generado exitosamente, enviando respuesta al cliente...');
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO EN /api/chat:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error desconocido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}