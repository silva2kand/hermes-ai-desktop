import { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { themes } from './lib/themes';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import WorkspacePanel from './components/WorkspacePanel';
import TerminalPanel from './components/TerminalPanel';
import MonitoringPanel from './components/MonitoringPanel';
import PopupAssistant from './components/PopupAssistant';
import { startContextMonitor } from './lib/contextEngine';
import {
  Terminal, Activity, Layout, MessageSquare, Brain,
  ChevronRight, ChevronLeft, Zap,
} from 'lucide-react';

export default function App() {
  const {
    theme, sidebarOpen, setSidebarOpen, activePanel, setActivePanel,
    rightPanelOpen, workspaceType,
    showPopup, setShowPopup, setContextCapture,
    detectLocalModels, settings, chats, activeChatId,
    agentMonitors, activeAgent, setActiveAgent, createChat,
    addMemoryEntry, hydrateDatabase,
  } = useAppStore();

  const t = themes[theme];
  const [fullscreen, setFullscreen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Boot sequence
  useEffect(() => {
    hydrateDatabase();
    
    if (settings.autoDetect) {
      detectLocalModels();
    }

    // Start real context detection
    const stopContextMonitor = startContextMonitor((ctx) => {
      setContextCapture(ctx);
    }, 5000);

    // Cleanup monitor on unmount
    return () => {
      stopContextMonitor();
    };

    // Save session fact
    addMemoryEntry({ key: 'session_start', value: new Date().toISOString(), source: 'system', tags: ['session'], pinned: false });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setShowPopup(!showPopup);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createChat(activeAgent);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setActivePanel(activePanel === 'terminal' ? 'chat' : 'terminal');
      }
      if (e.key === 'Escape') {
        setShowPopup(false);
        setShowContextMenu(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showPopup, activePanel, activeAgent]);

  // Right-click context menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    };
    const clickHandler = () => setShowContextMenu(false);
    window.addEventListener('contextmenu', handler);
    window.addEventListener('click', clickHandler);
    return () => {
      window.removeEventListener('contextmenu', handler);
      window.removeEventListener('click', clickHandler);
    };
  }, []);

  const runningAgents = agentMonitors.filter(a => a.status === 'running');

  const agentColorMap: Record<string, string> = {
    general: 'text-blue-400', coding: 'text-green-400', legal: 'text-purple-400',
    accounting: 'text-yellow-400', business: 'text-orange-400', web: 'text-cyan-400', generative: 'text-pink-400',
  };

  const panelButtons = [
    { id: 'chat', icon: <MessageSquare size={15} />, label: 'Chat' },
    { id: 'terminal', icon: <Terminal size={15} />, label: 'Terminal' },
    { id: 'monitoring', icon: <Activity size={15} />, label: 'Monitor' },
    { id: 'workspace', icon: <Layout size={15} />, label: 'Workspace' },
  ] as const;

  return (
    <div className={`h-screen flex flex-col ${t.bg} overflow-hidden`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Title Bar */}
      <div className={`flex items-center gap-3 px-4 py-2 border-b ${t.border} ${t.sidebar} flex-shrink-0 select-none`}>
        {/* Traffic lights simulation */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer transition-colors" />
          <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer transition-colors"
            onClick={() => setFullscreen(!fullscreen)} />
        </div>

        <div className="flex items-center gap-2 ml-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain size={11} className="text-white" />
          </div>
          <span className={`text-sm font-bold ${t.text}`}>Hermes AI Desktop</span>
          <span className={`text-xs ${t.textMuted} border ${t.border} rounded px-1.5 py-0.5`}>v3.0</span>
        </div>

        {/* Panel switcher */}
        <div className={`flex items-center gap-0.5 mx-4 ${t.surface} rounded-lg p-0.5 border ${t.border}`}>
          {panelButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setActivePanel(btn.id as any)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activePanel === btn.id
                  ? `${t.accent} text-white`
                  : `${t.textMuted} hover:${t.text}`
              }`}
            >
              {btn.icon}
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Running agent indicator */}
        {runningAgents.length > 0 && (
          <div className={`flex items-center gap-1.5 text-xs border ${t.border} rounded-lg px-2 py-1 ${t.surface}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className={t.text}>{runningAgents.length} agent{runningAgents.length > 1 ? 's' : ''} running</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Quick agent selector */}
        <div className="flex gap-1 items-center">
          {(['general', 'coding', 'legal', 'accounting'] as const).map(a => (
            <button key={a} onClick={() => setActiveAgent(a)}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all ${
                activeAgent === a ? `${t.surface} ${t.border} ${agentColorMap[a]}` : `${t.textMuted} border-transparent hover:${t.surface}`
              }`}
              title={a}>
              {a === 'general' ? '🧠' : a === 'coding' ? '💻' : a === 'legal' ? '⚖️' : '💰'}
            </button>
          ))}
        </div>

        {/* Popup button */}
        <button
          onClick={() => setShowPopup(!showPopup)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${t.border} ${t.surface} ${t.textMuted} hover:${t.accentText} transition-colors`}
          title="Toggle popup (Ctrl+Shift+H)"
        >
          <Zap size={12} />
          <span>Assistant</span>
        </button>

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`${t.textMuted} hover:${t.text} transition-colors`}>
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 overflow-hidden">
            <Sidebar />
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Primary panel */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activePanel === 'chat' && <ChatPanel />}
            {activePanel === 'terminal' && <TerminalPanel />}
            {activePanel === 'monitoring' && <MonitoringPanel />}
            {activePanel === 'workspace' && (
              <WorkspacePanel />
            )}
          </div>

          {/* Right panel (workspace when in chat mode) */}
          {activePanel === 'chat' && rightPanelOpen && workspaceType !== 'none' && (
            <div className="flex-shrink-0 w-80 overflow-hidden">
              <WorkspacePanel />
            </div>
          )}
        </div>
      </div>

      {/* Popup */}
      <PopupAssistant />

      {/* Right-click context menu */}
      {showContextMenu && contextMenuPos && (
        <div
          className={`fixed z-50 ${t.sidebar} ${t.border} border rounded-xl shadow-2xl py-1 w-56`}
          style={{ left: contextMenuPos.x, top: contextMenuPos.y, maxHeight: '80vh', overflow: 'auto' }}
        >
          <div className={`px-3 py-1.5 text-xs font-bold ${t.textMuted} border-b ${t.border} mb-1`}>
            <Brain size={10} className="inline mr-1" />
            Hermes AI
          </div>
          {[
            { icon: '🧠', label: 'Ask Hermes about this', action: () => { setShowPopup(true); } },
            { icon: '📋', label: 'Summarize selection', action: () => { setShowPopup(true); } },
            { icon: '⚖️', label: 'Legal check', action: () => { setActiveAgent('legal'); setShowPopup(true); } },
            { icon: '💻', label: 'Code analysis', action: () => { setActiveAgent('coding'); setShowPopup(true); } },
            { icon: '🌐', label: 'Web research', action: () => { setActiveAgent('web'); setShowPopup(true); } },
            { icon: '💰', label: 'Financial extract', action: () => { setActiveAgent('accounting'); setShowPopup(true); } },
            { icon: '📸', label: 'Screenshot & analyze', action: () => { setShowPopup(true); } },
            { icon: '📌', label: 'Save to memory', action: () => { addMemoryEntry({ key: 'context_save', value: 'Saved from context menu', source: 'user', tags: ['manual'], pinned: false }); } },
          ].map((item, i) => (
            <button key={i} onClick={() => { item.action(); setShowContextMenu(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs ${t.text} ${t.surfaceHover} transition-colors text-left`}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className={`border-t ${t.border} mt-1 pt-1`}>
            <button onClick={() => { setActivePanel('terminal'); setShowContextMenu(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs ${t.textMuted} ${t.surfaceHover} transition-colors`}>
              <Terminal size={11} />
              Open Terminal
            </button>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className={`flex items-center gap-4 px-4 py-1 border-t ${t.border} ${t.sidebar} flex-shrink-0`}>
        <div className={`flex items-center gap-1.5 text-xs ${t.textMuted}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span>Hermes Runtime Active</span>
        </div>
        <div className={`text-xs ${t.textMuted}`}>
          Agent: <span className={`${agentColorMap[activeAgent]} font-medium`}>{activeAgent}</span>
        </div>
        <div className={`text-xs ${t.textMuted}`}>
          Chat: {chats.find(c => c.id === activeChatId)?.title?.slice(0, 30) || 'None'}
        </div>
        <div className="flex-1" />
        <div className={`text-xs ${t.textMuted}`}>
          ⌨️ Ctrl+Shift+H — Popup · Ctrl+N — New Chat · Ctrl+` — Terminal
        </div>
        <div className={`text-xs ${t.textMuted}`}>
          Theme: {themes[theme].label}
        </div>
      </div>
    </div>
  );
}


