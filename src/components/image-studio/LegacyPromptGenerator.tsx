import React, { useState } from 'react';
import { Sparkles, Copy, Check, X } from 'lucide-react';

interface LegacyPromptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegacyPromptGenerator: React.FC<LegacyPromptGeneratorProps> = ({
  isOpen,
  onClose
}) => {
  const [subject, setSubject] = useState('Vintage pocket watch with gears');
  const [style, setStyle] = useState('Copperplate engraving');
  const [medium, setMedium] = useState('Vector artwork on flat background');
  const [mood, setMood] = useState('Nostalgic, scholarly');
  const [colorScheme, setColorScheme] = useState('Monochrome iron black on cream paper');
  const [promptResult, setPromptResult] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateQuickPrompt = () => {
    const prompt = `A ${style.toLowerCase()} illustration of ${subject}. Style: ${medium}. Mood: ${mood}. Color palette: ${colorScheme}. Flat graphic artwork, clean vector lines, high contrast, suitable for t-shirt and mug printing. No 3d render, no physical mockup, no drop shadows.`;
    setPromptResult(prompt);
  };

  const handleCopy = () => {
    if (!promptResult) return;
    navigator.clipboard.writeText(promptResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 text-stone-900">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2 font-serif text-stone-900 font-semibold text-base">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Quick Settings Prompt Generator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-stone-700 font-medium mb-1">Subject / Object</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Art Style</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Medium / Output</label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Mood / Character</label>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Color Palette</label>
              <input
                type="text"
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateQuickPrompt}
          className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-colors shadow-2xs"
        >
          Generate Quick Prompt
        </button>

        {promptResult && (
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-950 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Quick Prompt Result:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 rounded-lg border border-stone-300 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-stone-900 select-all leading-relaxed font-sans">
              {promptResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
