/**
 * Orchestrator — the brain that routes messages to agents,
 * parses structured output, and manages thinking phases.
 * 
 * Flow: interpret → plan → execute → post-process
 */

import type { AgentType, ThinkingPhase, WorkspaceData, Message } from '../store/appStore';
import { buildSystemPrompt, getDefaultSuggestions } from './agentPrompts';
import type { ChatMessage } from './localModels';

/**
 * Classify which agent should handle a message based on keywords.
 * Used as a fallback when user hasn't explicitly selected an agent.
 */
export function classifyDomain(input: string): AgentType {
  const lower = input.toLowerCase();

  const patterns: { agent: AgentType; keywords: string[] }[] = [
    {
      agent: 'coding',
      keywords: ['code', 'function', 'class', 'debug', 'error', 'python', 'javascript', 'typescript',
        'react', 'api', 'endpoint', 'refactor', 'git', 'commit', 'deploy', 'build', 'compile',
        'npm', 'pip', 'docker', 'database', 'sql', 'bug', 'fix', 'test', 'lint', 'script',
        'import', 'export', 'async', 'await', 'promise', 'syntax', 'algorithm', 'scaffold',
        'component', 'module', 'package', 'library', 'framework', 'vscode', 'ide'],
    },
    {
      agent: 'legal',
      keywords: ['contract', 'lease', 'clause', 'legal', 'tenant', 'landlord', 'obligation',
        'breach', 'indemnity', 'liability', 'termination', 'notice period', 'break clause',
        'dilapidation', 'covenant', 'warranty', 'dispute', 'compliance', 'regulation',
        'legislation', 'act', 'statute', 'solicitor', 'lawyer', 'court', 'tribunal',
        'settlement', 'damages', 'injunction', 'negligence', 'fiduciary'],
    },
    {
      agent: 'accounting',
      keywords: ['invoice', 'payment', 'vat', 'tax', 'receipt', 'expense', 'accounting',
        'reconcil', 'ledger', 'debit', 'credit', 'balance', 'statement', 'bank',
        'cash flow', 'profit', 'loss', 'revenue', 'turnover', 'payroll', 'hmrc',
        'self-assessment', 'corporation tax', 'dividend', 'accounts', 'bookkeep',
        'supplier', 'creditor', 'debtor', 'overdue', 'outstanding'],
    },
    {
      agent: 'web',
      keywords: ['search', 'find', 'look up', 'research', 'website', 'url', 'browse',
        'scrape', 'extract from', 'web page', 'online', 'google', 'compare options',
        'what is the latest', 'current price', 'news about'],
    },
    {
      agent: 'business',
      keywords: ['workflow', 'process', 'supplier', 'delivery', 'staff', 'employee',
        'meeting', 'agenda', 'project', 'deadline', 'milestone', 'client',
        'proposal', 'quote', 'tender', 'procurement', 'operational'],
    },
    {
      agent: 'generative',
      keywords: ['build a tool', 'create a tool', 'design a tool', 'new tool',
        'build an agent', 'create agent', 'generate tool', 'tool builder',
        'missing capability', 'create connector'],
    },
  ];

  for (const { agent, keywords } of patterns) {
    const matches = keywords.filter(kw => lower.includes(kw));
    if (matches.length >= 2) return agent;
  }

  // Single keyword match with lower confidence
  for (const { agent, keywords } of patterns) {
    if (keywords.some(kw => lower.includes(kw))) return agent;
  }

  return 'general';
}

/**
 * Build thinking phases for a given agent action.
 */
export function buildThinkingPhases(agent: AgentType, hasTools: boolean = false): ThinkingPhase[] {
  const agentLabels: Record<AgentType, string> = {
    general: 'General reasoning',
    coding: 'Code analysis',
    legal: 'Legal analysis',
    accounting: 'Financial analysis',
    business: 'Business analysis',
    web: 'Web research',
    generative: 'Tool design',
  };

  const phases: ThinkingPhase[] = [
    { phase: 'Interpreting request', status: 'active' },
    { phase: agentLabels[agent], status: 'pending' },
  ];

  if (hasTools) {
    phases.push({ phase: 'Running tools', status: 'pending' });
  }

  phases.push(
    { phase: 'Generating response', status: 'pending' },
    { phase: 'Complete', status: 'pending' },
  );

  return phases;
}

/**
 * Advance thinking phases to the next step.
 */
export function advancePhase(phases: ThinkingPhase[], targetIndex: number): ThinkingPhase[] {
  return phases.map((p, i) => ({
    ...p,
    status: i < targetIndex ? 'done' : i === targetIndex ? 'active' : 'pending',
  }));
}

/**
 * Build the messages array for LLM chat, including system prompt and history.
 */
export function buildChatMessages(
  agent: AgentType,
  userMessage: string,
  history: Message[],
  context?: {
    activeApp?: string;
    windowTitle?: string;
    selection?: string;
    clipboard?: string;
    availableTools?: string[];
    memoryFacts?: string[];
  }
): ChatMessage[] {
  const systemPrompt = buildSystemPrompt(agent, context);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Include recent history (last 20 messages for context)
  const recentHistory = history.slice(-20);
  for (const msg of recentHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

/**
 * Parse structured workspace data from a response.
 * Looks for ```hermes-workspace ... ``` blocks and extracts JSON.
 */
export function parseWorkspaceData(content: string): { cleanContent: string; workspaceData: WorkspaceData | null } {
  const workspaceRegex = /```hermes-workspace\s*\n([\s\S]*?)\n```/g;
  let workspaceData: WorkspaceData | null = null;

  const match = workspaceRegex.exec(content);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.type && parsed.content) {
        workspaceData = {
          type: parsed.type,
          content: parsed.content,
        };
      }
    } catch (e) {
      // JSON parse failed — ignore malformed workspace blocks
      console.warn('Failed to parse workspace data:', e);
    }
  }

  // Remove the workspace block from displayed content
  const cleanContent = content.replace(workspaceRegex, '').trim();

  return { cleanContent, workspaceData };
}

/**
 * Extract smart suggestions from the agent response.
 * First tries to find explicit suggestions in the response,
 * then falls back to defaults for the agent type.
 */
export function extractSuggestions(agent: AgentType, content: string): string[] {
  // Check if response contains a suggestions section
  const suggestionsRegex = /(?:suggestions?|next steps?|try|you (?:can|could|might))[:]\s*\n((?:[-•*]\s+.+\n?)+)/gi;
  const match = suggestionsRegex.exec(content);

  if (match) {
    const items = match[1]
      .split('\n')
      .map(line => line.replace(/^[-•*]\s+/, '').trim())
      .filter(line => line.length > 0 && line.length < 60);

    if (items.length >= 2) {
      return items.slice(0, 5);
    }
  }

  return getDefaultSuggestions(agent);
}

/**
 * Determine which model to use based on selected models and provider.
 */
export function resolveModel(
  selectedModels: string[],
  models: { id: string; provider: string; status: string }[]
): { modelId: string; provider: string; endpoint?: string } | null {
  // Try selected models first
  for (const id of selectedModels) {
    const model = models.find(m => m.id === id && m.status === 'available');
    if (model) {
      return { modelId: id, provider: model.provider };
    }
  }

  // Fallback: first available model
  const available = models.find(m => m.status === 'available');
  if (available) {
    return { modelId: available.id, provider: available.provider };
  }

  return null;
}
