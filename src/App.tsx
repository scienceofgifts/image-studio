import React, { useState, useEffect } from 'react';
import { MainView, ImageProject, SavedConceptItem, InspirationReference, SynthesisConcept, IdeaExplorerIdea } from './types';
import { getImageProjects, saveImageProject, syncDataFromCloud, DEFAULT_PROMPT_INSTRUCTIONS } from './utils/storage';
import { Navigation } from './components/Navigation';
import { ImageStudioWorkspace } from './components/image-studio/ImageStudioWorkspace';
import { GalleryView } from './components/gallery/GalleryView';
import { InspirationGallery } from './components/inspiration/InspirationGallery';
import { VisualProfilesView } from './components/profiles/VisualProfilesView';
import { IdeaExplorerWorkspace } from './components/idea-explorer/IdeaExplorerWorkspace';
import { LegacyPromptGenerator } from './components/image-studio/LegacyPromptGenerator';
import { SettingsModal } from './components/settings/SettingsModal';
import { NewProjectModal } from './components/common/NewProjectModal';
import { FolderKanban, Plus, Sparkles, LayoutGrid, Image as ImageIcon, Sliders, ArrowRight, RefreshCw } from 'lucide-react';

import { handleGlobalEscapeKey, useOverlay } from './utils/overlayManager';
import { getApiUrl } from './services/apiConfig';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOutUser, subscribeToAuthChanges } from './services/firebase';

export default function App() {
  const [activeView, setActiveView] = useState<MainView>('projects');
  const [projects, setProjects] = useState<ImageProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [activeStep, setActiveStep] = useState<string>('idea');

  // Auth & Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncDataFromCloud();
    } catch (err) {
      console.warn('[Cloud Sync] Notice during manual sync:', err);
    } finally {
      setIsSyncing(false);
      refreshData();
    }
  };

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      if (user) {
        handleManualSync();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      refreshData();
      setIsSyncing(true);
      try {
        await syncDataFromCloud();
      } catch (err) {
        console.warn('Initial cloud sync notice:', err);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
          refreshData();
        }
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        await handleManualSync();
      }
    } catch (err) {
      console.warn('Sign in notice:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

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

  const handleCreateProjectFromIdea = (idea: IdeaExplorerIdea) => {
    const conceptId = `concept-${Date.now()}`;
    const newProj: ImageProject = {
      id: `proj-${Date.now()}`,
      title: idea.title || 'Idea Project',
      status: 'concepts',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageIdea: {
        idea: `${idea.title} - ${idea.description}`,
        productType: idea.refinementSnapshot?.intendedUse || 'Graphic Artwork / Apparel',
        intendedUse: idea.refinementSnapshot?.intendedUse || 'High-quality standalone artwork and print graphic',
        audience: idea.refinementSnapshot?.audience || 'General enthusiasts',
        subject: idea.corePremise || idea.title,
        desiredMood: idea.tags?.join(', ') || 'Sophisticated, thoughtful',
        userNotes: (idea.executionSuggestions && idea.executionSuggestions.length > 0)
          ? `Execution suggestions:\n${idea.executionSuggestions.map(s => `- ${s}`).join('\n')}`
          : '',
        constraints: idea.refinementSnapshot?.excludeElements?.join(', ') || ''
      },
      outputMode: 'Finished Artwork',
      intendedOutput: 'Graphic Artwork',
      visualConcepts: [{
        id: conceptId,
        conceptName: idea.title,
        coreVisualIdea: idea.corePremise || idea.description,
        whyItWorks: idea.description,
        composition: 'Balanced central graphic focal point',
        keyVisualElements: idea.tags || [idea.title],
        typographyDirection: 'Clean editorial typography',
        illustrationDirection: idea.executionSuggestions?.[0] || 'Detailed graphic vector illustration',
        overallCharacter: idea.tags?.[0] || 'Distinctive design',
        possibleProductSuitability: idea.refinementSnapshot?.intendedUse || 'Apparel & Prints',
        potentialRisks: 'Ensure typography remains legible on darker substrates'
      }],
      conceptSelections: { [conceptId]: 'primary' },
      creativeDirection: idea.corePremise || idea.description,
      inspirationReferences: [],
      selectedReferenceCharacteristics: [],
      visualDirection: {
        composition: 'Balanced central graphic focal point',
        typography: 'Editorial typographic accents',
        illustration: idea.executionSuggestions?.[0] || 'Graphic linework and tonal rendering',
        color: 'Curated harmonic palette',
        texture: 'Subtle paper grain',
        era: 'Contemporary archival',
        mood: idea.tags?.join(', ') || 'Sophisticated, thoughtful',
        visualHierarchy: 'Primary focal illustration with supporting typography'
      },
      promptInstructions: DEFAULT_PROMPT_INSTRUCTIONS
    };
    saveImageProject(newProj);
    refreshData();
    setActiveProjectId(newProj.id);
    setActiveStep('concepts');
    setActiveView('project-detail');
  };

  // AI API wrapper for inspiration analysis in Gallery
  const handleAnalyzeReferenceGlobal = async (ref: InspirationReference) => {
    const res = await fetch(getApiUrl('/api/image-studio/analyze-reference'), {
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
      {/* Redesigned Navigation with Auth & Sync */}
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
        currentUser={currentUser}
        isSyncing={isSyncing}
        onSyncData={handleManualSync}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'projects' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Image Studio Projects</h1>
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  Conceptualize, refine visual directions, and generate production-ready AI image prompts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 rounded-xl border border-stone-300 transition-colors shadow-2xs"
                  title="Force refresh & sync with Firebase Cloud"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
                </button>

                <button
                  onClick={() => {
                    setInitialConceptForNewProj(null);
                    setInitialInspForNewProj(null);
                    setIsNewProjectModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors shadow-2xs font-sans"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center space-y-4 shadow-2xs max-w-lg mx-auto my-12">
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-stone-900">No Image Projects Yet</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Start a new project to conceptualize visual themes, analyze reference artwork, and generate high-fidelity AI prompts.
                </p>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-xl transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Create First Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => handleOpenProject(proj.id)}
                    className="group bg-white border border-stone-200/80 hover:border-amber-400/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                          {proj.status}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(proj.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-serif font-semibold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {proj.imageIdea?.idea || 'No description entered yet.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span className="font-mono text-[11px] text-stone-500">
                        {proj.intendedOutput || 'Artwork'}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-stone-700 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all">
                        <span>Open Studio</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'project-detail' && (
          <ImageStudioWorkspace
            projectId={activeProjectId}
            activeStep={activeStep}
            onSelectStep={setActiveStep}
            onBackToProjects={() => setActiveView('projects')}
            onUpdateProject={() => refreshData()}
          />
        )}

        {activeView === 'gallery' && (
          <GalleryView
            projects={projects}
            onOpenProject={(id) => handleOpenProject(id)}
            onCreateProjectFromConcept={handleCreateProjectFromConcept}
            onCreateProjectFromSynthesis={handleCreateProjectFromSynthesis}
            onRefreshData={refreshData}
          />
        )}

        {activeView === 'idea-explorer' && (
          <IdeaExplorerWorkspace
            onCreateProjectFromIdea={handleCreateProjectFromIdea}
          />
        )}

        {activeView === 'inspiration' && (
          <InspirationGallery
            onAnalyzeReference={handleAnalyzeReferenceGlobal}
            onCreateProjectFromInspiration={handleCreateProjectFromInspiration}
            onCreateProjectFromSynthesis={handleCreateProjectFromSynthesis}
            onRefreshData={refreshData}
            isAnalyzing={false}
          />
        )}

        {activeView === 'profiles' && (
          <VisualProfilesView
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreatedNewProject}
        initialSavedConcept={initialConceptForNewProj}
        initialInspirationRef={initialInspForNewProj}
      />

      <LegacyPromptGenerator
        isOpen={isQuickPrompterOpen}
        onClose={() => setIsQuickPrompterOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataRestored={refreshData}
      />
    </div>
  );
}
