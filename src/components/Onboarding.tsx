import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { themes } from '../lib/themes';
import { CheckCircle, Zap, Brain, Code, Globe, Layers, X } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { theme } = useAppStore();
  const t = themes[theme];
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < 5) setStep(step + 1);
    else onComplete();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const steps = [
    { title: 'Welcome', desc: 'Your universal AI intelligence layer — running locally on your machine with full access to your tools, connectors, and agents.', Icon: Brain },
    { title: '7 Specialized Agents', desc: 'General, Coding, Legal, Accounting, Business, Web, and Generative Builder — each with domain-specific expertise.', Icon: Zap },
    { title: 'Local Models', desc: 'Auto-detects Ollama and LM Studio. Click-connect to Gemini, OpenRouter, Groq, and more.', Icon: Code },
    { title: 'Smart Workspaces', desc: 'Code, Legal, Accounting, and Web workspaces that appear when agents produce structured output.', Icon: Layers },
    { title: 'Context-Aware', desc: 'Detects your active app, clipboard, and selection. Paperclip agents suggest actions in real-time.', Icon: Globe },
    { title: 'Ready to Start', desc: 'Press Ctrl+Shift+H anytime to summon the assistant. Right-click anywhere for quick actions.', Icon: CheckCircle },
  ];

  const currentStep = steps[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
    >
      <div className={`${t.sidebar} border ${t.border} rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${t.border}`}>
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-blue-400" />
            <span className={`font-bold ${t.text}`}>Hermes AI Setup</span>
          </div>
          <button
            onClick={onComplete}
            className={`p-1 rounded ${t.surfaceHover} transition-colors ${t.textMuted}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <currentStep.Icon size={36} className="text-white" />
            </div>
          </div>
          <h2 className={`text-xl font-bold mb-3 ${t.text}`}>
            {currentStep.title}
          </h2>
          <p className={`text-sm leading-relaxed ${t.textMuted}`}>
            {currentStep.desc}
          </p>
          <div className="flex justify-center gap-2 mt-6 mb-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'bg-blue-500 scale-125' : i < step ? 'bg-blue-300' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex border-t ${t.border} p-4 gap-3`}>
          <button
            onClick={prev}
            disabled={step === 0}
            className={`flex-1 py-2 px-4 rounded-lg border ${t.border} font-medium transition-all disabled:opacity-30 ${t.surfaceHover} ${t.text}`}
          >
            Back
          </button>
          <button
            onClick={next}
            className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-all bg-blue-500 hover:bg-blue-600"
          >
            {step === 5 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
