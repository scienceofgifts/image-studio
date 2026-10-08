import React, { useState } from 'react';
import { exportAllData, importAllData } from '../../utils/storage';
import { AVAILABLE_MODELS, getGlobalDefaultModel, setGlobalDefaultModel, getModelConfig } from '../../utils/models';
import { Download, Upload, Check, X, Settings, Cpu, Sparkles, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [globalModel, setGlobalModel] = useState<string>(getGlobalDefaultModel());
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectDefaultModel = (modelId: string) => {
    setGlobalModel(modelId);
    setGlobalDefaultModel(modelId);
    setSaveStatus(`Global default model set to ${getModelConfig(modelId).displayName}`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `image-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const success = importAllData(event.target.result as string);
        if (success) {
          setImportStatus('Data successfully restored!');
          onDataRestored();
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1200);
        } else {
          setImportStatus('Failed to restore data. Invalid JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 text-stone-900 overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2 font-serif font-semibold text-stone-900 text-sm">
            <Settings className="w-4 h-4 text-amber-700" />
            <span>Image Studio Settings &amp; AI Model Control</span>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: GLOBAL DEFAULT AI MODEL SETTINGS */}
        <div className="space-y-3 bg-stone-50/80 border border-stone-200 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-xs text-stone-900 uppercase tracking-wider font-mono">
              <Cpu className="w-4 h-4 text-amber-800" />
              <span>Global Default AI Model</span>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-mono px-2 py-0.5 rounded border border-amber-300 font-semibold">
              Persisted
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            New AI operations will start with this default model automatically unless you choose a different model for a specific task.
          </p>

          {saveStatus && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = model.id === globalModel;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelectDefaultModel(model.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-amber-500 shadow-2xs text-stone-900 font-medium ring-1 ring-amber-400'
                      : 'bg-white/60 hover:bg-white border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-serif font-semibold text-xs text-stone-900">
                      <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-700' : 'text-stone-400'}`} />
                      <span>{model.displayName}</span>
                    </div>
                    <p className="text-[11px] text-stone-600">{model.description}</p>
                    <div className="flex items-center gap-2 pt-1 text-[10px]">
                      <span className={`px-1.5 py-0.2 rounded border font-mono ${model.badgeColor}`}>
                        {model.speed}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500">{model.capability}</span>
                    </div>
                  </div>

                  <div className="mt-1">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-stone-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: DATA BACKUP & RESTORE */}
        <div className="space-y-3 pt-2 border-t border-stone-200">
          <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider font-mono">
            Data Backup &amp; Storage
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Export all projects, saved concepts, inspiration items, and visual profiles to a JSON backup file.
          </p>

          {importStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Complete Backup (.json)</span>
            </button>

            <div className="relative">
              <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-800 rounded-xl text-xs font-medium cursor-pointer transition-colors border border-stone-300">
                <Upload className="w-4 h-4 text-amber-700" />
                <span>Restore Backup From File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-500 flex justify-between items-center font-sans">
          <span>Science of Gifts — Image Studio v2.0</span>
          <span className="flex items-center gap-1 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Standalone Model Control</span>
          </span>
        </div>
      </div>
    </div>
  );
};
