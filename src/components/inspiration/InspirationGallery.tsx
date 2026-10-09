import React, { useState } from 'react';
import { InspirationReference, ReferenceAnalysis, SynthesisConcept, VisualConcept, SavedConceptItem } from '../../types';
import { 
  getInspirationLibrary, 
  saveInspirationItem, 
  deleteInspirationItem, 
  toggleInspirationVisualProfile,
  saveSynthesisConcept,
  saveConceptToGallery,
  getSavedConcepts,
  getSynthesisConcepts
} from '../../utils/storage';
import { ModelSelector } from '../common/ModelSelector';
import { getGlobalDefaultModel, getModelConfig } from '../../utils/models';
import { useOverlay } from '../../utils/overlayManager';
import { getApiUrl } from '../../services/apiConfig';
import { compressImage } from '../../utils/imageCompressor';
import { 
  Image as ImageIcon, 
  Plus, 
  Sparkles, 
  Trash2, 
  Search, 
  Check, 
  ArrowRight, 
  Bookmark, 
  AlertCircle,
  Layers,
  Edit3,
  Sliders,
  X,
  BookmarkCheck,
  Tag,
  Lightbulb,
  Cpu,
  CheckSquare,
  Square
} from 'lucide-react';

interface InspirationGalleryProps {
  onAnalyzeReference: (ref: InspirationReference, model?: string) => Promise<ReferenceAnalysis>;
  onCreateProjectFromInspiration: (ref: InspirationReference) => void;
  onCreateProjectFromSynthesis: (concept: SynthesisConcept) => void;
  onRefreshData: () => void;
  isAnalyzing: boolean;
}

const ALL_CREATIVE_MECHANISMS = [
  'Transformation',
  'Parody',
  'Visual Metaphor',
  'Recontextualization',
  'Historical Reinterpretation',
  'Genre Appropriation',
  'Exaggeration',
  'Classification',
  'Definition',
  'Mashup',
  'Personification',
  'Contrast',
  'Cultural Reference',
  'Symbol Substitution',
  'Role Reversal'
];

export const InspirationGallery: React.FC<InspirationGalleryProps> = ({
  onAnalyzeReference,
  onCreateProjectFromInspiration,
  onCreateProjectFromSynthesis,
  onRefreshData,
  isAnalyzing
}) => {
  const [library, setLibrary] = useState<InspirationReference[]>(getInspirationLibrary());
  const [activeCollection, setActiveCollection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selection state for Multi-Inspiration Synthesis
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [selectedModalRef, setSelectedModalRef] = useState<InspirationReference | null>(null);
  const [editingRef, setEditingRef] = useState<InspirationReference | null>(null);
  const [exploringRef, setExploringRef] = useState<InspirationReference | null>(null);
  const [isSynthesizeModalOpen, setIsSynthesizeModalOpen] = useState<boolean>(false);

  // Central Overlay / Escape Key registrations
  useOverlay(!!selectedModalRef, () => setSelectedModalRef(null), 'inspiration-detail-modal');
  useOverlay(!!editingRef, () => setEditingRef(null), 'inspiration-editing-modal');
  useOverlay(!!exploringRef, () => setExploringRef(null), 'inspiration-exploring-modal');
  useOverlay(isSynthesizeModalOpen, () => setIsSynthesizeModalOpen(false), 'inspiration-synthesize-modal');

  // Single Reference Exploration State
  const [exploreTopic, setExploreTopic] = useState<string>('');
  const [exploreConcepts, setExploreConcepts] = useState<any[]>([]);
  const [isExploring, setIsExploring] = useState<boolean>(false);

  // Multi-Reference Synthesis State
  const [synthesisTopic, setSynthesisTopic] = useState<string>('');
  const [synthesisConcepts, setSynthesisConcepts] = useState<SynthesisConcept[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Saved concept trackers
  const [savedExploreConceptTitles, setSavedExploreConceptTitles] = useState<Set<string>>(() => {
    return new Set(
      getSavedConcepts()
        .map(c => c.concept?.conceptName)
        .filter((title): title is string => typeof title === 'string' && title !== '')
    );
  });
  const [savedSynthesisConceptIds, setSavedSynthesisConceptIds] = useState<Set<string>>(() => {
    return new Set(
      getSynthesisConcepts()
        .map(s => s.id || s.conceptTitle)
        .filter((id): id is string => typeof id === 'string' && id !== '')
    );
  });

  // New Reference Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('T-Shirt Graphic');
  const [newCollection, setNewCollection] = useState('Museum Graphics');
  const [newNotes, setNewNotes] = useState('');
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [analyzingRefId, setAnalyzingRefId] = useState<string | null>(null);

  const collections = ['All', 'Museum Graphics', 'Vintage Typography', 'T-Shirt References', 'Mug Designs', 'Engraving & Woodcut', 'Scientific Illustration', 'Minimalist'];

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshLocalLibrary = () => {
    const updated = getInspirationLibrary();
    setLibrary(updated);
    onRefreshData();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit. Please select a smaller image file.');
      e.target.value = '';
      return;
    }

    const inputEl = e.target;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const originalBase64 = event.target.result as string;
        compressImage(originalBase64, 512, 0.6)
          .then((compressedBase64) => {
            setNewImageBase64(compressedBase64);
            if (!newName) {
              const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
              setNewName(nameWithoutExt);
            }
          })
          .catch((err) => {
            console.error('Failed to compress image:', err);
            setNewImageBase64(originalBase64);
            if (!newName) {
              const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
              setNewName(nameWithoutExt);
            }
          })
          .finally(() => {
            if (inputEl) inputEl.value = '';
          });
      } else {
        if (inputEl) inputEl.value = '';
      }
    };
    reader.onerror = () => {
      setFileError('Failed to upload image file.');
      if (inputEl) inputEl.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleAddInspiration = () => {
    if (!newName.trim()) return;
    const item: InspirationReference = {
      id: 'insp-' + Date.now(),
      name: newName.trim(),
      type: newType,
      collection: newCollection,
      notes: newNotes.trim(),
      imageDataUrl: newImageBase64 || undefined,
      createdAt: new Date().toISOString()
    };
    try {
      saveInspirationItem(item);
      refreshLocalLibrary();
      showToast(`Saved "${item.name}" to Inspiration Library!`);

      setNewName('');
      setNewNotes('');
      setNewImageBase64(null);
      setFileError(null);
      setFileInputKey(prev => prev + 1);
    } catch (err) {
      console.error('Failed to save inspiration:', err);
      showToast('Storage Limit Reached. Please remove some older references or images to make room.', 'error');
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteInspirationItem(id);
    refreshLocalLibrary();
    if (selectedModalRef?.id === id) setSelectedModalRef(null);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast('Reference removed from library.');
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 5) {
          showToast('You can select up to 5 inspirations for synthesis.');
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleVisualProfile = (id: string, e: React.MouseEvent | React.SyntheticEvent) => {
    e.stopPropagation();
    const inProfile = toggleInspirationVisualProfile(id);
    refreshLocalLibrary();
    if (selectedModalRef && selectedModalRef.id === id) {
      setSelectedModalRef({ ...selectedModalRef, inVisualProfile: inProfile });
    }
    showToast(inProfile ? 'Added to Visual Profile!' : 'Removed from Visual Profile.');
  };

  // Per-Task Model Override States
  const [exploreTaskModel, setExploreTaskModel] = useState<string>(getGlobalDefaultModel());
  const [synthesisTaskModel, setSynthesisTaskModel] = useState<string>(getGlobalDefaultModel());
  const [analysisTaskModel, setAnalysisTaskModel] = useState<string>(getGlobalDefaultModel());

  const handleAnalyzeModalRef = async (ref: InspirationReference) => {
    setAnalyzingRefId(ref.id);
    try {
      const analysis = await onAnalyzeReference(ref, analysisTaskModel);
      const updatedRef = { ...ref, analysis: { ...analysis, modelUsed: analysis.modelUsed || getModelConfig(analysisTaskModel).displayName } };
      saveInspirationItem(updatedRef);
      refreshLocalLibrary();
      setSelectedModalRef(updatedRef);
      showToast(`Visual analysis completed with ${getModelConfig(analysisTaskModel).shortName}!`);
    } catch (e) {
      console.error('Analysis failed:', e);
      showToast('Failed to analyze reference image. Please try again.', 'error');
    } finally {
      setAnalyzingRefId(null);
    }
  };

  // Single Reference "Explore This"
  const handleRunExploreThis = async () => {
    if (!exploringRef || !exploreTopic.trim()) return;
    setIsExploring(true);
    setExploreConcepts([]);

    try {
      const res = await fetch(getApiUrl('/api/image-studio/explore-inspiration'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspiration: exploringRef, topic: exploreTopic.trim(), model: exploreTaskModel })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.concepts)) {
        const conceptsWithModel = data.concepts.map((c: any, idx: number) => ({
          ...c,
          id: c.id || 'exp-concept-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
          modelUsed: data.modelUsed ? getModelConfig(data.modelUsed).displayName : getModelConfig(exploreTaskModel).displayName
        }));
        setExploreConcepts(conceptsWithModel);
      } else {
        showToast('Failed to generate exploration concepts.');
      }
    } catch (e) {
      console.error('Explore error:', e);
      showToast('Error exploring inspiration.');
    } finally {
      setIsExploring(false);
    }
  };

  // Multi-Reference Synthesis
  const handleRunSynthesis = async () => {
    if (selectedIds.size < 2 || !synthesisTopic.trim()) return;
    setIsSynthesizing(true);
    setSynthesisConcepts([]);

    const selectedRefs = library.filter(item => selectedIds.has(item.id));

    try {
      const res = await fetch(getApiUrl('/api/image-studio/synthesize-inspirations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspirations: selectedRefs, topic: synthesisTopic.trim(), model: synthesisTaskModel })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.concepts)) {
        const conceptsWithModel = data.concepts.map((c: any, idx: number) => ({
          ...c,
          id: c.id || 'syn-concept-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
          modelUsed: data.modelUsed ? getModelConfig(data.modelUsed).displayName : getModelConfig(synthesisTaskModel).displayName
        }));
        setSynthesisConcepts(conceptsWithModel);
      } else {
        showToast('Failed to generate synthesis concepts.');
      }
    } catch (e) {
      console.error('Synthesis error:', e);
      showToast('Error synthesizing inspirations.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Save Explore Concept
  const handleSaveExploreConcept = (concept: any) => {
    if (!concept) return;
    const titleKey = concept.conceptTitle || concept.title || 'Untitled Concept';
    
    const visualConcept: VisualConcept = {
      id: concept.id || 'exp-concept-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conceptName: titleKey,
      coreVisualIdea: concept.coreIdea || '',
      whyItWorks: concept.whyConceptWorks || concept.coreIdea || 'Extracted inspiration logic',
      composition: concept.composition || '',
      keyVisualElements: Array.isArray(concept.keyVisualElements) ? concept.keyVisualElements : [concept.designMechanism || 'Exploration Logic'],
      typographyDirection: concept.typography || '',
      illustrationDirection: concept.imageryIllustration || '',
      overallCharacter: concept.designMechanism || 'Exploration Concept',
      possibleProductSuitability: concept.productSuitability || 'T-Shirt, Print, Mug, Poster',
      potentialRisks: concept.potentialRisk || 'Ensure line weight translates cleanly for physical print.'
    };

    const savedItem: SavedConceptItem = {
      id: 'sc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      concept: visualConcept,
      sourceProjectTitle: exploringRef ? `Inspiration: ${exploringRef.name}` : 'Explore Inspiration',
      tags: [exploreTopic, concept.designMechanism || 'Exploration'].filter(Boolean),
      notes: `Derived from ${exploringRef?.name || 'Inspiration'} for topic "${exploreTopic}"`,
      createdAt: new Date().toISOString()
    };

    saveConceptToGallery(savedItem);
    setSavedExploreConceptTitles(prev => new Set(prev).add(titleKey));
    showToast(`Saved concept "${titleKey}"!`);
    onRefreshData();
  };

  // Save Synthesis Concept
  const handleSaveSynthesisConcept = (concept: SynthesisConcept) => {
    const conceptWithId = {
      ...concept,
      id: concept.id || 'syn-concept-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    };
    saveSynthesisConcept(conceptWithId);
    const key = conceptWithId.id || conceptWithId.conceptTitle;
    setSavedSynthesisConceptIds(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    showToast(`Saved concept "${conceptWithId.conceptTitle}"!`);
    onRefreshData();
  };

  // Save User Analysis Edits
  const handleSaveUserAnalysisEdits = () => {
    if (!editingRef) return;
    saveInspirationItem(editingRef);
    refreshLocalLibrary();
    if (selectedModalRef?.id === editingRef.id) {
      setSelectedModalRef(editingRef);
    }
    setEditingRef(null);
    showToast('Authoritative analysis updated and saved!');
  };

  const filteredItems = library.filter(item => {
    const matchesCol = activeCollection === 'All' || item.collection === activeCollection || item.type === activeCollection;
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) || (item.notes || '').toLowerCase().includes(q);
    return matchesCol && matchesSearch;
  });

  const selectedInspirationsList = library.filter(item => selectedIds.has(item.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border animate-bounce ${
          toastType === 'error'
            ? 'bg-red-950 text-red-200 border-red-800'
            : 'bg-stone-900 text-white border-stone-700'
        }`}>
          {toastType === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-serif text-stone-900 font-semibold tracking-tight">Persistent Visual Inspiration Library</h1>
          <p className="text-xs text-stone-600 mt-1">
            Store visual references, extract persistent design principles &amp; creative mechanisms, explore new topics, and synthesize multi-reference concepts.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inspiration..."
            className="pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 w-48 sm:w-64 shadow-2xs"
          />
        </div>
      </div>

      {/* Multi-Select Sticky Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-amber-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-amber-800 animate-fade-in">
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-amber-800/80 px-2.5 py-1 rounded-lg font-mono font-semibold text-amber-200">
              {selectedIds.size} Selected (2-5 for Synthesis)
            </span>
            <span className="hidden sm:inline text-amber-100">
              Select multiple inspirations to synthesize their visual mechanisms into original concepts.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSynthesizeModalOpen(true)}
              disabled={selectedIds.size < 2}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-2xs ${
                selectedIds.size < 2
                  ? 'bg-amber-800 text-amber-400 cursor-not-allowed'
                  : 'bg-white text-amber-950 hover:bg-amber-100 font-semibold'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>Synthesize Inspirations</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="p-2 hover:bg-amber-800 text-amber-300 rounded-lg transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Visual Reference Form */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-700" />
          <span>Add Visual Reference to Persistent Library</span>
        </h3>

        {fileError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{fileError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-stone-700 font-medium mb-1">Reference Title</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Victorian Woodcut Engraving"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Category / Type</label>
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="e.g. T-Shirt, Poster, Mug"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Collection</label>
            <select
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
            >
              {collections.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Upload Reference Image</label>
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:bg-stone-200 file:text-stone-800 hover:file:bg-stone-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Immediate Thumbnail Rendering */}
        {newImageBase64 && (
          <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <img src={newImageBase64} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-stone-300 shadow-2xs shrink-0" />
            <div className="text-xs text-stone-800 space-y-0.5">
              <span className="text-emerald-800 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Thumbnail Loaded Immediately
              </span>
              <p className="text-[11px] text-stone-500">Stored persistently in local library.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <input
            type="text"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Optional design notes or focus instructions..."
            className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 flex-1 max-w-lg mr-3"
          />

          <button
            type="button"
            onClick={handleAddInspiration}
            disabled={!newName.trim()}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors shadow-2xs ${
              !newName.trim() ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Save to Inspiration</span>
          </button>
        </div>
      </div>

      {/* Collection Filters Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 text-xs">
        <span className="text-stone-500 font-medium mr-2 shrink-0">Collections:</span>
        {collections.map(col => (
          <button
            key={col}
            onClick={() => setActiveCollection(col)}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
              activeCollection === col
                ? 'bg-stone-900 text-white font-medium shadow-2xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Inspiration Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200/80 rounded-2xl space-y-3 shadow-2xs">
          <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-medium text-stone-800">No inspiration references in this collection.</p>
          <p className="text-xs text-stone-500">Upload designs or visual references above to build your persistent library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((ref) => {
            const isSelected = selectedIds.has(ref.id);
            return (
              <div
                key={ref.id}
                onClick={() => setSelectedModalRef(ref)}
                className={`bg-white border rounded-2xl p-4 space-y-3 flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs group relative ${
                  isSelected ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                {/* Checkbox Selector Top Right */}
                <button
                  onClick={(e) => handleToggleSelect(ref.id, e)}
                  className="absolute top-3 left-3 z-10 p-1.5 bg-white/90 backdrop-blur-xs rounded-lg border border-stone-300 text-stone-700 hover:text-amber-900 shadow-2xs"
                  title={isSelected ? 'Deselect reference' : 'Select for synthesis'}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-amber-700" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                </button>

                <div className="space-y-3">
                  {/* Thumbnail Image */}
                  <div className="h-40 bg-stone-50 border border-stone-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                    {ref.imageDataUrl ? (
                      <img src={ref.imageDataUrl} alt={ref.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="text-stone-400 flex flex-col items-center gap-1">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[10px]">No Image Attached</span>
                      </div>
                    )}

                    {ref.inVisualProfile && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-semibold rounded-md backdrop-blur-xs flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-amber-700" /> Profile
                      </span>
                    )}

                    {ref.analysis && !ref.inVisualProfile && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-semibold rounded-md backdrop-blur-xs flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" /> Analyzed
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider block font-mono">
                      {ref.type} · {ref.collection || 'General'}
                    </span>
                    <h4 className="text-sm font-serif font-semibold text-stone-900 mt-0.5 truncate group-hover:text-amber-900">
                      {ref.name}
                    </h4>

                    {/* Show Mechanisms / Principles Chips preview if available */}
                    {ref.analysis?.creativeMechanisms && ref.analysis.creativeMechanisms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ref.analysis.creativeMechanisms.slice(0, 2).map((m, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded border border-stone-200">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExploringRef(ref);
                      setExploreTopic('');
                      setExploreConcepts([]);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-amber-900 hover:text-stone-900 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Explore This</span>
                  </button>

                  <button
                    onClick={(e) => handleDeleteItem(ref.id, e)}
                    className="p-1 text-stone-400 hover:text-red-700 rounded-lg transition-colors"
                    title="Delete reference"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RICH INSPIRATION DETAIL MODAL */}
      {selectedModalRef && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
                  {selectedModalRef.type}
                </span>
                <h3 className="text-base font-serif font-semibold text-stone-900">{selectedModalRef.name}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingRef(selectedModalRef)}
                  className="flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium border border-stone-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Analysis</span>
                </button>

                <button
                  onClick={() => setSelectedModalRef(null)}
                  className="p-1 text-stone-500 hover:text-stone-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-800">
              {/* Image & Quick Info Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selectedModalRef.imageDataUrl ? (
                  <div className="sm:col-span-1 max-h-48 rounded-xl overflow-hidden border border-stone-200 flex justify-center bg-stone-50">
                    <img src={selectedModalRef.imageDataUrl} alt={selectedModalRef.name} className="object-contain max-h-48" />
                  </div>
                ) : (
                  <div className="sm:col-span-1 h-36 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <span className="text-stone-500 font-medium block">User Notes &amp; Directives</span>
                    <p className="text-stone-800 italic mt-0.5">{selectedModalRef.notes || 'No custom notes attached.'}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={(e) => handleToggleVisualProfile(selectedModalRef.id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        selectedModalRef.inVisualProfile
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                          : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span>{selectedModalRef.inVisualProfile ? 'In Visual Profile ✓' : 'Add to Visual Profile'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setExploringRef(selectedModalRef);
                        setExploreTopic('');
                        setExploreConcepts([]);
                        setSelectedModalRef(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Explore This Reference</span>
                    </button>
                  </div>
                </div>
              </div>

              {selectedModalRef.analysis ? (
                <div className="space-y-6">
                  {/* DERIVED DESIGN PRINCIPLES */}
                  {selectedModalRef.analysis.designPrinciples && selectedModalRef.analysis.designPrinciples.length > 0 && (
                    <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                      <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-700" />
                        <span>Derived Abstract Design Principles</span>
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        Strategic visual rules derived from this reference that explain why the design succeeds:
                      </p>
                      <ul className="space-y-1.5 text-xs text-stone-800 pt-1">
                        {selectedModalRef.analysis.designPrinciples.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded-xl border border-amber-200/60 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CREATIVE MECHANISMS */}
                  {selectedModalRef.analysis.creativeMechanisms && selectedModalRef.analysis.creativeMechanisms.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-stone-700" />
                        <span>Creative Mechanisms</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedModalRef.analysis.creativeMechanisms.map((m, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-xs font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STRUCTURED VISUAL CHARACTERISTICS */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                      Structured Visual Characteristics
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="text-stone-500 font-medium block mb-0.5">Composition</span>
                        <p>{selectedModalRef.analysis.composition}</p>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="text-stone-500 font-medium block mb-0.5">Typography</span>
                        <p>{selectedModalRef.analysis.typography}</p>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="text-stone-500 font-medium block mb-0.5">Illustration Style</span>
                        <p>{selectedModalRef.analysis.illustration}</p>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="text-stone-500 font-medium block mb-0.5">Color Palette</span>
                        <p>{selectedModalRef.analysis.color}</p>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="text-stone-500 font-medium block mb-0.5">Texture &amp; Surface</span>
                        <p>{selectedModalRef.analysis.texture}</p>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="text-stone-500 font-medium block mb-0.5">Era &amp; Visual Language</span>
                        <p>{selectedModalRef.analysis.eraCulturalCharacter}</p>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="text-stone-500 font-medium block mb-0.5">Mood &amp; Emotional Character</span>
                        <p>{selectedModalRef.analysis.moodCharacter}</p>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="text-stone-500 font-medium block mb-0.5">Product Design &amp; Print</span>
                        <p>{selectedModalRef.analysis.productCharacteristics}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Re-Analyze Action Button */}
                  <div className="pt-4 border-t border-stone-150 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider font-mono">Model:</span>
                      <ModelSelector
                        selectedModel={analysisTaskModel}
                        onChangeModel={setAnalysisTaskModel}
                        compact
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAnalyzeModalRef(selectedModalRef)}
                      disabled={isAnalyzing || analyzingRefId !== null}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-3xs ${
                        analyzingRefId === selectedModalRef.id
                          ? 'bg-amber-50 text-amber-700/50 border-amber-200 cursor-not-allowed'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                      }`}
                    >
                      {analyzingRefId === selectedModalRef.id ? (
                        <div className="w-3 h-3 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin mr-0.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>{analyzingRefId === selectedModalRef.id ? 'Re-Analyzing...' : 'Re-Analyze Reference'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <p className="text-stone-600">Reference has not been analyzed yet.</p>
                  <button
                    onClick={() => handleAnalyzeModalRef(selectedModalRef)}
                    disabled={isAnalyzing || analyzingRefId !== null}
                    className={`flex items-center gap-1.5 px-4 py-2 text-white font-medium text-xs rounded-xl transition-all ${
                      (isAnalyzing || analyzingRefId !== null)
                        ? 'bg-stone-400 cursor-not-allowed shadow-none'
                        : 'bg-stone-900 hover:bg-stone-800 shadow-2xs'
                    }`}
                  >
                    {(isAnalyzing || analyzingRefId !== null) ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-0.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{(isAnalyzing || analyzingRefId !== null) ? 'Extracting Visual Knowledge...' : 'Run AI Visual Analysis'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-between items-center">
              <button
                onClick={() => {
                  onCreateProjectFromInspiration(selectedModalRef);
                  setSelectedModalRef(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-2xs"
              >
                <span>Use Reference in New Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedModalRef(null)}
                className="px-4 py-2 bg-stone-200 text-stone-800 rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ANALYSIS MODAL */}
      {editingRef && editingRef.analysis && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-sm font-serif font-semibold text-stone-900">Edit Authoritative Visual Analysis: {editingRef.name}</h3>
              <button onClick={() => setEditingRef(null)} className="p-1 text-stone-500 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-stone-900">
              <div>
                <label className="block text-stone-700 font-medium mb-1">User Notes</label>
                <input
                  type="text"
                  value={editingRef.notes || ''}
                  onChange={(e) => setEditingRef({ ...editingRef, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Design Principles (One per line)</label>
                <textarea
                  rows={4}
                  value={(editingRef.analysis.designPrinciples || []).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(Boolean);
                    setEditingRef({
                      ...editingRef,
                      analysis: { ...editingRef.analysis!, designPrinciples: lines }
                    });
                  }}
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Creative Mechanisms</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-stone-50 border border-stone-200 rounded-xl">
                  {ALL_CREATIVE_MECHANISMS.map(mech => {
                    const active = (editingRef.analysis?.creativeMechanisms || []).includes(mech);
                    return (
                      <button
                        key={mech}
                        type="button"
                        onClick={() => {
                          const current = new Set(editingRef.analysis?.creativeMechanisms || []);
                          if (current.has(mech)) current.delete(mech);
                          else current.add(mech);
                          setEditingRef({
                            ...editingRef,
                            analysis: { ...editingRef.analysis!, creativeMechanisms: Array.from(current) }
                          });
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          active ? 'bg-amber-900 text-white' : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {mech} {active ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Composition</label>
                  <input
                    type="text"
                    value={editingRef.analysis.composition || ''}
                    onChange={(e) => setEditingRef({ ...editingRef, analysis: { ...editingRef.analysis!, composition: e.target.value } })}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Typography</label>
                  <input
                    type="text"
                    value={editingRef.analysis.typography || ''}
                    onChange={(e) => setEditingRef({ ...editingRef, analysis: { ...editingRef.analysis!, typography: e.target.value } })}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-2">
              <button onClick={() => setEditingRef(null)} className="px-4 py-2 bg-stone-200 text-stone-800 rounded-xl text-xs font-medium">
                Cancel
              </button>
              <button onClick={handleSaveUserAnalysisEdits} className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium">
                Save Authoritative Edits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE REFERENCE "EXPLORE THIS" MODAL */}
      {exploringRef && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-serif font-semibold text-stone-900">Explore Inspiration: {exploringRef.name}</h3>
              </div>
              <button onClick={() => setExploringRef(null)} className="p-1 text-stone-500 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-900">
              {/* Reference Logic Summary Card */}
              <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider font-mono">
                  Extracted Reusable Design Logic
                </span>
                <p className="text-xs text-stone-800">
                  <strong>Mechanisms:</strong> {(exploringRef.analysis?.creativeMechanisms || ['Transformation']).join(', ')}
                </p>
                {exploringRef.analysis?.designPrinciples && exploringRef.analysis.designPrinciples.length > 0 && (
                  <p className="text-xs text-stone-700">
                    <strong>Core Principle:</strong> {exploringRef.analysis.designPrinciples[0]}
                  </p>
                )}
              </div>

              {/* Input New Topic */}
              <div className="space-y-2">
                <label className="block text-stone-800 font-semibold text-xs">
                  Enter New Topic / Subject to Apply This Visual Logic To:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={exploreTopic}
                    onChange={(e) => setExploreTopic(e.target.value)}
                    placeholder="e.g. Writer, Filmmaker, Architect, Astronomer"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                  <ModelSelector
                    selectedModel={exploreTaskModel}
                    onChangeModel={setExploreTaskModel}
                    compact
                  />
                  <button
                    type="button"
                    onClick={handleRunExploreThis}
                    disabled={!exploreTopic.trim() || isExploring}
                    className={`px-4 py-2 rounded-xl text-xs font-medium text-white shadow-2xs flex items-center gap-1.5 shrink-0 ${
                      !exploreTopic.trim() || isExploring ? 'bg-stone-300 cursor-not-allowed' : 'bg-stone-900 hover:bg-stone-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isExploring ? 'Generating Ideas...' : 'Generate Concepts'}</span>
                  </button>
                </div>
              </div>

              {/* Exploration Results */}
              {exploreConcepts.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                    Generated Concepts for "{exploreTopic}"
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    {exploreConcepts.map((c, idx) => (
                      <div key={idx} className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h5 className="font-serif font-semibold text-sm text-stone-900">{c.conceptTitle}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-semibold">
                              {c.designMechanism}
                            </span>
                            <span className="text-[10px] text-stone-600 font-mono bg-white px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-amber-700" />
                              <span>{c.modelUsed || getModelConfig(exploreTaskModel).displayName}</span>
                            </span>
                          </div>
                        </div>

                        <p className="text-stone-700 leading-relaxed">{c.coreIdea}</p>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200">
                          <p><strong>Composition:</strong> {c.composition}</p>
                          <p><strong>Typography:</strong> {c.typography}</p>
                          <p><strong>Illustration:</strong> {c.imageryIllustration}</p>
                          <p><strong>Product:</strong> {c.productSuitability}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            disabled={savedExploreConceptTitles.has(c.conceptTitle || c.title)}
                            onClick={() => handleSaveExploreConcept(c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              savedExploreConceptTitles.has(c.conceptTitle || c.title)
                                ? 'bg-amber-100 text-amber-900 border-amber-300 cursor-default font-semibold'
                                : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                            }`}
                          >
                            {savedExploreConceptTitles.has(c.conceptTitle || c.title) ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Saved Concept</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 text-stone-500" />
                                <span>Save Concept</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onCreateProjectFromInspiration({
                                ...exploringRef,
                                name: `${c.conceptTitle} (${exploreTopic})`,
                                notes: c.coreIdea
                              });
                              setExploringRef(null);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium shadow-2xs"
                          >
                            <span>Use in New Project</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MULTI-REFERENCE SYNTHESIS MODAL */}
      {isSynthesizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-serif font-semibold text-stone-900">Multi-Reference Visual Synthesis</h3>
              </div>
              <button onClick={() => setIsSynthesizeModalOpen(false)} className="p-1 text-stone-500 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-900">
              {/* Selected References Summary */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block font-mono">
                  Synthesizing Visual Logic Across {selectedInspirationsList.length} Selected References:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedInspirationsList.map(ref => (
                    <div key={ref.id} className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl flex items-center gap-2">
                      {ref.imageDataUrl ? (
                        <img src={ref.imageDataUrl} alt={ref.name} className="w-8 h-8 object-cover rounded-md shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-stone-200 rounded-md shrink-0 flex items-center justify-center text-stone-500">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-semibold block truncate text-stone-900">{ref.name}</span>
                        <span className="text-[10px] text-stone-500 font-mono">{ref.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input New Topic */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="block text-stone-800 font-semibold text-xs">
                  Enter New Topic / Subject for Visual Synthesis:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={synthesisTopic}
                    onChange={(e) => setSynthesisTopic(e.target.value)}
                    placeholder="e.g. Filmmaker, Software Architect, Chef, Astronomer"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                  <ModelSelector
                    selectedModel={synthesisTaskModel}
                    onChangeModel={setSynthesisTaskModel}
                    compact
                  />
                  <button
                    type="button"
                    onClick={handleRunSynthesis}
                    disabled={!synthesisTopic.trim() || isSynthesizing}
                    className={`px-4 py-2 rounded-xl text-xs font-medium text-white shadow-2xs flex items-center gap-1.5 shrink-0 ${
                      !synthesisTopic.trim() || isSynthesizing ? 'bg-stone-300 cursor-not-allowed' : 'bg-stone-900 hover:bg-stone-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSynthesizing ? 'Synthesizing...' : 'Generate 5 Synthesis Concepts'}</span>
                  </button>
                </div>
              </div>

              {/* Synthesis Results */}
              {synthesisConcepts.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                    5 Original Synthesized Concepts for "{synthesisTopic}"
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    {synthesisConcepts.map((concept, idx) => (
                      <div key={idx} className="bg-white border border-stone-200 p-5 rounded-2xl space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h5 className="font-serif font-semibold text-sm text-stone-900">{concept.conceptTitle}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-semibold">
                              {concept.designMechanism}
                            </span>
                            <span className="text-[10px] text-stone-600 font-mono bg-stone-100 px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-amber-700" />
                              <span>{concept.modelUsed || getModelConfig(synthesisTaskModel).displayName}</span>
                            </span>
                          </div>
                        </div>

                        <p className="text-stone-700 leading-relaxed">{concept.coreIdea}</p>

                        {/* What it borrows conceptually breakdown */}
                        {concept.borrowsConceptually && Object.keys(concept.borrowsConceptually).length > 0 && (
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1 text-[11px]">
                            <span className="font-semibold text-stone-700 uppercase tracking-wider text-[10px] block font-mono">
                              Conceptual Synthesis Breakdown:
                            </span>
                            {Object.entries(concept.borrowsConceptually).map(([refName, principle], pIdx) => (
                              <p key={pIdx} className="text-stone-700">
                                <strong className="text-stone-900">{refName}:</strong> {principle}
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 bg-stone-50/60 p-3 rounded-xl border border-stone-200">
                          <p><strong>Composition:</strong> {concept.composition}</p>
                          <p><strong>Typography:</strong> {concept.typography}</p>
                          <p><strong>Illustration:</strong> {concept.imageryIllustration}</p>
                          <p><strong>Color:</strong> {concept.colorDirection}</p>
                          <p className="col-span-2"><strong>Product Suitability:</strong> {concept.productSuitability}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            disabled={savedSynthesisConceptIds.has(concept.id || concept.conceptTitle)}
                            onClick={() => handleSaveSynthesisConcept({ ...concept, topic: synthesisTopic })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              savedSynthesisConceptIds.has(concept.id || concept.conceptTitle)
                                ? 'bg-amber-100 text-amber-900 border-amber-300 cursor-default font-semibold'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                            }`}
                          >
                            {savedSynthesisConceptIds.has(concept.id || concept.conceptTitle) ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Saved Concept</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                                <span>Save Concept</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              onCreateProjectFromSynthesis({ ...concept, topic: synthesisTopic });
                              setIsSynthesizeModalOpen(false);
                            }}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium"
                          >
                            <span>Use in New Project</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
