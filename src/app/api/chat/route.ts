import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { aiTools } from '@/lib/ai/tools';

// Instanciamos la conexión a Google pasando la clave de forma explícita
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages,
      tools: aiTools,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('❌ Error en el servidor /api/chat:', error);
    return new Response(`Error: ${error.message || error}`, { status: 500 });
  }
}