import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import { Trash2, Copy, ChevronRight, AlertCircle, Info, Terminal } from 'lucide-react';

export default function TerminalPanel() {
  const { theme, terminalLines, terminalInput, setTerminalInput, runTerminalCommand, clearTerminal } = useAppStore();
  const t = themes[theme];
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    runTerminalCommand(terminalInput.trim());
  };

  const lineColors: Record<string, string> = {
    input: t.accentText,
    output: t.text,
    error: 'text-red-400',
    info: t.textMuted,
  };

  const lineIcons: Record<string, React.ReactNode> = {
    input: <ChevronRight size={12} className="flex-shrink-0 mt-0.5" />,
    output: null,
    error: <AlertCircle size={12} className="flex-shrink-0 mt-0.5 text-red-400" />,
    info: <Info size={12} className="flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className={`flex flex-col h-full ${t.terminal} font-mono`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-2 border-b ${t.border} ${t.sidebar}`}>
        <Terminal size={14} className={t.accentText} />
        <span className={`text-xs font-semibold ${t.text}`}>Terminal</span>
        <div className="flex-1" />
        <button onClick={clearTerminal} className={`${t.textMuted} hover:text-red-400 transition-colors`} title="Clear terminal">
          <Trash2 size={13} />
        </button>
        <button onClick={() => navigator.clipboard.writeText(terminalLines.map(l => l.content).join('\n'))}
          className={`${t.textMuted} hover:${t.text} transition-colors`} title="Copy all">
          <Copy size={13} />
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5" onClick={() => inputRef.current?.focus()}>
        {terminalLines.map((line) => (
          <div key={line.id} className={`flex items-start gap-2 text-xs leading-relaxed ${lineColors[line.type]}`}>
            {lineIcons[line.type]}
            <span className="whitespace-pre-wrap break-all">{line.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`flex items-center gap-2 px-4 py-2 border-t ${t.border}`}>
        <span className={`${t.accentText} text-xs`}>$</span>
        <input
          ref={inputRef}
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          className={`flex-1 bg-transparent text-xs outline-none ${t.text} placeholder:${t.textMuted}`}
          placeholder="Enter command..."
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
      </form>

      {/* Quick commands */}
      <div className={`flex flex-wrap gap-1 px-4 py-2 border-t ${t.border}`}>
        {['ls', 'pwd', 'python --version', 'git status', 'npm test', 'clear'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => runTerminalCommand(cmd)}
            className={`text-xs px-2 py-0.5 rounded border ${t.border} ${t.textMuted} ${t.surfaceHover} hover:${t.text} transition-colors`}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
