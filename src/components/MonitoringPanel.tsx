import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import {
  Activity, Brain, HardDrive, CheckCircle,
  Zap, RefreshCw, Play, Pause, Trash2
} from 'lucide-react';

export default function MonitoringPanel() {
  const { theme, agentMonitors, updateAgentMonitor, memoryEntries, deleteMemoryEntry, toggleMemoryPin } = useAppStore();
  const t = themes[theme];
  const [activeTab, setActiveTab] = useState<'agents' | 'memory' | 'tools' | 'system'>('agents');
  const [uptimeSec, setUptimeSec] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setUptimeSec(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const statusColors: Record<string, string> = {
    running: 'text-green-400',
    idle: t.textMuted,
    error: 'text-red-400',
    waiting: 'text-yellow-400',
  };

  const statusDots: Record<string, string> = {
    running: 'bg-green-400 animate-pulse',
    idle: 'bg-gray-500',
    error: 'bg-red-400',
    waiting: 'bg-yellow-400',
  };

  const agentColorMap: Record<string, string> = {
    general: 'text-blue-400', coding: 'text-green-400', legal: 'text-purple-400',
    accounting: 'text-yellow-400', business: 'text-orange-400', web: 'text-cyan-400', generative: 'text-pink-400',
  };

  const toolCallsSimulated = [
    { name: 'web_search', calls: 47, avgMs: 340, status: 'ok' },
    { name: 'file_read', calls: 23, avgMs: 12, status: 'ok' },
    { name: 'file_write', calls: 8, avgMs: 18, status: 'ok' },
    { name: 'terminal', calls: 15, avgMs: 220, status: 'ok' },
    { name: 'email_search', calls: 3, avgMs: 890, status: 'warn' },
    { name: 'clause_extract', calls: 11, avgMs: 1200, status: 'ok' },
    { name: 'invoice_parse', calls: 7, avgMs: 450, status: 'ok' },
    { name: 'code_analyze', calls: 19, avgMs: 280, status: 'ok' },
    { name: 'sandbox_run', calls: 4, avgMs: 2100, status: 'warn' },
  ];

  return (
    <div className={`flex flex-col h-full ${t.sidebar}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${t.border}`}>
        <Activity size={15} className={t.accentText} />
        <span className={`text-sm font-semibold ${t.text}`}>System Monitoring</span>
        <div className={`ml-auto text-xs ${t.textMuted}`}>{formatUptime(uptimeSec)}</div>
      </div>

      {/* Quick stats */}
      <div className={`grid grid-cols-4 gap-px border-b ${t.border}`}>
        {[
          { label: 'Active Agents', value: agentMonitors.filter(a => a.status === 'running').length, icon: <Brain size={11} />, color: 'text-blue-400' },
          { label: 'Total Tasks', value: agentMonitors.reduce((s, a) => s + a.tasksCompleted, 0), icon: <CheckCircle size={11} />, color: 'text-green-400' },
          { label: 'Memory Entries', value: memoryEntries.length, icon: <HardDrive size={11} />, color: 'text-purple-400' },
          { label: 'Tool Calls', value: toolCallsSimulated.reduce((s, t) => s + t.calls, 0), icon: <Zap size={11} />, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className={`flex flex-col items-center py-3 ${t.surface}`}>
            <span className={stat.color}>{stat.icon}</span>
            <span className={`text-lg font-bold ${t.text}`}>{stat.value}</span>
            <span className={`text-xs ${t.textMuted} text-center leading-tight`}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${t.border}`}>
        {(['agents', 'memory', 'tools', 'system'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? `${t.accentText} border-current` : `${t.textMuted} border-transparent hover:${t.text}`
            }`}>{tab}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="space-y-2">
            {agentMonitors.map((agent) => (
              <div key={agent.id} className={`p-3 rounded-xl border ${t.border} ${t.surface}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDots[agent.status]}`} />
                  <span className={`text-xs font-semibold ${agentColorMap[agent.type] || t.text}`}>{agent.name}</span>
                  <span className={`ml-auto text-xs ${statusColors[agent.status]}`}>{agent.status}</span>
                </div>
                {agent.currentTask && (
                  <div className={`text-xs ${t.textMuted} mb-2 pl-4 truncate`}>↳ {agent.currentTask}</div>
                )}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`text-center p-1.5 rounded ${t.terminal}`}>
                    <div className={`font-bold ${t.text}`}>{agent.tasksCompleted}</div>
                    <div className={t.textMuted}>Tasks</div>
                  </div>
                  <div className={`text-center p-1.5 rounded ${t.terminal}`}>
                    <div className={`font-bold ${t.text}`}>{agent.memoryUsed}MB</div>
                    <div className={t.textMuted}>Memory</div>
                  </div>
                  <div className={`text-center p-1.5 rounded ${t.terminal}`}>
                    <div className={`font-bold ${t.text}`}>{agent.toolsUsed.length}</div>
                    <div className={t.textMuted}>Tools</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.toolsUsed.map(tool => (
                    <span key={tool} className={`text-xs px-1.5 py-0.5 rounded ${t.terminal} ${t.textMuted}`}>{tool}</span>
                  ))}
                </div>
                <div className={`text-xs ${t.textMuted} mt-2`}>
                  Last active: {new Date(agent.lastActive).toLocaleTimeString()}
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => updateAgentMonitor(agent.id, { status: agent.status === 'running' ? 'idle' : 'running' })}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${t.border} ${t.textMuted} hover:${t.text} transition-colors`}
                  >
                    {agent.status === 'running' ? <Pause size={10} /> : <Play size={10} />}
                    {agent.status === 'running' ? 'Pause' : 'Resume'}
                  </button>
                  <button className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${t.border} ${t.textMuted} hover:${t.text} transition-colors`}>
                    <RefreshCw size={10} /> Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MEMORY TAB */}
        {activeTab === 'memory' && (
          <div className="space-y-2">
            <div className={`text-xs ${t.textMuted} mb-2`}>{memoryEntries.length} entries in semantic memory</div>
            {memoryEntries.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((entry) => (
              <div key={entry.id} className={`p-3 rounded-lg border ${t.border} ${t.surface} ${entry.pinned ? 'border-l-2 border-l-blue-400' : ''}`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-mono font-medium ${t.accentText} truncate`}>{entry.key}</div>
                    <div className={`text-xs ${t.text} mt-0.5`}>{entry.value}</div>
                    <div className={`text-xs ${t.textMuted} mt-1`}>{entry.source} · {new Date(entry.createdAt).toLocaleDateString()}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.tags.map(tag => (
                        <span key={tag} className={`text-xs px-1.5 py-0 rounded ${t.terminal} ${t.textMuted}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => toggleMemoryPin(entry.id)} className={`text-xs ${entry.pinned ? 'text-blue-400' : t.textMuted} hover:text-blue-400`}>
                      📌
                    </button>
                    <button onClick={() => deleteMemoryEntry(entry.id)} className={`text-xs ${t.textMuted} hover:text-red-400`}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button className={`w-full text-xs py-2 rounded-lg border ${t.border} ${t.textMuted} hover:${t.accentText} transition-colors`}>
              + Add Memory Entry
            </button>
          </div>
        )}

        {/* TOOLS TAB */}
        {activeTab === 'tools' && (
          <div className="space-y-1">
            <div className={`text-xs ${t.textMuted} mb-2`}>{toolCallsSimulated.length} tools active</div>
            {toolCallsSimulated.map((tool, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${t.surface} border ${t.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tool.status === 'ok' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className={`font-mono text-xs flex-1 ${t.text}`}>{tool.name}</span>
                <span className={`text-xs ${t.textMuted}`}>{tool.calls} calls</span>
                <span className={`text-xs ${tool.avgMs > 500 ? 'text-yellow-400' : 'text-green-400'}`}>{tool.avgMs}ms avg</span>
              </div>
            ))}
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
          <div className="space-y-3">
            {[
              { label: 'CPU Usage', value: 23, unit: '%', color: 'bg-blue-400' },
              { label: 'RAM Usage', value: 67, unit: '%', color: 'bg-purple-400' },
              { label: 'GPU (LLM)', value: 85, unit: '%', color: 'bg-green-400' },
              { label: 'Disk I/O', value: 12, unit: '%', color: 'bg-yellow-400' },
            ].map((metric, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={t.textMuted}>{metric.label}</span>
                  <span className={t.text}>{metric.value}{metric.unit}</span>
                </div>
                <div className={`h-1.5 rounded-full ${t.terminal}`}>
                  <div className={`h-full rounded-full ${metric.color} transition-all duration-700`} style={{ width: `${metric.value}%` }} />
                </div>
              </div>
            ))}

            <div className={`mt-4 p-3 rounded-lg ${t.surface} border ${t.border}`}>
              <div className={`text-xs font-semibold ${t.textMuted} mb-2`}>CONNECTIONS</div>
              {[
                { name: 'Ollama API', status: true, endpoint: 'localhost:11434' },
                { name: 'LM Studio', status: false, endpoint: 'localhost:1234' },
                { name: 'Backend API', status: true, endpoint: 'localhost:8000' },
              ].map((conn, i) => (
                <div key={i} className={`flex items-center gap-2 py-1 text-xs ${t.text}`}>
                  <div className={`w-2 h-2 rounded-full ${conn.status ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span>{conn.name}</span>
                  <span className={`ml-auto font-mono ${t.textMuted}`}>{conn.endpoint}</span>
                </div>
              ))}
            </div>

            <div className={`p-3 rounded-lg ${t.surface} border ${t.border}`}>
              <div className={`text-xs font-semibold ${t.textMuted} mb-2`}>HERMES RUNTIME</div>
              <div className={`text-xs ${t.text} space-y-1`}>
                <div className="flex justify-between"><span className={t.textMuted}>Version</span><span>3.0.0-alpha</span></div>
                <div className="flex justify-between"><span className={t.textMuted}>Uptime</span><span>{formatUptime(uptimeSec)}</span></div>
                <div className="flex justify-between"><span className={t.textMuted}>Sandbox</span><span className="text-green-400">Active</span></div>
                <div className="flex justify-between"><span className={t.textMuted}>Auto-detect</span><span className="text-green-400">On</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
