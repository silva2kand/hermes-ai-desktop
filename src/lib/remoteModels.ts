/**
 * Remote Models — unified client for cloud LLM providers.
 * Supports: Gemini, OpenAI/OpenRouter, Groq, HuggingFace.
 * All use OpenAI-compatible chat completions API where possible.
 */

export interface RemoteModelConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Provider base URLs
export const PROVIDER_CONFIGS: Record<string, { baseUrl: string; keyPrefix?: string; models: string[] }> = {
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1'],
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'deepseek/deepseek-r1'],
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: ['meta-llama/Llama-3.3-70B-Instruct', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
  },
};

/**
 * Store/retrieve API keys using Electron store.
 */
export async function saveApiKey(provider: string, key: string): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.setStoreData) {
    await (window as any).electronAPI.setStoreData(`apiKeys.${provider}`, key);
  } else {
    // Fallback to localStorage for browser dev
    localStorage.setItem(`hermes_key_${provider}`, key);
  }
}

export async function getApiKey(provider: string): Promise<string | null> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.getStoreData) {
    return await (window as any).electronAPI.getStoreData(`apiKeys.${provider}`) || null;
  }
  return localStorage.getItem(`hermes_key_${provider}`);
}

export async function removeApiKey(provider: string): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.setStoreData) {
    await (window as any).electronAPI.setStoreData(`apiKeys.${provider}`, null);
  } else {
    localStorage.removeItem(`hermes_key_${provider}`);
  }
}

/**
 * Test connection to a provider with given API key.
 */
export async function testConnection(provider: string, apiKey: string): Promise<{ success: boolean; error?: string; models?: string[] }> {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) return { success: false, error: `Unknown provider: ${provider}` };

  try {
    if (provider === 'gemini') {
      // Gemini uses its own API format
      const res = await fetch(`${config.baseUrl}/models?key=${apiKey}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return { success: true, models: data.models?.map((m: any) => m.name) || [] };
    } else {
      // OpenAI-compatible: list models
      const res = await fetch(`${config.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return { success: true, models: data.data?.map((m: any) => m.id) || [] };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection failed' };
  }
}

/**
 * Stream chat completion from a remote provider.
 */
export async function* streamRemoteChat(
  provider: string,
  model: string,
  messages: ChatMessage[],
  apiKey: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  if (provider === 'gemini') {
    // Gemini API format
    yield* streamGeminiChat(model, messages, apiKey, signal);
  } else {
    // OpenAI-compatible format (OpenAI, OpenRouter, Groq)
    yield* streamOpenAICompatibleChat(config.baseUrl, model, messages, apiKey, signal, provider);
  }
}

/**
 * Stream from Gemini API (native format).
 */
async function* streamGeminiChat(
  model: string,
  messages: ChatMessage[],
  apiKey: string,
  signal?: AbortSignal
): AsyncGenerator<string> {
  // Convert to Gemini format
  const geminiMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find(m => m.role === 'system');

  const body: any = {
    contents: geminiMessages,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  }

  const modelName = model.startsWith('models/') ? model : `models/${model}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const json = JSON.parse(data);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch {}
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Stream from OpenAI-compatible API (works for OpenAI, OpenRouter, Groq).
 */
async function* streamOpenAICompatibleChat(
  baseUrl: string,
  model: string,
  messages: ChatMessage[],
  apiKey: string,
  signal?: AbortSignal,
  provider?: string
): AsyncGenerator<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  // OpenRouter requires additional headers
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://hermes-ai.dev';
    headers['X-Title'] = 'Hermes AI Desktop';
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${await response.text()}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {}
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Non-streaming chat for quick operations.
 */
export async function chatRemote(
  provider: string,
  model: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<string> {
  let result = '';
  for await (const chunk of streamRemoteChat(provider, model, messages, apiKey)) {
    result += chunk;
  }
  return result;
}
