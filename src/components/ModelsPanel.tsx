import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { detectOllama, detectLMStudio, DetectionResult } from '../lib/localModels';
import { themes } from '../lib/themes';
import { Cpu, Circle, CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, Zap, Wifi, WifiOff } from 'lucide-react';



export default function ModelsPanel() {
  const {
    theme, settings, models, updateModelStatus, updateSettings,
    selectedModels, setSelectedModels,
  } = useAppStore();

  const t = themes[theme];
  const [ollamaResult, setOllamaResult] = useState<DetectionResult | null>(null);
  const [lmResult, setLmResult] = useState<DetectionResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const scan = useCallback(async () => {
    setScanning(true);
    try {
      const [o, l] = await Promise.all([
        detectOllama(settings.ollamaEndpoint),
        detectLMStudio(settings.lmStudioEndpoint),
      ]);
      setOllamaResult(o);
      setLmResult(l);

      const allResults = [o, l];
      for (const r of allResults) {
        if (r.status === 'available') {
          const mList = r.models;
          if (r.provider === 'ollama') {
            mList.forEach((m: any) => {
              updateModelStatus(m.name, 'available', { context: 128000 });
            });
          } else {
            mList.forEach((m: any) => {
              updateModelStatus(`lm:${m.id}`, 'available', { context: 32000 });
            });
          }
        }
      }
    } finally {
      setScanning(false);
    }
  }, [settings.ollamaEndpoint, settings.lmStudioEndpoint]);

  useEffect(() => {
    if (settings.autoDetect) scan();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={14} className="text-green-400" />;
      case 'connecting': return <RefreshCw size={14} className="text-yellow-400 animate-spin" />;
      case 'error': return <XCircle size={14} className="text-red-400" />;
      case 'connect_required': return <AlertCircle size={14} className="text-yellow-500" />;
      case 'detecting': return <Circle size={14} className="text-gray-500" />;
      default: return <Circle size={14} className="text-gray-600" />;
    }
  };

  const localModels = models.filter(m => m.provider === 'ollama' || m.provider === 'lmstudio');
  const ollamaModels = localModels.filter(m => m.provider === 'ollama');
  const lmModels = localModels.filter(m => m.provider === 'lmstudio');

  const toggleModel = (id: string) => {
    if (selectedModels.includes(id)) {
      setSelectedModels(selectedModels.filter(m => m !== id));
    } else {
      setSelectedModels([...selectedModels, id]);
    }
  };

  return (
    <div className={`flex flex-col h-full ${t.surface}`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${t.border}`}>
        <div className="flex items-center gap-2">
          <Cpu size={15} className={t.accentText} />
          <span className={`text-sm font-semibold ${t.text}`}>Local Models</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded ${t.surfaceHover} ${t.textMuted} transition-colors`}
            title="Settings">
            <Settings size={13} />
          </button>
          <button
            onClick={scan}
            disabled={scanning}
            className={`p-1.5 rounded ${t.surfaceHover} ${t.textMuted} transition-colors ${scanning ? 'animate-spin' : ''}`}
            title="Rescan models">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {showSettings && (
          <div className={`rounded-xl border ${t.border} p-4 space-y-3`}>
            <h3 className={`text-xs font-bold ${t.textMuted} uppercase tracking-wider`}>Endpoint Configuration</h3>
            <div className="space-y-2">
              <div>
                <label className={`text-xs ${t.textMuted}`}>Ollama Endpoint</label>
                <input
                  type="text"
                  value={settings.ollamaEndpoint}
                  onChange={(e) => updateSettings({ ollamaEndpoint: e.target.value })}
                  className={`w-full mt-1 px-3 py-1.5 rounded-lg border ${t.border} ${t.surface} ${t.text} text-sm`}
                  placeholder="http://localhost:11434"
                />
              </div>
              <div>
                <label className={`text-xs ${t.textMuted}`}>LM Studio Endpoint</label>
                <input
                  type="text"
                  value={settings.lmStudioEndpoint}
                  onChange={(e) => updateSettings({ lmStudioEndpoint: e.target.value })}
                  className={`w-full mt-1 px-3 py-1.5 rounded-lg border ${t.border} ${t.surface} ${t.text} text-sm`}
                  placeholder="http://localhost:1234"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoDetect}
                  onChange={(e) => updateSettings({ autoDetect: e.target.checked })}
                  className="accent-blue-500"
                />
                <span className={`text-xs ${t.textMuted}`}>Auto-detect on startup</span>
              </label>
            </div>
          </div>
        )}

        <div className={`rounded-xl border ${t.border} p-4 space-y-3`}>
          <h3 className={`text-xs font-bold ${t.textMuted} uppercase tracking-wider`}>Ollama</h3>
          <div className="space-y-1">
            {ollamaResult?.status === 'available' ? (
              <div className={`flex items-center gap-2 text-xs ${t.textMuted}`}>
                <Wifi size={12} className="text-green-400" />
                <span>Connected — {ollamaResult.responseTime}ms</span>
                <span className="flex-1" />
                <span>{ollamaResult.models.length} model(s)</span>
              </div>
            ) : (
              <div className={`flex items-center gap-2 text-xs ${t.textMuted}`}>
                <WifiOff size={12} className="text-red-400" />
                <span>{ollamaResult?.error || 'Not running'}</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            {ollamaModels.length === 0 ? (
              <div className={`text-xs ${t.textMuted} py-2`}>
                {scanning ? 'Scanning...' : 'No models detected. Click Rescan.'}
              </div>
            ) : (
              ollamaModels.map(m => (
                <div key={m.id} className={`flex items-center gap-2 py-1.5 ${t.surfaceHover} rounded-lg px-2`}>
                  {getStatusIcon(m.status)}
                  <span className={`text-xs ${t.text} flex-1 truncate`}>{m.name}</span>
                  {m.size && <span className={`text-xs ${t.textMuted}`}>{m.size}</span>}
                  <button onClick={() => toggleModel(m.id)} className="flex-shrink-0">
                    {selectedModels.includes(m.id) ? (
                      <CheckCircle size={13} className="text-blue-400" />
                    ) : (
                      <Circle size={13} className={t.textMuted} />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`rounded-xl border ${t.border} p-4 space-y-3`}>
          <h3 className={`text-xs font-bold ${t.textMuted} uppercase tracking-wider`}>LM Studio</h3>
          <div className="space-y-1">
            {lmResult?.status === 'available' ? (
              <div className={`flex items-center gap-2 text-xs ${t.textMuted}`}>
                <Wifi size={12} className="text-green-400" />
                <span>Connected — {lmResult.responseTime}ms</span>
                <span className="flex-1" />
                <span>{lmResult.models.length} model(s)</span>
              </div>
            ) : (
              <div className={`flex items-center gap-2 text-xs ${t.textMuted}`}>
                <WifiOff size={12} className="text-red-400" />
                <span>{lmResult?.error || 'Not running'}</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            {lmModels.length === 0 ? (
              <div className={`text-xs ${t.textMuted} py-2`}>
                {scanning ? 'Scanning...' : 'No models detected. Click Rescan.'}
              </div>
            ) : (
              lmModels.map(m => (
                <div key={m.id} className={`flex items-center gap-2 py-1.5 ${t.surfaceHover} rounded-lg px-2`}>
                  {getStatusIcon(m.status)}
                  <span className={`text-xs ${t.text} flex-1 truncate`}>{m.name}</span>
                  {m.size && <span className={`text-xs ${t.textMuted}`}>{m.size}</span>}
                  <button onClick={() => toggleModel(m.id)} className="flex-shrink-0">
                    {selectedModels.includes(m.id) ? (
                      <CheckCircle size={13} className="text-blue-400" />
                    ) : (
                      <Circle size={13} className={t.textMuted} />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`rounded-xl border ${t.border} p-4 space-y-3`}>
          <h3 className={`text-xs font-bold ${t.textMuted} uppercase tracking-wider`}>Active Selection</h3>
          <div className="space-y-1">
            {selectedModels.length === 0 ? (
              <div className={`text-xs ${t.textMuted}`}>No models selected</div>
            ) : (
              selectedModels.map(id => {
                const m = models.find(x => x.id === id);
                return m ? (
                  <div key={id} className={`flex items-center gap-2 py-1 ${t.surfaceHover} rounded-lg px-2`}>
                    <Zap size={11} className={t.accentText} />
                    <span className={`text-xs ${t.text}`}>{m.name}</span>
                    <span className="flex-1" />
                    <span className={`text-xs ${t.textMuted}`}>{m.provider}</span>
                  </div>
                ) : null;
              })
            )}
          </div>
        </div>
      </div>

      <div className={`border-t ${t.border} px-4 py-3`}>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Zap size={10} />
          <span>Ollama: {settings.ollamaEndpoint}</span>
          <span className="mx-2">·</span>
          <span>LM: {settings.lmStudioEndpoint}</span>
        </div>
      </div>
    </div>
  );
}