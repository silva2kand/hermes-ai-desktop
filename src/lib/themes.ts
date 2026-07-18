export type Theme = 'dark-blue' | 'midnight' | 'solarized' | 'high-contrast' | 'neon' | 'minimal-light' | 'minimal-dark' | 'slate' | 'emerald' | 'crimson';

export interface ThemeConfig {
  name: string;
  label: string;
  bg: string;
  sidebar: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  accentHover: string;
  input: string;
  userMsg: string;
  assistantMsg: string;
  terminal: string;
  badge: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  'dark-blue': {
    name: 'dark-blue', label: 'Dark Blue',
    bg: 'bg-[#0d1117]', sidebar: 'bg-[#161b22]', surface: 'bg-[#1c2333]', surfaceHover: 'hover:bg-[#243047]',
    border: 'border-[#30363d]', text: 'text-[#e6edf3]', textMuted: 'text-[#7d8590]',
    accent: 'bg-blue-600', accentText: 'text-blue-400', accentHover: 'hover:bg-blue-500',
    input: 'bg-[#1c2333] border-[#30363d]', userMsg: 'bg-blue-600/20 border-blue-500/30',
    assistantMsg: 'bg-[#1c2333] border-[#30363d]', terminal: 'bg-[#0d1117]',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  midnight: {
    name: 'midnight', label: 'Midnight',
    bg: 'bg-[#090909]', sidebar: 'bg-[#111111]', surface: 'bg-[#1a1a1a]', surfaceHover: 'hover:bg-[#222222]',
    border: 'border-[#2a2a2a]', text: 'text-[#e0e0e0]', textMuted: 'text-[#666]',
    accent: 'bg-purple-700', accentText: 'text-purple-400', accentHover: 'hover:bg-purple-600',
    input: 'bg-[#1a1a1a] border-[#2a2a2a]', userMsg: 'bg-purple-900/30 border-purple-700/30',
    assistantMsg: 'bg-[#1a1a1a] border-[#2a2a2a]', terminal: 'bg-[#090909]',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  solarized: {
    name: 'solarized', label: 'Solarized',
    bg: 'bg-[#002b36]', sidebar: 'bg-[#073642]', surface: 'bg-[#073642]', surfaceHover: 'hover:bg-[#0d4452]',
    border: 'border-[#586e75]', text: 'text-[#839496]', textMuted: 'text-[#586e75]',
    accent: 'bg-[#268bd2]', accentText: 'text-[#268bd2]', accentHover: 'hover:bg-[#1a6fa8]',
    input: 'bg-[#073642] border-[#586e75]', userMsg: 'bg-[#268bd2]/20 border-[#268bd2]/30',
    assistantMsg: 'bg-[#073642] border-[#586e75]', terminal: 'bg-[#002b36]',
    badge: 'bg-[#268bd2]/20 text-[#268bd2] border-[#268bd2]/30',
  },
  'high-contrast': {
    name: 'high-contrast', label: 'High Contrast',
    bg: 'bg-black', sidebar: 'bg-black', surface: 'bg-[#111]', surfaceHover: 'hover:bg-[#1a1a1a]',
    border: 'border-white', text: 'text-white', textMuted: 'text-gray-400',
    accent: 'bg-yellow-400', accentText: 'text-yellow-400', accentHover: 'hover:bg-yellow-300',
    input: 'bg-black border-white', userMsg: 'bg-yellow-400/10 border-yellow-400',
    assistantMsg: 'bg-[#111] border-white', terminal: 'bg-black',
    badge: 'bg-yellow-400/10 text-yellow-400 border-yellow-400',
  },
  neon: {
    name: 'neon', label: 'Neon',
    bg: 'bg-[#050505]', sidebar: 'bg-[#0a0a0a]', surface: 'bg-[#0f0f0f]', surfaceHover: 'hover:bg-[#151515]',
    border: 'border-[#00ff88]/30', text: 'text-[#00ff88]', textMuted: 'text-[#00ff88]/50',
    accent: 'bg-[#00ff88]', accentText: 'text-[#00ff88]', accentHover: 'hover:bg-[#00cc70]',
    input: 'bg-[#0f0f0f] border-[#00ff88]/30', userMsg: 'bg-[#00ff88]/10 border-[#00ff88]/40',
    assistantMsg: 'bg-[#0f0f0f] border-[#00ff88]/20', terminal: 'bg-[#050505]',
    badge: 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30',
  },
  'minimal-light': {
    name: 'minimal-light', label: 'Minimal Light',
    bg: 'bg-white', sidebar: 'bg-gray-50', surface: 'bg-gray-100', surfaceHover: 'hover:bg-gray-200',
    border: 'border-gray-200', text: 'text-gray-900', textMuted: 'text-gray-500',
    accent: 'bg-gray-900', accentText: 'text-gray-700', accentHover: 'hover:bg-gray-800',
    input: 'bg-white border-gray-300', userMsg: 'bg-gray-900 text-white border-gray-900',
    assistantMsg: 'bg-gray-100 border-gray-200', terminal: 'bg-gray-900',
    badge: 'bg-gray-200 text-gray-700 border-gray-300',
  },
  'minimal-dark': {
    name: 'minimal-dark', label: 'Minimal Dark',
    bg: 'bg-[#1a1a1a]', sidebar: 'bg-[#141414]', surface: 'bg-[#202020]', surfaceHover: 'hover:bg-[#2a2a2a]',
    border: 'border-[#333]', text: 'text-[#d4d4d4]', textMuted: 'text-[#888]',
    accent: 'bg-white', accentText: 'text-white', accentHover: 'hover:bg-gray-200',
    input: 'bg-[#202020] border-[#333]', userMsg: 'bg-[#2a2a2a] border-[#444]',
    assistantMsg: 'bg-[#202020] border-[#333]', terminal: 'bg-[#141414]',
    badge: 'bg-white/10 text-gray-300 border-gray-600',
  },
  slate: {
    name: 'slate', label: 'Slate',
    bg: 'bg-slate-900', sidebar: 'bg-slate-800', surface: 'bg-slate-700', surfaceHover: 'hover:bg-slate-600',
    border: 'border-slate-600', text: 'text-slate-100', textMuted: 'text-slate-400',
    accent: 'bg-cyan-600', accentText: 'text-cyan-400', accentHover: 'hover:bg-cyan-500',
    input: 'bg-slate-700 border-slate-600', userMsg: 'bg-cyan-600/20 border-cyan-500/30',
    assistantMsg: 'bg-slate-700 border-slate-600', terminal: 'bg-slate-900',
    badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  emerald: {
    name: 'emerald', label: 'Emerald',
    bg: 'bg-[#0a1a0f]', sidebar: 'bg-[#0f2418]', surface: 'bg-[#142d1e]', surfaceHover: 'hover:bg-[#1a3826]',
    border: 'border-emerald-900/50', text: 'text-emerald-100', textMuted: 'text-emerald-400/60',
    accent: 'bg-emerald-600', accentText: 'text-emerald-400', accentHover: 'hover:bg-emerald-500',
    input: 'bg-[#142d1e] border-emerald-900/50', userMsg: 'bg-emerald-600/20 border-emerald-500/30',
    assistantMsg: 'bg-[#142d1e] border-emerald-900/40', terminal: 'bg-[#0a1a0f]',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  crimson: {
    name: 'crimson', label: 'Crimson',
    bg: 'bg-[#1a0505]', sidebar: 'bg-[#200808]', surface: 'bg-[#2a0c0c]', surfaceHover: 'hover:bg-[#361010]',
    border: 'border-red-900/50', text: 'text-red-100', textMuted: 'text-red-400/60',
    accent: 'bg-red-700', accentText: 'text-red-400', accentHover: 'hover:bg-red-600',
    input: 'bg-[#2a0c0c] border-red-900/50', userMsg: 'bg-red-700/20 border-red-600/30',
    assistantMsg: 'bg-[#2a0c0c] border-red-900/40', terminal: 'bg-[#1a0505]',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};
