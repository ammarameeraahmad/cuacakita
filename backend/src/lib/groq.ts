import { Message } from '../rag/types.js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';

function buildFallbackAnswer(messages: Message[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return (
    latestUserMessage?.content ||
    'Maaf, saya belum bisa memproses permintaan itu saat ini karena koneksi AI belum tersedia.'
  );
}

export async function callGroqChatCompletion(
  messages: Message[],
  options: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return buildFallbackAnswer(messages);
  }

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 700,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq request failed (${response.status}): ${errorText}`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;

    if (typeof content === 'string' && content.trim()) {
      return content.trim();
    }

    return buildFallbackAnswer(messages);
  } catch (error) {
    console.error('[Groq] Falling back to local response:', error);
    return buildFallbackAnswer(messages);
  }
}
