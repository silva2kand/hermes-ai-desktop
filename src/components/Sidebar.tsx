import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import { detectOllama, detectLMStudio, DetectionResult } from '../lib/localModels';
import {
  MessageSquare, Bot, Cpu, Plug, Settings, Plus, ChevronDown, ChevronRight,
  Pin, Trash2, Activity, Package, Brain, Zap, Scale, Calculator,
  Globe, Code, Layers, X, RefreshCw, Wifi, WifiOff
} from 'lucide-react';

const agentIcons: Record<string, React.ReactNode> = {
  general: <Bot size={14} />,
  coding: <Code size={14} />,
  legal: <Scale size={14} />,
  accounting: <Calculator size={14} />,
  business: <Layers size={14} />,
  web: <Globe size={14} />,
  generative: <Zap size={14} />,
};

const agentColors: Record<string, string> = {
  general: 'text-blue-400',
  coding: 'text-green-400',
  legal: 'text-purple-400',
  accounting: 'text-yellow-400',
  business: 'text-orange-400',
  web: 'text-cyan-400',
  generative: 'text-pink-400',
};

export default function Sidebar() {
  const {
    theme, sidebarSection, setSidebarSection, sidebarCollapsed, toggleSidebarCollapsed,
    chats, activeChatId, setActiveChat, createChat,
    models, connectors, plugins, agentMonitors,
    setSidebarOpen, activeAgent, setActiveAgent,
    connectConnector, connectModel,
    togglePlugin, settings,
  } = useAppStore();
  const [ollamaResult, setOllamaResult] = useState<DetectionResult | null>(null);
  const [lmResult, setLmResult] = useState<DetectionResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const scanLocalModels = useCallback(async () => {
    setScanning(true);
    try {
      const [o, l] = await Promise.all([
        detectOllama(settings.ollamaEndpoint),
        detectLMStudio(settings.lmStudioEndpoint),
      ]);
      setOllamaResult(o);
      setLmResult(l);
    } finally {
      setScanning(false);
    }
  }, [settings.ollamaEndpoint, settings.lmStudioEndpoint]);

  useEffect(() => {
    if (settings.autoDetect) scanLocalModels();
  }, []);

  const t = themes[theme];

  const sections = [
    { id: 'chats', label: 'Chats', icon: <MessageSquare size={18} /> },
    { id: 'agents', label: 'Agents', icon: <Bot size={18} /> },
    { id: 'models', label: 'Models', icon: <Cpu size={18} /> },
    { id: 'connectors', label: 'Connectors', icon: <Plug size={18} /> },
    { id: 'plugins', label: 'Plugins', icon: <Package size={18} /> },
    { id: 'monitoring', label: 'Monitoring', icon: <Activity size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ] as const;

  const availableModels = models.filter(m => m.status === 'available').length;
  const connectedConnectors = connectors.filter(c => c.status === 'connected').length;
  const runningAgents = agentMonitors.filter(a => a.status === 'running').length;

  return (
    <div className={`h-full flex flex-col ${t.sidebar} ${t.border} border-r`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${t.border}`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain size={14} className="text-white" />
          </div>
          <span className={`font-bold text-sm ${t.text}`}>HERMES AI</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className={`${t.textMuted} hover:${t.text} transition-colors`}>
          <X size={16} />
        </button>
      </div>

      {/* Nav Icons */}
      <div className={`flex flex-col py-2 border-b ${t.border}`}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSidebarSection(s.id)}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all relative ${
              sidebarSection === s.id
                ? `${t.accentText} ${t.surface}`
                : `${t.textMuted} ${t.surfaceHover}`
            }`}
          >
            {sidebarSection === s.id && (
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${t.accent}`} />
            )}
            {s.icon}
            <span>{s.label}</span>
            {s.id === 'models' && availableModels > 0 && (
              <span className="ml-auto text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-1.5">{availableModels}</span>
            )}
            {s.id === 'connectors' && connectedConnectors > 0 && (
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-1.5">{connectedConnectors}</span>
            )}
            {s.id === 'monitoring' && runningAgents > 0 && (
              <span className="ml-auto text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-1.5 animate-pulse">{runningAgents}</span>
            )}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">

        {/* CHATS */}
        {sidebarSection === 'chats' && (
          <div className="p-2">
            <button
              onClick={() => createChat(activeAgent)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-2 ${t.accent} text-white hover:opacity-90 transition-opacity`}
            >
              <Plus size={15} />
              New Chat
            </button>
            <div className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-1`}>Recent</div>
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all mb-0.5 ${
                  activeChatId === chat.id ? `${t.surface} ${t.accentText}` : `${t.textMuted} ${t.surfaceHover}`
                }`}
              >
                <span className={`flex-shrink-0 ${agentColors[chat.agent]}`}>{agentIcons[chat.agent]}</span>
                <span className="truncate flex-1">{chat.title}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button className={`${t.textMuted} hover:text-white`}><Pin size={11} /></button>
                  <button className={`${t.textMuted} hover:text-red-400`}><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AGENTS */}
        {sidebarSection === 'agents' && (
          <div className="p-2">
            <div className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-2`}>Select Active Agent</div>
            {([
              { id: 'general', label: 'General Hermes', desc: 'Planning, reasoning, summaries' },
              { id: 'coding', label: 'Coding Hermes', desc: 'Code, debug, build tools' },
              { id: 'legal', label: 'Legal Hermes', desc: 'Contracts, clauses, timelines' },
              { id: 'accounting', label: 'Accounting Hermes', desc: 'Invoices, reconciliation, VAT' },
              { id: 'business', label: 'Business Hermes', desc: 'Workflows, ops, suppliers' },
              { id: 'web', label: 'Web Hermes', desc: 'Search, scrape, extract' },
              { id: 'generative', label: 'Generative Builder', desc: 'Build new tools & agents' },
            ] as const).map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all text-left ${
                  activeAgent === agent.id ? `${t.surface} border ${t.border}` : `${t.surfaceHover}`
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${t.surface} ${agentColors[agent.id]}`}>
                  {agentIcons[agent.id]}
                </span>
                <div className="min-w-0">
                  <div className={`font-medium truncate ${activeAgent === agent.id ? t.accentText : t.text}`}>{agent.label}</div>
                  <div className={`text-xs truncate ${t.textMuted}`}>{agent.desc}</div>
                </div>
                {activeAgent === agent.id && <div className={`w-2 h-2 rounded-full ${t.accent} ml-auto flex-shrink-0`} />}
              </button>
            ))}

            <div className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-2 mt-4`}>Paperclip Agents (Context)</div>
            {['Legal Context Watcher', 'Accounting Context Watcher', 'Code Context Watcher', 'Web Context Watcher', 'Business Context Watcher'].map((name) => (
              <div key={name} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${t.textMuted} mb-0.5`}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {name}
              </div>
            ))}
          </div>
        )}

        {/* MODELS */}
        {sidebarSection === 'models' && (
          <div className="p-2 space-y-3">
            <button
              onClick={scanLocalModels}
              disabled={scanning}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${t.surface} ${t.border} border ${t.text} hover:${t.accentText} transition-colors disabled:opacity-50`}
            >
              <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
              {scanning ? 'Scanning...' : 'Auto-detect Local Models'}
            </button>

            <div className="grid grid-cols-2 gap-2 px-1">
              <div className={`rounded-lg border ${t.border} p-2`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">🦙 Ollama</span>
                  {ollamaResult?.status === 'available' ? (
                    <Wifi size={10} className="text-green-400" />
                  ) : ollamaResult ? (
                    <WifiOff size={10} className="text-red-400" />
                  ) : null}
                </div>
                <div className={`text-lg font-bold ${ollamaResult?.status === 'available' ? 'text-green-400' : 'text-gray-500'}`}>
                  {ollamaResult?.models?.length || 0}
                </div>
                <div className={`text-xs ${t.textMuted}`}>models</div>
                {ollamaResult?.responseTime && (
                  <div className={`text-xs ${t.textMuted}`}>{ollamaResult.responseTime}ms</div>
                )}
              </div>
              <div className={`rounded-lg border ${t.border} p-2`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">🧠 LM Studio</span>
                  {lmResult?.status === 'available' ? (
                    <Wifi size={10} className="text-green-400" />
                  ) : lmResult ? (
                    <WifiOff size={10} className="text-red-400" />
                  ) : null}
                </div>
                <div className={`text-lg font-bold ${lmResult?.status === 'available' ? 'text-green-400' : 'text-gray-500'}`}>
                  {lmResult?.models?.length || 0}
                </div>
                <div className={`text-xs ${t.textMuted}`}>models</div>
                {lmResult?.responseTime && (
                  <div className={`text-xs ${t.textMuted}`}>{lmResult.responseTime}ms</div>
                )}
              </div>
            </div>

            {['ollama', 'lmstudio', 'gemini', 'openai', 'groq', 'openrouter', 'huggingface'].map((provider) => {
              const providerModels = models.filter(m => m.provider === provider);
              if (!providerModels.length) return null;
              const isCollapsed = sidebarCollapsed[provider];
              const providerLabels: Record<string, string> = {
                ollama: '🦙 Ollama', lmstudio: '🧠 LM Studio', gemini: '✨ Google Gemini',
                openai: '🤖 OpenAI', groq: '⚡ Groq', openrouter: '🔀 OpenRouter', huggingface: '🤗 Hugging Face'
              };
              return (
                <div key={provider} className="mb-2">
                  <button
                    onClick={() => toggleSidebarCollapsed(provider)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider ${t.textMuted} hover:${t.text} transition-colors`}
                  >
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    {providerLabels[provider]}
                    <span className="ml-auto">{providerModels.filter(m => m.status === 'available').length}/{providerModels.length}</span>
                  </button>
                  {!isCollapsed && providerModels.map((m) => (
                    <div key={m.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 ${t.surfaceHover} cursor-pointer`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        m.status === 'available' ? 'bg-green-400' :
                        m.status === 'detecting' ? 'bg-yellow-400 animate-pulse' :
                        m.status === 'connecting' ? 'bg-blue-400 animate-pulse' :
                        m.status === 'error' ? 'bg-red-400' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium truncate ${t.text}`}>{m.name}</div>
                        {m.size && <div className={`text-xs ${t.textMuted}`}>{m.size} · {m.context ? `${Math.round(m.context / 1000)}K ctx` : ''}</div>}
                      </div>
                      {m.status === 'connect_required' && (
                        <button
                          onClick={() => connectModel(m.id)}
                          className={`text-xs px-2 py-0.5 rounded ${t.accent} text-white hover:opacity-80`}
                        >Connect</button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* CONNECTORS */}
        {sidebarSection === 'connectors' && (
          <div className="p-2">
            {['email', 'calendar', 'messaging', 'browser', 'filesystem', 'code', 'productivity'].map((cat) => {
              const catConnectors = connectors.filter(c => c.category === cat);
              if (!catConnectors.length) return null;
              const isCollapsed = sidebarCollapsed['conn_' + cat];
              const catLabels: Record<string, string> = {
                email: '📧 Email', calendar: '📅 Calendar', messaging: '💬 Messaging',
                browser: '🌐 Browser', filesystem: '📁 Filesystem', code: '💻 Code', productivity: '⚙️ Productivity'
              };
              return (
                <div key={cat} className="mb-2">
                  <button
                    onClick={() => toggleSidebarCollapsed('conn_' + cat)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider ${t.textMuted} hover:${t.text} transition-colors`}
                  >
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    {catLabels[cat]}
                    <span className="ml-auto">{catConnectors.filter(c => c.status === 'connected').length}/{catConnectors.length}</span>
                  </button>
                  {!isCollapsed && catConnectors.map((c) => (
                    <div key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 ${t.surfaceHover}`}>
                      <span className="text-base">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium truncate ${t.text}`}>{c.name}</div>
                        <div className={`text-xs ${t.textMuted} truncate`}>{c.status === 'connected' ? '✅ Connected' : c.status === 'connecting' ? '🔄 Connecting...' : '○ Not connected'}</div>
                      </div>
                      {c.status !== 'connected' && c.status !== 'connecting' && (
                        <button
                          onClick={() => connectConnector(c.id)}
                          className={`text-xs px-2 py-0.5 rounded ${t.accent} text-white hover:opacity-80 flex-shrink-0`}
                        >Connect</button>
                      )}
                      {c.status === 'connecting' && (
                        <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* PLUGINS */}
        {sidebarSection === 'plugins' && (
          <div className="p-2">
            <div className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-2`}>Installed Plugins</div>
            {plugins.map((p) => (
              <div key={p.id} className={`p-3 rounded-lg mb-2 ${t.surface} border ${t.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${t.text} truncate`}>{p.name}</div>
                    <div className={`text-xs ${t.textMuted}`}>v{p.version}</div>
                  </div>
                  <button
                    onClick={() => togglePlugin(p.id)}
                    className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${p.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform mx-0.5 ${p.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className={`text-xs ${t.textMuted} mb-1`}>{p.description}</div>
                <div className="flex flex-wrap gap-1">
                  {p.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className={`text-xs px-1.5 py-0.5 rounded ${t.badge} border`}>{cap}</span>
                  ))}
                </div>
              </div>
            ))}
            <button className={`w-full text-xs ${t.textMuted} border ${t.border} rounded-lg py-2 mt-2 hover:${t.accentText} transition-colors`}>
              + Browse Plugin Store
            </button>
          </div>
        )}

        {/* MONITORING */}
        {sidebarSection === 'monitoring' && (
          <div className="p-2">
            <div className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-2`}>Agent Status</div>
            {agentMonitors.map((agent) => (
              <div key={agent.id} className={`p-3 rounded-lg mb-2 ${t.surface} border ${t.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={agentColors[agent.type]}>{agentIcons[agent.type]}</span>
                  <span className={`text-xs font-semibold ${t.text}`}>{agent.name}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === 'running' ? 'bg-green-400 animate-pulse' :
                      agent.status === 'error' ? 'bg-red-400' :
                      agent.status === 'waiting' ? 'bg-yellow-400' : 'bg-gray-500'
                    }`} />
                    <span className={`text-xs ${t.textMuted}`}>{agent.status}</span>
                  </div>
                </div>
                {agent.currentTask && (
                  <div className={`text-xs ${t.textMuted} mb-1 truncate`}>📋 {agent.currentTask}</div>
                )}
                <div className="flex justify-between text-xs">
                  <span className={t.textMuted}>{agent.tasksCompleted} tasks</span>
                  <span className={t.textMuted}>{agent.memoryUsed}MB</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {sidebarSection === 'settings' && (
          <SettingsPanel t={t} />
        )}
      </div>
    </div>
  );
}

function SettingsPanel({ t }: { t: any }) {
  const { settings, updateSettings, theme, setTheme } = useAppStore();
  // themes is imported at top of file

  return (
    <div className="p-3">
      <div className={`text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-3`}>Theme</div>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {(['dark-blue', 'midnight', 'neon', 'solarized', 'high-contrast', 'minimal-light', 'minimal-dark', 'slate', 'emerald', 'crimson'] as const).map((th) => (
          <button
            key={th}
            onClick={() => setTheme(th)}
            className={`text-xs py-1.5 px-2 rounded-lg border transition-all ${
              theme === th ? `${t.accent} text-white border-transparent` : `${t.surface} ${t.border} ${t.textMuted}`
            }`}
          >
            {themes[th].label}
          </button>
        ))}
      </div>

      <div className={`text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-2`}>Local Model Endpoints</div>
      <div className="space-y-2 mb-4">
        <div>
          <label className={`text-xs ${t.textMuted}`}>Ollama</label>
          <input
            value={settings.ollamaEndpoint}
            onChange={e => updateSettings({ ollamaEndpoint: e.target.value })}
            className={`w-full text-xs px-2 py-1.5 rounded border ${t.input} ${t.text} mt-1`}
          />
        </div>
        <div>
          <label className={`text-xs ${t.textMuted}`}>LM Studio</label>
          <input
            value={settings.lmStudioEndpoint}
            onChange={e => updateSettings({ lmStudioEndpoint: e.target.value })}
            className={`w-full text-xs px-2 py-1.5 rounded border ${t.input} ${t.text} mt-1`}
          />
        </div>
      </div>

      <div className={`text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-2`}>Behaviour</div>
      <div className="space-y-2">
        {[
          { key: 'autoDetect', label: 'Auto-detect local models' },
          { key: 'streamResponses', label: 'Stream responses' },
          { key: 'autoSuggest', label: 'Smart suggestions' },
          { key: 'approvalRequired', label: 'Require approval for high-risk' },
          { key: 'sandboxEnabled', label: 'Sandbox tool generation' },
          { key: 'notifications', label: 'System notifications' },
          { key: 'soundEnabled', label: 'Sound effects' },
          { key: 'trayOnClose', label: 'Minimize to tray on close' },
          { key: 'alwaysOnTop', label: 'Always on top' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className={`text-xs ${t.text}`}>{label}</span>
            <button
              onClick={() => updateSettings({ [key]: !settings[key as keyof typeof settings] })}
              className={`w-8 h-4 rounded-full transition-colors ${settings[key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white mx-0.5 transition-transform ${settings[key as keyof typeof settings] ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </label>
        ))}
      </div>

      <div className={`text-xs font-semibold uppercase tracking-wider ${t.textMuted} mb-2 mt-4`}>Hotkeys</div>
      <div className={`text-xs ${t.textMuted} space-y-1`}>
        <div className="flex justify-between"><span>Global assistant</span><kbd className={`px-1.5 py-0.5 rounded ${t.surface} border ${t.border} ${t.text}`}>Ctrl+Shift+H</kbd></div>
        <div className="flex justify-between"><span>Screenshot</span><kbd className={`px-1.5 py-0.5 rounded ${t.surface} border ${t.border} ${t.text}`}>Ctrl+Shift+S</kbd></div>
        <div className="flex justify-between"><span>New chat</span><kbd className={`px-1.5 py-0.5 rounded ${t.surface} border ${t.border} ${t.text}`}>Ctrl+N</kbd></div>
      </div>
    </div>
  );
}
