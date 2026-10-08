import React, { useState } from 'react';
import { exportAllData, importAllData } from '../../utils/storage';
import { Download, Upload, Check, AlertCircle, X } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `science-of-gifts-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
          }, 1500);
        } else {
          setImportStatus('Failed to restore data. Invalid JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-stone-100">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <h3 className="text-sm font-semibold font-serif text-stone-100">Data Backup &amp; Restore</h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-400">
          Backup or restore all Image Studio and Writing Studio projects, inspiration references, and design briefs across sessions.
        </p>

        {importStatus && (
          <div className="p-3 bg-amber-950/80 border border-amber-800 rounded-xl text-xs text-amber-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export All Data (.json)</span>
          </button>

          <div className="relative">
            <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium cursor-pointer transition-colors border border-stone-700">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Restore Data From File</span>
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
    </div>
  );
};
