import React, { useState } from 'react';
import { ImageProject, DesignBrief } from '../../types';
import { ModelSelector } from '../common/ModelSelector';
import { getGlobalDefaultModel } from '../../utils/models';
import { Sparkles, FileText, ArrowRight, Package, ShieldAlert, Target, Layout, Type, PenTool, Palette, Layers, Smile, Shield, Cpu } from 'lucide-react';

interface BriefStepProps {
  project: ImageProject;
  onUpdateProject: (updated: ImageProject) => void;
  onCreateBrief: (modelOverride?: string) => void;
  onNextStep: () => void;
  isGenerating: boolean;
}

export const BriefStep: React.FC<BriefStepProps> = ({
  project,
  onUpdateProject,
  onCreateBrief,
  onNextStep,
  isGenerating
}) => {
  const brief = project.designBrief;
  const [briefTaskModel, setBriefTaskModel] = useState<string>(getGlobalDefaultModel());

  const updateBriefField = (field: keyof DesignBrief, value: any) => {
    if (!brief) return;
    const updatedBrief = { ...brief, [field]: value };
    onUpdateProject({
      ...project,
      designBrief: updatedBrief
    });
  };

  const updateArrayField = (field: 'keyElements' | 'optionalElements' | 'avoid', valueStr: string) => {
    if (!brief) return;
    const arr = valueStr.split('\n').map(s => s.trim()).filter(Boolean);
    updateBriefField(field, arr);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
            STAGE 05 · MASTER DESIGN BRIEF
          </span>
          <h2 className="text-xl font-serif text-stone-900 font-semibold">Comprehensive Design Brief</h2>
          <p className="text-xs text-stone-600 mt-1">
            Synthesizes all design choices, reference analysis, and product requirements into an authoritative brief that describes an actual visual design.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <ModelSelector
            selectedModel={briefTaskModel}
            onChangeModel={setBriefTaskModel}
            compact
          />
          <button
            type="button"
            onClick={() => onCreateBrief(briefTaskModel)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-xs transition-all bg-stone-900 hover:bg-stone-800 text-white shrink-0 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isGenerating ? 'Synthesizing Brief...' : brief ? 'Re-Create Design Brief' : 'Create Design Brief'}</span>
          </button>
        </div>
      </div>

      {!brief ? (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-2xs">
          <FileText className="w-12 h-12 text-stone-400 mx-auto" />
          <p className="text-stone-800 font-medium text-sm">No Design Brief created yet.</p>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-4">
            Click "Create Design Brief" above to synthesize your idea, selected concepts, inspiration references, and product requirements into a complete design brief.
          </p>
          <div className="flex items-center justify-center gap-3">
            <ModelSelector
              selectedModel={briefTaskModel}
              onChangeModel={setBriefTaskModel}
              compact
            />
            <button
              type="button"
              onClick={() => onCreateBrief(briefTaskModel)}
              disabled={isGenerating}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-2xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Create Design Brief</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mode & Output Specs Bar */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-stone-700 shadow-2xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-800" />
              <span>Output Mode: <strong className="text-stone-900">{project.outputMode}</strong></span>
            </div>
            {brief.modelUsed && (
              <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-700" />
                <span>Generated with {brief.modelUsed}</span>
              </span>
            )}
            <div>
              <span>Product Target: <strong className="text-stone-900">{project.intendedOutput}</strong></span>
            </div>
          </div>

          {/* Section 1: Subject & Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
              <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-800" />
                <span>SUBJECT (What is depicted)</span>
              </label>
              <textarea
                rows={3}
                value={brief.subject}
                onChange={(e) => updateBriefField('subject', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
              <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <span>PURPOSE (Intended Achievement)</span>
              </label>
              <textarea
                rows={3}
                value={brief.purpose}
                onChange={(e) => updateBriefField('purpose', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Section 2: Composition, Hierarchy, Product Considerations */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
              Layout, Hierarchy &amp; Product Realities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-stone-500" />
                  <span>Composition</span>
                </label>
                <textarea
                  rows={4}
                  value={brief.composition}
                  onChange={(e) => updateBriefField('composition', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  <span>Visual Hierarchy</span>
                </label>
                <textarea
                  rows={4}
                  value={brief.visualHierarchy}
                  onChange={(e) => updateBriefField('visualHierarchy', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-800" />
                  <span>Product &amp; Print Considerations</span>
                </label>
                <textarea
                  rows={4}
                  value={brief.productPrintConsiderations}
                  onChange={(e) => updateBriefField('productPrintConsiderations', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Visual Language */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
              Visual Language &amp; Aesthetic Medium
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-stone-500" />
                  <span>Typography</span>
                </label>
                <textarea
                  rows={3}
                  value={brief.typography}
                  onChange={(e) => updateBriefField('typography', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-stone-500" />
                  <span>Illustration Style</span>
                </label>
                <textarea
                  rows={3}
                  value={brief.illustration}
                  onChange={(e) => updateBriefField('illustration', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-stone-500" />
                  <span>Color Palette</span>
                </label>
                <textarea
                  rows={3}
                  value={brief.color}
                  onChange={(e) => updateBriefField('color', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  <span>Texture &amp; Surface</span>
                </label>
                <textarea
                  rows={3}
                  value={brief.texture}
                  onChange={(e) => updateBriefField('texture', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-500" />
                  <span>Era Language</span>
                </label>
                <textarea
                  rows={3}
                  value={brief.eraReferenceLanguage}
                  onChange={(e) => updateBriefField('eraReferenceLanguage', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-stone-500" />
                  <span>Mood &amp; Character</span>
                </label>
                <textarea
                  rows={3}
                  value={brief.moodCharacter}
                  onChange={(e) => updateBriefField('moodCharacter', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Key Elements, Optional, Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
              <label className="block text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                KEY ELEMENTS (Must Appear)
              </label>
              <textarea
                rows={4}
                value={(brief.keyElements || []).join('\n')}
                onChange={(e) => updateArrayField('keyElements', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                OPTIONAL ELEMENTS (May Appear)
              </label>
              <textarea
                rows={4}
                value={(brief.optionalElements || []).join('\n')}
                onChange={(e) => updateArrayField('optionalElements', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
              <label className="block text-xs font-semibold text-red-800 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                AVOID (Exclusions)
              </label>
              <textarea
                rows={4}
                value={(brief.avoid || []).join('\n')}
                onChange={(e) => updateArrayField('avoid', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex justify-end pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={onNextStep}
          disabled={!brief}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-xs transition-all shadow-2xs ${
            !brief
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-stone-900 hover:bg-stone-800 text-white'
          }`}
        >
          <span>Continue to Prompt Package</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
