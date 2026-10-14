import React, { useState } from 'react';
import { IdeaExplorerIdea } from '../../types/ideaExplorer';
import { useOverlay } from '../../utils/overlayManager';
import { ModelSelector } from '../common/ModelSelector';
import { GitBranch, X, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentIdeas: IdeaExplorerIdea[];
  onExecuteBranch: (directive: string, model: string) => Promise<void>;
  currentModel: string;
}

export const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  parentIdeas,
  onExecuteBranch,
  currentModel
}) => {
  const [directive, setDirective] = useState('');
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useOverlay(isOpen, onClose, 'branch-modal');

  if (!isOpen || parentIdeas.length === 0) return null;

  const handleBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onExecuteBranch(directive.trim(), selectedModel);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to branch ideas. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleDirectives = [
    'Explore subtle, deadpan humor variations',
    'Translate into minimalist typography and specimen layouts',
    'Focus on apparel and sweatshirt placement',
    'Introduce vintage technical and blueprint elements',
    'Synthesize the shared themes between selected concepts'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5 text-stone-900 animate-fadeIn my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl border border-amber-200">
              <GitBranch className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Branch New Concepts
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Generate 10 fresh ideas inspired by {parentIdeas.length} selected concept{parentIdeas.length > 1 ? 's' : ''}
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

        {/* Selected Parent Ideas Preview */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-stone-500">
            Selected Parent Ideas ({parentIdeas.length})
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {parentIdeas.map((p, idx) => (
              <div
                key={p.id}
                className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 text-xs space-y-1"
              >
                <div className="flex items-center gap-2 font-medium text-stone-900">
                  <span className="font-mono text-[10px] text-amber-700 font-semibold">#{idx + 1}</span>
                  <span>{p.title}</span>
                </div>
                {p.corePremise && (
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    <span className="font-semibold text-stone-700">Premise:</span> {p.corePremise}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Branch Directive Form */}
        <form onSubmit={handleBranch} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-stone-500 flex items-center justify-between">
              <span>Branching Directive (Optional)</span>
              <span className="text-[10px] font-sans font-normal text-stone-400">Where should the creative branch go?</span>
            </label>
            <textarea
              rows={3}
              value={directive}
              onChange={e => setDirective(e.target.value)}
              placeholder="e.g. Develop this vein into bolder, more irreverent takes, or focus on witty textual statements suitable for sweatshirts..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-all resize-none font-sans"
            />
          </div>

          {/* Quick Directives */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-stone-600 uppercase font-mono">Quick Inspiration Directives:</span>
            <div className="flex flex-wrap gap-1.5">
              {sampleDirectives.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDirective(d)}
                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[11px] transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selector & Submit */}
          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <ModelSelector
              selectedModel={selectedModel}
              onChangeModel={setSelectedModel}
              compact
              label="Branching Model"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Branching 10 Ideas...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Generate 10 Branched Ideas</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs leading-relaxed">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
