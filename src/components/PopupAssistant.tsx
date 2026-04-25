import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import { X, Send, Brain, Minimize2, Camera, Clipboard, Globe, Code, Scale, Calculator, Zap } from 'lucide-react';

export default function PopupAssistant() {
  const { theme, showPopup, setShowPopup, sendMessage, contextCapture } = useAppStore();
  const t = themes[theme];
  const [localInput, setLocalInput] = useState('');
  const [mode, setMode] = useState<'mini' | 'expanded'>('mini');

  const quickActions = [
    { icon: <Camera size={13} />, label: 'Screenshot', action: () => setLocalInput('Analyze my current screen') },
    { icon: <Clipboard size={13} />, label: 'Clipboard', action: () => setLocalInput('Process my clipboard content') },
    { icon: <Globe size={13} />, label: 'Summarize Page', action: () => setLocalInput('Summarize the current web page') },
    { icon: <Code size={13} />, label: 'Fix Code', action: () => setLocalInput('Analyze and fix the code in my editor') },
    { icon: <Scale size={13} />, label: 'Legal Check', action: () => setLocalInput('Check this document for legal issues') },
    { icon: <Calculator size={13} />, label: 'Parse Invoice', action: () => setLocalInput('Extract invoice data from the current document') },
  ];

  const contextSuggestions = contextCapture?.suggestions || [
    'Summarize this content',
    'Create a task from this',
    'Draft a reply',
    'Explain this to me',
  ];

  const handleSend = () => {
    if (!localInput.trim()) return;
    sendMessage(localInput.trim());
    setLocalInput('');
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowPopup(false); }}
    >
      <div
        className={`${t.sidebar} border ${t.border} rounded-2xl shadow-2xl overflow-hidden transition-all`}
        style={{ width: mode === 'expanded' ? '600px' : '420px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${t.border}`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain size={14} className="text-white" />
          </div>
          <div>
            <div className={`text-sm font-bold ${t.text}`}>Hermes AI</div>
            {contextCapture && (
              <div className={`text-xs ${t.textMuted}`}>{contextCapture.activeApp} · {contextCapture.detectedDomain || 'general'}</div>
            )}
          </div>
          <div className="flex-1" />
          <button onClick={() => setMode(mode === 'mini' ? 'expanded' : 'mini')} className={`${t.textMuted} hover:${t.text} p-1`}>
            <Minimize2 size={14} />
          </button>
          <button onClick={() => setShowPopup(false)} className={`${t.textMuted} hover:text-red-400 p-1`}>
            <X size={14} />
          </button>
        </div>

        {/* Context strip */}
        {contextCapture && (
          <div className={`px-4 py-2 border-b ${t.border} ${t.surface}`}>
            <div className={`text-xs ${t.textMuted} flex items-center gap-1.5`}>
              <Globe size={10} />
              <span className="font-mono truncate">{contextCapture.windowTitle}</span>
            </div>
            {contextCapture.selection && (
              <div className={`text-xs ${t.text} mt-1 italic truncate`}>"{contextCapture.selection}"</div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className={`px-4 py-3 border-b ${t.border}`}>
          <div className={`text-xs font-semibold ${t.textMuted} mb-2`}>Quick Actions</div>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((a, i) => (
              <button key={i} onClick={a.action}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${t.border} ${t.surface} ${t.textMuted} hover:${t.accentText} hover:border-current transition-all`}>
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Context suggestions */}
        {contextSuggestions.length > 0 && (
          <div className={`px-4 py-2 border-b ${t.border}`}>
            <div className={`text-xs font-semibold ${t.textMuted} mb-1.5`}>
              <Zap size={10} className="inline mr-1" />
              Detected: {contextCapture?.detectedDomain || 'general'} context
            </div>
            <div className="flex flex-wrap gap-1">
              {contextSuggestions.map((s, i) => (
                <button key={i} onClick={() => setLocalInput(s)}
                  className={`text-xs px-2 py-1 rounded-full border ${t.badge} hover:opacity-80 transition-opacity`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className={`p-4`}>
          <div className={`flex items-center gap-2 border ${t.border} rounded-xl px-3 py-2 ${t.input}`}>
            <textarea
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask Hermes anything... (Enter to send)"
              rows={2}
              className={`flex-1 bg-transparent text-sm resize-none outline-none ${t.text} placeholder:${t.textMuted}`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <button
              onClick={handleSend}
              disabled={!localInput.trim()}
              className={`p-2 rounded-lg ${localInput.trim() ? `${t.accent} text-white` : `${t.surface} ${t.textMuted}`} transition-all`}
            >
              <Send size={14} />
            </button>
          </div>
          <div className={`flex items-center justify-between mt-2 text-xs ${t.textMuted}`}>
            <span>Ctrl+Shift+H to toggle · Right-click anywhere</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
