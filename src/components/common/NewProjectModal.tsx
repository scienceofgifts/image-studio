import React, { useState } from 'react';
import { ImageProject, SavedConceptItem, InspirationReference } from '../../types';
import { getSavedConcepts, getInspirationLibrary, DEFAULT_PROMPT_INSTRUCTIONS } from '../../utils/storage';
import { Plus, X, Bookmark, ImageIcon, Layers, Sparkles } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (proj: ImageProject) => void;
  initialSavedConcept?: SavedConceptItem | null;
  initialInspirationRef?: InspirationReference | null;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  initialSavedConcept,
  initialInspirationRef
}) => {
  const savedConcepts = getSavedConcepts();
  const inspirationLib = getInspirationLibrary();

  const [startType, setStartType] = useState<'blank' | 'saved-concept' | 'inspiration'>('blank');
  const [idea, setIdea] = useState(initialSavedConcept?.concept.conceptName || initialInspirationRef?.name || '');
  const [title, setTitle] = useState('');
  const [selectedConceptId, setSelectedConceptId] = useState<string>(initialSavedConcept?.id || '');
  const [selectedInspId, setSelectedInspId] = useState<string>(initialInspirationRef?.id || '');

  if (!isOpen) return null;

  const handleStart = () => {
    if (!idea.trim() && startType === 'blank') return;

    let projTitle = title.trim();
    let projIdea = idea.trim();
    let concepts: any[] = [];
    let selections: Record<string, any> = {};
    let references: InspirationReference[] = [];

    if (startType === 'saved-concept' && selectedConceptId) {
      const item = savedConcepts.find(c => c.id === selectedConceptId);
      if (item) {
        projIdea = projIdea || item.concept.conceptName;
        projTitle = projTitle || `${item.concept.conceptName} Project`;
        concepts = [item.concept];
        selections[item.concept.id] = 'primary';
      }
    } else if (startType === 'inspiration' && selectedInspId) {
      const insp = inspirationLib.find(i => i.id === selectedInspId);
      if (insp) {
        projIdea = projIdea || insp.name;
        projTitle = projTitle || `${insp.name} Design`;
        references = [insp];
      }
    }

    if (!projIdea) projIdea = 'Custom Image Concept';
    if (!projTitle) projTitle = `${projIdea} Design`;

    const newProj: ImageProject = {
      id: 'proj-' + Date.now(),
      title: projTitle,
      status: concepts.length > 0 ? 'concepts' : 'idea',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageIdea: {
        idea: projIdea,
        productType: 'T-Shirt & Mug Graphic',
        intendedUse: 'Print-on-demand artwork',
        audience: 'General audience',
        subject: projIdea,
        desiredMood: 'Scholarly, nostalgic',
        userNotes: '',
        constraints: ''
      },
      outputMode: 'Finished Artwork',
      intendedOutput: 'T-shirt & Mug Graphic Artwork',
      visualConcepts: concepts,
      conceptSelections: selections,
      creativeDirection: '',
      inspirationReferences: references,
      selectedReferenceCharacteristics: [],
      visualDirection: {
        composition: '',
        typography: '',
        illustration: '',
        color: '',
        texture: '',
        era: '',
        mood: '',
        visualHierarchy: ''
      },
      promptInstructions: DEFAULT_PROMPT_INSTRUCTIONS
    };

    onCreateProject(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-stone-900">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h3 className="text-sm font-serif font-semibold text-stone-900">Start New Image Design Project</h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Start Type Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-[11px] font-medium">
          <button
            onClick={() => setStartType('blank')}
            className={`py-1.5 rounded-lg transition-colors ${
              startType === 'blank' ? 'bg-stone-900 text-white font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Blank Idea
          </button>
          <button
            onClick={() => setStartType('saved-concept')}
            className={`py-1.5 rounded-lg transition-colors ${
              startType === 'saved-concept' ? 'bg-stone-900 text-white font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Saved Concept
          </button>
          <button
            onClick={() => setStartType('inspiration')}
            className={`py-1.5 rounded-lg transition-colors ${
              startType === 'inspiration' ? 'bg-stone-900 text-white font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Inspiration
          </button>
        </div>

        {startType === 'blank' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-700 font-medium mb-1">
                Core Image Idea <span className="text-amber-700">*</span>
              </label>
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. History Teacher, Viking Mythology, Filmmaker"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Project Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. History Teacher Museum Specimen"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        )}

        {startType === 'saved-concept' && (
          <div className="space-y-3 text-xs">
            <label className="block text-stone-700 font-medium mb-1">Select Saved Concept</label>
            <select
              value={selectedConceptId}
              onChange={(e) => setSelectedConceptId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
            >
              <option value="">-- Choose a Saved Concept --</option>
              {savedConcepts.map(c => (
                <option key={c.id} value={c.id}>{c.concept.conceptName}</option>
              ))}
            </select>
          </div>
        )}

        {startType === 'inspiration' && (
          <div className="space-y-3 text-xs">
            <label className="block text-stone-700 font-medium mb-1">Select Inspiration Reference</label>
            <select
              value={selectedInspId}
              onChange={(e) => setSelectedInspId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
            >
              <option value="">-- Choose Reference --</option>
              {inspirationLib.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.type})</option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-2xs"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};
