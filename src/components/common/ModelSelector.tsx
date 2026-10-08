import React, { useState, useRef, useEffect } from 'react';
import { AVAILABLE_MODELS, getModelConfig, getGlobalDefaultModel } from '../../utils/models';
import { useOverlay } from '../../utils/overlayManager';
import { Cpu, ChevronDown, Check, Sparkles, Info } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onChangeModel: (modelId: string) => void;
  label?: string;
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onChangeModel,
  label = 'AI Model',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const instanceIdRef = useRef('model-selector-' + Math.random().toString(36).substring(2, 9));

  useOverlay(isOpen, () => setIsOpen(false), instanceIdRef.current);
  
  const currentConfig = getModelConfig(selectedModel);
  const globalDefaultId = getGlobalDefaultModel();
  const isOverride = selectedModel !== globalDefaultId;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {label && !compact && (
        <div className="flex items-center justify-between gap-2 mb-1">
          <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1 font-mono">
            <Cpu className="w-3 h-3 text-amber-800" />
            <span>{label}</span>
          </label>
          {isOverride && (
            <span className="text-[10px] text-amber-800 font-medium bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
              Task Override
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 bg-white border border-stone-300 hover:border-amber-600 rounded-xl transition-all shadow-2xs font-sans text-stone-900 ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="font-medium truncate">{currentConfig.displayName}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in p-1.5 text-xs space-y-1">
          <div className="px-2.5 py-1.5 border-b border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Select Model for this Operation</span>
            <span className="font-mono text-[10px] text-stone-400">Default: {getModelConfig(globalDefaultId).shortName}</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {AVAILABLE_MODELS.map((m) => {
              const isSelected = m.id === selectedModel;
              const isGlobalDefault = m.id === globalDefaultId;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChangeModel(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-all flex flex-col gap-0.5 border ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-300 text-stone-900 font-medium'
                      : 'border-transparent hover:bg-stone-100/80 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                      {m.displayName}
                      {isGlobalDefault && (
                        <span className="text-[9px] bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded font-mono">
                          Default
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </div>

                  <p className="text-[11px] text-stone-600 leading-tight">
                    {m.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded border font-mono font-medium ${m.badgeColor}`}>
                      {m.speed}
                    </span>
                    <span className="text-stone-400 font-sans">·</span>
                    <span className="text-stone-500 font-sans">{m.capability}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2 bg-stone-50 rounded-xl border border-stone-100 text-[10px] text-stone-500 flex items-start gap-1.5">
            <Info className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
            <span>Overriding here only affects this task. The global default model remains unchanged.</span>
          </div>
        </div>
      )}
    </div>
  );
};
