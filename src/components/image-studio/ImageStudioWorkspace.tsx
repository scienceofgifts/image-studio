import React, { useState, useEffect } from 'react';
import { ImageProject } from '../../types';
import { getImageProjects, saveImageProject, safeStringify } from '../../utils/storage';
import { getModelConfig } from '../../utils/models';
import { getApiUrl } from '../../services/apiConfig';
import { IdeaStep } from './IdeaStep';
import { DirectionStep } from './DirectionStep';
import { BriefStep } from './BriefStep';
import { PromptStep } from './PromptStep';
import { Lightbulb, Compass, FileText, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

interface ImageStudioWorkspaceProps {
  projectId: string;
  activeStep: string;
  onSelectStep: (step: string) => void;
  onBackToProjects: () => void;
  onUpdateProject?: (updated: ImageProject) => void;
}

export const ImageStudioWorkspace: React.FC<ImageStudioWorkspaceProps> = ({
  projectId,
  activeStep,
  onSelectStep,
  onBackToProjects,
  onUpdateProject
}) => {
  const [projects, setProjects] = useState<ImageProject[]>(() => getImageProjects());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setProjects(getImageProjects());
  }, [projectId]);

  useEffect(() => {
    const handleStorageUpdated = () => {
      setProjects(getImageProjects());
    };
    window.addEventListener('sog-storage-updated', handleStorageUpdated);
    return () => {
      window.removeEventListener('sog-storage-updated', handleStorageUpdated);
    };
  }, []);

  // Normalize any legacy step IDs ('concepts' -> 'idea', 'inspiration' -> 'direction')
  const normalizedStep =
    activeStep === 'concepts'
      ? 'idea'
      : activeStep === 'inspiration'
      ? 'direction'
      : activeStep;

  useEffect(() => {
    if (activeStep === 'concepts') {
      onSelectStep('idea');
    } else if (activeStep === 'inspiration') {
      onSelectStep('direction');
    }
  }, [activeStep, onSelectStep]);

  const activeProject =
    projects.find(p => p.id === projectId) ||
    getImageProjects().find(p => p.id === projectId) ||
    projects[0];

  const handleUpdateProject = (updated: ImageProject) => {
    saveImageProject(updated);
    setProjects(getImageProjects());
    if (onUpdateProject) {
      onUpdateProject(updated);
    }
  };

  const steps = [
    { id: 'idea', label: '1. Idea & Concepts', icon: Lightbulb },
    { id: 'direction', label: '2. Visual Direction', icon: Compass },
    { id: 'brief', label: '3. Design Brief', icon: FileText },
    { id: 'prompt', label: '4. Prompt Package', icon: Sparkles }
  ];

  const handleExploreConcepts = async (modelOverride?: string) => {
    if (!activeProject) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await fetch(getApiUrl('/api/image-studio/explore-concepts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify({
          ...activeProject.imageIdea,
          model: modelOverride
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to explore concepts');

      const conceptsWithModel = (data.concepts || []).map((c: any, idx: number) => ({
        ...c,
        id: c.id || 'concept-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
        modelUsed: data.modelUsed
          ? getModelConfig(data.modelUsed).displayName
          : modelOverride
          ? getModelConfig(modelOverride).displayName
          : undefined
      }));

      const updatedProject: ImageProject = {
        ...activeProject,
        status: 'concepts',
        visualConcepts: conceptsWithModel,
        conceptSelections: {}
      };
      handleUpdateProject(updatedProject);
      // Stay on 'idea' ("Idea & Concepts") so the user can review concepts and pick a Primary concept
    } catch (err: any) {
      console.error('Error exploring concepts:', err);
      setErrorMessage(err.message || 'Error generating concepts');
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
        selectedReferenceCharacteristics: activeProject.selectedReferenceCharacteristics || [],
        visualDirection: activeProject.visualDirection,
        outputMode: activeProject.outputMode,
        intendedOutput: activeProject.intendedOutput,
        model: modelOverride
      };

      const res = await fetch(getApiUrl('/api/image-studio/create-brief'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
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

      const res = await fetch(getApiUrl('/api/image-studio/generate-prompt'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'TEXTAREA' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'BUTTON')
      ) {
        return;
      }
      if (isGenerating || !activeProject) return;

      if (normalizedStep === 'idea') {
        const hasConcepts = (activeProject.visualConcepts?.length || 0) > 0;
        const hasPrimary = Object.values(activeProject.conceptSelections || {}).some(r => r === 'primary');
        if (hasConcepts && hasPrimary) {
          e.preventDefault();
          onSelectStep('direction');
        }
      } else if (normalizedStep === 'direction') {
        e.preventDefault();
        onSelectStep('brief');
      } else if (normalizedStep === 'brief') {
        if (activeProject.designBrief) {
          e.preventDefault();
          onSelectStep('prompt');
        }
      }
    }
  };

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-stone-500">Loading project...</div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf9f6] text-stone-900 flex flex-col" onKeyDown={handleKeyDown}>
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
              const isActive = normalizedStep === step.id;
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

        {normalizedStep === 'idea' && (
          <IdeaStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onExploreConcepts={handleExploreConcepts}
            onNextStep={() => onSelectStep('direction')}
            isGenerating={isGenerating}
          />
        )}

        {normalizedStep === 'direction' && (
          <DirectionStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onNextStep={() => onSelectStep('brief')}
          />
        )}

        {normalizedStep === 'brief' && (
          <BriefStep
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onCreateBrief={handleCreateBrief}
            onNextStep={() => onSelectStep('prompt')}
            isGenerating={isGenerating}
          />
        )}

        {normalizedStep === 'prompt' && (
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
