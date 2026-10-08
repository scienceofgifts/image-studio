import React, { useState } from 'react';
import { ImageProject, ImageIdea, OutputMode, StructuredVisualDirection } from '../../types';
import { StructuredVisualParametersSelector } from './StructuredVisualParametersSelector';
import { ModelSelector } from '../common/ModelSelector';
import { getGlobalDefaultModel } from '../../utils/models';
import { Sparkles, Lightbulb, Package, Check, ArrowRight, Compass, Image as ImageIcon } from 'lucide-react';

interface IdeaStepProps {
  project: ImageProject;
  onUpdateProject: (updated: ImageProject) => void;
  onExploreConcepts: (modelOverride?: string) => void;
  isGenerating: boolean;
}

export const IdeaStep: React.FC<IdeaStepProps> = ({
  project,
  onUpdateProject,
  onExploreConcepts,
  isGenerating
}) => {
  const [idea, setIdea] = useState<ImageIdea>(project.imageIdea);
  const [outputMode, setOutputMode] = useState<OutputMode>(project.outputMode || 'Finished Artwork');
  const [intendedOutput, setIntendedOutput] = useState<string>(project.intendedOutput || 'T-Shirt Graphic');
  const [creativeDir, setCreativeDir] = useState<string>(project.creativeDirection || '');
  const [conceptTaskModel, setConceptTaskModel] = useState<string>(getGlobalDefaultModel());

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
    setIntendedOutput(p);
    updateIdeaField('productType', p);
    onUpdateProject({
      ...project,
      intendedOutput: p
    });
  };

  const handleModeSelect = (mode: OutputMode) => {
    setOutputMode(mode);
    onUpdateProject({ ...project, outputMode: mode });
  };

  const handleVisualDirectionChange = (updatedDirection: StructuredVisualDirection) => {
    onUpdateProject({
      ...project,
      visualDirection: updatedDirection
    });
  };

  const handleCreativeDirectionChange = (val: string) => {
    setCreativeDir(val);
    onUpdateProject({
      ...project,
      creativeDirection: val
    });
  };

  const sampleIdeas = ['History Teacher', 'Civil War History Buff', 'Viking Mythology', 'Filmmaker', 'Psychology Professor', 'Botanical Explorer'];

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
              STAGE 01 · VISUAL FOUNDATION
            </span>
            <h2 className="text-xl font-serif text-stone-900 font-semibold">Image Idea &amp; Visual Direction</h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Start with your core subject and select visual parameters below. Image Studio will translate your choices into 5 distinct visual design concepts.
            </p>
          </div>
        </div>
      </div>

      {/* Freeform Core Idea Input */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
        <div>
          <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
            Core Image Subject / Idea <span className="text-amber-700">*</span>
          </label>
          <input
            type="text"
            value={idea.idea}
            onChange={(e) => updateIdeaField('idea', e.target.value)}
            placeholder="e.g. History Teacher, Civil War Buff, Viking Mythology, Filmmaker..."
            className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-base placeholder-stone-400 focus:outline-none focus:border-amber-600 transition-colors shadow-2xs"
          />
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 flex-wrap">
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

      {/* Full Structured Visual Parameters Selector */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs">
        <StructuredVisualParametersSelector
          value={project.visualDirection}
          onChange={handleVisualDirectionChange}
          creativeDirection={creativeDir}
          onCreativeDirectionChange={handleCreativeDirectionChange}
        />
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
          <span>{isGenerating ? 'Generating 5 Concepts...' : 'Explore 5 Visual Concepts'}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
