import React, { useState, useEffect } from 'react';
import { MainView, ImageProject, SavedConceptItem, InspirationReference, SynthesisConcept } from './types';
import { getImageProjects, saveImageProject, DEFAULT_PROMPT_INSTRUCTIONS } from './utils/storage';
import { Navigation } from './components/Navigation';
import { ImageStudioWorkspace } from './components/image-studio/ImageStudioWorkspace';
import { GalleryView } from './components/gallery/GalleryView';
import { InspirationGallery } from './components/inspiration/InspirationGallery';
import { VisualProfilesView } from './components/profiles/VisualProfilesView';
import { LegacyPromptGenerator } from './components/image-studio/LegacyPromptGenerator';
import { SettingsModal } from './components/settings/SettingsModal';
import { NewProjectModal } from './components/common/NewProjectModal';
import { FolderKanban, Plus, Sparkles, LayoutGrid, Image as ImageIcon, Sliders, ArrowRight } from 'lucide-react';

import { handleGlobalEscapeKey, useOverlay } from './utils/overlayManager';

export default function App() {
  const [activeView, setActiveView] = useState<MainView>('projects');
  const [projects, setProjects] = useState<ImageProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [activeStep, setActiveStep] = useState<string>('idea');

  // Modals
  const [isQuickPrompterOpen, setIsQuickPrompterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [initialConceptForNewProj, setInitialConceptForNewProj] = useState<SavedConceptItem | null>(null);
  const [initialInspForNewProj, setInitialInspForNewProj] = useState<InspirationReference | null>(null);

  // Register central Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        handleGlobalEscapeKey(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Register top-level App modals with central overlay manager
  useOverlay(isQuickPrompterOpen, () => setIsQuickPrompterOpen(false), 'app-quick-prompter');
  useOverlay(isSettingsOpen, () => setIsSettingsOpen(false), 'app-settings-modal');
  useOverlay(isNewProjectModalOpen, () => setIsNewProjectModalOpen(false), 'app-new-project-modal');

  const refreshData = () => {
    const loaded = getImageProjects();
    setProjects(loaded);
    if (loaded.length > 0 && !activeProjectId) {
      setActiveProjectId(loaded[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenProject = (id: string, step = 'idea') => {
    setActiveProjectId(id);
    setActiveStep(step);
    setActiveView('project-detail');
  };

  const handleCreateProjectFromConcept = (concept: SavedConceptItem) => {
    setInitialConceptForNewProj(concept);
    setInitialInspForNewProj(null);
    setIsNewProjectModalOpen(true);
  };

  const handleCreateProjectFromInspiration = (ref: InspirationReference) => {
    setInitialInspForNewProj(ref);
    setInitialConceptForNewProj(null);
    setIsNewProjectModalOpen(true);
  };

  const handleCreateProjectFromSynthesis = (concept: SynthesisConcept) => {
    const newProj: ImageProject = {
      id: 'proj-' + Date.now(),
      title: concept.conceptTitle,
      status: 'direction',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageIdea: {
        idea: concept.conceptTitle,
        productType: concept.productSuitability || 'Finished Artwork',
        intendedUse: 'Print-on-demand artwork and gift graphic',
        audience: 'General audience',
        subject: concept.topic || concept.conceptTitle,
        desiredMood: concept.designMechanism || 'Artistic',
        userNotes: concept.coreIdea,
        constraints: 'Clean vector linework'
      },
      outputMode: 'Finished Artwork',
      intendedOutput: 'Graphic Artwork',
      visualConcepts: [{
        id: 'concept-syn-1',
        conceptName: concept.conceptTitle,
        coreVisualIdea: concept.coreIdea,
        whyItWorks: concept.whyConceptWorks,
        composition: concept.composition,
        keyVisualElements: [concept.topic, concept.designMechanism],
        typographyDirection: concept.typography,
        illustrationDirection: concept.imageryIllustration,
        overallCharacter: concept.designMechanism,
        possibleProductSuitability: concept.productSuitability,
        potentialRisks: concept.potentialRisk
      }],
      conceptSelections: { 'concept-syn-1': 'primary' },
      creativeDirection: concept.coreIdea,
      inspirationReferences: [],
      selectedReferenceCharacteristics: [],
      visualDirection: {
        composition: concept.composition,
        typography: concept.typography,
        illustration: concept.imageryIllustration,
        color: concept.colorDirection,
        texture: 'Clean paper grain texture',
        era: 'Modern design synthesis',
        mood: concept.designMechanism,
        visualHierarchy: 'Centered focal point'
      },
      promptInstructions: DEFAULT_PROMPT_INSTRUCTIONS
    };
    saveImageProject(newProj);
    refreshData();
    setActiveProjectId(newProj.id);
    setActiveStep('direction');
    setActiveView('project-detail');
  };

  const handleCreatedNewProject = (newProj: ImageProject) => {
    saveImageProject(newProj);
    refreshData();
    setActiveProjectId(newProj.id);
    setActiveStep(newProj.status === 'concepts' ? 'concepts' : 'idea');
    setActiveView('project-detail');
  };

  // AI API wrapper for inspiration analysis in Gallery
  const handleAnalyzeReferenceGlobal = async (ref: InspirationReference) => {
    const res = await fetch('/api/image-studio/analyze-reference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceName: ref.name,
        referenceType: ref.type,
        notes: ref.notes,
        imageDataBase64: ref.imageDataUrl
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Analysis failed');
    return data.analysis;
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-stone-900 selection:bg-amber-200 selection:text-amber-950">
      {/* Redesigned Navigation */}
      <Navigation
        activeView={activeView}
        onSelectView={setActiveView}
        onNewProject={() => {
          setInitialConceptForNewProj(null);
          setInitialInspForNewProj(null);
          setIsNewProjectModalOpen(true);
        }}
        onOpenQuickPrompter={() => setIsQuickPrompterOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Router */}

      {/* VIEW 1: PROJECTS DASHBOARD */}
      {activeView === 'projects' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
            <div>
              <h1 className="text-2xl font-serif text-stone-900 font-semibold tracking-tight">
                Image Design Projects
              </h1>
              <p className="text-xs text-stone-600 mt-1">
                Conceptualize, refine, and document visual designs for Science of Gifts artwork and prompts.
              </p>
            </div>

            <button
              onClick={() => {
                setInitialConceptForNewProj(null);
                setInitialInspForNewProj(null);
                setIsNewProjectModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleOpenProject(proj.id)}
                className="bg-white border border-stone-200/80 hover:border-amber-400/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-900 font-semibold uppercase tracking-wider px-2 py-0.5 bg-amber-100 rounded-md border border-amber-300">
                      {proj.status}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2">
                    Idea: {proj.imageIdea.idea} · Medium: {proj.intendedOutput}
                  </p>

                  {proj.finalPrompt && (
                    <p className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200 line-clamp-2 italic">
                      "{proj.finalPrompt}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 group-hover:text-amber-900 font-medium transition-colors">
                  <span>Open Design Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PROJECT DETAIL WORKFLOW */}
      {activeView === 'project-detail' && (
        <ImageStudioWorkspace
          projectId={activeProjectId}
          activeStep={activeStep}
          onSelectStep={setActiveStep}
          onBackToProjects={() => setActiveView('projects')}
        />
      )}

      {/* VIEW 3: SAVED CONCEPT & PROJECT GALLERY */}
      {activeView === 'gallery' && (
        <GalleryView
          projects={projects}
          onOpenProject={(id) => handleOpenProject(id)}
          onCreateProjectFromConcept={handleCreateProjectFromConcept}
          onCreateProjectFromSynthesis={handleCreateProjectFromSynthesis}
          onRefreshData={refreshData}
        />
      )}

      {/* VIEW 4: INSPIRATION LIBRARY */}
      {activeView === 'inspiration' && (
        <InspirationGallery
          onAnalyzeReference={handleAnalyzeReferenceGlobal}
          onCreateProjectFromInspiration={handleCreateProjectFromInspiration}
          onCreateProjectFromSynthesis={handleCreateProjectFromSynthesis}
          onRefreshData={refreshData}
          isAnalyzing={false}
        />
      )}

      {/* VIEW 5: VISUAL PROFILES */}
      {activeView === 'profiles' && (
        <VisualProfilesView onRefreshData={refreshData} />
      )}

      {/* MODALS */}
      <LegacyPromptGenerator
        isOpen={isQuickPrompterOpen}
        onClose={() => setIsQuickPrompterOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataRestored={refreshData}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreatedNewProject}
        initialSavedConcept={initialConceptForNewProj}
        initialInspirationRef={initialInspForNewProj}
      />
    </div>
  );
}
