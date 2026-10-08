import React, { useState, useEffect } from 'react';
import { ImageProject, InspirationReference, ReferenceAnalysis } from '../../types';
import { getImageProjects, saveImageProject } from '../../utils/storage';
import { getModelConfig } from '../../utils/models';
import { IdeaStep } from './IdeaStep';
import { ConceptsStep } from './ConceptsStep';
import { InspirationStep } from './InspirationStep';
import { DirectionStep } from './DirectionStep';
import { BriefStep } from './BriefStep';
import { PromptStep } from './PromptStep';
import { Lightbulb, Layers, ImageIcon, Compass, FileText, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

interface ImageStudioWorkspaceProps {
  projectId: string;
  activeStep: string;
  onSelectStep: (step: string) => void;
  onBackToProjects: () => void;
}

export const ImageStudioWorkspace: React.FC<ImageStudioWorkspaceProps> = ({
  projectId,
  activeStep,
  onSelectStep,
  onBackToProjects
}) => {
  const [projects, setProjects] = useState<ImageProject[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setProjects(getImageProjects());
  }, [projectId]);

  const activeProject = projects.find(p => p.id === projectId) || projects[0];

  const handleUpdateProject = (updated: ImageProject) => {
    saveImageProject(updated);
    setProjects(getImageProjects());
  };

  const steps = [
    { id: 'idea', label: '1. Idea', icon: Lightbulb },
    { id: 'concepts', label: '2. Concepts', icon: Layers },
    { id: 'inspiration', label: '3. Inspiration', icon: ImageIcon },
    { id: 'direction', label: '4. Direction', icon: Compass },
    { id: 'brief', label: '5. Design Brief', icon: FileText },
    { id: 'prompt', label: '6. Prompt Package', icon: Sparkles }
  ];

  const handleExploreConcepts = async (modelOverride?: string) => {
    if (!activeProject) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/image-studio/explore-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activeProject.imageIdea,
          model: modelOverride
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to explore concepts');

      const conceptsWithModel = (data.concepts || []).map((c: any) => ({
        ...c,
        modelUsed: data.modelUsed ? getModelConfig(data.modelUsed).displayName : (modelOverride ? getModelConfig(modelOverride).displayName : undefined)
      }));

      const updatedProject: ImageProject = {
        ...activeProject,
        status: 'concepts',
        visualConcepts: conceptsWithModel
      };
      handleUpdateProject(updatedProject);
      onSelectStep('concepts');
    } catch (err: any) {
      console.error('Error exploring concepts:', err);
      setErrorMessage(err.message || 'Error generating concepts');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeReference = async (ref: InspirationReference, modelOverride?: string): Promise<ReferenceAnalysis> => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/image-studio/analyze-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceName: ref.name,
          referenceType: ref.type,
          notes: ref.notes,
          imageDataBase64: ref.imageDataUrl,
          model: modelOverride
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to analyze reference');
      return {
        ...data.analysis,
        modelUsed: data.modelUsed ? getModelConfig(data.modelUsed).displayName : undefined
      };
    } catch (err: any) {
      console.error('Error analyzing reference:', err);
      setErrorMessage(err.message || 'Error analyzing reference image');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateBrief = async (modelOverride?: string) => {
    if (!activeProject) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const primaryId = Object.keys(activeProject.conceptSelections).find(
        id => activeProject.conceptSelections[id] === 'primary'
      );
      const primaryConcept = activeProject.visualConcepts.find(c => c.id === primaryId);

      const secondaryIds = Object.keys(activeProject.conceptSelections).filter(
        id => activeProject.conceptSelections[id] === 'secondary' || activeProject.conceptSelections[id] === 'incorporate'
      );
      const secondaryConcepts = activeProject.visualConcepts.filter(c => secondaryIds.includes(c.id));

      const payload = {
        imageIdea: activeProject.imageIdea,
        selectedConcepts: {
          primary: primaryConcept,
          secondary: secondaryConcepts
        },
        creativeDirection: activeProject.creativeDirection,
        selectedReferenceCharacteristics: activeProject.selectedReferenceCharacteristics,
        visualDirection: activeProject.visualDirection,
        outputMode: activeProject.outputMode,
        intendedOutput: activeProject.intendedOutput,
        model: modelOverride
      };

      const res = await fetch('/api/image-studio/create-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create brief');

      const briefWithModel = {
        ...data.brief,
        modelUsed: data.modelUsed ? getModelConfig(data.modelUsed).displayName : undefined
      };

      const updatedProject: ImageProject = {
        ...activeProject,
        status: 'brief',
        designBrief: briefWithModel
      };
      handleUpdateProject(updatedProject);
      onSelectStep('brief');
    } catch (err: any) {
      console.error('Error creating brief:', err);
      setErrorMessage(err.message || 'Error creating design brief');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePrompt = async (modelOverride?: string) => {
    if (!activeProject || !activeProject.designBrief) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const payload = {
        designBrief: activeProject.designBrief,
        promptInstructions: activeProject.promptInstructions,
        visualCharacteristics: activeProject.visualCharacteristics,
        outputMode: activeProject.outputMode,
        intendedOutput: activeProject.intendedOutput,
        creativeDirection: activeProject.creativeDirection,
        model: modelOverride
      };

      const res = await fetch('/api/image-studio/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate prompt');

      const updatedProject: ImageProject = {
        ...activeProject,
        status: 'prompt',
        finalPrompt: data.finalPrompt,
        negativePrompt: data.negativePrompt,
        modelNotes: `${data.modelNotes || ''} (Generated with ${data.modelUsed ? getModelConfig(data.modelUsed).displayName : 'Gemini'})`.trim()
      };
      handleUpdateProject(updatedProject);
      onSelectStep('prompt');
    } catch (err: any) {
      console.error('Error generating prompt:', err);
      setErrorMessage(err.message || 'Error generating final prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-stone-500">Loading project...</div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf9f6] text-stone-900 flex flex-col">
      {/* Project Overview Header */}
      <div className="bg-white border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToProjects}
              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors border border-stone-300"
              title="Back to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-serif font-semibold text-stone-900">{activeProject.title}</h1>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 font-semibold">
                  {activeProject.status}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Core Idea: <strong className="text-stone-900">"{activeProject.imageIdea.idea}"</strong> · Mode: {activeProject.outputMode} ({activeProject.intendedOutput})
              </p>
            </div>
          </div>

          {/* Workflow Steps Horizontal Bar */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300 overflow-x-auto">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => onSelectStep(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Step Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {errorMessage && (
          <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl flex items-center gap-3 text-xs shadow-2xs">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold">✕</button>
          </div>
        )}

        {activeStep === 'idea' && (
          <IdeaStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onExploreConcepts={handleExploreConcepts}
            isGenerating={isGenerating}
          />
        )}

        {activeStep === 'concepts' && (
          <ConceptsStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onExploreConcepts={handleExploreConcepts}
            onNextStep={() => onSelectStep('inspiration')}
            isGenerating={isGenerating}
          />
        )}

        {activeStep === 'inspiration' && (
          <InspirationStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onAnalyzeReference={handleAnalyzeReference}
            onNextStep={() => onSelectStep('direction')}
            isAnalyzing={isGenerating}
          />
        )}

        {activeStep === 'direction' && (
          <DirectionStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onNextStep={() => onSelectStep('brief')}
          />
        )}

        {activeStep === 'brief' && (
          <BriefStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onCreateBrief={handleCreateBrief}
            onNextStep={() => onSelectStep('prompt')}
            isGenerating={isGenerating}
          />
        )}

        {activeStep === 'prompt' && (
          <PromptStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onGeneratePrompt={handleGeneratePrompt}
            isGenerating={isGenerating}
          />
        )}
      </main>
    </div>
  );
};
