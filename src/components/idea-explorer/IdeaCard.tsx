import React, { useState } from 'react';
import { IdeaExplorerIdea } from '../../types/ideaExplorer';
import {
  Bookmark,
  GitBranch,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Tag,
  Sparkles,
  Lightbulb
} from 'lucide-react';

interface IdeaCardProps {
  idea: IdeaExplorerIdea;
  index: number;
  isSelected: boolean;
  onToggleSelect: (ideaId: string) => void;
  isSaved: boolean;
  onToggleSave: (idea: IdeaExplorerIdea) => void;
  onBranch: (idea: IdeaExplorerIdea) => void;
  onCreateProject: (idea: IdeaExplorerIdea) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  index,
  isSelected,
  onToggleSelect,
  isSaved,
  onToggleSave,
  onBranch,
  onCreateProject
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCopy = () => {
    const textToCopy = `TITLE: ${idea.title}
PREMISE: ${idea.corePremise}
DESCRIPTION: ${idea.description}
${idea.executionSuggestions?.length ? `\nEXECUTION SUGGESTIONS:\n${idea.executionSuggestions.map(s => `- ${s}`).join('\n')}` : ''}
${idea.tags?.length ? `\nTAGS: ${idea.tags.join(', ')}` : ''}`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-400/30 shadow-md bg-amber-50/20'
          : 'border-stone-200/90 hover:border-stone-300 shadow-2xs hover:shadow-sm'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-stone-100 bg-stone-50/40">
        <div className="flex items-center gap-2.5">
          {/* Selection Checkbox */}
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(idea.id)}
              className="w-4 h-4 rounded-md border-stone-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer transition-colors"
            />
          </label>

          {/* Index Counter */}
          <span className="font-mono text-xs font-semibold text-stone-600">
            #{formattedIndex}
          </span>
        </div>

        {/* Top Actions: Bookmark / Save */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleSave(idea)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isSaved
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title={isSaved ? 'Remove from Saved Ideas' : 'Save to Idea Library'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-start">
        {/* Title */}
        <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-900 tracking-tight leading-snug group-hover:text-amber-900 transition-colors">
          {idea.title}
        </h3>

        {/* Core Premise Pill */}
        {idea.corePremise && (
          <div className="bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-2 text-xs text-stone-700 space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-amber-800 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-700" />
              <span>Core Premise</span>
            </div>
            <p className="leading-relaxed font-sans">{idea.corePremise}</p>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-stone-600 leading-relaxed font-sans flex-1">
          {idea.description}
        </p>

        {/* Execution Suggestions (Collapsible or Preview) */}
        {idea.executionSuggestions && idea.executionSuggestions.length > 0 && (
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center justify-between w-full text-[11px] font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Execution Suggestions ({idea.executionSuggestions.length})</span>
              </span>
              {showSuggestions ? (
                <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              )}
            </button>

            {showSuggestions && (
              <ul className="mt-2 space-y-1 text-[11px] text-stone-600 pl-4 list-disc marker:text-amber-500 animate-fadeIn">
                {idea.executionSuggestions.map((sugg, i) => (
                  <li key={i} className="leading-relaxed">
                    {sugg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {idea.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-mono"
              >
                <Tag className="w-2.5 h-2.5 text-stone-500" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Branch Button */}
          <button
            type="button"
            onClick={() => onBranch(idea)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200 rounded-lg text-xs font-medium transition-colors shadow-2xs"
            title="Branch 10 sister ideas exploring this concept"
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-700" />
            <span>Branch</span>
          </button>

          {/* Create Project Button */}
          <button
            type="button"
            onClick={() => onCreateProject(idea)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
            title="Start an Image Studio design project with this idea"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">To Studio</span>
            <span className="sm:hidden">Studio</span>
          </button>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-colors"
          title="Copy idea details to clipboard"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
