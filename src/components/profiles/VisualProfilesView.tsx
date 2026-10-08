import React, { useState } from 'react';
import { VisualProfile } from '../../types';
import { 
  getVisualProfiles, 
  saveVisualProfile, 
  deleteVisualProfile, 
  getAggregateVisualProfile, 
  toggleInspirationVisualProfile 
} from '../../utils/storage';
import { useOverlay } from '../../utils/overlayManager';
import { Sliders, Plus, Trash2, Edit3, Check, Layers, Image as ImageIcon, Sparkles, X, Lightbulb, Cpu } from 'lucide-react';

interface VisualProfilesViewProps {
  onRefreshData: () => void;
}

export const VisualProfilesView: React.FC<VisualProfilesViewProps> = ({ onRefreshData }) => {
  const [profiles, setProfiles] = useState<VisualProfile[]>(getVisualProfiles());
  const [editingProfile, setEditingProfile] = useState<VisualProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useOverlay(!!editingProfile, () => setEditingProfile(null), 'visual-profile-editing-modal');

  const aggregate = getAggregateVisualProfile();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshAllData = () => {
    setProfiles(getVisualProfiles());
    onRefreshData();
  };

  const handleSave = (prof: VisualProfile) => {
    saveVisualProfile(prof);
    refreshAllData();
    setEditingProfile(null);
    showToast('Visual profile saved!');
  };

  const handleDelete = (id: string) => {
    deleteVisualProfile(id);
    refreshAllData();
    showToast('Visual profile removed.');
  };

  const handleRemoveContribution = (inspirationId: string) => {
    toggleInspirationVisualProfile(inspirationId);
    refreshAllData();
    showToast('Removed inspiration contribution from Visual Profile.');
  };

  const handleCreateNewProfile = () => {
    const newProf: VisualProfile = {
      id: 'vp-' + Date.now(),
      title: 'New Visual Profile',
      description: 'Custom design style preferences.',
      compositionPreference: 'Symmetrical centered framing with thin border line.',
      typographyPreference: 'Clean serif headers paired with condensed sans-serif.',
      illustrationPreference: 'High-contrast vector line art with subtle stippling.',
      colorPreference: 'Monochrome iron black on cream background.',
      degreeOfMinimalism: 'Refined editorial detail with generous negative space.',
      avoidList: ['3D renders', 'Modern neon gradients', 'Photographs'],
      createdAt: new Date().toISOString()
    };
    setEditingProfile(newProf);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border border-stone-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-serif text-stone-900 font-semibold tracking-tight">Persistent Visual Style Learning &amp; Profiles</h1>
          <p className="text-xs text-stone-600 mt-1">
            Aggregated visual characteristics learned from your deliberately selected inspirations, alongside custom reusable visual style profiles.
          </p>
        </div>

        <button
          onClick={handleCreateNewProfile}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Custom Profile</span>
        </button>
      </div>

      {/* SECTION 1: AGGREGATED VISUAL LEARNING PROFILE */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-100 text-amber-900 rounded-xl border border-amber-300">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </span>
            <div>
              <h2 className="text-base font-serif font-semibold text-stone-900">Learned Visual Profile</h2>
              <p className="text-xs text-stone-500">
                Synthesized from {aggregate.contributingInspirations.length} deliberately added inspiration references.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300 font-semibold">
            {aggregate.contributingInspirations.length} Contributing References
          </span>
        </div>

        {aggregate.contributingInspirations.length === 0 ? (
          <div className="text-center py-12 bg-stone-50/60 rounded-xl border border-stone-200 space-y-2 text-xs">
            <Sliders className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-medium text-stone-800">No inspirations added to the Visual Profile yet.</p>
            <p className="text-stone-500 max-w-sm mx-auto">
              Go to the Inspiration Library and click <strong>"Add to Visual Profile"</strong> on your favorite analyzed references to build your learned visual style profile.
            </p>
          </div>
        ) : (
          <div className="space-y-6 text-xs text-stone-900">
            {/* RECURRING DESIGN PRINCIPLES */}
            {aggregate.preferredDesignPrinciples.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-700" />
                  <span>Recurring Design Principles</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {aggregate.preferredDesignPrinciples.map((principle, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-2xs flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span className="text-stone-800 leading-relaxed">{principle}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CREATIVE MECHANISMS */}
            {aggregate.preferredMechanisms.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-stone-700" />
                  <span>Preferred Creative Mechanisms</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {aggregate.preferredMechanisms.map((mech, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-xs font-medium">
                      {mech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AGGREGATED CHARACTERISTICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold text-[11px] uppercase tracking-wider block font-mono">Preferred Composition</span>
                <p className="text-stone-800 leading-relaxed">{aggregate.preferredCompositions.join(' · ') || 'Balanced centered compositions'}</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold text-[11px] uppercase tracking-wider block font-mono">Preferred Typography</span>
                <p className="text-stone-800 leading-relaxed">{aggregate.preferredTypography.join(' · ') || 'Refined editorial serifs'}</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold text-[11px] uppercase tracking-wider block font-mono">Preferred Illustration Styles</span>
                <p className="text-stone-800 leading-relaxed">{aggregate.preferredIllustrationStyles.join(' · ') || 'Copperplate woodcut etching'}</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold text-[11px] uppercase tracking-wider block font-mono">Preferred Color Palettes</span>
                <p className="text-stone-800 leading-relaxed">{aggregate.preferredColors.join(' · ') || 'Monochrome iron black on cream'}</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold text-[11px] uppercase tracking-wider block font-mono">Preferred Textures</span>
                <p className="text-stone-800 leading-relaxed">{aggregate.preferredTextures.join(' · ') || 'Subtle paper grain'}</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold text-[11px] uppercase tracking-wider block font-mono">Preferred Eras &amp; Visual Language</span>
                <p className="text-stone-800 leading-relaxed">{aggregate.preferredEras.join(' · ') || '19th-century Victorian archival'}</p>
              </div>
            </div>

            {/* CONTRIBUTING INSPIRATIONS LIST */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                <span>Contributing References ({aggregate.contributingInspirations.length})</span>
                <span className="text-[11px] text-stone-500 font-normal">Toggle "Remove" to stop contributing without deleting the reference file.</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {aggregate.contributingInspirations.map(ref => (
                  <div key={ref.id} className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      {ref.imageDataUrl ? (
                        <img src={ref.imageDataUrl} alt={ref.name} className="w-10 h-10 object-cover rounded-lg border border-stone-300 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-stone-200 rounded-lg shrink-0 flex items-center justify-center text-stone-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-semibold text-stone-900 block truncate">{ref.name}</span>
                        <span className="text-[10px] text-stone-500 font-mono block">{ref.type}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveContribution(ref.id)}
                      className="px-2 py-1 bg-white hover:bg-red-50 text-stone-600 hover:text-red-700 rounded-lg border border-stone-300 text-[10px] font-medium transition-colors shrink-0"
                      title="Remove contribution from Visual Profile"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: CUSTOM PRESET VISUAL PROFILES */}
      <div className="space-y-4">
        <h2 className="text-base font-serif font-semibold text-stone-900 border-b border-stone-200 pb-3">
          Custom Reusable Visual Profiles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((prof) => (
            <div
              key={prof.id}
              className="bg-white border border-stone-200/80 hover:border-stone-300 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider font-mono px-2 py-0.5 bg-amber-100 rounded-md border border-amber-300">
                    {prof.isDefault ? 'Default Profile' : 'Custom Profile'}
                  </span>
                  <button
                    onClick={() => setEditingProfile(prof)}
                    className="p-1 text-stone-400 hover:text-stone-800 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-serif font-semibold text-stone-900">{prof.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{prof.description}</p>

                <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs text-stone-700">
                  <p><strong className="text-stone-500">Composition:</strong> {prof.compositionPreference}</p>
                  <p><strong className="text-stone-500">Typography:</strong> {prof.typographyPreference}</p>
                  <p><strong className="text-stone-500">Illustration:</strong> {prof.illustrationPreference}</p>
                  <p><strong className="text-stone-500">Color:</strong> {prof.colorPreference}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setEditingProfile(prof)}
                  className="text-amber-900 hover:text-stone-900 font-semibold"
                >
                  Edit Profile
                </button>

                <button
                  onClick={() => handleDelete(prof.id)}
                  className="p-1 text-stone-400 hover:text-red-700 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl text-xs text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-semibold font-serif">
                {editingProfile.id ? 'Edit Visual Profile' : 'New Visual Profile'}
              </h3>
              <button onClick={() => setEditingProfile(null)} className="p-1 text-stone-500 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Profile Title</label>
                <input
                  type="text"
                  value={editingProfile.title}
                  onChange={(e) => setEditingProfile({ ...editingProfile, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={editingProfile.description}
                  onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Composition Preference</label>
                  <input
                    type="text"
                    value={editingProfile.compositionPreference}
                    onChange={(e) => setEditingProfile({ ...editingProfile, compositionPreference: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Typography Preference</label>
                  <input
                    type="text"
                    value={editingProfile.typographyPreference}
                    onChange={(e) => setEditingProfile({ ...editingProfile, typographyPreference: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Illustration Style</label>
                  <input
                    type="text"
                    value={editingProfile.illustrationPreference}
                    onChange={(e) => setEditingProfile({ ...editingProfile, illustrationPreference: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Color Palette</label>
                  <input
                    type="text"
                    value={editingProfile.colorPreference}
                    onChange={(e) => setEditingProfile({ ...editingProfile, colorPreference: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 bg-stone-200 text-stone-800 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingProfile)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
