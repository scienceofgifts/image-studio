import React, { useState } from 'react';
import { ImageProject, StructuredVisualDirection, DirectionProfile } from '../../types';
import { StructuredVisualParametersSelector } from './StructuredVisualParametersSelector';
import { getDirectionProfiles, saveDirectionProfile, deleteDirectionProfile } from '../../utils/storage';
import { Compass, ArrowRight, Edit3, Sliders, Plus, Save, Trash2, Copy, Check, RefreshCw } from 'lucide-react';

interface DirectionStepProps {
  project: ImageProject;
  onUpdateProject: (updated: ImageProject) => void;
  onNextStep: () => void;
}

export const DirectionStep: React.FC<DirectionStepProps> = ({
  project,
  onUpdateProject,
  onNextStep
}) => {
  const [profiles, setProfiles] = useState<DirectionProfile[]>(getDirectionProfiles());
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [creativeDir, setCreativeDir] = useState<string>(project.creativeDirection || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleVisualDirectionChange = (updatedDirection: StructuredVisualDirection) => {
    onUpdateProject({
      ...project,
      visualDirection: updatedDirection
    });
  };

  const handleCreativeDirectionChange = (val: string) => {
    setCreativeDir(val);
    onUpdateProject({
      ...project,
      creativeDirection: val
    });
  };

  const handleApplyProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    if (!profileId) return;
    const prof = profiles.find(p => p.id === profileId);
    if (prof) {
      // Copy structured values into active project without mutating the saved profile
      onUpdateProject({
        ...project,
        visualDirection: JSON.parse(JSON.stringify(prof.visualDirection)),
        creativeDirection: prof.creativeDirection !== undefined ? prof.creativeDirection : project.creativeDirection
      });
      if (prof.creativeDirection !== undefined) {
        setCreativeDir(prof.creativeDirection);
      }
      showToast(`Applied direction profile: "${prof.name}"`);
    }
  };

  const handleSaveNewProfile = () => {
    if (!newProfileName.trim()) return;
    const newProf: DirectionProfile = {
      id: 'dir-prof-' + Date.now(),
      name: newProfileName.trim(),
      version: 1,
      visualDirection: JSON.parse(JSON.stringify(project.visualDirection)),
      creativeDirection: creativeDir,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveDirectionProfile(newProf);
    setProfiles(getDirectionProfiles());
    setSelectedProfileId(newProf.id);
    setShowSaveModal(false);
    setNewProfileName('');
    showToast(`Saved new profile: "${newProf.name}"`);
  };

  const handleUpdateCurrentProfile = () => {
    if (!selectedProfileId) {
      setShowSaveModal(true);
      return;
    }
    const prof = profiles.find(p => p.id === selectedProfileId);
    if (!prof) return;

    const updated: DirectionProfile = {
      ...prof,
      visualDirection: JSON.parse(JSON.stringify(project.visualDirection)),
      creativeDirection: creativeDir,
      updatedAt: new Date().toISOString()
    };
    saveDirectionProfile(updated);
    setProfiles(getDirectionProfiles());
    showToast(`Updated profile: "${prof.name}"`);
  };

  const handleDuplicateProfile = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (!prof) return;
    const dup: DirectionProfile = {
      ...prof,
      id: 'dir-prof-' + Date.now(),
      name: `${prof.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveDirectionProfile(dup);
    setProfiles(getDirectionProfiles());
    setSelectedProfileId(dup.id);
    showToast(`Duplicated profile as "${dup.name}"`);
  };

  const handleDeleteProfile = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (!prof) return;
    if (confirm(`Are you sure you want to delete profile "${prof.name}"?`)) {
      deleteDirectionProfile(id);
      setProfiles(getDirectionProfiles());
      if (selectedProfileId === id) setSelectedProfileId('');
      showToast(`Deleted profile "${prof.name}"`);
    }
  };

  const primaryConceptId = Object.keys(project.conceptSelections).find(
    id => project.conceptSelections[id] === 'primary'
  );
  const primaryConcept = project.visualConcepts.find(c => c.id === primaryConceptId);

  const secondaryConceptIds = Object.keys(project.conceptSelections).filter(
    id => project.conceptSelections[id] === 'secondary'
  );
  const secondaryConcepts = project.visualConcepts.filter(c => secondaryConceptIds.includes(c.id));

  const incorporateIds = Object.keys(project.conceptSelections).filter(
    id => project.conceptSelections[id] === 'incorporate'
  );
  const incorporateConcepts = project.visualConcepts.filter(c => incorporateIds.includes(c.id));

  const avoidIds = Object.keys(project.conceptSelections).filter(
    id => project.conceptSelections[id] === 'avoid'
  );
  const avoidConcepts = project.visualConcepts.filter(c => avoidIds.includes(c.id));

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border border-stone-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100/80 text-amber-800 rounded-xl border border-amber-200/80 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
              STAGE 04 · HOW THE DESIGN LOOKS
            </span>
            <h2 className="text-xl font-serif text-stone-900 font-semibold">Visual Direction &amp; Style Profiles</h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Apply a persistent Direction Profile or configure structured visual parameters (color, typography, texture, era, mood, composition) to guide the Design Brief.
            </p>
          </div>
        </div>
      </div>

      {/* Persistent Direction Profiles Bar */}
      <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-800" />
            <h3 className="text-xs font-semibold text-amber-950 uppercase tracking-wider">Direction Style Profiles</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save As New Profile</span>
            </button>
            {selectedProfileId && (
              <>
                <button
                  type="button"
                  onClick={handleUpdateCurrentProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-medium transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateProfile(selectedProfileId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-medium transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(selectedProfileId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProfileId}
            onChange={(e) => handleApplyProfile(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-600 shadow-2xs"
          >
            <option value="">-- Choose a Saved Direction Profile (or keep current custom config) --</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedProfileId && (
            <button
              type="button"
              onClick={() => handleApplyProfile(selectedProfileId)}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shrink-0 transition-colors shadow-2xs"
            >
              Apply Profile
            </button>
          )}
        </div>
      </div>

      {/* Save Profile Modal Prompt */}
      {showSaveModal && (
        <div className="bg-white border-2 border-amber-400 rounded-2xl p-5 space-y-4 shadow-md animate-fadeIn">
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Save Current Visual Direction as New Profile</h4>
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="e.g. 19th Century Botanical Press Style..."
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSaveModal(false)}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNewProfile}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-2xs"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Conceptual Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Concept */}
        <div className="bg-amber-50/60 border border-amber-300 rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider block">
            Primary Visual Concept
          </span>
          <h3 className="text-base font-serif text-stone-900 font-semibold">
            {primaryConcept ? primaryConcept.conceptName : 'None explicitly set as primary'}
          </h3>
          <p className="text-xs text-stone-600 italic">
            {primaryConcept ? primaryConcept.coreVisualIdea : 'Select a primary concept in Stage 2.'}
          </p>
        </div>

        {/* User Creative Direction Preview */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-semibold text-stone-900 uppercase tracking-wider block">
            User Creative Direction
          </span>
          <p className="text-xs text-stone-800 font-sans leading-relaxed italic">
            "{creativeDir || 'No custom overriding instruction provided yet.'}"
          </p>
        </div>
      </div>

      {/* Concept Selection Map */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3 shadow-2xs text-xs">
        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Concept Selection Map</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] font-medium text-stone-500 block mb-1">Secondary Influences:</span>
            {secondaryConcepts.length === 0 ? (
              <span className="text-stone-400">None</span>
            ) : (
              <ul className="space-y-1 text-stone-800">
                {secondaryConcepts.map(c => <li key={c.id}>• {c.conceptName}</li>)}
              </ul>
            )}
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] font-medium text-amber-800 block mb-1">Incorporate Briefly:</span>
            {incorporateConcepts.length === 0 ? (
              <span className="text-stone-400">None</span>
            ) : (
              <ul className="space-y-1 text-stone-800">
                {incorporateConcepts.map(c => <li key={c.id}>• {c.conceptName}</li>)}
              </ul>
            )}
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] font-medium text-red-800 block mb-1">Do Not Use / Exclude:</span>
            {avoidConcepts.length === 0 ? (
              <span className="text-stone-400">None</span>
            ) : (
              <ul className="space-y-1 text-stone-600">
                {avoidConcepts.map(c => <li key={c.id}>• {c.conceptName}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Structured Visual Parameters Form */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-5 shadow-2xs">
        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-200 pb-3">
          <Edit3 className="w-4 h-4 text-amber-700" />
          <span>Refine Structured Visual Parameters</span>
        </h3>

        <StructuredVisualParametersSelector
          value={project.visualDirection}
          onChange={handleVisualDirectionChange}
          creativeDirection={creativeDir}
          onCreativeDirectionChange={handleCreativeDirectionChange}
        />
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-end pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={onNextStep}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-all shadow-2xs"
        >
          <span>Proceed to Design Brief</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
