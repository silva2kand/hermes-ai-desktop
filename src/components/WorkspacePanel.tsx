import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import {
  Code, Scale, Calculator, Globe, X, Copy, Play, Download,
  AlertTriangle, CheckCircle, Clock, ExternalLink,
  FileText, ArrowUpDown
} from 'lucide-react';

export default function WorkspacePanel() {
  const { theme, workspaceData, workspaceType, setWorkspace, setRightPanelOpen } = useAppStore();
  const t = themes[theme];

  const close = () => {
    setWorkspace('none', null);
    setRightPanelOpen(false);
  };

  const icons: Record<string, React.ReactNode> = {
    code: <Code size={14} />,
    legal: <Scale size={14} />,
    accounting: <Calculator size={14} />,
    web: <Globe size={14} />,
    terminal: <Code size={14} />,
    monitoring: <CheckCircle size={14} />,
  };

  const labels: Record<string, string> = {
    code: 'Code Workspace',
    legal: 'Legal Workspace',
    accounting: 'Accounting Workspace',
    web: 'Web Workspace',
    terminal: 'Terminal Workspace',
    monitoring: 'Monitoring',
  };

  return (
    <div className={`h-full flex flex-col ${t.sidebar} border-l ${t.border}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${t.border}`}>
        <span className={t.accentText}>{icons[workspaceType]}</span>
        <span className={`text-sm font-semibold ${t.text}`}>{labels[workspaceType] || 'Workspace'}</span>
        <div className="flex-1" />
        <button onClick={close} className={`${t.textMuted} hover:${t.text} transition-colors`}>
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {workspaceType === 'code' && workspaceData && <CodeWorkspace data={workspaceData.content} t={t} />}
        {workspaceType === 'legal' && workspaceData && <LegalWorkspace data={workspaceData.content} t={t} />}
        {workspaceType === 'accounting' && workspaceData && <AccountingWorkspace data={workspaceData.content} t={t} />}
        {workspaceType === 'web' && workspaceData && <WebWorkspace data={workspaceData.content} t={t} />}
        {workspaceType === 'none' && (
          <div className={`flex flex-col items-center justify-center h-full ${t.textMuted} text-sm`}>
            <Code size={32} className="mb-2 opacity-40" />
            <p>Workspace appears when agents produce structured output</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeWorkspace({ data, t }: { data: any; t: any }) {
  const [activeFile, setActiveFile] = useState(0);
  const [activeTab, setActiveTab] = useState<'files' | 'diff' | 'terminal'>('files');

  const files = data?.files || [];
  const commands = data?.commands || [];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className={`flex border-b ${t.border}`}>
        {(['files', 'diff', 'terminal'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? `${t.accentText} border-current` : `${t.textMuted} border-transparent hover:${t.text}`
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'files' && (
        <div className="flex flex-1 overflow-hidden">
          {/* File tree */}
          <div className={`w-1/3 border-r ${t.border} overflow-y-auto`}>
            {files.map((file: any, i: number) => (
              <button key={i} onClick={() => setActiveFile(i)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                  activeFile === i ? `${t.surface} ${t.accentText}` : `${t.textMuted} ${t.surfaceHover}`
                }`}>
                <FileText size={12} />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
          {/* Code view */}
          <div className="flex-1 overflow-auto">
            {files[activeFile] && (
              <div className="p-4">
                <div className={`flex items-center justify-between mb-2 text-xs ${t.textMuted}`}>
                  <span className="font-mono">{files[activeFile].name}</span>
                  <button className="flex items-center gap-1 hover:text-white"><Copy size={11} /> Copy</button>
                </div>
                <pre className={`text-xs font-mono leading-relaxed ${t.text} whitespace-pre-wrap`}>
                  {files[activeFile].content}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'diff' && (
        <div className="p-4">
          <div className={`text-xs ${t.textMuted} mb-3`}>Diff View — Changes from last run</div>
          <div className={`rounded-lg ${t.terminal} p-3 font-mono text-xs`}>
            <div className="text-green-400">+ Added: HermesToolBuilder class</div>
            <div className="text-green-400">+ Added: async build_tool method</div>
            <div className="text-green-400">+ Added: sandbox_test integration</div>
            <div className={t.textMuted}>  Unchanged: imports, config</div>
            <div className="text-red-400">- Removed: synchronous version</div>
          </div>
        </div>
      )}

      {activeTab === 'terminal' && (
        <div className="p-3 flex-1">
          <div className={`text-xs font-semibold ${t.textMuted} mb-2`}>Available Commands</div>
          <div className="space-y-2">
            {commands.map((cmd: string, i: number) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${t.surface} border ${t.border}`}>
                <code className={`text-xs font-mono flex-1 ${t.text}`}>{cmd}</code>
                <button className={`p-1 rounded ${t.accentText} hover:opacity-80`}><Play size={11} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LegalWorkspace({ data, t }: { data: any; t: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'timeline' | 'risks'>('overview');

  return (
    <div>
      <div className={`flex border-b ${t.border}`}>
        {(['overview', 'clauses', 'timeline', 'risks'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? `${t.accentText} border-current` : `${t.textMuted} border-transparent hover:${t.text}`
            }`}>{tab}</button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${t.surface} border ${t.border}`}>
              <div className={`text-xs font-semibold ${t.textMuted} mb-2`}>PARTIES</div>
              {(data?.parties || []).map((p: any, i: number) => (
                <div key={i} className={`flex justify-between text-xs ${t.text} py-1`}>
                  <span className={t.textMuted}>{p.role}</span>
                  <span className="font-medium">{p.name}</span>
                </div>
              ))}
            </div>
            <div className={`p-3 rounded-lg ${t.surface} border ${t.border}`}>
              <div className={`text-xs font-semibold ${t.textMuted} mb-2`}>STATS</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded ${t.terminal} text-center`}>
                  <div className={`text-lg font-bold ${t.accentText}`}>{data?.clauses || 0}</div>
                  <div className={t.textMuted}>Clauses</div>
                </div>
                <div className={`p-2 rounded ${t.terminal} text-center`}>
                  <div className="text-lg font-bold text-red-400">{(data?.risks || []).filter((r: any) => r.level === 'HIGH').length}</div>
                  <div className={t.textMuted}>High Risks</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-2">
            {(data?.dates || []).map((d: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${d.critical ? 'border-red-500/30 bg-red-500/10' : t.surface + ' border ' + t.border} border`}>
                <Clock size={14} className={d.critical ? 'text-red-400' : t.textMuted} />
                <div>
                  <div className={`text-xs font-medium ${t.text}`}>{d.label}</div>
                  <div className={`text-xs ${t.textMuted}`}>{d.date}</div>
                </div>
                {d.critical && <span className="ml-auto text-xs text-red-400 font-medium">⚠️ Critical</span>}
              </div>
            ))}
            <button className={`w-full text-xs py-2 rounded-lg border ${t.border} ${t.textMuted} hover:${t.accentText} transition-colors`}>
              + Create Calendar Events
            </button>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-2">
            {(data?.risks || []).map((r: any, i: number) => (
              <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border ${
                r.level === 'HIGH' ? 'border-red-500/30 bg-red-500/10' :
                r.level === 'MEDIUM' ? 'border-yellow-500/30 bg-yellow-500/10' :
                'border-green-500/30 bg-green-500/10'
              }`}>
                <AlertTriangle size={12} className={
                  r.level === 'HIGH' ? 'text-red-400 mt-0.5' :
                  r.level === 'MEDIUM' ? 'text-yellow-400 mt-0.5' : 'text-green-400 mt-0.5'
                } />
                <div>
                  <span className={`text-xs font-bold ${
                    r.level === 'HIGH' ? 'text-red-400' : r.level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                  }`}>{r.level}</span>
                  <p className={`text-xs ${t.text} mt-0.5`}>{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'clauses' && (
          <div className={`text-xs ${t.textMuted} text-center py-8`}>
            Upload a document to extract and analyze clauses in detail.
          </div>
        )}
      </div>
    </div>
  );
}

function AccountingWorkspace({ data, t }: { data: any; t: any }) {
  const invoices = data?.invoices || [];
  const totals = data?.totals || {};

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        {[
          { label: 'Net', value: `£${totals.net?.toLocaleString() || 0}`, color: t.text },
          { label: 'VAT', value: `£${totals.vat?.toLocaleString() || 0}`, color: 'text-yellow-400' },
          { label: 'Total', value: `£${totals.total?.toLocaleString() || 0}`, color: t.accentText },
        ].map((item, i) => (
          <div key={i} className={`flex-1 p-2 rounded-lg ${t.surface} border ${t.border} text-center`}>
            <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
            <div className={`text-xs ${t.textMuted}`}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className={`rounded-lg border ${t.border} overflow-hidden`}>
        <table className="w-full text-xs">
          <thead>
            <tr className={`${t.surface} border-b ${t.border}`}>
              {['ID', 'Supplier', 'Net', 'VAT', 'Total', 'Status'].map(h => (
                <th key={h} className={`px-2 py-2 text-left font-semibold ${t.textMuted}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any, i: number) => (
              <tr key={i} className={`border-b ${t.border} ${t.surfaceHover} transition-colors`}>
                <td className={`px-2 py-2 font-mono ${t.accentText}`}>{inv.id}</td>
                <td className={`px-2 py-2 ${t.text}`}>{inv.supplier}</td>
                <td className={`px-2 py-2 ${t.text}`}>£{inv.net?.toLocaleString()}</td>
                <td className={`px-2 py-2 ${t.textMuted}`}>£{inv.vat?.toLocaleString()}</td>
                <td className={`px-2 py-2 font-medium ${t.text}`}>£{inv.total?.toLocaleString()}</td>
                <td className="px-2 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    inv.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    inv.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-3">
        <button className={`flex-1 text-xs py-2 rounded-lg border ${t.border} ${t.textMuted} hover:${t.accentText} flex items-center justify-center gap-1`}>
          <Download size={11} /> Export CSV
        </button>
        <button className={`flex-1 text-xs py-2 rounded-lg ${t.accent} text-white flex items-center justify-center gap-1 hover:opacity-90`}>
          <ArrowUpDown size={11} /> Reconcile
        </button>
      </div>
    </div>
  );
}

function WebWorkspace({ data, t }: { data: any; t: any }) {
  const sources = data?.sources || [];
  const keywords = data?.keywords || [];

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-1 mb-4">
        {keywords.map((kw: string, i: number) => (
          <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${t.badge} border`}>{kw}</span>
        ))}
      </div>
      <div className={`text-xs font-semibold ${t.textMuted} mb-2`}>Sources</div>
      <div className="space-y-2">
        {sources.map((s: any, i: number) => (
          <div key={i} className={`p-3 rounded-lg ${t.surface} border ${t.border}`}>
            <div className="flex items-center gap-2 mb-1">
              <Globe size={11} className={t.accentText} />
              <span className={`text-xs font-medium ${t.text} truncate flex-1`}>{s.title}</span>
              <span className={`text-xs ${t.textMuted}`}>{Math.round(s.relevance * 100)}%</span>
            </div>
            <div className={`text-xs ${t.textMuted} font-mono truncate`}>{s.url}</div>
            <button className={`mt-1 text-xs flex items-center gap-1 ${t.accentText} hover:underline`}>
              <ExternalLink size={10} /> Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
