import React, { useState } from 'react';
import { ImageProject, SavedConceptItem, SynthesisConcept } from '../../types';
import { 
  getSavedConcepts, 
  removeSavedConcept, 
  deleteImageProject, 
  saveImageProject,
  getSynthesisConcepts,
  deleteSynthesisConcept
} from '../../utils/storage';
import { LayoutGrid, Bookmark, FolderKanban, Search, Trash2, ArrowRight, Copy, Sparkles, Layers } from 'lucide-react';

interface GalleryViewProps {
  projects: ImageProject[];
  onOpenProject: (projectId: string) => void;
  onCreateProjectFromConcept: (concept: SavedConceptItem) => void;
  onCreateProjectFromSynthesis: (concept: SynthesisConcept) => void;
  onRefreshData: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  projects,
  onOpenProject,
  onCreateProjectFromConcept,
  onCreateProjectFromSynthesis,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'synthesis' | 'projects'>('concepts');
  const [savedConcepts, setSavedConcepts] = useState<SavedConceptItem[]>(getSavedConcepts());
  const [synthesisConcepts, setSynthesisConcepts] = useState<SynthesisConcept[]>(getSynthesisConcepts());
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteSavedConcept = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedConcept(id);
    setSavedConcepts(getSavedConcepts());
    onRefreshData();
  };

  const handleDeleteSynthesisConcept = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSynthesisConcept(id);
    setSynthesisConcepts(getSynthesisConcepts());
    onRefreshData();
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteImageProject(id);
      onRefreshData();
    }
  };

  const handleDuplicateProject = (project: ImageProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup: ImageProject = {
      ...project,
      id: 'proj-' + Date.now(),
      title: `${project.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveImageProject(dup);
    onRefreshData();
  };

  const filteredConcepts = savedConcepts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.concept.conceptName.toLowerCase().includes(q) ||
      c.concept.coreVisualIdea.toLowerCase().includes(q) ||
      (c.tags || []).some(t => t.toLowerCase().includes(q))
    );
  });

  const filteredSynthesis = synthesisConcepts.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.conceptTitle.toLowerCase().includes(q) ||
      s.coreIdea.toLowerCase().includes(q) ||
      s.topic.toLowerCase().includes(q) ||
      s.designMechanism.toLowerCase().includes(q)
    );
  });

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.imageIdea.idea.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-serif text-stone-900 font-semibold tracking-tight">Visual Design Gallery</h1>
          <p className="text-xs text-stone-600 mt-1">
            Browse saved visual creative concepts, multi-reference synthesis concepts, and active Image Studio projects.
          </p>
        </div>

        {/* Tab Selector & Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-300">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'concepts'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-800" />
              <span>Saved Concepts ({savedConcepts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('synthesis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'synthesis'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>Synthesized Concepts ({synthesisConcepts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'projects'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-stone-500" />
              <span>Projects ({projects.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter gallery..."
              className="pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 w-36 sm:w-48 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: SAVED CONCEPTS */}
      {activeTab === 'concepts' && (
        <div>
          {filteredConcepts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200/80 rounded-2xl space-y-3 shadow-2xs">
              <Bookmark className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-medium text-stone-800">No saved concepts yet.</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Save interesting visual concepts while exploring ideas in your projects to build your creative idea library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConcepts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-stone-200/80 hover:border-stone-300 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="h-28 bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                        <span className="text-amber-800 font-semibold">SAVED CONCEPT</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-sm font-serif font-semibold text-stone-900 block truncate">
                          {item.concept.conceptName}
                        </span>
                        <span className="text-[11px] text-stone-600 line-clamp-1 italic">
                          {item.concept.coreVisualIdea}
                        </span>
                      </div>
                      <div className="absolute right-2 bottom-2 text-stone-300 pointer-events-none">
                        <Sparkles className="w-12 h-12 opacity-20" />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-stone-700">
                      <p className="text-stone-700 leading-relaxed line-clamp-2">
                        {item.concept.whyItWorks}
                      </p>

                      <div className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-100">
                        <p><strong className="text-stone-700">Style:</strong> {item.concept.illustrationDirection}</p>
                        <p><strong className="text-stone-700">Product:</strong> {item.concept.possibleProductSuitability}</p>
                      </div>

                      {item.sourceProjectTitle && (
                        <p className="text-[11px] text-amber-800 italic">
                          From: {item.sourceProjectTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => onCreateProjectFromConcept(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
                    >
                      <span>Use in New Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteSavedConcept(item.id, e)}
                      className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-stone-100 transition-colors"
                      title="Remove from saved concepts"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SYNTHESIZED CONCEPTS */}
      {activeTab === 'synthesis' && (
        <div>
          {filteredSynthesis.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200/80 rounded-2xl space-y-3 shadow-2xs">
              <Layers className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-medium text-stone-800">No synthesized concepts saved yet.</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Go to the Inspiration Library, select 2 to 5 references, and click <strong>"Synthesize Inspirations"</strong> to create original multi-reference concepts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSynthesis.map((syn) => (
                <div
                  key={syn.id}
                  className="bg-white border border-stone-200/80 hover:border-stone-300 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-900 font-semibold uppercase tracking-wider px-2 py-0.5 bg-amber-100 rounded-md border border-amber-300">
                        Topic: {syn.topic}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(syn.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-semibold text-stone-900">{syn.conceptTitle}</h3>
                    <p className="text-xs text-stone-700 leading-relaxed">{syn.coreIdea}</p>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                      <p><strong>Mechanism:</strong> {syn.designMechanism}</p>
                      <p><strong>Composition:</strong> {syn.composition}</p>
                      <p><strong>Product:</strong> {syn.productSuitability}</p>
                    </div>

                    {syn.borrowsConceptually && Object.keys(syn.borrowsConceptually).length > 0 && (
                      <div className="text-[10px] text-amber-900 bg-amber-50/50 p-2 rounded-lg border border-amber-200/60">
                        <strong>Borrows:</strong> {Object.entries(syn.borrowsConceptually).map(([ref, p]) => `${ref} (${p})`).join(' · ')}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => onCreateProjectFromSynthesis(syn)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
                    >
                      <span>Use in New Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteSynthesisConcept(syn.id, e)}
                      className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-stone-100 transition-colors"
                      title="Remove synthesized concept"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IMAGE PROJECTS */}
      {activeTab === 'projects' && (
        <div>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200/80 rounded-2xl space-y-3 shadow-2xs">
              <FolderKanban className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-medium text-stone-800">No image projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onOpenProject(proj.id)}
                  className="bg-white border border-stone-200/80 hover:border-stone-300 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
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

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-700 font-medium group-hover:text-stone-900">Open Studio →</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDuplicateProject(proj, e)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Duplicate project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
