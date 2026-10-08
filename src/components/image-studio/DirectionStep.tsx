import React, { useState } from 'react';
import { ImageProject, StructuredVisualDirection } from '../../types';
import { StructuredVisualParametersSelector } from './StructuredVisualParametersSelector';
import { Compass, ArrowRight, Edit3 } from 'lucide-react';

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
  const [creativeDir, setCreativeDir] = useState<string>(project.creativeDirection || '');

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
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100/80 text-amber-800 rounded-xl border border-amber-200/80 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
              STAGE 04 · DIRECTION SYNTHESIS
            </span>
            <h2 className="text-xl font-serif text-stone-900 font-semibold">Visual Direction</h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Synthesize your primary concept, secondary influences, reference characteristics, and creative direction into a structured framework before creating the Design Brief.
            </p>
          </div>
        </div>
      </div>

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
          <span>Continue to Design Brief</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
