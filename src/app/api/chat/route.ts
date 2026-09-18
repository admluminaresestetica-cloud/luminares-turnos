import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { aiTools } from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extraemos los mensajes sin importar si vienen directos o envueltos por la versión nueva del SDK
    let rawMessages = body.messages || (Array.isArray(body) ? body : []);

    // Normalizamos los mensajes para que la IA los lea perfectamente en formato estándar
    const formattedMessages = rawMessages.map((m: any) => {
      let content = m.content || '';
      
      // Si viene con 'parts' (como muestra tu payload actual), extraemos el texto de ahí
      if (!content && m.parts && Array.isArray(m.parts)) {
        content = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('');
      }

      return {
        role: m.role || 'user',
        content: content,
      };
    });

    if (!formattedMessages || formattedMessages.length === 0) {
      return new Response('No se recibieron mensajes válidos', { status: 400 });
    }

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: formattedMessages,
      tools: aiTools,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO EN /api/chat:', error);
    return new Response(`Error en el servidor: ${error.message || error}`, { status: 500 });
  }
}