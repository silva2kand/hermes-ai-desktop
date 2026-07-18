/**
 * Context Engine — detects the user's active desktop context.
 * 
 * Capabilities:
 * - Active window detection (via Electron IPC)
 * - Clipboard monitoring
 * - Domain classification from context
 * - Suggestion generation based on detected domain
 */

import type { AgentType } from '../store/appStore';
import { classifyDomain } from './orchestrator';

export interface DesktopContext {
  activeApp: string;
  windowTitle: string;
  selection?: string;
  clipboard?: string;
  detectedDomain: AgentType;
  suggestions: string[];
  timestamp: Date;
}

/**
 * Detect the active window using Electron IPC.
 * Falls back to navigator info in browser mode.
 */
export async function detectActiveWindow(): Promise<{ app: string; title: string }> {
  // Try Electron IPC
  if (typeof window !== 'undefined' && (window as any).electronAPI?.getActiveWindow) {
    try {
      const result = await (window as any).electronAPI.getActiveWindow();
      return { app: result.app || 'Unknown', title: result.title || '' };
    } catch {}
  }

  // Browser fallback
  return {
    app: 'Browser',
    title: document.title || window.location.href,
  };
}

/**
 * Read clipboard contents.
 */
export async function readClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch {
    // Clipboard access denied or not available
  }
  return null;
}

/**
 * Get the current text selection.
 */
export function getSelection(): string | null {
  const selection = window.getSelection();
  return selection && selection.toString().length > 0 ? selection.toString() : null;
}

/**
 * Generate context-aware suggestions based on detected domain.
 */
function generateSuggestions(domain: AgentType, context: { app: string; title: string; clipboard?: string }): string[] {
  const baseSuggestions: Record<AgentType, string[]> = {
    general: ['Summarize this content', 'Create a task from this', 'Draft a reply', 'Explain this to me'],
    coding: ['Fix this code', 'Add error handling', 'Write tests', 'Refactor this', 'Explain this code'],
    legal: ['Check for legal issues', 'Extract dates', 'Identify parties', 'Flag risk clauses'],
    accounting: ['Parse invoice data', 'Calculate totals', 'Check for errors', 'Export to CSV'],
    business: ['Create action items', 'Draft a reply', 'Summarize for team', 'Create workflow'],
    web: ['Summarize this page', 'Extract key points', 'Find related sources', 'Save to knowledge base'],
    generative: ['Build a tool for this', 'Create an agent', 'Design a workflow'],
  };

  const suggestions = [...(baseSuggestions[domain] || baseSuggestions.general)];

  // Add app-specific suggestions
  const appLower = context.app.toLowerCase();
  if (appLower.includes('code') || appLower.includes('studio')) {
    suggestions.unshift('Analyze current file', 'Fix errors in editor');
  } else if (appLower.includes('chrome') || appLower.includes('firefox') || appLower.includes('edge') || appLower.includes('browser')) {
    suggestions.unshift('Summarize this page', 'Extract data from page');
  } else if (appLower.includes('outlook') || appLower.includes('mail') || appLower.includes('gmail')) {
    suggestions.unshift('Draft a reply', 'Summarize email thread');
  } else if (appLower.includes('excel') || appLower.includes('sheets')) {
    suggestions.unshift('Analyze this spreadsheet', 'Create chart from data');
  } else if (appLower.includes('word') || appLower.includes('docs')) {
    suggestions.unshift('Proofread this document', 'Summarize document');
  }

  // Add clipboard-specific
  if (context.clipboard && context.clipboard.length > 10) {
    suggestions.unshift('Process clipboard content');
  }

  return suggestions.slice(0, 6);
}

/**
 * Classify domain from window title and clipboard content.
 */
function classifyFromContext(title: string, clipboard?: string): AgentType {
  const combined = `${title} ${clipboard || ''}`;
  return classifyDomain(combined);
}

/**
 * Capture full desktop context.
 */
export async function captureContext(): Promise<DesktopContext> {
  const [windowInfo, clipboard, selection] = await Promise.all([
    detectActiveWindow(),
    readClipboard(),
    Promise.resolve(getSelection()),
  ]);

  const detectedDomain = classifyFromContext(
    windowInfo.title,
    clipboard || selection || undefined
  );

  const suggestions = generateSuggestions(detectedDomain, {
    ...windowInfo,
    clipboard: clipboard || undefined,
  });

  return {
    activeApp: windowInfo.app,
    windowTitle: windowInfo.title,
    selection: selection || undefined,
    clipboard: clipboard || undefined,
    detectedDomain,
    suggestions,
    timestamp: new Date(),
  };
}

/**
 * Start periodic context capture.
 * Returns a cleanup function to stop monitoring.
 */
export function startContextMonitor(
  onUpdate: (ctx: DesktopContext) => void,
  intervalMs: number = 5000
): () => void {
  let running = true;

  const poll = async () => {
    if (!running) return;
    try {
      const ctx = await captureContext();
      onUpdate(ctx);
    } catch (err) {
      console.warn('[ContextEngine] Capture failed:', err);
    }
    if (running) {
      setTimeout(poll, intervalMs);
    }
  };

  // Initial capture
  poll();

  return () => {
    running = false;
  };
}
