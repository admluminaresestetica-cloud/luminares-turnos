import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { aiTools } from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('Mensajes recibidos en el backend:', messages);

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages,
      tools: aiTools,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('❌ ERROR FATAL EN /api/chat:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error desconocido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}