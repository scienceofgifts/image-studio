import React, { useState } from 'react';
import { exportIdeaExplorerBackup, importIdeaExplorerBackup } from '../../utils/ideaExplorerStorage';
import { useOverlay } from '../../utils/overlayManager';
import { Download, Upload, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface IdeaBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const IdeaBackupModal: React.FC<IdeaBackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  useOverlay(isOpen, onClose, 'idea-backup-modal');

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportIdeaExplorerBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idea-explorer-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
        const result = importIdeaExplorerBackup(event.target.result as string, importMode);
        setImportStatus(result);
        if (result.success) {
          onDataRestored();
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1800);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 text-stone-900 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold font-serif text-stone-900">
              Idea Explorer Backup &amp; Restore
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-sans">
          Export your generated ideas, exploration sessions, and saved library as a portable JSON file, or restore them safely.
        </p>

        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {importStatus.success ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Import Mode Selector */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
            Import Mode:
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="merge"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span>Merge (Preserve existing ideas)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span>Replace All</span>
            </label>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Idea Explorer Data (.json)</span>
          </button>

          <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-stone-50 text-stone-800 rounded-xl text-xs font-medium cursor-pointer transition-colors border border-stone-300 shadow-2xs">
            <Upload className="w-4 h-4 text-amber-700" />
            <span>Restore From Backup File (.json)</span>
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
  );
};
