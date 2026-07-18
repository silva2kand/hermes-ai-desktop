import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import {
  Send, Mic, Paperclip, Copy, Volume2, Edit3, ChevronRight, RefreshCw,
  CheckCheck, Loader2, Brain, Globe, Code, Wrench, ChevronDown,
  Zap, Square, Image as ImageIcon,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface CodeBlockProps {
  children: string;
  language?: string;
  t: any;
}

function CodeBlock({ children, language, t }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={`relative rounded-lg overflow-hidden my-3 border ${t.border}`}>
      <div className={`flex items-center justify-between px-4 py-2 ${t.surface} border-b ${t.border}`}>
        <span className={`text-xs font-mono ${t.textMuted}`}>{language || 'code'}</span>
        <button onClick={copy} className={`text-xs flex items-center gap-1 ${t.textMuted} hover:${t.text} transition-colors`}>
          {copied ? <CheckCheck size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className={`${t.terminal} p-4 overflow-x-auto text-xs font-mono leading-relaxed`}>
        <code className={`${t.text}`}>{children}</code>
      </pre>
    </div>
  );
}

function ThinkingBar({ phases, t }: { phases: any[]; t: any }) {
  const icons: Record<string, React.ReactNode> = {
    'Interpreting request': <Brain size={12} />,
    'Planning approach': <Zap size={12} />,
    'Executing tools': <Wrench size={12} />,
    'Searching web': <Globe size={12} />,
    'Synthesizing response': <Code size={12} />,
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${t.surface} border ${t.border} rounded-xl mb-3 animate-pulse`}>
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${t.accent} opacity-70`}
              style={{ animation: `bounce 1s ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto">
        {phases.map((phase, i) => (
          <div key={i} className={`flex items-center gap-1.5 text-xs whitespace-nowrap ${
            phase.status === 'done' ? 'text-green-400' :
            phase.status === 'active' ? t.accentText :
            t.textMuted
          }`}>
            <span>{icons[phase.phase] || <Brain size={12} />}</span>
            {phase.phase}
            {phase.status === 'done' && <CheckCheck size={10} className="text-green-400" />}
            {phase.status === 'active' && <Loader2 size={10} className="animate-spin" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const {
    theme, chats, activeChatId, inputValue, setInputValue,
    sendMessage, isStreaming, showThinkingBar, thinkingPhases,
    activeAgent, setActiveAgent, selectedModels, setSelectedModels,
    models, multiModelView, setMultiModelView,
  } = useAppStore();

  const t = themes[theme];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, showThinkingBar]);

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;
    sendMessage(inputValue.trim());
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const availableModels = models.filter(m => m.status === 'available');

  const agentColors: Record<string, string> = {
    general: 'text-blue-400', coding: 'text-green-400', legal: 'text-purple-400',
    accounting: 'text-yellow-400', business: 'text-orange-400', web: 'text-cyan-400', generative: 'text-pink-400',
  };

  const agentLabels: Record<string, string> = {
    general: '🧠 General', coding: '💻 Coding', legal: '⚖️ Legal',
    accounting: '💰 Accounting', business: '⚙️ Business', web: '🌐 Web', generative: '🔧 Generative',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${t.border} ${t.sidebar} flex-shrink-0`}>
        {/* Agent Selector */}
        <div className="flex gap-1 flex-wrap">
          {(['general', 'coding', 'legal', 'accounting', 'web'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setActiveAgent(a)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                activeAgent === a
                  ? `${t.accent} text-white border-transparent`
                  : `${t.surface} ${t.border} ${t.textMuted} hover:${t.text}`
              }`}
            >
              {agentLabels[a]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${t.surface} ${t.border} ${t.text} hover:${t.accentText} transition-colors`}
          >
            <Brain size={12} />
            {selectedModels.length > 0 ? (
              <span>{availableModels.find(m => m.id === selectedModels[0])?.name || selectedModels[0]}</span>
            ) : <span>Select Model</span>}
            {selectedModels.length > 1 && <span className="text-blue-400">+{selectedModels.length - 1}</span>}
            <ChevronDown size={10} />
          </button>
          {showModelPicker && (
            <div className={`absolute right-0 top-full mt-1 w-64 ${t.surface} ${t.border} border rounded-xl shadow-xl z-50 p-2`}>
              <div className={`text-xs font-semibold ${t.textMuted} px-2 py-1 mb-1`}>Select up to 3 models</div>
              <div className="flex gap-1 mb-2 px-2">
                {(['merged', 'split'] as const).map(v => (
                  <button key={v} onClick={() => setMultiModelView(v)}
                    className={`text-xs px-2 py-0.5 rounded ${multiModelView === v ? t.accent + ' text-white' : t.surface + ' ' + t.textMuted} border ${t.border}`}>
                    {v === 'merged' ? 'Merged' : 'Split View'}
                  </button>
                ))}
              </div>
              {availableModels.map(m => (
                <label key={m.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer ${t.surfaceHover}`}>
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(m.id)}
                    onChange={e => {
                      if (e.target.checked && selectedModels.length < 3) setSelectedModels([...selectedModels, m.id]);
                      else setSelectedModels(selectedModels.filter(id => id !== m.id));
                    }}
                    className="rounded"
                  />
                  <div>
                    <div className={`text-xs font-medium ${t.text}`}>{m.name}</div>
                    <div className={`text-xs ${t.textMuted}`}>{m.provider} · {m.size || 'remote'}</div>
                  </div>
                </label>
              ))}
              {availableModels.length === 0 && (
                <div className={`text-xs ${t.textMuted} px-2 py-2`}>No local models detected. Connect remote models or run Ollama.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" onClick={() => setShowModelPicker(false)}>
        {activeChat?.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} t={t} agentColors={agentColors} agentLabels={agentLabels} />
        ))}

        {showThinkingBar && thinkingPhases.length > 0 && (
          <ThinkingBar phases={thinkingPhases} t={t} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`flex-shrink-0 px-4 pb-4 pt-2 border-t ${t.border}`}>
        <div className={`flex flex-col rounded-xl border ${t.border} ${t.input} overflow-hidden`}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder={`Ask ${agentLabels[activeAgent] || 'Hermes'}... (Shift+Enter for newline)`}
            rows={1}
            className={`w-full px-4 py-3 text-sm resize-none bg-transparent outline-none ${t.text} placeholder:${t.textMuted}`}
            style={{ fontFamily: 'Inter, sans-serif', maxHeight: '160px' }}
          />
          <div className={`flex items-center gap-2 px-3 py-2 border-t ${t.border}`}>
            <button className={`${t.textMuted} hover:${t.text} transition-colors p-1 rounded`}><Paperclip size={16} /></button>
            <button className={`${t.textMuted} hover:${t.text} transition-colors p-1 rounded`}><ImageIcon size={16} /></button>
            <button className={`${t.textMuted} hover:${t.text} transition-colors p-1 rounded`}><Mic size={16} /></button>
            <div className="flex-1" />
            <span className={`text-xs ${t.textMuted}`}>{inputValue.length > 0 ? `${inputValue.length} chars` : 'Enter to send'}</span>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                inputValue.trim() && !isStreaming
                  ? `${t.accent} text-white hover:opacity-90`
                  : `${t.surface} ${t.textMuted} cursor-not-allowed`
              }`}
            >
              {isStreaming ? <Square size={14} /> : <Send size={14} />}
              {isStreaming ? 'Stop' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, t, agentColors, agentLabels }: any) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { setWorkspace, activeChatId, sendMessage, regenerateMessage, continueMessage, editAndResend, speakMessage } = useAppStore();

  const isUser = message.role === 'user';

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (isUser) {
      setIsEditing(true);
      setEditContent(message.content);
    }
  };

  const handleEditSubmit = () => {
    if (activeChatId && editContent.trim()) {
      editAndResend(activeChatId, message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const assistantActions = [
    { icon: copied ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} />, label: copied ? 'Copied' : 'Copy', action: copy },
    { icon: <Volume2 size={13} />, label: 'Speak', action: () => speakMessage(message.content) },
    { icon: <ChevronRight size={13} />, label: 'Continue', action: () => activeChatId && continueMessage(activeChatId) },
    { icon: <RefreshCw size={13} />, label: 'Regenerate', action: () => activeChatId && regenerateMessage(activeChatId, message.id) },
  ];

  const userActions = [
    { icon: copied ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} />, label: copied ? 'Copied' : 'Copy', action: copy },
    { icon: <Edit3 size={13} />, label: 'Edit', action: handleEdit },
  ];

  const actions = isUser ? userActions : assistantActions;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isUser && message.agent && (
          <div className={`flex items-center gap-1.5 text-xs ${agentColors[message.agent] || 'text-gray-400'} mb-1`}>
            <Brain size={11} />
            <span className="font-medium">{agentLabels[message.agent] || message.agent}</span>
            {message.model && (
              <>
                <span className={t.textMuted}>·</span>
                <span className={`${t.textMuted} font-mono`}>{message.model}</span>
              </>
            )}
            <span className={t.textMuted}>·</span>
            <span className={t.textMuted}>{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>
        )}

        {/* Inline edit mode for user messages */}
        {isEditing ? (
          <div className={`rounded-2xl px-4 py-3 text-sm border ${t.userMsg} w-full`}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`w-full bg-transparent outline-none resize-none ${t.text} text-sm`}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button
                onClick={handleEditCancel}
                className={`text-xs px-2.5 py-1 rounded-lg border ${t.border} ${t.textMuted} hover:${t.text}`}
              >Cancel</button>
              <button
                onClick={handleEditSubmit}
                className={`text-xs px-2.5 py-1 rounded-lg ${t.accent} text-white hover:opacity-90`}
              >Resend</button>
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl px-4 py-3 text-sm border ${
            isUser
              ? `${t.userMsg} ${message.role === 'user' ? 'ml-8' : ''}`
              : `${t.assistantMsg} mr-8`
          } ${isUser && theme_light_check(t) ? 'text-white' : t.text}`}
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.65' }}>

            {message.isStreaming && message.content === '' ? (
              <div className="flex gap-1 py-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${t.accentText.replace('text-', 'bg-')}`}
                    style={{ animation: `bounce 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            ) : (
              <MarkdownContent content={message.content} t={t} />
            )}

            {message.isStreaming && message.content.length > 0 && (
              <span className={`inline-block w-0.5 h-4 ml-0.5 ${t.accentText.replace('text-', 'bg-')} animate-pulse align-middle`} />
            )}
          </div>
        )}

        {/* Workspace trigger */}
        {message.workspaceData && !message.isStreaming && (
          <button
            onClick={() => setWorkspace(message.workspaceData.type, message.workspaceData.content)}
            className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${t.badge} hover:opacity-80 transition-opacity mt-1`}
          >
            <Code size={11} />
            Open in Workspace ({message.workspaceData.type})
          </button>
        )}

        {/* Suggestions — now clickable */}
        {!isUser && !message.isStreaming && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.suggestions.map((s: string, i: number) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(s)}
                className={`text-xs px-2.5 py-1 rounded-full border ${t.surface} ${t.border} ${t.textMuted} hover:${t.accentText} hover:border-current transition-all`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Actions — now works for both user and assistant */}
        {!message.isStreaming && (
          <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            {actions.map((a, i) => (
              <button key={i} onClick={a.action} title={a.label}
                className={`p-1.5 rounded-lg ${t.textMuted} hover:${t.text} hover:${t.surface} transition-all`}>
                {a.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function theme_light_check(t: any) {
  return t.userMsg.includes('bg-') && !t.userMsg.includes('bg-[#');
}

function MarkdownContent({ content, t }: { content: string; t: any }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }: any) {
            const isInline = !className;
            if (isInline) {
              return (
                <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${t.surface} ${t.text} border ${t.border}`} {...props}>
                  {children}
                </code>
              );
            }
            const lang = className?.replace('language-', '') || '';
            return <CodeBlock language={lang} t={t}>{String(children).replace(/\n$/, '')}</CodeBlock>;
          },
          h1: ({ children }) => <h1 className={`text-lg font-bold mb-2 ${t.text}`}>{children}</h1>,
          h2: ({ children }) => <h2 className={`text-base font-semibold mb-2 mt-3 ${t.text}`}>{children}</h2>,
          h3: ({ children }) => <h3 className={`text-sm font-semibold mb-1.5 mt-2 ${t.text}`}>{children}</h3>,
          p: ({ children }) => <p className={`mb-2 leading-relaxed ${t.text}`}>{children}</p>,
          ul: ({ children }) => <ul className={`list-disc list-inside mb-2 space-y-0.5 ${t.text}`}>{children}</ul>,
          ol: ({ children }) => <ol className={`list-decimal list-inside mb-2 space-y-0.5 ${t.text}`}>{children}</ol>,
          li: ({ children }) => <li className={`text-sm ${t.text}`}>{children}</li>,
          strong: ({ children }) => <strong className={`font-semibold ${t.text}`}>{children}</strong>,
          em: ({ children }) => <em className={`italic ${t.textMuted}`}>{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 pl-3 py-1 my-2 ${t.accentText} border-current ${t.textMuted} italic text-sm`}>{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className={`text-xs border-collapse border ${t.border} w-full`}>{children}</table>
            </div>
          ),
          th: ({ children }) => <th className={`px-3 py-2 border ${t.border} ${t.surface} font-semibold ${t.text} text-left`}>{children}</th>,
          td: ({ children }) => <td className={`px-3 py-2 border ${t.border} ${t.text}`}>{children}</td>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className={`${t.accentText} underline hover:opacity-80`}>{children}</a>,
          hr: () => <hr className={`border-t ${t.border} my-3`} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
