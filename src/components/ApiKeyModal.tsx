import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import { testConnection, saveApiKey, PROVIDER_CONFIGS } from '../lib/remoteModels';
import { X, Key, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  provider: string;
  modelId: string;
  onClose: () => void;
  onConnected: (apiKey: string) => void;
}

export default function ApiKeyModal({ provider, onClose, onConnected }: ApiKeyModalProps) {
  const { theme } = useAppStore();
  const t = themes[theme];
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const providerLabels: Record<string, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI',
    openrouter: 'OpenRouter',
    groq: 'Groq',
    huggingface: 'Hugging Face',
  };

  const providerHelp: Record<string, string> = {
    gemini: 'Get your API key from aistudio.google.com → API Keys',
    openai: 'Get your API key from platform.openai.com → API Keys',
    openrouter: 'Get your API key from openrouter.ai → Keys',
    groq: 'Get your API key from console.groq.com → API Keys',
    huggingface: 'Get your token from huggingface.co → Settings → Access Tokens',
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setTesting(true);
    setError('');
    setSuccess(false);

    const result = await testConnection(provider, apiKey.trim());

    if (result.success) {
      setSuccess(true);
      // Save key and notify parent
      await saveApiKey(provider, apiKey.trim());
      setTimeout(() => {
        onConnected(apiKey.trim());
      }, 800);
    } else {
      setError(result.error || 'Connection failed');
    }

    setTesting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`${t.sidebar} border ${t.border} rounded-2xl shadow-2xl w-[440px] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${t.border}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Key size={16} className="text-white" />
          </div>
          <div>
            <div className={`text-sm font-bold ${t.text}`}>Connect {providerLabels[provider] || provider}</div>
            <div className={`text-xs ${t.textMuted}`}>Enter your API key to connect</div>
          </div>
          <div className="flex-1" />
          <button onClick={onClose} className={`${t.textMuted} hover:${t.text} p-1 rounded`}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* API Key Input */}
          <div>
            <label className={`text-xs font-medium ${t.textMuted} block mb-1.5`}>API Key</label>
            <div className={`flex items-center border ${t.border} rounded-lg ${t.surface} overflow-hidden`}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTest(); }}
                placeholder={provider === 'gemini' ? 'AIza...' : 'sk-...'}
                className={`flex-1 px-3 py-2.5 bg-transparent outline-none text-sm font-mono ${t.text} placeholder:${t.textMuted}`}
                autoFocus
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className={`px-2 ${t.textMuted} hover:${t.text}`}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Help text */}
          <div className={`text-xs ${t.textMuted} flex items-start gap-1.5`}>
            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
            <span>{providerHelp[provider] || 'Enter your API key for this provider'}</span>
          </div>

          {/* Available models */}
          {PROVIDER_CONFIGS[provider] && (
            <div>
              <div className={`text-xs font-medium ${t.textMuted} mb-1.5`}>Available Models</div>
              <div className="flex flex-wrap gap-1">
                {PROVIDER_CONFIGS[provider].models.map(m => (
                  <span key={m} className={`text-xs px-2 py-0.5 rounded-full ${t.surface} border ${t.border} ${t.textMuted} font-mono`}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              <CheckCircle size={13} />
              <span>Connected successfully! Redirecting...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex gap-2 px-5 py-4 border-t ${t.border}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 px-4 rounded-lg border ${t.border} font-medium text-sm ${t.text} ${t.surfaceHover} transition-all`}
          >
            Cancel
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !apiKey.trim() || success}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {testing ? (
              <><Loader2 size={14} className="animate-spin" /> Testing...</>
            ) : success ? (
              <><CheckCircle size={14} /> Connected</>
            ) : (
              'Connect & Test'
            )}
          </button>
        </div>

        {/* Security note */}
        <div className={`px-5 py-3 border-t ${t.border} ${t.surface}`}>
          <p className={`text-xs ${t.textMuted} text-center`}>
            🔒 Keys are stored locally on your machine only. Never sent to Hermes servers.
          </p>
        </div>
      </div>
    </div>
  );
}
