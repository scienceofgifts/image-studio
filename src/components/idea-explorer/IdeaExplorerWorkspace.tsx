import React, { useState, useEffect, useRef } from 'react';
import {
  IdeaExplorerIdea,
  IdeaExplorerSession,
  IdeaExplorerBatch,
  IdeaExplorerRefinements
} from '../../types/ideaExplorer';
import {
  getIdeaExplorerSessions,
  getIdeaExplorerSession,
  saveIdeaExplorerSession,
  deleteIdeaExplorerSession,
  getActiveIdeaExplorerSessionId,
  setActiveIdeaExplorerSessionId,
  getIdeaExplorerBatch,
  saveIdeaExplorerBatch,
  getIdeaExplorerIdeas,
  saveIdeaExplorerIdeas,
  getIdeaExplorerSavedItems,
  toggleSaveIdeaExplorerItem,
  isIdeaExplorerItemSaved
} from '../../utils/ideaExplorerStorage';
import { getApiUrl, apiFetch } from '../../services/apiConfig';
import { getGlobalDefaultModel } from '../../utils/models';
import { ModelSelector } from '../common/ModelSelector';
import { RefinementsPanel } from './RefinementsPanel';
import { IdeaCard } from './IdeaCard';
import { BranchModal } from './BranchModal';
import { SavedLibraryModal } from './SavedLibraryModal';
import { SessionHistoryModal } from './SessionHistoryModal';
import { IdeaBackupModal } from './IdeaBackupModal';
import {
  Lightbulb,
  Sparkles,
  GitBranch,
  Bookmark,
  History,
  RotateCcw,
  Plus,
  Send,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface IdeaExplorerWorkspaceProps {
  onCreateProjectFromIdea: (idea: IdeaExplorerIdea) => void;
}

const INSPIRATION_CHIPS = [
  'Funny historical quotes for sweatshirts',
  'Abraham Lincoln',
  'World War II',
  'Sophisticated design inspired by ancient Rome',
  'Clever visual metaphor for the passage of time',
  'Victorian botanical specimen sheet',
  'Vintage typography for book lovers',
  'Minimalist Bauhaus diagrams of everyday life'
];

export const IdeaExplorerWorkspace: React.FC<IdeaExplorerWorkspaceProps> = ({
  onCreateProjectFromIdea
}) => {
  // Active session and ideas state
  const [sessions, setSessions] = useState<IdeaExplorerSession[]>([]);
  const [activeSession, setActiveSession] = useState<IdeaExplorerSession | null>(null);
  const [currentBatch, setCurrentBatch] = useState<IdeaExplorerBatch | null>(null);
  const [currentIdeas, setCurrentIdeas] = useState<IdeaExplorerIdea[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Form inputs
  const [topic, setTopic] = useState('');
  const [creativeDirection, setCreativeDirection] = useState('');
  const [refinements, setRefinements] = useState<IdeaExplorerRefinements>({});
  const [selectedModel, setSelectedModel] = useState<string>(getGlobalDefaultModel());

  // Selection & generation states
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Modal dialog states
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchingParents, setBranchingParents] = useState<IdeaExplorerIdea[]>([]);
  const [isSavedLibraryOpen, setIsSavedLibraryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Load state on mount
  useEffect(() => {
    refreshSessions();
    refreshSavedCount();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshSavedCount = () => {
    setSavedCount(getIdeaExplorerSavedItems().length);
  };

  const refreshSessions = () => {
    const loadedSessions = getIdeaExplorerSessions();
    setSessions(loadedSessions);

    const activeId = getActiveIdeaExplorerSessionId();
    let current = loadedSessions.find(s => s.id === activeId) || null;

    if (!current && loadedSessions.length > 0) {
      current = loadedSessions[0];
      setActiveIdeaExplorerSessionId(current.id);
    }

    if (current) {
      setActiveSession(current);
      setTopic(current.originalTopic || '');
      setCreativeDirection(current.creativeDirection || '');
      setRefinements(current.activeRefinements || {});
      loadBatch(current.currentBatchId || current.batchIds[current.batchIds.length - 1]);
    } else {
      setActiveSession(null);
      setCurrentBatch(null);
      setCurrentIdeas([]);
    }
  };

  const loadBatch = (batchId: string) => {
    if (!batchId) return;
    const batch = getIdeaExplorerBatch(batchId);
    if (batch) {
      setCurrentBatch(batch);
      const allIdeas = getIdeaExplorerIdeas();
      const batchIdeas = batch.ideaIds
        .map(id => allIdeas.find(i => i.id === id))
        .filter((i): i is IdeaExplorerIdea => Boolean(i));
      setCurrentIdeas(batchIdeas);
      setSelectedIdeaIds(new Set());
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveIdeaExplorerSessionId(sessionId);
    const session = getIdeaExplorerSession(sessionId);
    if (session) {
      setActiveSession(session);
      setTopic(session.originalTopic || '');
      setCreativeDirection(session.creativeDirection || '');
      setRefinements(session.activeRefinements || {});
      const batchToLoad = session.currentBatchId || session.batchIds[session.batchIds.length - 1];
      loadBatch(batchToLoad);
    }
  };

  const handleStartNewSession = () => {
    setActiveSession(null);
    setCurrentBatch(null);
    setCurrentIdeas([]);
    setTopic('');
    setCreativeDirection('');
    setRefinements({});
    setSelectedIdeaIds(new Set());
    setActiveIdeaExplorerSessionId(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteIdeaExplorerSession(sessionId);
    refreshSessions();
    showToast('Session deleted', 'info');
  };

  const handleToggleSelectIdea = (ideaId: string) => {
    setSelectedIdeaIds(prev => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIdeaIds.size === currentIdeas.length) {
      setSelectedIdeaIds(new Set());
    } else {
      setSelectedIdeaIds(new Set(currentIdeas.map(i => i.id)));
    }
  };

  const handleToggleSaveIdea = (idea: IdeaExplorerIdea) => {
    const isNowSaved = toggleSaveIdeaExplorerItem(idea);
    refreshSavedCount();
    showToast(isNowSaved ? `Saved "${idea.title}" to library` : `Removed "${idea.title}" from library`);
    // update currentIdeas saved flag locally
    setCurrentIdeas(prev =>
      prev.map(i => (i.id === idea.id ? { ...i, isSaved: isNowSaved } : i))
    );
  };

  const handleSaveSelectedIdeas = () => {
    if (selectedIdeaIds.size === 0) return;
    let savedNow = 0;
    currentIdeas.forEach(i => {
      if (selectedIdeaIds.has(i.id)) {
        toggleSaveIdeaExplorerItem(i);
        savedNow++;
      }
    });
    refreshSavedCount();
    showToast(`Saved ${savedNow} selected idea${savedNow > 1 ? 's' : ''} to library`);
  };

  // GENERATE 10 IDEAS
  const handleGenerateIdeas = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setError('Please enter a creative topic, quote, or theme to explore.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Gather previously explored premises in this session to ensure maximal diversity
      const excludedPremises = currentIdeas.map(i => i.corePremise || i.title).filter(Boolean);

      const res = await apiFetch('/api/idea-explorer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          creativeDirection: creativeDirection.trim(),
          refinements,
          excludedPremises: excludedPremises.slice(0, 10),
          model: selectedModel
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate ideas. Please retry.');
      }

      const generatedIdeas: IdeaExplorerIdea[] = (data.ideas || []).map((item: any, idx: number) => ({
        ...item,
        topic: cleanTopic,
        createdAt: new Date().toISOString(),
        refinementSnapshot: refinements,
        isSaved: isIdeaExplorerItemSaved(item.id),
        modelUsed: data.modelUsed || selectedModel
      }));

      // Session handling
      let session = activeSession;
      const isNewSession = !session;
      const sessionId = session ? session.id : `session-${Date.now()}`;
      const batchId = `batch-${Date.now()}`;

      // Tag ideas with sessionId and batchId
      const finalIdeas = generatedIdeas.map(i => ({
        ...i,
        sessionId,
        batchId
      }));

      saveIdeaExplorerIdeas(finalIdeas);

      const newBatch: IdeaExplorerBatch = {
        id: batchId,
        sessionId,
        ideaIds: finalIdeas.map(i => i.id),
        refinementSnapshot: refinements,
        creativeDirection: creativeDirection.trim(),
        createdAt: new Date().toISOString(),
        generationType: data.generationType || 'initial',
        modelUsed: data.modelUsed || selectedModel
      };
      saveIdeaExplorerBatch(newBatch);

      if (!session) {
        session = {
          id: sessionId,
          title: cleanTopic.length > 40 ? cleanTopic.substring(0, 37) + '...' : cleanTopic,
          originalTopic: cleanTopic,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activeRefinements: refinements,
          creativeDirection: creativeDirection.trim(),
          batchIds: [batchId],
          currentBatchId: batchId,
          selectedIdeaIds: []
        };
      } else {
        session = {
          ...session,
          updatedAt: new Date().toISOString(),
          activeRefinements: refinements,
          creativeDirection: creativeDirection.trim(),
          batchIds: [...session.batchIds, batchId],
          currentBatchId: batchId
        };
      }

      saveIdeaExplorerSession(session);
      setActiveIdeaExplorerSessionId(sessionId);
      setActiveSession(session);
      setCurrentBatch(newBatch);
      setCurrentIdeas(finalIdeas);
      setSelectedIdeaIds(new Set());
      refreshSessions();
      showToast('Generated 10 distinct creative ideas!');
    } catch (err: any) {
      console.error('Idea generation error:', err);
      setError(err?.message || 'Failed to generate ideas. Please check connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Open Branch Modal for a single idea
  const handleOpenBranchSingle = (idea: IdeaExplorerIdea) => {
    setBranchingParents([idea]);
    setIsBranchModalOpen(true);
  };

  // Open Branch Modal for multi-selected ideas
  const handleOpenBranchSelected = () => {
    const parents = currentIdeas.filter(i => selectedIdeaIds.has(i.id));
    if (parents.length === 0) return;
    setBranchingParents(parents);
    setIsBranchModalOpen(true);
  };

  // Execute Branching
  const handleExecuteBranch = async (directive: string, modelToUse: string) => {
    const cleanTopic = activeSession?.originalTopic || topic.trim() || 'General Theme';
    const excludedPremises = currentIdeas.map(i => i.corePremise || i.title).filter(Boolean);

    const res = await apiFetch('/api/idea-explorer/branch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: cleanTopic,
        parentIdeas: branchingParents,
        creativeDirection: directive,
        refinements,
        excludedPremises: excludedPremises.slice(0, 10),
        model: modelToUse
      })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to branch ideas.');
    }

    const sessionId = activeSession?.id || `session-${Date.now()}`;
    const batchId = `batch-branch-${Date.now()}`;

    const branchedIdeas: IdeaExplorerIdea[] = (data.ideas || []).map((item: any) => ({
      ...item,
      topic: cleanTopic,
      sessionId,
      batchId,
      createdAt: new Date().toISOString(),
      parentIdeaIds: branchingParents.map(p => p.id),
      refinementSnapshot: refinements,
      isSaved: isIdeaExplorerItemSaved(item.id),
      modelUsed: data.modelUsed || modelToUse
    }));

    saveIdeaExplorerIdeas(branchedIdeas);

    const newBatch: IdeaExplorerBatch = {
      id: batchId,
      sessionId,
      ideaIds: branchedIdeas.map(i => i.id),
      parentIdeaIds: branchingParents.map(p => p.id),
      refinementSnapshot: refinements,
      creativeDirection: directive,
      createdAt: new Date().toISOString(),
      generationType: 'branched',
      modelUsed: data.modelUsed || modelToUse
    };
    saveIdeaExplorerBatch(newBatch);

    let updatedSession = activeSession;
    if (updatedSession) {
      updatedSession = {
        ...updatedSession,
        updatedAt: new Date().toISOString(),
        batchIds: [...updatedSession.batchIds, batchId],
        currentBatchId: batchId
      };
      saveIdeaExplorerSession(updatedSession);
      setActiveSession(updatedSession);
    }

    setCurrentBatch(newBatch);
    setCurrentIdeas(branchedIdeas);
    setSelectedIdeaIds(new Set());
    refreshSessions();
    showToast(`Branched 10 sister concepts from ${branchingParents.length} idea${branchingParents.length > 1 ? 's' : ''}!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-medium border border-stone-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl border border-amber-200">
              <Compass className="w-5 h-5 text-amber-800" />
            </span>
            <h1 className="text-2xl font-serif text-stone-900 font-semibold tracking-tight">
              Idea Explorer
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl font-sans">
            A flexible creative ideation workspace. Enter any theme, quote, historical figure, or concept to generate 10 original ideas, branch promising angles, and save concepts to your library.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Saved Library */}
          <button
            type="button"
            onClick={() => setIsSavedLibraryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-xl border border-stone-200 text-xs font-medium transition-colors shadow-2xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-700" />
            <span>Saved Library ({savedCount})</span>
          </button>

          {/* Session History */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-xl border border-stone-200 text-xs font-medium transition-colors shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-stone-600" />
            <span>Sessions ({sessions.length})</span>
          </button>

          {/* Backup / Export */}
          <button
            type="button"
            onClick={() => setIsBackupOpen(true)}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
            title="Backup & Export Idea Explorer Library"
          >
            <ShieldCheck className="w-4 h-4 text-stone-600" />
          </button>

          {/* Start Fresh */}
          {activeSession && (
            <button
              type="button"
              onClick={handleStartNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Exploration</span>
            </button>
          )}
        </div>
      </div>

      {/* Input & Generator Console */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
        <form onSubmit={handleGenerateIdeas} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-900 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                <span>Exploration Topic, Theme, or Creative Thought</span>
              </label>
              {activeSession && (
                <span className="text-[11px] text-stone-500 font-sans">
                  Session: <strong className="text-stone-800">{activeSession.title}</strong>
                </span>
              )}
            </div>

            <textarea
              rows={2}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. World War II, Abraham Lincoln, Funny historical quotes for sweatshirts, A sophisticated design inspired by ancient Rome, A clever visual metaphor for the passage of time..."
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-all resize-none shadow-2xs font-sans leading-relaxed"
            />
          </div>

          {/* Quick Starter Inspiration Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-mono uppercase text-stone-500">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>Starter Inspirations (Click to Explore):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_CHIPS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setTopic(chip)}
                  className="px-2.5 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200/80 rounded-xl text-xs transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Creative Direction */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-stone-600 flex items-center justify-between">
              <span>Creative Angle / Direction (Optional)</span>
              <span className="text-[10px] font-normal text-stone-400">Guide how ideas are framed</span>
            </label>
            <input
              type="text"
              value={creativeDirection}
              onChange={e => setCreativeDirection(e.target.value)}
              placeholder="e.g. Focus on unexpected juxtaposition between academic diagrams and street fashion"
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-all font-sans"
            />
          </div>

          {/* Refinements Panel (Accordion) */}
          <RefinementsPanel
            refinements={refinements}
            onChange={setRefinements}
            onClear={() => setRefinements({})}
          />

          {/* Bottom Action Bar: Model Selector & Generate Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100">
            <ModelSelector
              selectedModel={selectedModel}
              onChangeModel={setSelectedModel}
              label="Ideation Model"
            />

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Synthesizing 10 Distinct Ideas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Generate 10 Ideas</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Batches Navigation Timeline (If active session has multiple batches) */}
      {activeSession && activeSession.batchIds.length > 1 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center justify-between gap-3 overflow-x-auto shadow-2xs">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono font-semibold text-stone-500 uppercase">
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>Generation History:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {activeSession.batchIds.map((bId, idx) => {
              const isCurrent = currentBatch?.id === bId;
              const isBranched = bId.includes('branch');
              return (
                <button
                  key={bId}
                  type="button"
                  onClick={() => loadBatch(bId)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 border ${
                    isCurrent
                      ? 'bg-amber-100 text-amber-950 border-amber-300 font-semibold shadow-2xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {isBranched ? (
                    <GitBranch className="w-3 h-3 text-amber-700" />
                  ) : (
                    <Lightbulb className="w-3 h-3 text-amber-700" />
                  )}
                  <span>
                    Batch {idx + 1} {isBranched ? '(Branched)' : idx === 0 ? '(Initial)' : '(Refined)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated 10 Ideas Grid */}
      {isGenerating ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-serif text-lg font-semibold text-stone-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Synthesizing 10 Distinct Concepts...</span>
            </h3>
            <span className="text-xs text-stone-500 font-mono">Exploring creative angles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-12 bg-stone-200 rounded"></div>
                  <div className="h-4 w-6 bg-stone-200 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-stone-200 rounded"></div>
                <div className="h-12 w-full bg-stone-100 rounded-xl"></div>
                <div className="h-16 w-full bg-stone-100 rounded"></div>
                <div className="h-8 w-1/3 bg-stone-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ) : currentIdeas.length > 0 ? (
        <div className="space-y-4">
          {/* Header & Multi-select Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                10 Visual Concepts
              </h3>
              {currentBatch && (
                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[11px] font-mono border border-stone-200">
                  {currentBatch.generationType.toUpperCase()} BATCH
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-stone-600 hover:text-stone-900 underline font-medium"
              >
                {selectedIdeaIds.size === currentIdeas.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* 10 Ideas Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentIdeas.map((idea, idx) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={idx}
                isSelected={selectedIdeaIds.has(idea.id)}
                onToggleSelect={handleToggleSelectIdea}
                isSaved={Boolean(idea.isSaved)}
                onToggleSave={handleToggleSaveIdea}
                onBranch={handleOpenBranchSingle}
                onCreateProject={onCreateProjectFromIdea}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-stone-200/90 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Ready to Explore New Creative Directions
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Enter any topic, quote, historic era, or rough idea in the box above, or click one of the starter inspirations to generate 10 distinctive concepts.
            </p>
          </div>
        </div>
      )}

      {/* Floating Multi-select Action Dock (When ≥ 1 idea is selected) */}
      {selectedIdeaIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-800 flex items-center gap-4 animate-fadeIn">
          <span className="text-xs font-mono font-medium text-amber-300">
            {selectedIdeaIds.size} idea{selectedIdeaIds.size > 1 ? 's' : ''} selected
          </span>

          <div className="h-4 w-px bg-stone-700"></div>

          <button
            type="button"
            onClick={handleOpenBranchSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Branch Selected</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSelectedIdeas}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium transition-colors border border-stone-700"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save All</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedIdeaIds(new Set())}
            className="text-stone-400 hover:text-white text-xs underline transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Branch Modal */}
      <BranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        parentIdeas={branchingParents}
        onExecuteBranch={handleExecuteBranch}
        currentModel={selectedModel}
      />

      {/* Saved Library Modal */}
      <SavedLibraryModal
        isOpen={isSavedLibraryOpen}
        onClose={() => setIsSavedLibraryOpen(false)}
        onBranchIdea={handleOpenBranchSingle}
        onCreateProject={onCreateProjectFromIdea}
        onLibraryUpdated={() => {
          refreshSavedCount();
          // update isSaved state on current batch
          const savedItems = getIdeaExplorerSavedItems();
          const savedSet = new Set(savedItems.map(s => s.idea.id));
          setCurrentIdeas(prev =>
            prev.map(i => ({ ...i, isSaved: savedSet.has(i.id) }))
          );
        }}
      />

      {/* Session History Modal */}
      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSession?.id || null}
        onSelectSession={handleSelectSession}
        onNewSession={handleStartNewSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Backup & Restore Modal */}
      <IdeaBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={() => {
          refreshSessions();
          refreshSavedCount();
          showToast('Idea Explorer library restored successfully!');
        }}
      />
    </div>
  );
};
