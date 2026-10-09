import React, { useState } from 'react';
import { ImageProject, VisualConcept, ConceptRole } from '../../types';
import { getSavedConcepts, saveConceptToGallery, removeSavedConcept } from '../../utils/storage';
import { Sparkles, Bookmark, Layout, Type, PenTool, Package, AlertTriangle, ArrowRight, Check, Cpu } from 'lucide-react';

interface ConceptsStepProps {
  project: ImageProject;
  onUpdateProject: (updated: ImageProject) => void;
  onExploreConcepts: () => void;
  onNextStep: () => void;
  isGenerating: boolean;
}

export const ConceptsStep: React.FC<ConceptsStepProps> = ({
  project,
  onUpdateProject,
  onExploreConcepts,
  onNextStep,
  isGenerating
}) => {
  const [selections, setSelections] = useState<Record<string, ConceptRole>>(project.conceptSelections || {});
  const [creativeDirection, setCreativeDirection] = useState<string>(project.creativeDirection || '');
  const [savedConceptIds, setSavedConceptIds] = useState<string[]>(() => {
    return getSavedConcepts()
      .map(c => c.concept?.id)
      .filter((id): id is string => typeof id === 'string' && id !== '');
  });
  const [savedConceptNames, setSavedConceptNames] = useState<string[]>(() => {
    return getSavedConcepts()
      .map(c => c.concept?.conceptName)
      .filter((name): name is string => typeof name === 'string' && name !== '');
  });

  React.useEffect(() => {
    let hasChanges = false;
    const sanitizedConcepts = project.visualConcepts.map((c, idx) => {
      if (!c.id) {
        hasChanges = true;
        return {
          ...c,
          id: 'concept-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6)
        };
      }
      return c;
    });

    if (hasChanges) {
      onUpdateProject({
        ...project,
        visualConcepts: sanitizedConcepts
      });
    }
  }, [project.visualConcepts, project.id, onUpdateProject]);

  const setRole = (conceptId: string, role: ConceptRole) => {
    if (!conceptId) return;
    const updated = { ...selections };
    if (role === 'primary') {
      Object.keys(updated).forEach(id => {
        if (updated[id] === 'primary') updated[id] = 'secondary';
      });
    }
    updated[conceptId] = role;
    setSelections(updated);
    onUpdateProject({
      ...project,
      conceptSelections: updated,
      creativeDirection
    });
  };

  const handleToggleSaveConcept = (concept: VisualConcept, e: React.MouseEvent) => {
    e.stopPropagation();
    const isSaved = concept.id ? savedConceptIds.includes(concept.id) : false;
    
    if (isSaved) {
      if (concept.id) {
        removeSavedConcept(concept.id);
        setSavedConceptIds(savedConceptIds.filter(id => id !== concept.id));
      }
    } else {
      const generatedId = concept.id || 'concept-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      
      // If concept had no ID, update project concepts to persist it
      if (!concept.id) {
        concept.id = generatedId;
        const updatedConcepts = project.visualConcepts.map(c => 
          c.conceptName === concept.conceptName ? { ...c, id: generatedId } : c
        );
        onUpdateProject({
          ...project,
          visualConcepts: updatedConcepts
        });
      }

      saveConceptToGallery({
        id: 'sc-' + Date.now() + Math.random().toString().slice(2, 6),
        concept: {
          ...concept,
          id: generatedId
        },
        sourceProjectId: project.id,
        sourceProjectTitle: project.title,
        tags: [project.imageIdea.idea, 'Exploration'],
        createdAt: new Date().toISOString()
      });
      setSavedConceptIds([...savedConceptIds, generatedId]);
    }
  };

  const handleCreativeDirectionChange = (val: string) => {
    setCreativeDirection(val);
    onUpdateProject({
      ...project,
      conceptSelections: selections,
      creativeDirection: val
    });
  };

  const hasPrimary = Object.values(selections).some(r => r === 'primary');

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
            STAGE 02 · 5 CREATIVE DIRECTIONS
          </span>
          <h2 className="text-xl font-serif text-stone-900 font-semibold">Explore Visual Concepts</h2>
          <p className="text-xs text-stone-600 mt-1">
            Review 5 distinct visual directions for <strong className="text-stone-900">"{project.imageIdea.idea}"</strong>. Select a Primary Concept and bookmark ideas for your library.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreConcepts}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl border border-stone-300 transition-colors shrink-0 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>{isGenerating ? 'Exploring...' : 'Re-Explore Concepts'}</span>
        </button>
      </div>

      {/* User Creative Direction Override */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
        <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider">
          Creative Direction (User Instructions Take Precedence)
        </label>
        <textarea
          rows={2}
          value={creativeDirection}
          onChange={(e) => handleCreativeDirectionChange(e.target.value)}
          placeholder="e.g. Use the museum catalog layout as primary, but incorporate woodcut linework from the crest concept..."
          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs placeholder-stone-400 focus:outline-none focus:border-amber-600"
        />
      </div>

      {/* Concepts Cards Grid */}
      {project.visualConcepts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-2xs">
          <p className="text-stone-500 text-xs">No visual concepts generated yet.</p>
          <button
            type="button"
            onClick={onExploreConcepts}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-2xs"
          >
            Explore 5 Visual Concepts
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {project.visualConcepts.map((concept, idx) => {
            const role = selections[concept.id] || 'secondary';
            const isPrimary = role === 'primary';
            const isSaved = concept.id ? savedConceptIds.includes(concept.id) : false;

            return (
              <div
                key={concept.id || idx}
                className={`rounded-2xl border transition-all p-6 space-y-5 shadow-2xs ${
                  isPrimary
                    ? 'bg-amber-50/60 border-amber-400 text-stone-900 ring-1 ring-amber-300'
                    : role === 'avoid'
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : 'bg-white border-stone-200/80 hover:border-stone-300'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-amber-800 font-semibold">0{idx + 1}.</span>
                      <h3 className="text-lg font-serif text-stone-900 font-semibold">{concept.conceptName}</h3>
                      {concept.modelUsed && (
                        <span className="text-[10px] font-mono text-stone-600 bg-stone-100/90 px-2 py-0.5 rounded-md border border-stone-200 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-amber-700" />
                          <span>Generated with {concept.modelUsed}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-900 italic mt-1 font-serif">{concept.coreVisualIdea}</p>
                  </div>

                  {/* Actions: Bookmark Save + Role Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleSaveConcept(concept, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isSaved
                          ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                          : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                      }`}
                      title={isSaved ? 'Saved in Concept Library' : 'Save to Concept Library'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300">
                      <button
                        type="button"
                        onClick={() => setRole(concept.id, 'primary')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                          isPrimary
                            ? 'bg-stone-900 text-white font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Primary
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole(concept.id, 'secondary')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                          role === 'secondary'
                            ? 'bg-white text-stone-900 border border-stone-300 font-medium'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Secondary
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole(concept.id, 'incorporate')}
                        className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                          role === 'incorporate'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-medium'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Incorporate
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole(concept.id, 'avoid')}
                        className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                          role === 'avoid'
                            ? 'bg-red-100 text-red-900 border border-red-300 font-medium'
                            : 'text-stone-600 hover:text-red-700'
                        }`}
                      >
                        Avoid
                      </button>
                    </div>
                  </div>
                </div>

                {/* Structured Metadata Breakdown with Icons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700">
                  <div className="space-y-3">
                    <div>
                      <span className="text-stone-500 font-medium block mb-1">Why It Works:</span>
                      <p className="text-stone-800 leading-relaxed">{concept.whyItWorks}</p>
                    </div>

                    <div className="flex items-start gap-2">
                      <Layout className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 font-medium block">Composition:</span>
                        <p className="text-stone-800">{concept.composition}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-stone-500 font-medium block mb-1">Key Visual Elements:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {concept.keyVisualElements.map((elem, eIdx) => (
                          <span
                            key={eIdx}
                            className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-800 rounded-md text-[11px]"
                          >
                            {elem}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Type className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 font-medium block">Typography:</span>
                        <p className="text-stone-800">{concept.typographyDirection}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <PenTool className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 font-medium block">Illustration / Art Style:</span>
                        <p className="text-stone-800">{concept.illustrationDirection}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Package className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 font-medium block">Product Suitability:</span>
                        <p className="text-stone-800">{concept.possibleProductSuitability}</p>
                      </div>
                    </div>

                    {concept.potentialRisks && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-amber-800 font-medium block">Potential Risks:</span>
                          <p className="text-stone-600">{concept.potentialRisks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-stone-200">
        <div className="text-xs text-stone-500">
          {!hasPrimary ? (
            <span className="text-amber-800 font-medium">Tip: Click "Primary" on your preferred direction above.</span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Primary concept selected!
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onNextStep}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-all shadow-2xs"
        >
          <span>Continue to Inspiration Library</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
