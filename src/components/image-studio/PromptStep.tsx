import React, { useState } from 'react';
import { ImageProject } from '../../types';
import { DEFAULT_PROMPT_INSTRUCTIONS } from '../../utils/storage';
import { ModelSelector } from '../common/ModelSelector';
import { getGlobalDefaultModel } from '../../utils/models';
import { useOverlay } from '../../utils/overlayManager';
import { Sparkles, Copy, Download, Check, RefreshCw, Code, Eye, FileText, ShieldAlert, Cpu } from 'lucide-react';

interface PromptStepProps {
  project: ImageProject;
  onUpdateProject: (updated: ImageProject) => void;
  onGeneratePrompt: (modelOverride?: string) => void;
  isGenerating: boolean;
}

export const PromptStep: React.FC<PromptStepProps> = ({
  project,
  onUpdateProject,
  onGeneratePrompt,
  isGenerating
}) => {
  const [promptTaskModel, setPromptTaskModel] = useState<string>(getGlobalDefaultModel());
  const [instructions, setInstructions] = useState<string>(
    project.promptInstructions || DEFAULT_PROMPT_INSTRUCTIONS
  );
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [showFullPackageModal, setShowFullPackageModal] = useState(false);

  useOverlay(showFullPackageModal, () => setShowFullPackageModal(false), 'prompt-package-modal');

  const handleInstructionsChange = (val: string) => {
    setInstructions(val);
    onUpdateProject({
      ...project,
      promptInstructions: val
    });
  };

  const resetInstructionsToDefault = () => {
    setInstructions(DEFAULT_PROMPT_INSTRUCTIONS);
    onUpdateProject({
      ...project,
      promptInstructions: DEFAULT_PROMPT_INSTRUCTIONS
    });
  };

  const generateFullPackageMarkdown = (): string => {
    const brief = project.designBrief;
    return `# SCIENCE OF GIFTS - IMAGE DESIGN PACKAGE
PROJECT: ${project.title}
CREATED: ${new Date(project.createdAt).toLocaleDateString()}
UPDATED: ${new Date(project.updatedAt).toLocaleDateString()}

---

## 1. PROMPT INSTRUCTIONS
${instructions}

## 2. IMAGE IDEA & TARGET
- Core Idea: ${project.imageIdea.idea}
- Product Type / Medium: ${project.intendedOutput}
- Output Mode: ${project.outputMode}
- Target Audience: ${project.imageIdea.audience}
- Desired Mood: ${project.imageIdea.desiredMood}
- User Notes: ${project.imageIdea.userNotes || 'None'}

## 3. CREATIVE DIRECTION & CONCEPT
- User Creative Direction: ${project.creativeDirection || 'None'}
- Selected Visual Direction:
  * Composition: ${project.visualDirection.composition || 'N/A'}
  * Typography: ${project.visualDirection.typography || 'N/A'}
  * Illustration: ${project.visualDirection.illustration || 'N/A'}
  * Color: ${project.visualDirection.color || 'N/A'}
  * Texture: ${project.visualDirection.texture || 'N/A'}
  * Era: ${project.visualDirection.era || 'N/A'}
  * Mood: ${project.visualDirection.mood || 'N/A'}

## 4. INSPIRATION CHARACTERISTICS
${project.selectedReferenceCharacteristics.map(c => `- [${c.referenceName}] ${c.category.toUpperCase()}: ${c.text}`).join('\n') || 'None'}

## 5. APPROVED DESIGN BRIEF
- SUBJECT: ${brief?.subject || 'N/A'}
- PURPOSE: ${brief?.purpose || 'N/A'}
- COMPOSITION: ${brief?.composition || 'N/A'}
- VISUAL HIERARCHY: ${brief?.visualHierarchy || 'N/A'}
- TYPOGRAPHY: ${brief?.typography || 'N/A'}
- ILLUSTRATION: ${brief?.illustration || 'N/A'}
- COLOR: ${brief?.color || 'N/A'}
- TEXTURE: ${brief?.texture || 'N/A'}
- ERA / REFERENCE LANGUAGE: ${brief?.eraReferenceLanguage || 'N/A'}
- MOOD / CHARACTER: ${brief?.moodCharacter || 'N/A'}
- PRODUCT / PRINT CONSIDERATIONS: ${brief?.productPrintConsiderations || 'N/A'}
- NEGATIVE SPACE: ${brief?.negativeSpace || 'N/A'}
- KEY ELEMENTS: ${(brief?.keyElements || []).join(', ')}
- AVOID EXCLUSIONS: ${(brief?.avoid || []).join(', ')}
- CREATIVE RATIONALE: ${brief?.creativeRationale || 'N/A'}

---

## 6. FINAL GENERATED IMAGE PROMPT
${project.finalPrompt || 'Not generated yet'}

## 7. NEGATIVE PROMPT / EXCLUSIONS
${project.negativePrompt || 'None'}

## 8. MODEL ADVICE
${project.modelNotes || 'Suitable for Google Flow, Midjourney v6, or Gemini image generation.'}
`;
  };

  const handleCopyPrompt = () => {
    if (!project.finalPrompt) return;
    navigator.clipboard.writeText(project.finalPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyFullPackage = () => {
    const markdown = generateFullPackageMarkdown();
    navigator.clipboard.writeText(markdown);
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2000);
  };

  const handleExportFile = (format: 'md' | 'txt') => {
    const content = generateFullPackageMarkdown();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${safeTitle}-design-package.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
            STAGE 06 · FINAL PROMPT TRANSLATION
          </span>
          <h2 className="text-xl font-serif text-stone-900 font-semibold">Prompt Package &amp; Export</h2>
          <p className="text-xs text-stone-600 mt-1">
            Translates your approved Design Brief into clean instructions for external AI image tools (Google Flow, Gemini, ChatGPT, Midjourney).
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <ModelSelector
            selectedModel={promptTaskModel}
            onChangeModel={setPromptTaskModel}
            compact
          />
          <button
            type="button"
            onClick={() => onGeneratePrompt(promptTaskModel)}
            disabled={isGenerating || !project.designBrief}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-xs transition-all shrink-0 shadow-2xs ${
              isGenerating || !project.designBrief
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isGenerating ? 'Translating Prompt...' : project.finalPrompt ? 'Re-Generate Prompt' : 'Generate Prompt'}</span>
          </button>
        </div>
      </div>

      {/* Customizable Prompt Instructions Box */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Customizable Prompt Instructions
          </label>
          <button
            type="button"
            onClick={resetInstructionsToDefault}
            className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Default</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={instructions}
          onChange={(e) => handleInstructionsChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-sans"
        />
      </div>

      {/* Generated Final Prompt View */}
      {project.finalPrompt ? (
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <span className="text-xs font-semibold text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Final Usable Image Prompt
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Prompt'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyFullPackage}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-300 transition-colors shadow-2xs"
              >
                {copiedPackage ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <FileText className="w-3.5 h-3.5 text-amber-700" />}
                <span>{copiedPackage ? 'Copied Full Package!' : 'Copy Full Package'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
            <p className="text-sm font-sans text-stone-900 leading-relaxed select-all">
              {project.finalPrompt}
            </p>
          </div>

          {project.negativePrompt && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-red-900 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Negative Prompt / Exclusions:
              </span>
              <p className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-amber-200 select-all">
                {project.negativePrompt}
              </p>
            </div>
          )}

          {project.modelNotes && (
            <p className="text-xs text-amber-900 font-serif italic">
              💡 Model Advice: {project.modelNotes}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-2xs">
          <p className="text-sm text-stone-800 font-medium">Prompt not generated yet.</p>
          <p className="text-xs text-stone-500">
            Click "Generate Prompt" above to translate your approved brief into final image instructions.
          </p>
        </div>
      )}

      {/* Complete Prompt Package Summary Card */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider font-serif">
            Prompt Package Preview
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFullPackageModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Inspect Package</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportFile('md')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-300 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportFile('txt')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-300 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .TXT</span>
            </button>
          </div>
        </div>

        {/* Structured Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <span className="text-[11px] font-semibold text-amber-900 block uppercase tracking-wider">IMAGE IDEA &amp; TARGET</span>
            <p><strong>Idea:</strong> {project.imageIdea.idea}</p>
            <p><strong>Output Mode:</strong> {project.outputMode}</p>
            <p><strong>Intended Product:</strong> {project.intendedOutput}</p>
            <p><strong>Audience:</strong> {project.imageIdea.audience}</p>
            <p><strong>Mood:</strong> {project.imageIdea.desiredMood}</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <span className="text-[11px] font-semibold text-amber-900 block uppercase tracking-wider">CREATIVE DIRECTION</span>
            <p><strong>Directive:</strong> {project.creativeDirection || 'Default'}</p>
            <p><strong>Composition:</strong> {project.visualDirection.composition || 'N/A'}</p>
            <p><strong>Style:</strong> {project.visualDirection.illustration || 'N/A'}</p>
            <p><strong>Palette:</strong> {project.visualDirection.color || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Full Screen Inspection Modal */}
      {showFullPackageModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-sm font-semibold text-stone-900 font-serif">
                Full Design Package Inspection
              </h3>
              <button
                type="button"
                onClick={() => setShowFullPackageModal(false)}
                className="text-stone-600 hover:text-stone-900 px-3 py-1 rounded-lg bg-stone-200 text-xs font-medium"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-stone-800 whitespace-pre-wrap bg-stone-50/50 leading-relaxed">
              {generateFullPackageMarkdown()}
            </div>

            <div className="p-4 border-t border-stone-200 flex justify-end gap-2 bg-white">
              <button
                type="button"
                onClick={handleCopyFullPackage}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium"
              >
                Copy Full Package Markdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
