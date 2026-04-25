import { create } from 'zustand';
// Database integration will be wired in Phase 6
// import * as db from '../lib/database';

export type Theme = 'dark-blue' | 'midnight' | 'solarized' | 'high-contrast' | 'neon' | 'minimal-light' | 'minimal-dark' | 'slate' | 'emerald' | 'crimson';
export type SidebarSection = 'chats' | 'agents' | 'models' | 'connectors' | 'settings' | 'plugins' | 'monitoring';
export type AgentType = 'general' | 'coding' | 'legal' | 'accounting' | 'business' | 'web' | 'generative';
export type WorkspaceType = 'none' | 'code' | 'legal' | 'accounting' | 'web' | 'terminal' | 'monitoring';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  agent?: AgentType;
  model?: string;
  thinking?: ThinkingPhase[];
  suggestions?: string[];
  workspaceData?: WorkspaceData;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  modelResults?: { model: string; content: string }[];
}

export interface ThinkingPhase {
  phase: string;
  status: 'pending' | 'active' | 'done';
  detail?: string;
}

export interface WorkspaceData {
  type: WorkspaceType;
  content: any;
}

export interface ToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'done' | 'error';
  input?: any;
  output?: any;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  agent: AgentType;
  createdAt: Date;
  pinned?: boolean;
  tags?: string[];
}

export interface Model {
  id: string;
  name: string;
  provider: 'ollama' | 'lmstudio' | 'gemini' | 'openrouter' | 'groq' | 'huggingface' | 'openai';
  status: 'available' | 'connect_required' | 'connecting' | 'error' | 'detecting';
  size?: string;
  context?: number;
  selected?: boolean;
  apiKey?: string;
  endpoint?: string;
}

export interface Connector {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'not_connected' | 'connecting' | 'error';
  description: string;
  category: 'email' | 'calendar' | 'messaging' | 'browser' | 'filesystem' | 'code' | 'productivity';
  permissions?: string[];
  lastSync?: Date;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  author: string;
  capabilities: string[];
  icon: string;
}

export interface AgentMonitor {
  id: string;
  name: string;
  type: AgentType;
  status: 'idle' | 'running' | 'error' | 'waiting';
  tasksCompleted: number;
  lastActive: Date;
  memoryUsed: number;
  toolsUsed: string[];
  currentTask?: string;
}

export interface MemoryEntry {
  id: string;
  key: string;
  value: string;
  source: string;
  createdAt: Date;
  tags: string[];
  pinned: boolean;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

export interface ContextCapture {
  activeApp: string;
  windowTitle: string;
  selection?: string;
  clipboard?: string;
  screenshot?: string;
  domain?: string;
  detectedDomain?: AgentType;
  suggestions?: string[];
}

interface AppState {
  // UI State
  theme: Theme;
  sidebarOpen: boolean;
  sidebarSection: SidebarSection;
  sidebarCollapsed: Record<string, boolean>;
  activePanel: 'chat' | 'workspace' | 'terminal' | 'monitoring';
  workspaceType: WorkspaceType;
  workspaceData: WorkspaceData | null;
  showPopup: boolean;
  popupPosition: { x: number; y: number };
  showThinkingBar: boolean;
  thinkingPhases: ThinkingPhase[];
  rightPanelOpen: boolean;

  // Chat State
  chats: Chat[];
  activeChatId: string | null;
  inputValue: string;
  isStreaming: boolean;
  selectedModels: string[];
  multiModelView: 'merged' | 'split';
  activeAgent: AgentType;

  // Models
  models: Model[];

  // Connectors
  connectors: Connector[];

  // Plugins
  plugins: Plugin[];

  // Agents Monitoring
  agentMonitors: AgentMonitor[];

  // Memory
  memoryEntries: MemoryEntry[];

  // Terminal
  terminalLines: TerminalLine[];
  terminalInput: string;

  // Context
  contextCapture: ContextCapture | null;

  // Settings
  settings: {
    ollamaEndpoint: string;
    lmStudioEndpoint: string;
    autoDetect: boolean;
    notifications: boolean;
    globalHotkey: string;
    trayOnClose: boolean;
    alwaysOnTop: boolean;
    fontSize: number;
    soundEnabled: boolean;
    autoSuggest: boolean;
    streamResponses: boolean;
    approvalRequired: boolean;
    sandboxEnabled: boolean;
  };

  // Actions
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarSection: (section: SidebarSection) => void;
  toggleSidebarCollapsed: (key: string) => void;
  setActivePanel: (panel: 'chat' | 'workspace' | 'terminal' | 'monitoring') => void;
  setWorkspace: (type: WorkspaceType, data: any) => void;
  setShowPopup: (show: boolean, pos?: { x: number; y: number }) => void;
  setThinkingPhases: (phases: ThinkingPhase[]) => void;
  setShowThinkingBar: (show: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;

  createChat: (agent?: AgentType) => string;
  setActiveChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (chatId: string, msgId: string, updates: Partial<Message>) => void;
  setInputValue: (val: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setSelectedModels: (models: string[]) => void;
  setMultiModelView: (view: 'merged' | 'split') => void;
  setActiveAgent: (agent: AgentType) => void;

  updateModelStatus: (modelId: string, status: Model['status'], extra?: Partial<Model>) => void;
  connectModel: (modelId: string, apiKey?: string) => void;

  updateConnector: (connectorId: string, updates: Partial<Connector>) => void;
  connectConnector: (connectorId: string) => void;

  togglePlugin: (pluginId: string) => void;

  updateAgentMonitor: (agentId: string, updates: Partial<AgentMonitor>) => void;

  addMemoryEntry: (entry: Omit<MemoryEntry, 'id' | 'createdAt'>) => void;
  deleteMemoryEntry: (id: string) => void;
  toggleMemoryPin: (id: string) => void;

  addTerminalLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  setTerminalInput: (val: string) => void;
  clearTerminal: () => void;

  setContextCapture: (ctx: ContextCapture) => void;
  updateSettings: (updates: Partial<AppState['settings']>) => void;

  detectLocalModels: () => Promise<void>;
  sendMessage: (content: string) => void;
  regenerateMessage: (chatId: string, msgId: string) => void;
  continueMessage: (chatId: string) => void;
  editAndResend: (chatId: string, msgId: string, newContent: string) => void;
  speakMessage: (content: string) => void;
  runTerminalCommand: (cmd: string) => void;
  hydrateDatabase: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(1)}GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(0)}MB`;
}

const defaultModels: Model[] = [
  { id: 'qwen3.6:27b', name: 'Qwen 3.6 27B', provider: 'ollama', status: 'detecting', size: '17.4GB', context: 128000 },
  { id: 'lfm2.5-thinking:latest', name: 'LMF 2.5 Thinking', provider: 'ollama', status: 'detecting', size: '731MB', context: 32000 },
  { id: 'lm:qwen/qwen3.6-27b', name: 'Qwen 3.6 27B', provider: 'lmstudio', status: 'detecting', context: 32000 },
  { id: 'lm:google/gemma-4-e4b', name: 'Gemma 4 E4B', provider: 'lmstudio', status: 'detecting', context: 32000 },
  { id: 'gemini-pro', name: 'Gemini Pro 1.5', provider: 'gemini', status: 'connect_required', context: 1000000 },
  { id: 'gemini-flash', name: 'Gemini Flash 2.0', provider: 'gemini', status: 'connect_required', context: 1000000 },
  { id: 'gpt4o', name: 'GPT-4o', provider: 'openai', status: 'connect_required', context: 128000 },
  { id: 'groq-llama', name: 'Llama 3.1 (Groq)', provider: 'groq', status: 'connect_required', context: 128000 },
  { id: 'openrouter-mix', name: 'OpenRouter Auto', provider: 'openrouter', status: 'connect_required', context: 200000 },
];

const defaultConnectors: Connector[] = [
  { id: 'outlook', name: 'Outlook', icon: '📧', status: 'not_connected', description: 'Microsoft Outlook email & calendar', category: 'email', permissions: ['read_email', 'send_email', 'read_calendar'] },
  { id: 'gmail', name: 'Gmail', icon: '✉️', status: 'not_connected', description: 'Google Gmail with full thread access', category: 'email', permissions: ['read_email', 'send_email', 'labels'] },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', status: 'not_connected', description: 'WhatsApp Web bridge (QR connect)', category: 'messaging', permissions: ['read_messages', 'send_messages'] },
  { id: 'teams', name: 'Microsoft Teams', icon: '🟣', status: 'not_connected', description: 'Teams channels & messages', category: 'messaging', permissions: ['read_channels', 'send_messages'] },
  { id: 'slack', name: 'Slack', icon: '⚡', status: 'not_connected', description: 'Slack workspace integration', category: 'messaging', permissions: ['read_channels', 'send_messages'] },
  { id: 'gcal', name: 'Google Calendar', icon: '📅', status: 'not_connected', description: 'Google Calendar events & reminders', category: 'calendar', permissions: ['read_events', 'create_events'] },
  { id: 'outlook-cal', name: 'Outlook Calendar', icon: '🗓️', status: 'not_connected', description: 'Outlook Calendar integration', category: 'calendar', permissions: ['read_events', 'create_events'] },
  { id: 'chrome', name: 'Chrome Browser', icon: '🌐', status: 'not_connected', description: 'Chrome extension: tab control, history, screenshots', category: 'browser', permissions: ['active_tab', 'history', 'screenshots'] },
  { id: 'filesystem', name: 'Filesystem', icon: '📁', status: 'connected', description: 'Local filesystem access (sandboxed)', category: 'filesystem', permissions: ['read_files', 'write_files', 'list_dirs'] },
  { id: 'terminal', name: 'Terminal', icon: '⬛', status: 'connected', description: 'Whitelisted command execution', category: 'code', permissions: ['run_commands'] },
  { id: 'vscode', name: 'VS Code', icon: '💻', status: 'not_connected', description: 'VS Code extension for context & edits', category: 'code', permissions: ['read_files', 'write_files', 'run_commands'] },
  { id: 'notion', name: 'Notion', icon: '📓', status: 'not_connected', description: 'Notion pages & databases', category: 'productivity', permissions: ['read_pages', 'write_pages'] },
  { id: 'jira', name: 'Jira', icon: '🎯', status: 'not_connected', description: 'Jira issues & sprints', category: 'productivity', permissions: ['read_issues', 'create_issues'] },
  { id: 'github', name: 'GitHub', icon: '🐙', status: 'not_connected', description: 'GitHub repos, PRs, issues', category: 'code', permissions: ['read_repos', 'create_prs'] },
];

const defaultPlugins: Plugin[] = [
  { id: 'legal-analyzer', name: 'Legal Analyzer Pro', description: 'Deep contract analysis, clause extraction, risk scoring', version: '2.1.0', enabled: true, author: 'Hermes Labs', capabilities: ['clause_extraction', 'risk_scoring', 'timeline'], icon: '⚖️' },
  { id: 'accounting-suite', name: 'Accounting Suite', description: 'Invoice parsing, reconciliation, VAT classification', version: '1.8.3', enabled: true, author: 'Hermes Labs', capabilities: ['invoice_parse', 'reconcile', 'vat'], icon: '💰' },
  { id: 'code-workspace', name: 'Code Workspace', description: 'Full IDE features: diff, linting, scaffolding, run', version: '3.0.1', enabled: true, author: 'Hermes Labs', capabilities: ['diff', 'lint', 'scaffold', 'run'], icon: '🛠️' },
  { id: 'web-intel', name: 'Web Intelligence', description: 'Deep web scraping, extraction, structured data', version: '1.2.0', enabled: true, author: 'Hermes Labs', capabilities: ['scrape', 'extract', 'search'], icon: '🔍' },
  { id: 'memory-graph', name: 'Memory Graph', description: 'Persistent semantic memory with knowledge graph', version: '1.0.5', enabled: true, author: 'Hermes Labs', capabilities: ['store', 'recall', 'graph'], icon: '🧠' },
  { id: 'screen-reader', name: 'Screen Intelligence', description: 'Screenshot OCR, UI detection, context capture', version: '2.0.0', enabled: false, author: 'Hermes Labs', capabilities: ['ocr', 'ui_detect', 'capture'], icon: '📸' },
  { id: 'voice-io', name: 'Voice I/O', description: 'Real-time STT/TTS with multiple voice models', version: '1.5.2', enabled: false, author: 'Hermes Labs', capabilities: ['stt', 'tts', 'voice_clone'], icon: '🎙️' },
  { id: 'workflow-engine', name: 'Workflow Engine', description: 'Visual workflow builder with trigger automation', version: '1.1.0', enabled: false, author: 'Community', capabilities: ['triggers', 'actions', 'conditions'], icon: '⚙️' },
];

const defaultAgentMonitors: AgentMonitor[] = [
  { id: 'general-hermes', name: 'General Hermes', type: 'general', status: 'idle', tasksCompleted: 147, lastActive: new Date(Date.now() - 120000), memoryUsed: 245, toolsUsed: ['web_search', 'summarize'], currentTask: undefined },
  { id: 'coding-hermes', name: 'Coding Hermes', type: 'coding', status: 'idle', tasksCompleted: 89, lastActive: new Date(Date.now() - 300000), memoryUsed: 512, toolsUsed: ['file_read', 'file_write', 'terminal', 'diff'], currentTask: undefined },
  { id: 'legal-hermes', name: 'Legal Hermes', type: 'legal', status: 'idle', tasksCompleted: 34, lastActive: new Date(Date.now() - 600000), memoryUsed: 128, toolsUsed: ['clause_extract', 'timeline', 'calendar'], currentTask: undefined },
  { id: 'accounting-hermes', name: 'Accounting Hermes', type: 'accounting', status: 'idle', tasksCompleted: 56, lastActive: new Date(Date.now() - 900000), memoryUsed: 96, toolsUsed: ['invoice_parse', 'reconcile'], currentTask: undefined },
  { id: 'web-hermes', name: 'Web Hermes', type: 'web', status: 'idle', tasksCompleted: 212, lastActive: new Date(Date.now() - 60000), memoryUsed: 384, toolsUsed: ['web_search', 'web_fetch', 'extract'], currentTask: undefined },
  { id: 'generative-agent', name: 'Generative Builder', type: 'generative', status: 'idle', tasksCompleted: 12, lastActive: new Date(Date.now() - 3600000), memoryUsed: 64, toolsUsed: ['tool_build', 'sandbox', 'register'], currentTask: undefined },
];

const defaultMemory: MemoryEntry[] = [
  { id: 'm1', key: 'user_name', value: 'Alex', source: 'conversation', createdAt: new Date(Date.now() - 86400000 * 3), tags: ['personal', 'identity'], pinned: true },
  { id: 'm2', key: 'preferred_language', value: 'Python, TypeScript', source: 'conversation', createdAt: new Date(Date.now() - 86400000 * 2), tags: ['preferences', 'coding'], pinned: false },
  { id: 'm3', key: 'active_project', value: 'Hermes AI Desktop App', source: 'conversation', createdAt: new Date(Date.now() - 86400000), tags: ['project', 'work'], pinned: true },
  { id: 'm4', key: 'ollama_endpoint', value: 'http://localhost:11434', source: 'settings', createdAt: new Date(), tags: ['config', 'models'], pinned: false },
];

const welcomeChat: Chat = {
  id: 'welcome',
  title: 'Welcome to Hermes AI',
  agent: 'general',
  createdAt: new Date(),
  messages: [
    {
      id: 'w1',
      role: 'assistant',
      content: `# Welcome to Hermes AI Desktop 🧠

I'm your **universal AI intelligence layer** — running locally on your machine with full access to your tools, connectors, and agents.

**What I can do:**
- 🔧 **Build tools** automatically when capabilities are missing
- ⚖️ **Legal analysis** — contracts, leases, clauses, timelines  
- 💰 **Accounting** — invoices, reconciliation, VAT classification
- 💻 **Code** — write, refactor, debug, scaffold entire projects
- 🌐 **Web intelligence** — search, scrape, extract structured data
- 📧 **Email & calendar** — Outlook, Gmail, WhatsApp, Teams
- 🖥️ **Desktop context** — I see what you're working on and suggest actions

**Auto-detected local models:** Scanning Ollama & LM Studio...
**Connected tools:** Filesystem ✅ | Terminal ✅

Type anything to get started, or use the sidebar to configure models and connectors.`,
      timestamp: new Date(),
      agent: 'general',
      thinking: [],
      suggestions: ['Detect my local AI models', 'Connect my email', 'Show me what you can do', 'Build a new tool for me'],
    }
  ],
};

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'dark-blue',
  sidebarOpen: true,
  sidebarSection: 'chats',
  sidebarCollapsed: {},
  activePanel: 'chat',
  workspaceType: 'none',
  workspaceData: null,
  showPopup: false,
  popupPosition: { x: 0, y: 0 },
  showThinkingBar: false,
  thinkingPhases: [],
  rightPanelOpen: false,

  chats: [welcomeChat],
  activeChatId: 'welcome',
  inputValue: '',
  isStreaming: false,
  selectedModels: ['llama3.1'],
  multiModelView: 'merged',
  activeAgent: 'general',

  models: defaultModels,
  connectors: defaultConnectors,
  plugins: defaultPlugins,
  agentMonitors: defaultAgentMonitors,
  memoryEntries: defaultMemory,
  terminalLines: [
    { id: 't0', type: 'info', content: 'Hermes Terminal v1.0 — Sandboxed execution environment', timestamp: new Date() },
    { id: 't1', type: 'info', content: 'Type commands or ask the AI to run them for you', timestamp: new Date() },
  ],
  terminalInput: '',
  contextCapture: null,

  settings: {
    ollamaEndpoint: 'http://localhost:11434',
    lmStudioEndpoint: 'http://localhost:1234',
    autoDetect: true,
    notifications: true,
    globalHotkey: 'Ctrl+Shift+H',
    trayOnClose: true,
    alwaysOnTop: false,
    fontSize: 14,
    soundEnabled: false,
    autoSuggest: true,
    streamResponses: true,
    approvalRequired: true,
    sandboxEnabled: true,
  },

  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarSection: (section) => set({ sidebarSection: section }),
  toggleSidebarCollapsed: (key) => set((s) => ({ sidebarCollapsed: { ...s.sidebarCollapsed, [key]: !s.sidebarCollapsed[key] } })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setWorkspace: (type, data) => set({ workspaceType: type, workspaceData: { type, content: data }, rightPanelOpen: type !== 'none' }),
  setShowPopup: (show, pos) => set({ showPopup: show, ...(pos ? { popupPosition: pos } : {}) }),
  setThinkingPhases: (phases) => set({ thinkingPhases: phases }),
  setShowThinkingBar: (show) => set({ showThinkingBar: show }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

  createChat: (agent = 'general') => {
    const id = generateId();
    const chat: Chat = {
      id,
      title: `New Chat`,
      messages: [],
      agent,
      createdAt: new Date(),
    };
    set((s) => ({ chats: [chat, ...s.chats], activeChatId: id, activeAgent: agent }));
    
    if (typeof window !== 'undefined' && (window as any).electronAPI?.db) {
      (window as any).electronAPI.db.createChat(id, chat.title, agent).catch(console.error);
    }
    
    return id;
  },

  setActiveChat: (id) => set({ activeChatId: id }),

  addMessage: (chatId, message) => {
    const id = generateId();
    const msg: Message = { ...message, id, timestamp: new Date() };
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, msg],
              title: c.messages.length === 0 && message.role === 'user' ? message.content.slice(0, 40) : c.title,
            }
          : c
      ),
    }));
    
    if (typeof window !== 'undefined' && (window as any).electronAPI?.db) {
      (window as any).electronAPI.db.addMessage(id, chatId, msg.role, msg.content, msg.agent, msg.model).catch(console.error);
    }
    
    return id;
  },

  updateMessage: (chatId, msgId, updates) => {
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === chatId
          ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...updates } : m)) }
          : c
      ),
    }));
  },

  setInputValue: (val) => set({ inputValue: val }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setSelectedModels: (models) => set({ selectedModels: models }),
  setMultiModelView: (view) => set({ multiModelView: view }),
  setActiveAgent: (agent) => set({ activeAgent: agent }),

  updateModelStatus: (modelId, status, extra) =>
    set((s) => ({
      models: s.models.map((m) => (m.id === modelId ? { ...m, status, ...extra } : m)),
    })),

  connectModel: async (modelId, apiKey) => {
    const { updateModelStatus, models } = get();
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    // If API key provided, test and connect
    if (apiKey) {
      updateModelStatus(modelId, 'connecting');
      try {
        const { testConnection, saveApiKey } = await import('../lib/remoteModels');
        const result = await testConnection(model.provider, apiKey);
        if (result.success) {
          await saveApiKey(model.provider, apiKey);
          updateModelStatus(modelId, 'available', { apiKey });
        } else {
          updateModelStatus(modelId, 'error');
        }
      } catch {
        updateModelStatus(modelId, 'error');
      }
    } else {
      // Signal UI to show API key modal — set status to prompt user
      updateModelStatus(modelId, 'connect_required');
    }
  },

  updateConnector: (connectorId, updates) =>
    set((s) => ({
      connectors: s.connectors.map((c) => (c.id === connectorId ? { ...c, ...updates } : c)),
    })),

  connectConnector: (connectorId) => {
    const { updateConnector } = get();
    updateConnector(connectorId, { status: 'connecting' });
    setTimeout(() => {
      updateConnector(connectorId, { status: 'connected', lastSync: new Date() });
    }, 2000);
  },

  togglePlugin: (pluginId) =>
    set((s) => ({
      plugins: s.plugins.map((p) => (p.id === pluginId ? { ...p, enabled: !p.enabled } : p)),
    })),

  updateAgentMonitor: (agentId, updates) =>
    set((s) => ({
      agentMonitors: s.agentMonitors.map((a) => (a.id === agentId ? { ...a, ...updates } : a)),
    })),

  addMemoryEntry: (entry) => {
    const id = generateId();
    set((s) => ({ memoryEntries: [{ ...entry, id, createdAt: new Date() }, ...s.memoryEntries] }));
  },

  deleteMemoryEntry: (id) => set((s) => ({ memoryEntries: s.memoryEntries.filter((m) => m.id !== id) })),
  toggleMemoryPin: (id) =>
    set((s) => ({ memoryEntries: s.memoryEntries.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)) })),

  addTerminalLine: (line) => {
    const id = generateId();
    set((s) => ({ terminalLines: [...s.terminalLines, { ...line, id, timestamp: new Date() }] }));
  },
  setTerminalInput: (val) => set({ terminalInput: val }),
  clearTerminal: () => set({ terminalLines: [] }),

  setContextCapture: (ctx) => set({ contextCapture: ctx }),
  updateSettings: (updates) => set((s) => ({ settings: { ...s.settings, ...updates } })),

  detectLocalModels: async () => {
    const { updateModelStatus, settings, models } = get();
    
    // Mark all as detecting
    models.forEach(m => updateModelStatus(m.id, 'detecting'));
    
    try {
      // Import and run real detection
      const { detectOllama, detectLMStudio } = await import('../lib/localModels');
      const [o, l] = await Promise.all([
        detectOllama(settings.ollamaEndpoint),
        detectLMStudio(settings.lmStudioEndpoint),
      ]);

      if (o.status === 'available') {
        o.models.forEach((m: any) => {
          updateModelStatus(m.name, 'available', { 
            size: formatBytes(m.size),
            context: 128000 
          });
        });
      } else {
        ['llama3.1', 'llama3.1:70b', 'mistral', 'codellama', 'deepseek-coder'].forEach(id => 
          updateModelStatus(id, o.status === 'error' ? 'error' : 'detecting')
        );
      }

      if (l.status === 'available') {
        l.models.forEach((m: any) => {
          updateModelStatus(`lm:${m.id}`, 'available', { 
            size: formatBytes(m.size),
            context: 32000 
          });
        });
      } else {
        updateModelStatus('lmstudio-default', l.status === 'error' ? 'error' : 'detecting');
      }
    } catch (err) {
      console.error('Model detection failed:', err);
    }
  },

  sendMessage: async (content) => {
    const { activeChatId, addMessage, updateMessage, setIsStreaming, setShowThinkingBar, setThinkingPhases, setWorkspace, activeAgent, updateAgentMonitor, settings, selectedModels, models, contextCapture, memoryEntries } = get();
    if (!activeChatId || !content.trim()) return;

    addMessage(activeChatId, { role: 'user', content });
    setIsStreaming(true);

    const agentId = activeAgent === 'generative' ? 'generative-agent' : activeAgent + '-hermes';
    updateAgentMonitor(agentId, { status: 'running', currentTask: content.slice(0, 50), lastActive: new Date() });

    // Import orchestrator for real agent routing
    const { buildThinkingPhases, advancePhase, buildChatMessages, parseWorkspaceData, extractSuggestions, resolveModel } = await import('../lib/orchestrator');

    const phases = buildThinkingPhases(activeAgent, false);
    setThinkingPhases(phases);
    setShowThinkingBar(true);

    const msgId = addMessage(activeChatId, {
      role: 'assistant',
      content: '',
      agent: activeAgent,
      isStreaming: true,
      thinking: phases,
    });

    // Resolve which model to use
    const resolved = resolveModel(selectedModels, models);

    if (!resolved) {
      updateMessage(activeChatId, msgId, {
        content: '⚠️ **No model available.** Please ensure Ollama or LM Studio is running, or connect a remote model in the Models tab.\n\n**Quick fix:**\n1. Open the sidebar → Models\n2. Click "Auto-detect Local Models"\n3. Or connect a remote provider (Gemini, OpenRouter, Groq)',
        isStreaming: false,
        suggestions: ['Detect local models', 'Open Models panel', 'Connect Gemini'],
      });
      setIsStreaming(false);
      setShowThinkingBar(false);
      updateAgentMonitor(agentId, { status: 'idle', currentTask: undefined });
      return;
    }

    try {
      const { streamOllamaChat, streamLMStudioChat } = await import('../lib/localModels');

      // Build context for agent prompt
      const context = {
        activeApp: contextCapture?.activeApp,
        windowTitle: contextCapture?.windowTitle,
        selection: contextCapture?.selection,
        clipboard: contextCapture?.clipboard,
        availableTools: ['web_search', 'file_read', 'file_write', 'terminal', 'summarize'],
        memoryFacts: memoryEntries.filter(m => m.pinned).map(m => `${m.key}: ${m.value}`),
      };

      // Build messages with agent-specific system prompt
      const chatHistory = get().chats.find(c => c.id === activeChatId)?.messages.slice(0, -1) || [];
      const messages = buildChatMessages(activeAgent, content, chatHistory, context);

      // Phase 1 done → Phase 2 (agent working)
      setThinkingPhases(advancePhase(phases, 1));

      let fullContent = '';
      let modelName = resolved.modelId;

      const model = models.find(m => m.id === resolved.modelId);
      const provider = model?.provider || resolved.provider;

      // Phase 2 done → streaming phase
      const streamPhaseIdx = phases.findIndex(p => p.phase === 'Generating response');
      setThinkingPhases(advancePhase(phases, streamPhaseIdx >= 0 ? streamPhaseIdx : 2));

      const abortController = new AbortController();
      let generator: AsyncGenerator<string>;

      if (provider === 'ollama') {
        generator = streamOllamaChat(settings.ollamaEndpoint, modelName, messages, abortController.signal);
      } else if (provider === 'lmstudio') {
        generator = streamLMStudioChat(settings.lmStudioEndpoint, modelName, messages, abortController.signal);
      } else {
        // Remote provider (gemini, openai, openrouter, groq, huggingface)
        const { streamRemoteChat, getApiKey } = await import('../lib/remoteModels');
        const apiKey = (model as any)?.apiKey || await getApiKey(provider);
        if (!apiKey) {
          updateMessage(activeChatId!, msgId, {
            content: `⚠️ **API key required for ${provider}.** Click "Connect" on the model in the sidebar to enter your key.`,
            isStreaming: false,
            suggestions: ['Open Models panel', 'Connect model'],
          });
          setIsStreaming(false);
          setShowThinkingBar(false);
          return;
        }
        generator = streamRemoteChat(provider, modelName, messages, apiKey, abortController.signal);
      }

      for await (const chunk of generator) {
        fullContent += chunk;
        updateMessage(activeChatId!, msgId, { content: fullContent, isStreaming: true });
      }

      // Post-process: parse workspace data and suggestions
      const { cleanContent, workspaceData } = parseWorkspaceData(fullContent);
      const suggestions = extractSuggestions(activeAgent, cleanContent);

      // Final phase: complete
      setThinkingPhases(advancePhase(phases, phases.length - 1));

      updateMessage(activeChatId!, msgId, {
        content: cleanContent || fullContent,
        isStreaming: false,
        suggestions,
        workspaceData: workspaceData || undefined,
        model: model?.name || modelName,
      });

      // If workspace data was produced, open the workspace panel
      if (workspaceData) {
        setWorkspace(workspaceData.type as any, workspaceData.content);
      }

      setTimeout(() => setShowThinkingBar(false), 1000);
      setIsStreaming(false);
      updateAgentMonitor(agentId, {
        status: 'idle',
        currentTask: undefined,
        tasksCompleted: (get().agentMonitors.find(a => a.id === agentId)?.tasksCompleted || 0) + 1,
      });

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('AI Error:', err);
        updateMessage(activeChatId!, msgId, {
          content: `⚠️ **Connection Error**\n\n\`${err.message || 'Failed to get response'}\`\n\n**Troubleshooting:**\n- Make sure **Ollama** is running (\`ollama serve\`)\n- Or **LM Studio** local server is started\n- Check the endpoint in Settings\n- Current endpoint: \`${settings.ollamaEndpoint}\``,
          isStreaming: false,
          suggestions: ['Retry', 'Check model status', 'Open Settings'],
        });
      }
      setShowThinkingBar(false);
      setIsStreaming(false);
      updateAgentMonitor(agentId, { status: 'error', currentTask: undefined });
    }
  },

  // ── New message actions ──────────────────────────────────────────

  regenerateMessage: (chatId: string, msgId: string) => {
    const { chats, sendMessage } = get();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const msgIndex = chat.messages.findIndex(m => m.id === msgId);
    if (msgIndex <= 0) return;

    // Find the user message that preceded this assistant message
    let userMsg = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (chat.messages[i].role === 'user') {
        userMsg = chat.messages[i].content;
        break;
      }
    }
    if (!userMsg) return;

    // Remove the assistant message and re-send
    set((s) => ({
      chats: s.chats.map(c =>
        c.id === chatId
          ? { ...c, messages: c.messages.filter(m => m.id !== msgId) }
          : c
      ),
    }));

    sendMessage(userMsg);
  },

  continueMessage: (_chatId: string) => {
    const { sendMessage } = get();
    sendMessage('Continue from where you left off. Do not repeat what you already said.');
  },

  editAndResend: (chatId: string, msgId: string, newContent: string) => {
    const { chats, sendMessage } = get();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const msgIndex = chat.messages.findIndex(m => m.id === msgId);
    if (msgIndex < 0) return;

    // Remove this message and all messages after it
    set((s) => ({
      chats: s.chats.map(c =>
        c.id === chatId
          ? { ...c, messages: c.messages.slice(0, msgIndex) }
          : c
      ),
    }));

    sendMessage(newContent);
  },

  speakMessage: (content: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown for cleaner speech
      const clean = content
        .replace(/```[\s\S]*?```/g, 'code block omitted')
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[-•]\s/g, '')
        .replace(/\|[^|]*\|/g, '')
        .trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  },

  runTerminalCommand: async (cmd) => {
    const { addTerminalLine, clearTerminal } = get();
    const lower = cmd.toLowerCase().trim();

    // Handle clear locally
    if (lower === 'clear' || lower === 'cls') {
      clearTerminal();
      set({ terminalInput: '' });
      return;
    }

    addTerminalLine({ type: 'input', content: `$ ${cmd}` });
    set({ terminalInput: '' });

    // Try real execution via Electron IPC first
    if (typeof window !== 'undefined' && (window as any).electronAPI?.executeTerminalCommand) {
      try {
        const result = await (window as any).electronAPI.executeTerminalCommand(cmd);
        if (result.type === 'error') {
          addTerminalLine({ type: 'error', content: result.content });
        } else {
          // Split multi-line output into separate lines
          const lines = (result.content || '').split('\n').filter((l: string) => l.length > 0);
          lines.forEach((line: string) => {
            addTerminalLine({ type: 'output', content: line });
          });
          if (lines.length === 0) {
            addTerminalLine({ type: 'info', content: '(no output)' });
          }
        }
      } catch (err: any) {
        addTerminalLine({ type: 'error', content: `Exec failed: ${err.message}` });
      }
    } else {
      // Fallback: basic simulation for browser-only dev mode
      addTerminalLine({ type: 'info', content: '[Browser mode] Real execution requires Electron. Showing simulated output.' });
      addTerminalLine({ type: 'output', content: `Simulated: ${cmd}` });
    }
  },

  hydrateDatabase: async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.db) {
      try {
        const chats = await (window as any).electronAPI.db.getChats();
        const memory = await (window as any).electronAPI.db.getMemory();
        set({ 
          chats: chats.length > 0 ? chats : [welcomeChat], 
          memoryEntries: memory.length > 0 ? memory : defaultMemory 
        });
      } catch (e) {
        console.error('Failed to hydrate DB', e);
      }
    }
  },
}));
