export interface ModelConfig {
  id: string;
  displayName: string;
  shortName: string;
  description: string;
  speed: string;
  capability: string;
  badgeColor: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    shortName: '3.8 Flash',
    description: 'Most capable current Flash model for complex, long-horizon tasks.',
    speed: 'High Speed',
    capability: 'Maximum Capability',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-300'
  },
  {
    id: 'gemini-3.7-flash',
    displayName: 'Gemini 3.7 Flash',
    shortName: '3.7 Flash',
    description: 'Previous-generation Flash model for complex coding, agentic workflows, and multi-step tasks.',
    speed: 'High Speed',
    capability: 'Advanced Reasoning',
    badgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-300'
  },
  {
    id: 'gemini-3.6-flash',
    displayName: 'Gemini 3.6 Flash',
    shortName: '3.6 Flash',
    description: 'Balanced Flash model for general-purpose and multimodal tasks.',
    speed: 'Very Fast',
    capability: 'Balanced Multimodal',
    badgeColor: 'bg-purple-100 text-purple-950 border-purple-300'
  },
  {
    id: 'gemini-3.5-flash',
    displayName: 'Gemini 3.5 Flash',
    shortName: '3.5 Flash',
    description: 'Previous-generation Flash model for routine, high-throughput tasks.',
    speed: 'Very Fast',
    capability: 'High Capability',
    badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300'
  },
  {
    id: 'gemini-3.5-flash-lite',
    displayName: 'Gemini 3.5 Flash-Lite',
    shortName: '3.5 Lite',
    description: 'Fast, cost-efficient model for high-throughput tasks.',
    speed: 'Ultra Fast',
    capability: 'High Throughput',
    badgeColor: 'bg-teal-100 text-teal-950 border-teal-300'
  },
  {
    id: 'gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash-Lite',
    shortName: '3.1 Lite',
    description: 'Lightweight, cost-efficient Flash model for fast tasks.',
    speed: 'Fastest',
    capability: 'Lightweight Speed',
    badgeColor: 'bg-blue-100 text-blue-950 border-blue-300'
  }
];

export const DEFAULT_MODEL_ID = 'gemini-3.5-flash';

const GLOBAL_MODEL_STORAGE_KEY = 'sog_global_default_model_v1';

export function getGlobalDefaultModel(): string {
  try {
    const saved = localStorage.getItem(GLOBAL_MODEL_STORAGE_KEY);
    if (saved && (AVAILABLE_MODELS.some(m => m.id === saved) || saved === 'gemini-2.5-flash')) {
      return saved;
    }
  } catch (e) {
    console.error('Failed to read global default model:', e);
  }
  return DEFAULT_MODEL_ID;
}

export function setGlobalDefaultModel(modelId: string): void {
  try {
    localStorage.setItem(GLOBAL_MODEL_STORAGE_KEY, modelId);
  } catch (e) {
    console.error('Failed to save global default model:', e);
  }
}

export function getModelConfig(modelId?: string): ModelConfig {
  if (!modelId) {
    return AVAILABLE_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || AVAILABLE_MODELS[3];
  }
  const found = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (found) return found;

  if (modelId === 'gemini-2.5-flash') {
    return {
      id: 'gemini-2.5-flash',
      displayName: 'Gemini 2.5 Flash',
      shortName: '2.5 Flash',
      description: 'Legacy Flash model',
      speed: 'Fast',
      capability: 'Legacy Capability',
      badgeColor: 'bg-stone-200 text-stone-900 border-stone-300'
    };
  }

  return AVAILABLE_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || AVAILABLE_MODELS[3];
}
