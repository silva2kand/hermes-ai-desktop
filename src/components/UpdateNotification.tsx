import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import { electronAPI } from '../lib/electron';
import { Download, X, CheckCircle, Loader2 } from 'lucide-react';

interface UpdateInfo {
  version: string;
  downloaded?: boolean;
}

interface UpdateNotificationProps {
  info: UpdateInfo;
  onClose: () => void;
}

export default function UpdateNotification({ info, onClose }: UpdateNotificationProps) {
  const { theme } = useAppStore();
  const t = themes[theme];
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    electronAPI.downloadUpdate();
  };

  const install = () => {
    electronAPI.quitAndInstall();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className={`${t.sidebar} border ${t.border} rounded-xl shadow-2xl overflow-hidden`}>
        <div className={`p-4 border-b ${t.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className={`text-sm font-semibold ${t.accentText}`}>
                Update Available
              </span>
            </div>
            <button
              onClick={onClose}
              className={`${t.textMuted} hover:${t.text} transition-colors p-1 rounded`}
            >
              <X size={14} />
            </button>
          </div>
          <p className={`text-xs mt-1 ${t.textMuted}`}>
            Version {info.version} is ready
          </p>
        </div>
        <div className="p-4 flex gap-2">
          {info.downloaded ? (
            <button
              onClick={install}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-white transition-all bg-green-500 hover:bg-green-600 text-sm"
            >
              <CheckCircle size={14} />
              Install Update
            </button>
          ) : (
            <button
              onClick={download}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-white transition-all bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {downloading ? 'Downloading...' : 'Download Update'}
            </button>
          )}
          <button
            onClick={onClose}
            className={`py-2 px-4 rounded-lg font-medium transition-all border ${t.border} ${t.surfaceHover} ${t.text} text-sm`}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
