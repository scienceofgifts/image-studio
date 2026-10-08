import React, { useState } from 'react';
import { ImageProject, InspirationReference, ReferenceAnalysis, SelectedCharacteristic } from '../../types';
import { saveInspirationItem, getInspirationLibrary } from '../../utils/storage';
import { Sparkles, Upload, Image as ImageIcon, Plus, Check, Trash2, ArrowRight, Bookmark, BookmarkCheck, AlertCircle } from 'lucide-react';

interface InspirationStepProps {
  project: ImageProject;
  onUpdateProject: (updated: ImageProject) => void;
  onAnalyzeReference: (reference: InspirationReference) => Promise<ReferenceAnalysis>;
  onNextStep: () => void;
  isAnalyzing: boolean;
}

export const InspirationStep: React.FC<InspirationStepProps> = ({
  project,
  onUpdateProject,
  onAnalyzeReference,
  onNextStep,
  isAnalyzing
}) => {
  const [refName, setRefName] = useState('');
  const [refType, setRefType] = useState('T-Shirt Graphic');
  const [refNotes, setRefNotes] = useState('');
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedLibraryIds, setSavedLibraryIds] = useState<string[]>(() =>
    getInspirationLibrary().map(i => i.id)
  );

  const referenceCategories = [
    'T-Shirt Graphic', 'Mug Design', 'Poster', 'Vintage Advertisement',
    'Typography Reference', 'Illustration', 'Packaging', 'Editorial Graphic', 'Museum Specimen'
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setRefImageBase64(event.target.result as string);
        if (!refName) {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          setRefName(nameWithoutExt);
        }
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddReference = () => {
    if (!refName.trim()) return;
    const newRef: InspirationReference = {
      id: 'ref-' + Date.now(),
      name: refName.trim(),
      type: refType,
      notes: refNotes.trim(),
      imageDataUrl: refImageBase64 || undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [...project.inspirationReferences, newRef];
    onUpdateProject({
      ...project,
      inspirationReferences: updated
    });

    // Automatically persist to persistent library as well
    saveInspirationItem(newRef);
    setSavedLibraryIds([...savedLibraryIds, newRef.id]);
    showToast(`Added "${newRef.name}" to project and inspiration library!`);

    setRefName('');
    setRefNotes('');
    setRefImageBase64(null);
    setFileError(null);
  };

  const handleToggleSaveToGlobalLibrary = (ref: InspirationReference, e: React.MouseEvent) => {
    e.stopPropagation();
    saveInspirationItem(ref);
    if (!savedLibraryIds.includes(ref.id)) {
      setSavedLibraryIds([...savedLibraryIds, ref.id]);
      showToast(`Saved "${ref.name}" to Global Inspiration Library!`);
    } else {
      showToast(`"${ref.name}" is already in Inspiration Library.`);
    }
  };

  const handleDeleteReference = (id: string) => {
    const updated = project.inspirationReferences.filter(r => r.id !== id);
    const updatedCharacteristics = project.selectedReferenceCharacteristics.filter(c => c.referenceId !== id);
    onUpdateProject({
      ...project,
      inspirationReferences: updated,
      selectedReferenceCharacteristics: updatedCharacteristics
    });
  };

  const toggleCharacteristic = (ref: InspirationReference, category: SelectedCharacteristic['category'], text: string) => {
    const existingIndex = project.selectedReferenceCharacteristics.findIndex(
      c => c.referenceId === ref.id && c.category === category && c.text === text
    );

    let updated: SelectedCharacteristic[] = [...project.selectedReferenceCharacteristics];
    if (existingIndex >= 0) {
      updated.splice(existingIndex, 1);
    } else {
      updated.push({
        id: 'char-' + Date.now() + Math.random().toString().slice(2, 6),
        referenceId: ref.id,
        referenceName: ref.name,
        category,
        text
      });
    }

    onUpdateProject({
      ...project,
      selectedReferenceCharacteristics: updated
    });
  };

  const isCharacteristicSelected = (refId: string, category: string, text: string) => {
    return project.selectedReferenceCharacteristics.some(
      c => c.referenceId === refId && c.category === category && c.text === text
    );
  };

  const runAnalysis = async (ref: InspirationReference) => {
    try {
      const analysis = await onAnalyzeReference(ref);
      const updatedRefs = project.inspirationReferences.map(r => 
        r.id === ref.id ? { ...r, analysis } : r
      );
      onUpdateProject({
        ...project,
        inspirationReferences: updatedRefs
      });
      showToast('Visual analysis completed!');
    } catch (e) {
      console.error('Failed to run analysis:', e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Lightweight Toast Feedback */}
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
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
              STAGE 03 · INSPIRATION ANALYSIS
            </span>
            <h2 className="text-xl font-serif text-stone-900 font-semibold">Inspiration Library &amp; Reference Analysis</h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Upload or describe visual references. Images render immediately and persist offline. AI can analyze design characteristics so you can synthesize original ideas without copying.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Upload Dropzone / Form */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-700" />
          <span>Add Visual Reference to Project</span>
        </h3>

        {fileError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{fileError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Reference Title</label>
            <input
              type="text"
              value={refName}
              onChange={(e) => setRefName(e.target.value)}
              placeholder="e.g. Victorian Botanical Catalog"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Type / Category</label>
            <select
              value={refType}
              onChange={(e) => setRefType(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            >
              {referenceCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Upload Reference Image (PNG/JPG/WebP)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-stone-200 file:text-stone-800 hover:file:bg-stone-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Immediate Thumbnail Rendering */}
        {refImageBase64 && (
          <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <img src={refImageBase64} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-stone-300 shadow-2xs shrink-0" />
            <div className="text-xs text-stone-800 space-y-0.5">
              <span className="text-emerald-800 font-semibold block flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Thumbnail Loaded Immediately
              </span>
              <p className="text-[11px] text-stone-500">Image stored in project state &amp; local memory.</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">User Notes / Specific Focus</label>
          <input
            type="text"
            value={refNotes}
            onChange={(e) => setRefNotes(e.target.value)}
            placeholder="e.g. Love the engraved two-color illustration and formal specimen border layout"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleAddReference}
            disabled={!refName.trim()}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors shadow-2xs ${
              !refName.trim()
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            Add Reference to Project
          </button>
        </div>
      </div>

      {/* Reference Library List */}
      <div className="space-y-6">
        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
          Project Visual References ({project.inspirationReferences.length})
        </h3>

        {project.inspirationReferences.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-200/80 rounded-2xl text-stone-500 text-xs shadow-2xs">
            No visual references added yet. Use the form above to attach inspiration images or notes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.inspirationReferences.map((ref) => {
              const hasAnalysis = !!ref.analysis;
              const isSavedInLibrary = savedLibraryIds.includes(ref.id);

              return (
                <div key={ref.id} className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {ref.imageDataUrl ? (
                        <img src={ref.imageDataUrl} alt={ref.name} className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <span className="text-[11px] font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200/80">
                          {ref.type}
                        </span>
                        <h4 className="text-sm font-semibold text-stone-900 font-serif mt-1">{ref.name}</h4>
                        {ref.notes && <p className="text-xs text-stone-600 italic mt-0.5">{ref.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSaveToGlobalLibrary(ref, e)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                          isSavedInLibrary
                            ? 'bg-amber-100 text-amber-950 border-amber-300 font-semibold'
                            : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                        }`}
                        title={isSavedInLibrary ? 'Saved to Inspiration Library' : 'Save to Global Inspiration Library'}
                      >
                        {isSavedInLibrary ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-800" /> : <Bookmark className="w-3.5 h-3.5 text-stone-500" />}
                        <span>{isSavedInLibrary ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReference(ref.id)}
                        className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Remove reference"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI Action: Analyze Reference */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => runAnalysis(ref)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 hover:bg-amber-200/80 text-amber-900 rounded-lg border border-amber-300 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{hasAnalysis ? 'Re-Analyze Reference' : 'Analyze Reference'}</span>
                    </button>

                    {hasAnalysis && (
                      <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Analysis complete
                      </span>
                    )}
                  </div>

                  {/* Analysis Breakdown Chips */}
                  {hasAnalysis && ref.analysis && (
                    <div className="mt-3 pt-3 border-t border-stone-200 space-y-2 text-xs">
                      <p className="text-[11px] font-medium text-stone-500">
                        Click any extracted characteristic to carry it forward into your design direction:
                      </p>

                      <div className="space-y-1.5">
                        {Object.entries(ref.analysis).map(([catKey, value]) => {
                          const categoryName = catKey
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase());
                          const isSelected = isCharacteristicSelected(ref.id, catKey as any, value);

                          return (
                            <button
                              key={catKey}
                              type="button"
                              onClick={() => toggleCharacteristic(ref, catKey as any, value)}
                              className={`w-full text-left p-2 rounded-lg text-[11px] border transition-all ${
                                isSelected
                                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-medium'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              <div className="flex items-center justify-between font-medium text-stone-500 mb-0.5">
                                <span>{categoryName}</span>
                                {isSelected && <Check className="w-3 h-3 text-amber-800" />}
                              </div>
                              <p className="line-clamp-2">{value}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Characteristics Carry Forward Summary */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
        <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
          Selected Characteristics Carried Forward ({project.selectedReferenceCharacteristics.length})
        </h4>
        {project.selectedReferenceCharacteristics.length === 0 ? (
          <p className="text-xs text-stone-500">
            No characteristics selected yet. Analyze a reference above and click any characteristic chip to carry it forward into your Design Brief.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.selectedReferenceCharacteristics.map((char) => (
              <span
                key={char.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-950 text-xs rounded-xl font-medium"
              >
                <span className="font-semibold text-amber-900">{char.referenceName}</span>
                <span className="text-amber-400">·</span>
                <span>{char.text}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-end pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={onNextStep}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-all shadow-2xs"
        >
          <span>Continue to Visual Direction</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
