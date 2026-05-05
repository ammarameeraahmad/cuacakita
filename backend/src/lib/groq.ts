import { Message } from '../rag/types.js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function buildFallbackAnswer(messages: Message[], error?: string) {
  const base = 'Maaf, AI sedang tidak tersedia. Silakan coba lagi beberapa saat atau gunakan informasi BMKG di layar.';
  return error ? `${base}\n\nDebug: ${error}` : base;
}

export async function callGroqChatCompletion(
  messages: Message[],
  options: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return buildFallbackAnswer(messages, 'GROQ_API_KEY not set');
  }

  try {
    const requestBody = {
      model: options.model || DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 700,
    };

    // Log the complete request to Groq API
    console.log('=== GROQ API REQUEST ===');
    console.log('Endpoint:', GROQ_ENDPOINT);
    console.log('Model:', requestBody.model);
    console.log('Temperature:', requestBody.temperature);
    console.log('Max Tokens:', requestBody.maxTokens ?? 700);
    console.log('Number of messages:', messages.length);
    console.log('Complete request body:');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('=======================');

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.status} - ${errorText}`);
      return buildFallbackAnswer(messages, `API error ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;

    if (typeof content === 'string' && content.trim()) {
      return content.trim();
    }

    return buildFallbackAnswer(messages, 'No content in response');
  } catch (error) {
    console.error('[Groq] Falling back to local response:', error);
    return buildFallbackAnswer(messages, `Exception: ${error}`);
  }
}
