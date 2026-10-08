import React, { useState, useEffect } from 'react';
import { StructuredVisualDirection, StructuredVisualParameters } from '../../types';
import { Layout, Type, PenTool, Palette, Layers, Clock, Smile, Sparkles, Plus, Check } from 'lucide-react';

interface Props {
  value: StructuredVisualDirection;
  onChange: (updated: StructuredVisualDirection) => void;
  creativeDirection: string;
  onCreativeDirectionChange: (val: string) => void;
}

export const StructuredVisualParametersSelector: React.FC<Props> = ({
  value,
  onChange,
  creativeDirection,
  onCreativeDirectionChange
}) => {
  // Initialize parameters state with defaults or existing values
  const initParams = value.parameters || {
    compositions: value.composition ? value.composition.split(', ').filter(Boolean) : ['Balanced'],
    framings: ['Centered'],
    typographyFontCharacters: value.typography ? value.typography.split(', ').filter(Boolean) : ['Serif'],
    typographyRoles: ['Typography-led'],
    typographyCharacters: ['Editorial'],
    illustrationStyles: value.illustration ? value.illustration.split(', ').filter(Boolean) : ['Engraving'],
    colorPalettes: value.color ? value.color.split(', ').filter(Boolean) : ['Monochrome'],
    textures: value.texture ? value.texture.split(', ').filter(Boolean) : ['Paper Grain'],
    eras: value.era ? value.era.split(', ').filter(Boolean) : ['Victorian'],
    moods: value.mood ? value.mood.split(', ').filter(Boolean) : ['Scholarly'],
    hierarchyPrimary: 'Typography',
    hierarchySecondary: ['Supporting Illustration']
  };

  const [params, setParams] = useState<StructuredVisualParameters>(initParams);
  const [showCustomComp, setShowCustomComp] = useState(!!params.customComposition);
  const [showCustomTypo, setShowCustomTypo] = useState(!!params.customTypography);
  const [showCustomIll, setShowCustomIll] = useState(!!params.customIllustration);
  const [showCustomColor, setShowCustomColor] = useState(!!params.customColorHex || !!params.customColorNote);
  const [showCustomEra, setShowCustomEra] = useState(!!params.customEra);

  // Helper to toggle items in array
  const toggleArray = <K extends keyof StructuredVisualParameters>(
    field: K,
    item: string
  ) => {
    const current = (params[field] as string[]) || [];
    const exists = current.includes(item);
    const updated = exists ? current.filter(i => i !== item) : [...current, item];
    updateParams({ ...params, [field]: updated });
  };

  const updateParams = (newParams: StructuredVisualParameters) => {
    setParams(newParams);

    // Synthesize readable string representations for backward compatibility & AI context
    const compStr = [
      ...newParams.compositions,
      ...newParams.framings.map(f => `${f} Frame`),
      newParams.customComposition
    ].filter(Boolean).join(', ');

    const typoStr = [
      ...newParams.typographyFontCharacters,
      ...newParams.typographyRoles.map(r => `Role: ${r}`),
      ...newParams.typographyCharacters.map(c => `${c} character`),
      newParams.customTypography
    ].filter(Boolean).join(', ');

    const illStr = [
      ...newParams.illustrationStyles,
      newParams.customIllustration
    ].filter(Boolean).join(', ');

    const colorStr = [
      ...newParams.colorPalettes,
      newParams.customColorHex ? `Custom (${newParams.customColorHex})` : null,
      newParams.customColorNote
    ].filter(Boolean).join(', ');

    const textureStr = (newParams.textures || []).filter(Boolean).join(', ');
    const eraStr = [...newParams.eras, newParams.customEra].filter(Boolean).join(', ');
    const moodStr = (newParams.moods || []).filter(Boolean).join(', ');

    const hierarchyStr = `Primary: ${newParams.hierarchyPrimary || 'Balanced'}, Secondary: ${(newParams.hierarchySecondary || []).join(', ')}${
      newParams.hierarchyCustomNote ? ` (${newParams.hierarchyCustomNote})` : ''
    }`;

    onChange({
      composition: compStr || 'Balanced Composition',
      typography: typoStr || 'Serif Typography',
      illustration: illStr || 'Engraving Illustration',
      color: colorStr || 'Monochrome',
      texture: textureStr || 'Paper Grain',
      era: eraStr || 'Victorian',
      mood: moodStr || 'Scholarly',
      visualHierarchy: hierarchyStr,
      parameters: newParams
    });
  };

  // Option lists
  const compositions = ['Minimal', 'Balanced', 'Dense', 'Layered', 'Collage', 'Typography-led', 'Illustration-led', 'Image-led', 'Balanced Text + Image'];
  const framings = ['Centered', 'Asymmetric', 'Framed', 'Full Bleed', 'Badge', 'Poster', 'Grid', 'Stacked'];

  const fontCharacters = ['Serif', 'Sans Serif', 'Slab Serif', 'Condensed', 'Display', 'Handwritten', 'Monospaced', 'Decorative', 'Mixed'];
  const typographyRoles = ['Typography-led', 'Image-led', 'Balanced'];
  const typographyCharacters = ['Academic', 'Vintage', 'Editorial', 'Industrial', 'Playful', 'Formal', 'Experimental'];

  const illustrationStyles = [
    'Engraving', 'Woodcut', 'Etching', 'Line Art', 'Screen Print', 'Scientific Diagram',
    'Botanical Illustration', 'Hand Drawn', 'Geometric', 'Collage', 'Cut Paper', 'Photographic', 'Minimal Graphic', 'None'
  ];

  const colorOptions = [
    { name: 'Monochrome', swatches: ['#1c1917', '#f5f5f4', '#44403c'] },
    { name: 'Black + Cream', swatches: ['#0c0a09', '#fef3c7', '#78350f'] },
    { name: 'Muted Vintage', swatches: ['#78350f', '#d97706', '#fef3c7'] },
    { name: 'Earth Tones', swatches: ['#3f6212', '#78350f', '#ca8a04'] },
    { name: 'Cool Academic', swatches: ['#1e3a8a', '#334155', '#e2e8f0'] },
    { name: 'Warm Academic', swatches: ['#7c2d12', '#b45309', '#fef3c7'] },
    { name: 'Pastel', swatches: ['#fbcfe8', '#bae6fd', '#fef08a'] },
    { name: 'Limited Palette', swatches: ['#0284c7', '#0f172a', '#ffffff'] },
    { name: 'High Contrast', swatches: ['#000000', '#ffffff', '#dc2626'] },
    { name: 'Low Contrast', swatches: ['#57534e', '#78716c', '#e7e5e4'] },
    { name: 'Neutral', swatches: ['#27272a', '#71717a', '#f4f4f5'] }
  ];

  const textures = ['Clean', 'Paper Grain', 'Aged Paper', 'Distressed', 'Ink Texture', 'Screen Print', 'Letterpress', 'Grain', 'Rough', 'Smooth', 'None'];
  const eras = ['Contemporary', 'Vintage', 'Victorian', 'Edwardian', 'Art Deco', 'Mid-Century', '1970s', '1980s', 'Archival', 'Museum', 'Academic', 'Scientific', 'Industrial', 'Retro'];
  const moods = ['Scholarly', 'Serious', 'Playful', 'Witty', 'Nostalgic', 'Sophisticated', 'Quirky', 'Bold', 'Minimal', 'Mysterious', 'Academic', 'Irreverent', 'Experimental', 'Refined'];

  const hierarchyPrimaries = ['Typography', 'Illustration', 'Central Object', 'Symbol', 'Character', 'Composition', 'Balanced'];
  const hierarchySecondaries = ['Supporting Typography', 'Supporting Illustration', 'Decorative Elements', 'Texture', 'Background'];

  return (
    <div className="space-y-8">
      {/* 1. Composition & Framing */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Layout className="w-4 h-4 text-amber-700" />
          <span>1. Composition &amp; Framing</span>
        </label>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-stone-500 block">Composition Type:</span>
          <div className="flex flex-wrap gap-1.5">
            {compositions.map(c => {
              const isSelected = params.compositions.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleArray('compositions', c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-medium text-stone-500 block">Framing Style:</span>
          <div className="flex flex-wrap gap-1.5">
            {framings.map(f => {
              const isSelected = params.framings.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleArray('framings', f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {f}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowCustomComp(!showCustomComp)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Custom Composition</span>
            </button>
          </div>

          {showCustomComp && (
            <input
              type="text"
              value={params.customComposition || ''}
              onChange={(e) => updateParams({ ...params, customComposition: e.target.value })}
              placeholder="e.g. Symmetrical 3x3 specimen grid with central cartouche..."
              className="w-full mt-2 px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          )}
        </div>
      </div>

      {/* 2. Typography Direction */}
      <div className="space-y-3 pt-4 border-t border-stone-200/80">
        <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-4 h-4 text-amber-700" />
          <span>2. Typography Direction</span>
        </label>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-stone-500 block">Font Classification:</span>
          <div className="flex flex-wrap gap-1.5">
            {fontCharacters.map(f => {
              const isSelected = params.typographyFontCharacters.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleArray('typographyFontCharacters', f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1.5">Typography Role:</span>
            <div className="flex flex-wrap gap-1.5">
              {typographyRoles.map(r => {
                const isSelected = params.typographyRoles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleArray('typographyRoles', r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1.5">Typography Style/Character:</span>
            <div className="flex flex-wrap gap-1.5">
              {typographyCharacters.map(tc => {
                const isSelected = params.typographyCharacters.includes(tc);
                return (
                  <button
                    key={tc}
                    type="button"
                    onClick={() => toggleArray('typographyCharacters', tc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-stone-800 text-white border-stone-800 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {tc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Illustration Style & Medium */}
      <div className="space-y-3 pt-4 border-t border-stone-200/80">
        <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <PenTool className="w-4 h-4 text-amber-700" />
          <span>3. Illustration Style &amp; Medium</span>
        </label>

        <div className="flex flex-wrap gap-1.5">
          {illustrationStyles.map(ill => {
            const isSelected = params.illustrationStyles.includes(ill);
            return (
              <button
                key={ill}
                type="button"
                onClick={() => toggleArray('illustrationStyles', ill)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {ill}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCustomIll(!showCustomIll)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-dashed border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Custom Style</span>
          </button>
        </div>

        {showCustomIll && (
          <input
            type="text"
            value={params.customIllustration || ''}
            onChange={(e) => updateParams({ ...params, customIllustration: e.target.value })}
            placeholder="e.g. Fine 19th-century copperplate engraving with stippled shading..."
            className="w-full mt-2 px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600"
          />
        )}
      </div>

      {/* 4. Color Palette & Swatches */}
      <div className="space-y-3 pt-4 border-t border-stone-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-700" />
            <span>4. Color Palette Direction</span>
          </label>

          <button
            type="button"
            onClick={() => setShowCustomColor(!showCustomColor)}
            className="text-[11px] text-amber-900 hover:underline font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Custom Hex Color</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {colorOptions.map(opt => {
            const isSelected = params.colorPalettes.includes(opt.name);
            return (
              <button
                key={opt.name}
                type="button"
                onClick={() => toggleArray('colorPalettes', opt.name)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="text-xs">{opt.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {opt.swatches.map((hex, sIdx) => (
                    <span
                      key={sIdx}
                      className="w-3 h-3 rounded-full border border-stone-300/80 inline-block"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {showCustomColor && (
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 mt-2">
            <input
              type="color"
              value={params.customColorHex || '#78350f'}
              onChange={(e) => updateParams({ ...params, customColorHex: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <input
              type="text"
              value={params.customColorNote || ''}
              onChange={(e) => updateParams({ ...params, customColorNote: e.target.value })}
              placeholder="e.g. Deep indigo accent with warm ivory background"
              className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
        )}
      </div>

      {/* 5. Texture & Surface Finish */}
      <div className="space-y-3 pt-4 border-t border-stone-200/80">
        <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-700" />
          <span>5. Texture &amp; Surface Finish</span>
        </label>

        <div className="flex flex-wrap gap-1.5">
          {textures.map(t => {
            const isSelected = params.textures.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleArray('textures', t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Era & Mood */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-200/80">
        <div className="space-y-3">
          <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>6. Era / Reference Language</span>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {eras.map(e => {
              const isSelected = params.eras.includes(e);
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleArray('eras', e)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {e}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Smile className="w-4 h-4 text-amber-700" />
            <span>7. Mood &amp; Emotional Character</span>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {moods.map(m => {
              const isSelected = params.moods.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleArray('moods', m)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8. Visual Hierarchy */}
      <div className="space-y-3 pt-4 border-t border-stone-200/80">
        <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>8. Visual Hierarchy Focus</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1.5">Primary Focus:</span>
            <div className="flex flex-wrap gap-1.5">
              {hierarchyPrimaries.map(hp => {
                const isSelected = params.hierarchyPrimary === hp;
                return (
                  <button
                    key={hp}
                    type="button"
                    onClick={() => updateParams({ ...params, hierarchyPrimary: hp })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {hp}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1.5">Secondary Emphasis:</span>
            <div className="flex flex-wrap gap-1.5">
              {hierarchySecondaries.map(hs => {
                const isSelected = (params.hierarchySecondary || []).includes(hs);
                return (
                  <button
                    key={hs}
                    type="button"
                    onClick={() => toggleArray('hierarchySecondary', hs)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {hs}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 10. SINGLE PROMINENT FREEFORM CREATIVE FIELD */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-2 pt-4">
        <label className="block text-xs font-semibold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>Creative Direction (Human Overriding Intent)</span>
        </label>
        <textarea
          rows={3}
          value={creativeDirection}
          onChange={(e) => onCreativeDirectionChange(e.target.value)}
          placeholder='e.g. "Make it feel like an authentic 19th-century museum specimen artifact, but with subtle academic humor in the catalog details."'
          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 font-sans leading-relaxed shadow-2xs"
        />
        <p className="text-[11px] text-stone-600">
          Express your specific human concept that predefined controls cannot capture. The AI will synthesize your creative direction with the structured parameters above.
        </p>
      </div>
    </div>
  );
};
