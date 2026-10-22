import React, { useState, useEffect, useRef } from 'react';
import { IdeaExplorerRefinements } from '../../types/ideaExplorer';
import { ChevronDown, SlidersHorizontal, X, Plus, Sparkles, Filter, Check } from 'lucide-react';

interface RefinementsPanelProps {
  refinements: IdeaExplorerRefinements;
  onChange: (updated: IdeaExplorerRefinements) => void;
  onClear: () => void;
}

const PRESET_TONES = [
  'Witty',
  'Scholarly',
  'Nostalgic',
  'Satirical',
  'Minimalist',
  'Poetic',
  'Reverent',
  'Bold',
  'Playful',
  'Dark Humor',
  'Sophisticated',
  'Whimsical'
];

const PRESET_AESTHETICS = [
  'Vintage Engraving',
  'Bauhaus',
  'Technical Blueprint',
  'Cyberpunk',
  'Archival Botanical',
  'Minimalist Monoline',
  'Retro Editorial',
  'Victorian Specimen',
  'Woodcut Print',
  'Mid-Century Modern'
];

const PRESET_PRODUCTS = [
  'Apparel & Sweatshirts',
  'Coffee Mug & Drinkware',
  'Fine Art Wall Print',
  'Notebook & Journal',
  'Tote Bag',
  'Greeting Card & Stationery',
  'Die-Cut Sticker & Decal',
  'Desk & Everyday Object'
];

const PRESET_AUDIENCES = [
  'History Enthusiasts & Scholars',
  'Book Lovers & Writers',
  'Science & Tech Geeks',
  'Design & Architecture Aficionados',
  'Humor & Pun Lovers',
  'Thoughtful Gift Buyers'
];

export const RefinementsPanel: React.FC<RefinementsPanelProps> = ({
  refinements,
  onChange,
  onClear
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newIncludeTag, setNewIncludeTag] = useState('');
  const [newExcludeTag, setNewExcludeTag] = useState('');

  // Available options state for Target Product / Format
  const [productOptions, setProductOptions] = useState<string[]>(() => {
    const list = [...PRESET_PRODUCTS];
    if (refinements.intendedUse && !list.includes(refinements.intendedUse)) {
      list.push(refinements.intendedUse);
    }
    return list;
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [customProductText, setCustomProductText] = useState('');
  const productInputRef = useRef<HTMLInputElement>(null);

  // Available options state for Target Audience
  const [audienceOptions, setAudienceOptions] = useState<string[]>(() => {
    const list = [...PRESET_AUDIENCES];
    if (refinements.audience && !list.includes(refinements.audience)) {
      list.push(refinements.audience);
    }
    return list;
  });
  const [isAddingAudience, setIsAddingAudience] = useState(false);
  const [customAudienceText, setCustomAudienceText] = useState('');
  const audienceInputRef = useRef<HTMLInputElement>(null);

  // Synchronize options if external refinements supply custom values
  useEffect(() => {
    if (refinements.intendedUse && !productOptions.includes(refinements.intendedUse)) {
      setProductOptions(prev => [...prev, refinements.intendedUse!]);
    }
  }, [refinements.intendedUse]);

  useEffect(() => {
    if (refinements.audience && !audienceOptions.includes(refinements.audience)) {
      setAudienceOptions(prev => [...prev, refinements.audience!]);
    }
  }, [refinements.audience]);

  const activeCount =
    (refinements.tones?.length || 0) +
    (refinements.aesthetics?.length || 0) +
    (refinements.audience ? 1 : 0) +
    (refinements.intendedUse ? 1 : 0) +
    (refinements.includeElements?.length || 0) +
    (refinements.excludeElements?.length || 0) +
    (refinements.customInstructions?.trim() ? 1 : 0);

  const toggleTone = (tone: string) => {
    const current = refinements.tones || [];
    const updated = current.includes(tone)
      ? current.filter(t => t !== tone)
      : [...current, tone];
    onChange({ ...refinements, tones: updated });
  };

  const toggleAesthetic = (aes: string) => {
    const current = refinements.aesthetics || [];
    const updated = current.includes(aes)
      ? current.filter(a => a !== aes)
      : [...current, aes];
    onChange({ ...refinements, aesthetics: updated });
  };

  const handleProductSelect = (product: string) => {
    onChange({
      ...refinements,
      intendedUse: refinements.intendedUse === product ? undefined : product
    });
  };

  const handleAudienceSelect = (aud: string) => {
    onChange({
      ...refinements,
      audience: refinements.audience === aud ? undefined : aud
    });
  };

  const handleStartAddProduct = () => {
    setIsAddingProduct(true);
    setTimeout(() => productInputRef.current?.focus(), 50);
  };

  const handleAddCustomProduct = () => {
    const val = customProductText.trim();
    if (!val) return;

    if (!productOptions.includes(val)) {
      setProductOptions(prev => [...prev, val]);
    }
    // Auto-select newly added custom chip
    onChange({
      ...refinements,
      intendedUse: val
    });

    setCustomProductText('');
    setIsAddingProduct(false);
  };

  const handleRemoveCustomProduct = (prod: string) => {
    setProductOptions(prev => prev.filter(p => p !== prod));
    if (refinements.intendedUse === prod) {
      onChange({ ...refinements, intendedUse: undefined });
    }
  };

  const handleStartAddAudience = () => {
    setIsAddingAudience(true);
    setTimeout(() => audienceInputRef.current?.focus(), 50);
  };

  const handleAddCustomAudience = () => {
    const val = customAudienceText.trim();
    if (!val) return;

    if (!audienceOptions.includes(val)) {
      setAudienceOptions(prev => [...prev, val]);
    }
    // Auto-select newly added custom chip
    onChange({
      ...refinements,
      audience: val
    });

    setCustomAudienceText('');
    setIsAddingAudience(false);
  };

  const handleRemoveCustomAudience = (aud: string) => {
    setAudienceOptions(prev => prev.filter(a => a !== aud));
    if (refinements.audience === aud) {
      onChange({ ...refinements, audience: undefined });
    }
  };

  const addIncludeElement = () => {
    const val = newIncludeTag.trim();
    if (!val) return;
    const current = refinements.includeElements || [];
    if (!current.includes(val)) {
      onChange({ ...refinements, includeElements: [...current, val] });
    }
    setNewIncludeTag('');
  };

  const removeIncludeElement = (tag: string) => {
    const current = refinements.includeElements || [];
    onChange({ ...refinements, includeElements: current.filter(t => t !== tag) });
  };

  const addExcludeElement = () => {
    const val = newExcludeTag.trim();
    if (!val) return;
    const current = refinements.excludeElements || [];
    if (!current.includes(val)) {
      onChange({ ...refinements, excludeElements: [...current, val] });
    }
    setNewExcludeTag('');
  };

  const removeExcludeElement = (tag: string) => {
    const current = refinements.excludeElements || [];
    onChange({ ...refinements, excludeElements: current.filter(t => t !== tag) });
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
      {/* Accordion Toggle Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-stone-50/60 hover:bg-stone-50 border-b border-stone-100 transition-colors">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-medium text-stone-800 hover:text-stone-900 transition-colors text-left flex-1"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Refinement Criteria &amp; Directives</span>
          {activeCount > 0 ? (
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
              {activeCount} active
            </span>
          ) : (
            <span className="text-[11px] text-stone-500 font-normal hidden sm:inline">
              (Optional: tone, aesthetic, target product, constraints)
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] text-stone-500 hover:text-stone-800 underline transition-colors px-2 py-0.5"
            >
              Reset Filters
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-stone-500 hover:text-stone-800 transition-colors"
            aria-label="Toggle refinements"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-5 bg-white text-xs text-stone-800 animate-fadeIn">
          {/* Tone Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider font-mono">
                Tone &amp; Temperament
              </label>
              <span className="text-[10px] text-stone-600">Select multiple</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TONES.map(tone => {
                const isSelected = (refinements.tones || []).includes(tone);
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => toggleTone(tone)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-medium shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aesthetic Direction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider font-mono">
                Visual Aesthetic
              </label>
              <span className="text-[10px] text-stone-600">Select multiple</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_AESTHETICS.map(aes => {
                const isSelected = (refinements.aesthetics || []).includes(aes);
                return (
                  <button
                    key={aes}
                    type="button"
                    onClick={() => toggleAesthetic(aes)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-medium shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {aes}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intended Product & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-stone-100">
            {/* Intended Product / Use */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider font-mono">
                Target Product / Format
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {productOptions.map(prod => {
                  const isSelected = refinements.intendedUse === prod;
                  const isCustom = !PRESET_PRODUCTS.includes(prod);
                  return (
                    <button
                      key={prod}
                      type="button"
                      onClick={() => handleProductSelect(prod)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs transition-all border ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 font-medium'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <span>{prod}</span>
                      {isCustom && (
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomProduct(prod);
                          }}
                          className={`ml-1.5 -mr-0.5 p-0.5 rounded-full transition-colors ${
                            isSelected
                              ? 'hover:bg-white/25 text-white/80 hover:text-white'
                              : 'hover:bg-stone-200 text-stone-400 hover:text-stone-700'
                          }`}
                          title="Remove custom option"
                        >
                          <X className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Custom Product Input or Add Button */}
                {isAddingProduct ? (
                  <div className="inline-flex items-center gap-1 bg-stone-50 border border-stone-300 rounded-lg px-2 py-0.5 focus-within:border-amber-600 focus-within:bg-white transition-all shadow-2xs">
                    <input
                      ref={productInputRef}
                      type="text"
                      value={customProductText}
                      onChange={e => setCustomProductText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomProduct();
                        } else if (e.key === 'Escape') {
                          setIsAddingProduct(false);
                          setCustomProductText('');
                        }
                      }}
                      placeholder="Custom format..."
                      className="bg-transparent text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden w-28 sm:w-36 py-0.5"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomProduct}
                      disabled={!customProductText.trim()}
                      className="p-0.5 rounded text-stone-700 hover:text-stone-950 hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Add & select"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setCustomProductText('');
                      }}
                      className="p-0.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartAddProduct}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all border border-dashed border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50"
                    title="Add custom target product or format"
                  >
                    <Plus className="w-3 h-3 text-stone-500" />
                    <span>Add Custom</span>
                  </button>
                )}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider font-mono">
                Target Audience
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {audienceOptions.map(aud => {
                  const isSelected = refinements.audience === aud;
                  const isCustom = !PRESET_AUDIENCES.includes(aud);
                  return (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => handleAudienceSelect(aud)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs transition-all border ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 font-medium'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <span>{aud}</span>
                      {isCustom && (
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomAudience(aud);
                          }}
                          className={`ml-1.5 -mr-0.5 p-0.5 rounded-full transition-colors ${
                            isSelected
                              ? 'hover:bg-white/25 text-white/80 hover:text-white'
                              : 'hover:bg-stone-200 text-stone-400 hover:text-stone-700'
                          }`}
                          title="Remove custom option"
                        >
                          <X className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Custom Audience Input or Add Button */}
                {isAddingAudience ? (
                  <div className="inline-flex items-center gap-1 bg-stone-50 border border-stone-300 rounded-lg px-2 py-0.5 focus-within:border-amber-600 focus-within:bg-white transition-all shadow-2xs">
                    <input
                      ref={audienceInputRef}
                      type="text"
                      value={customAudienceText}
                      onChange={e => setCustomAudienceText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomAudience();
                        } else if (e.key === 'Escape') {
                          setIsAddingAudience(false);
                          setCustomAudienceText('');
                        }
                      }}
                      placeholder="Custom audience..."
                      className="bg-transparent text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden w-28 sm:w-36 py-0.5"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAudience}
                      disabled={!customAudienceText.trim()}
                      className="p-0.5 rounded text-stone-700 hover:text-stone-950 hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Add & select"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAudience(false);
                        setCustomAudienceText('');
                      }}
                      className="p-0.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartAddAudience}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all border border-dashed border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50"
                    title="Add custom target audience"
                  >
                    <Plus className="w-3 h-3 text-stone-500" />
                    <span>Add Custom</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Must Include & Must Avoid Elements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-stone-100">
            {/* Must Include */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Must Include Elements</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newIncludeTag}
                  onChange={e => setNewIncludeTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIncludeElement())}
                  placeholder="e.g. latin quote, diagram labels"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={addIncludeElement}
                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {refinements.includeElements && refinements.includeElements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {refinements.includeElements.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeIncludeElement(tag)}
                        className="hover:text-emerald-950"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Must Avoid */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Must Avoid / Exclude</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newExcludeTag}
                  onChange={e => setNewExcludeTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addExcludeElement())}
                  placeholder="e.g. cliché puns, skulls, neon colors"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={addExcludeElement}
                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {refinements.excludeElements && refinements.excludeElements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {refinements.excludeElements.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-md text-[11px]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeExcludeElement(tag)}
                        className="hover:text-rose-950"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Constraints / Prompt Additions */}
          <div className="space-y-1.5 pt-1 border-t border-stone-100">
            <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider font-mono">
              Custom Conceptual Constraints &amp; Directives
            </label>
            <input
              type="text"
              value={refinements.customInstructions || ''}
              onChange={e => onChange({ ...refinements, customInstructions: e.target.value })}
              placeholder="e.g., Focus specifically on the ironic contrast between Victorian propriety and modern cynicism"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
