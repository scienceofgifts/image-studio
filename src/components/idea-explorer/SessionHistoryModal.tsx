import React from 'react';
import { IdeaExplorerSession } from '../../types/ideaExplorer';
import { useOverlay } from '../../utils/overlayManager';
import { History, X, Plus, Trash2, ArrowRight, Calendar, Sparkles } from 'lucide-react';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: IdeaExplorerSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}) => {
  useOverlay(isOpen, onClose, 'session-history-modal');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl text-stone-900 animate-fadeIn my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-stone-100 text-stone-800 rounded-xl border border-stone-200">
              <History className="w-5 h-5 text-amber-700" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Exploration Sessions
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Browse, revisit, or manage past ideation workspaces
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-600 font-mono">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} stored
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNewSession();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start Fresh Session</span>
          </button>
        </div>

        {/* Session List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {sessions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-serif text-stone-700">No past exploration sessions</p>
              <p className="text-xs text-stone-500">
                Your brainstorm topics and generated batches will be saved here automatically.
              </p>
            </div>
          ) : (
            sessions.map(s => {
              const isActive = s.id === activeSessionId;
              const formattedDate = new Date(s.updatedAt || s.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300/40 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectSession(s.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer pr-3 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-sm font-semibold text-stone-900 hover:text-amber-900">
                        {s.title || s.originalTopic}
                      </h4>
                      {isActive && (
                        <span className="px-2 py-[2px] bg-amber-200 text-amber-900 rounded-full text-[10px] font-mono font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formattedDate}
                      </span>
                      <span>·</span>
                      <span>{s.batchIds.length} batch{s.batchIds.length !== 1 ? 'es' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession(s.id);
                        onClose();
                      }}
                      className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                      title="Open session"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSession(s.id)}
                      className="p-2 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
