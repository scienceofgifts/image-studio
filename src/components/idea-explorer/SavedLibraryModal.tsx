import React, { useState } from 'react';
import { IdeaExplorerSavedItem, IdeaExplorerIdea } from '../../types/ideaExplorer';
import {
  getIdeaExplorerSavedItems,
  removeSavedIdeaExplorerItem,
  toggleSaveIdeaExplorerItem
} from '../../utils/ideaExplorerStorage';
import { useOverlay } from '../../utils/overlayManager';
import {
  Bookmark,
  X,
  Search,
  Tag,
  Copy,
  Check,
  FolderPlus,
  Trash2,
  FileText,
  Lightbulb,
  GitBranch,
  Edit2
} from 'lucide-react';

interface SavedLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBranchIdea: (idea: IdeaExplorerIdea) => void;
  onCreateProject: (idea: IdeaExplorerIdea) => void;
  onLibraryUpdated: () => void;
}

export const SavedLibraryModal: React.FC<SavedLibraryModalProps> = ({
  isOpen,
  onClose,
  onBranchIdea,
  onCreateProject,
  onLibraryUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useOverlay(isOpen, onClose, 'saved-library-modal');

  if (!isOpen) return null;

  const savedItems = getIdeaExplorerSavedItems();

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      savedItems.flatMap(item => [
        ...(item.tags || []),
        ...(item.idea.tags || [])
      ])
    )
  ).filter(Boolean);

  // Filter items
  const filteredItems = savedItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.idea.title.toLowerCase().includes(q) ||
      item.idea.description.toLowerCase().includes(q) ||
      item.idea.corePremise.toLowerCase().includes(q) ||
      (item.customNotes && item.customNotes.toLowerCase().includes(q)) ||
      (item.idea.topic && item.idea.topic.toLowerCase().includes(q));

    const matchesTag =
      !selectedTag ||
      (item.tags && item.tags.includes(selectedTag)) ||
      (item.idea.tags && item.idea.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const handleCopy = (item: IdeaExplorerSavedItem) => {
    const text = `TITLE: ${item.idea.title}\nPREMISE: ${item.idea.corePremise}\nDESCRIPTION: ${item.idea.description}\nNOTES: ${item.customNotes || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRemove = (ideaId: string) => {
    removeSavedIdeaExplorerItem(ideaId);
    onLibraryUpdated();
  };

  const handleSaveNote = (item: IdeaExplorerSavedItem) => {
    toggleSaveIdeaExplorerItem(item.idea, noteText.trim());
    setEditingNoteId(null);
    setNoteText('');
    onLibraryUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-stone-900 animate-fadeIn my-4">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200">
              <Bookmark className="w-5 h-5 fill-amber-700" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Saved Ideas Library
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                {savedItems.length} curated concept{savedItems.length !== 1 ? 's' : ''} saved across exploration sessions
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

        {/* Filter & Search Bar */}
        <div className="p-4 sm:px-6 bg-stone-50/70 border-b border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search saved ideas by title, premise, keyword, or notes..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-600 shadow-2xs font-sans"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <span className="text-[10px] text-stone-600 uppercase font-mono shrink-0">Tag:</span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-1 rounded-lg text-xs shrink-0 transition-colors ${
                  selectedTag === null
                    ? 'bg-stone-900 text-white font-medium'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                All
              </button>
              {allTags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-1 rounded-lg text-xs shrink-0 transition-colors ${
                    selectedTag === tag
                      ? 'bg-amber-600 text-white font-medium'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Saved List Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-serif font-medium text-stone-800">
                {savedItems.length === 0 ? 'No ideas saved yet' : 'No matching ideas found'}
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {savedItems.length === 0
                  ? 'Click the bookmark icon on any idea card in the Idea Explorer workspace to save it to your library.'
                  : 'Try clearing your search query or tag filter to view all saved items.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white border border-stone-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-base font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
                        {item.idea.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.idea.id)}
                        className="text-stone-300 hover:text-rose-600 p-1 transition-colors shrink-0"
                        title="Remove from saved library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.idea.corePremise && (
                      <div className="p-2 bg-stone-50 rounded-lg text-xs text-stone-700">
                        <span className="font-semibold text-stone-800">Premise: </span>
                        {item.idea.corePremise}
                      </div>
                    )}

                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      {item.idea.description}
                    </p>

                    {/* Custom Notes Section */}
                    {editingNoteId === item.id ? (
                      <div className="pt-2 space-y-2 border-t border-stone-100">
                        <textarea
                          rows={2}
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Add custom notes or instructions for this concept..."
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:border-amber-600 resize-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="px-2 py-1 text-[11px] text-stone-500 hover:text-stone-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNote(item)}
                            className="px-2.5 py-1 bg-stone-900 text-white rounded-md text-[11px] font-medium"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : item.customNotes ? (
                      <div className="p-2 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-amber-900 flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono uppercase text-amber-700 font-semibold block">Notes:</span>
                          <p>{item.customNotes}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(item.id);
                            setNoteText(item.customNotes || '');
                          }}
                          className="text-amber-700 hover:text-amber-950 p-1"
                          title="Edit note"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setNoteText('');
                        }}
                        className="text-[11px] text-stone-400 hover:text-stone-700 inline-flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Add note...</span>
                      </button>
                    )}

                    {/* Tags */}
                    {item.idea.tags && item.idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.idea.tags.map(t => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onBranchIdea(item.idea);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-xs font-medium transition-colors"
                        title="Branch from this idea"
                      >
                        <GitBranch className="w-3 h-3 text-amber-700" />
                        <span>Branch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onCreateProject(item.idea);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
                        title="Create Image Studio project"
                      >
                        <FolderPlus className="w-3 h-3" />
                        <span>To Studio</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Copy idea details"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
