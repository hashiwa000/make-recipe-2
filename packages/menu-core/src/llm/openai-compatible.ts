// Lightweight OpenAI-compatible adapter (provider swappable)

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface ChatCompleteOptions {
  apiKey?: string;
  baseUrl?: string; // e.g. https://api.openai.com/v1
  model: string;
  temperature?: number;
}

export async function chatComplete(
  messages: ChatMessage[],
  opts: ChatCompleteOptions,
): Promise<string> {
  const baseUrl = opts.baseUrl ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY ?? '';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: opts.model,
      messages,
      temperature: opts.temperature ?? 0,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM request failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as any;
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in LLM response');
  return content;
}

