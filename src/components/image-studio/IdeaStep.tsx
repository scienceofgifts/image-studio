import React, { useState, useEffect, useRef } from 'react';
import { ImageProject, ImageIdea, OutputMode, VisualConcept, ConceptRole } from '../../types';
import { getSavedConcepts, saveConceptToGallery, removeSavedConcept } from '../../utils/storage';
import { ModelSelector } from '../common/ModelSelector';
import { getGlobalDefaultModel } from '../../utils/models';
import {
  Sparkles,
  Lightbulb,
  Package,
  Check,
  ArrowRight,
  Compass,
  Image as ImageIcon,
  Bookmark,
  Layout,
  Type,
  PenTool,
  AlertTriangle,
  Cpu,
  Layers
} from 'lucide-react';

interface IdeaStepProps {
  project: ImageProject;
  onUpdateProject: (updated: ImageProject) => void;
  onExploreConcepts: (modelOverride?: string) => void;
  onNextStep: () => void;
  isGenerating: boolean;
}

export const IdeaStep: React.FC<IdeaStepProps> = ({
  project,
  onUpdateProject,
  onExploreConcepts,
  onNextStep,
  isGenerating
}) => {
  const [idea, setIdea] = useState<ImageIdea>(project.imageIdea);
  const [outputMode, setOutputMode] = useState<OutputMode>(project.outputMode || 'Finished Artwork');
  const [intendedOutput, setIntendedOutput] = useState<string>(project.intendedOutput || 'T-Shirt Graphic');
  const [conceptTaskModel, setConceptTaskModel] = useState<string>(getGlobalDefaultModel());

  const [selections, setSelections] = useState<Record<string, ConceptRole>>(project.conceptSelections || {});
  const [creativeDirection, setCreativeDirection] = useState<string>(project.creativeDirection || '');
  const [savedConceptIds, setSavedConceptIds] = useState<string[]>(() => {
    return getSavedConcepts()
      .map(c => c.concept?.id)
      .filter((id): id is string => typeof id === 'string' && id !== '');
  });

  const conceptsSectionRef = useRef<HTMLDivElement>(null);
  const prevConceptsCountRef = useRef<number>(project.visualConcepts?.length || 0);

  // Sync local state when project changes
  useEffect(() => {
    setIdea(project.imageIdea);
    setOutputMode(project.outputMode || 'Finished Artwork');
    setIntendedOutput(project.intendedOutput || 'T-Shirt Graphic');
    setSelections(project.conceptSelections || {});
    setCreativeDirection(project.creativeDirection || '');
    setSavedConceptIds(
      getSavedConcepts()
        .map(c => c.concept?.id)
        .filter((id): id is string => typeof id === 'string' && id !== '')
    );
  }, [
    project.id,
    project.imageIdea,
    project.outputMode,
    project.intendedOutput,
    project.conceptSelections,
    project.creativeDirection
  ]);

  // Ensure all visualConcepts have stable IDs
  useEffect(() => {
    let hasChanges = false;
    const sanitizedConcepts = (project.visualConcepts || []).map((c, idx) => {
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
  }, [project.visualConcepts, project.id]);

  // Smoothly scroll to concepts section when concepts are newly generated
  useEffect(() => {
    const currentCount = project.visualConcepts?.length || 0;
    if (currentCount > 0 && prevConceptsCountRef.current === 0 && !isGenerating) {
      conceptsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevConceptsCountRef.current = currentCount;
  }, [project.visualConcepts?.length, isGenerating]);

  const products = ['T-Shirt', 'Hoodie', 'Mug', 'Poster', 'Journal', 'Water Bottle', 'Scientific Print', 'Other'];
  const outputTypes = [
    { mode: 'Finished Artwork', title: 'Finished Artwork', desc: 'Standalone graphic ready for reproduction', icon: ImageIcon },
    { mode: 'Product Mockup', title: 'Product Mockup', desc: 'Design shown on a physical product', icon: Package }
  ];

  const updateIdeaField = (field: keyof ImageIdea, value: string) => {
    const updatedIdea = { ...idea, [field]: value };
    setIdea(updatedIdea);
    onUpdateProject({
      ...project,
      title: updatedIdea.idea ? `${updatedIdea.idea} Design` : project.title,
      imageIdea: updatedIdea
    });
  };

  const handleProductSelect = (p: string) => {
    const updatedIdea = { ...idea, productType: p };
    setIntendedOutput(p);
    setIdea(updatedIdea);
    onUpdateProject({
      ...project,
      imageIdea: updatedIdea,
      intendedOutput: p
    });
  };

  const handleModeSelect = (mode: OutputMode) => {
    setOutputMode(mode);
    onUpdateProject({ ...project, outputMode: mode });
  };

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

    const updatedProject: ImageProject = {
      ...project,
      status:
        role === 'primary' && (project.status === 'idea' || project.status === 'concepts')
          ? 'direction'
          : project.status,
      conceptSelections: updated,
      creativeDirection
    };
    onUpdateProject(updatedProject);

    // Selecting a Primary concept automatically advances directly to Visual Direction
    if (role === 'primary') {
      onNextStep();
    }
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

  const sampleIdeas = ['History Teacher', 'Civil War History Buff', 'Viking Mythology', 'Filmmaker', 'Psychology Professor', 'Botanical Explorer'];
  const hasPrimary = Object.values(selections).some(r => r === 'primary');
  const primaryConceptId = Object.keys(selections).find(id => selections[id] === 'primary');
  const primaryConcept = project.visualConcepts?.find(c => c.id === primaryConceptId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100/80 text-amber-800 rounded-xl border border-amber-200/80 shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
              STAGE 01 · IDEA &amp; VISUAL CONCEPTS
            </span>
            <h2 className="text-xl font-serif text-stone-900 font-semibold">Idea &amp; Concepts</h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Define your core subject and product medium, explore 5 distinct visual concepts below, and click <strong>Primary</strong> on your preferred concept to advance directly to Visual Direction.
            </p>
          </div>
        </div>
      </div>

      {/* Freeform Core Idea & Subject Details */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-2xs">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Core Image Subject / Concept <span className="text-amber-700">*</span>
          </label>
          <input
            type="text"
            value={idea.idea}
            onChange={(e) => updateIdeaField('idea', e.target.value)}
            placeholder="e.g. History Teacher, Civil War Buff, Viking Mythology, Filmmaker..."
            className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-base placeholder-stone-400 focus:outline-none focus:border-amber-600 transition-colors shadow-2xs"
          />
          <div className="flex items-center gap-1.5 text-xs text-stone-500 flex-wrap">
            <span className="text-stone-400 font-medium">Quick subjects:</span>
            {sampleIdeas.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => updateIdeaField('idea', sample)}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors border border-stone-200 text-xs"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700">Target Audience / Persona</label>
            <input
              type="text"
              value={idea.audience || ''}
              onChange={(e) => updateIdeaField('audience', e.target.value)}
              placeholder="e.g. History educators, enthusiasts..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700">Desired Emotional Mood / Tone</label>
            <input
              type="text"
              value={idea.desiredMood || ''}
              onChange={(e) => updateIdeaField('desiredMood', e.target.value)}
              placeholder="e.g. Scholarly, witty, nostalgic..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-medium text-stone-700">Specific Symbolism &amp; Thematic Notes</label>
          <textarea
            rows={2}
            value={idea.userNotes || ''}
            onChange={(e) => updateIdeaField('userNotes', e.target.value)}
            placeholder="Describe specific thematic elements, historical period context, or distinctive details..."
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-sans"
          />
        </div>
      </div>

      {/* Intended Product & Output Type */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-2xs">
        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-3 flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-700" />
          <span>Product Medium &amp; Output Mode</span>
        </h3>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-stone-700 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-stone-500" />
            <span>Intended Product / Medium</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => {
              const isSelected = intendedOutput === p || idea.productType === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProductSelect(p)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-amber-100 border-amber-400 text-amber-900 font-semibold shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-stone-100">
          <label className="block text-xs font-medium text-stone-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
            <span>Output Type</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {outputTypes.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = outputMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => handleModeSelect(opt.mode as OutputMode)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-xs text-stone-900 mb-0.5">
                    <span className="flex items-center gap-1.5">
                      <IconComp className="w-3.5 h-3.5 text-amber-700" />
                      {opt.title}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-700" />}
                  </div>
                  <p className="text-[11px] text-stone-500">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Action Button with Model Selector */}
      <div className="flex items-center justify-end gap-3 pt-2 flex-wrap">
        <ModelSelector
          selectedModel={conceptTaskModel}
          onChangeModel={setConceptTaskModel}
          label="Model for Concept Generation"
        />
        <button
          type="button"
          onClick={() => onExploreConcepts(conceptTaskModel)}
          disabled={!idea.idea.trim() || isGenerating}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-xs transition-all shadow-2xs ${
            !idea.idea.trim() || isGenerating
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
              : 'bg-stone-900 hover:bg-stone-800 text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>
            {isGenerating
              ? 'Generating 5 Concepts...'
              : project.visualConcepts && project.visualConcepts.length > 0
              ? 'Re-Explore 5 Visual Concepts'
              : 'Explore 5 Visual Concepts'}
          </span>
        </button>
      </div>

      {/* Generated Concepts Section (Integrated Directly Into Stage 1) */}
      <div ref={conceptsSectionRef} className="space-y-6 pt-4 border-t border-stone-200/80">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100/80 text-amber-800 rounded-xl border border-amber-200/80 shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
                CONCEPT SELECTION · CHOOSE PRIMARY DIRECTION
              </span>
              <h3 className="text-lg font-serif text-stone-900 font-semibold">
                Visual Concepts {project.visualConcepts.length > 0 ? `(${project.visualConcepts.length})` : ''}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Review the generated visual directions for <strong className="text-stone-900">"{project.imageIdea.idea || 'your subject'}"</strong>. Selecting a <strong>Primary</strong> concept will save your selection and automatically advance to Visual Direction.
              </p>
            </div>
          </div>

          {hasPrimary && (
            <button
              type="button"
              onClick={onNextStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-all shrink-0 shadow-2xs"
            >
              <span>Visual Direction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {project.visualConcepts.length > 0 && (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Creative Direction Notes (Optional — User Instructions Take Precedence)
            </label>
            <textarea
              rows={2}
              value={creativeDirection}
              onChange={(e) => handleCreativeDirectionChange(e.target.value)}
              placeholder="e.g. Use the museum catalog layout as primary, but incorporate woodcut linework from the crest concept..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs placeholder-stone-400 focus:outline-none focus:border-amber-600"
            />
          </div>
        )}

        {project.visualConcepts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-2xs">
            <p className="text-stone-500 text-xs">
              {isGenerating
                ? 'Generating 5 creative visual concepts for your idea...'
                : 'No visual concepts generated yet. Click "Explore 5 Visual Concepts" above to generate directions.'}
            </p>
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
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                            isPrimary
                              ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                              : 'text-stone-700 hover:bg-stone-900 hover:text-white'
                          }`}
                          title="Select as Primary concept and proceed to Visual Direction"
                        >
                          <span>Primary</span>
                          <ArrowRight className="w-3 h-3" />
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
                          {(concept.keyVisualElements || []).map((elem, eIdx) => (
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

        {project.visualConcepts.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t border-stone-200">
            <div className="text-xs text-stone-500">
              {!hasPrimary ? (
                <span className="text-amber-800 font-medium">
                  Click &ldquo;Primary&rdquo; on your preferred concept above to automatically advance to Visual Direction.
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Primary concept selected{primaryConcept ? `: "${primaryConcept.conceptName}"` : ''}
                  </span>
                </span>
              )}
            </div>

            {hasPrimary && (
              <button
                type="button"
                onClick={onNextStep}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-all shadow-2xs"
              >
                <span>Proceed to Visual Direction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
