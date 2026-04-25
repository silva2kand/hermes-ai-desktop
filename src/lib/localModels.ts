const OLLAMA_DEFAULT = 'http://localhost:11434';
const LMSTUDIO_DEFAULT = 'http://localhost:1234';

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface LMStudioModel {
  id: string;
  name: string;
  size: number;
  quantized: boolean;
}

export interface DetectionResult {
  provider: 'ollama' | 'lmstudio';
  endpoint: string;
  status: 'available' | 'unavailable' | 'error';
  models: OllamaModel[] | LMStudioModel[];
  error?: string;
  responseTime?: number;
}

export async function detectOllama(endpoint: string = OLLAMA_DEFAULT): Promise<DetectionResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${endpoint}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return { provider: 'ollama', endpoint, status: 'error', models: [], error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const models: OllamaModel[] = (data.models || []).map((m: any) => ({
      name: m.name || m.model,
      size: m.size || 0,
      digest: m.digest || '',
      modified_at: m.modified_at || new Date().toISOString(),
    }));

    return { provider: 'ollama', endpoint, status: models.length > 0 ? 'available' : 'unavailable', models, responseTime: Date.now() - start };
  } catch (err: any) {
    if (err.name === 'AbortError') return { provider: 'ollama', endpoint, status: 'error', models: [], error: 'Connection timeout' };
    return { provider: 'ollama', endpoint, status: 'error', models: [], error: err.message || 'Connection failed' };
  }
}

export async function detectLMStudio(endpoint: string = LMSTUDIO_DEFAULT): Promise<DetectionResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${endpoint}/v1/models`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return { provider: 'lmstudio', endpoint, status: 'error', models: [], error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const models: LMStudioModel[] = (data.data || []).map((m: any) => ({
      id: m.id,
      name: m.id?.split('/').pop() || m.id,
      size: m.size || 0,
      quantized: m.quantization_level != null,
    }));

    return { provider: 'lmstudio', endpoint, status: models.length > 0 ? 'available' : 'unavailable', models, responseTime: Date.now() - start };
  } catch (err: any) {
    if (err.name === 'AbortError') return { provider: 'lmstudio', endpoint, status: 'error', models: [], error: 'Connection timeout' };
    return { provider: 'lmstudio', endpoint, status: 'error', models: [], error: err.message || 'Connection failed' };
  }
}

export async function detectAllLocalModels(
  ollamaEndpoint: string = OLLAMA_DEFAULT,
  lmStudioEndpoint: string = LMSTUDIO_DEFAULT
): Promise<DetectionResult[]> {
  const [ollama, lmstudio] = await Promise.all([detectOllama(ollamaEndpoint), detectLMStudio(lmStudioEndpoint)]);
  return [ollama, lmstudio].filter(r => r.status !== 'error');
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function* streamOllamaChat(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<string, void, undefined> {
  const response = await fetch(`${endpoint}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });

  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Ollama returns raw JSON lines (no SSE prefix)
        // Each line is a complete JSON object like:
        // {"model":"...","message":{"role":"assistant","content":"hi"},"done":false}
        try {
          const json = JSON.parse(trimmed);
          if (json.done) return;
          if (json.message?.content) yield json.message.content;
        } catch {
          // If not valid JSON, try SSE format as fallback
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;
            try {
              const json = JSON.parse(data);
              if (json.message?.content) yield json.message.content;
            } catch {}
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function* streamLMStudioChat(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<string, void, undefined> {
  const response = await fetch(`${endpoint}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model.split('/').pop() || model,
      messages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
    signal,
  });

  if (!response.ok) throw new Error(`LM Studio HTTP ${response.status}`);
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    let buffer = '';
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
            if (json.choices?.[0]?.delta?.content) yield json.choices[0].delta.content;
          } catch {}
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function chatOllama(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${endpoint}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
    signal,
  });

  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
  const data = await response.json();
  return data.message?.content || '';
}

export async function chatLMStudio(
  endpoint: string,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${endpoint}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model.split('/').pop() || model,
      messages,
      stream: false,
      max_tokens: 2048,
      temperature: 0.7,
    }),
    signal,
  });

  if (!response.ok) throw new Error(`LM Studio HTTP ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}