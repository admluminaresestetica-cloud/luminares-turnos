import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { aiTools } from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response('No se recibieron mensajes', { status: 400 });
    }

    // Verificamos que la API key esté presente
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response('Error: Falta la variable de entorno GOOGLE_GENERATIVE_AI_API_KEY en el servidor.', { status: 500 });
    }

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages,
      tools: aiTools,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('❌ ERROR DETALLADO EN /api/chat:', error);
    // Devolvemos el error en texto plano para verlo directo en el navegador
    return new Response(`Error en el servidor: ${error.message || error}`, { status: 500 });
  }
}