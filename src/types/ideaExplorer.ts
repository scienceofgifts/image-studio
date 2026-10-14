export interface IdeaExplorerRefinements {
  tones?: string[];
  aesthetics?: string[];
  audience?: string;
  intendedUse?: string;
  includeElements?: string[];
  excludeElements?: string[];
  customInstructions?: string;
}

export interface IdeaExplorerIdea {
  id: string;
  title: string;
  description: string;
  corePremise: string;
  executionSuggestions?: string[];
  tags?: string[];
  topic: string;
  createdAt: string;
  sessionId: string;
  batchId: string;
  parentIdeaIds?: string[];
  refinementSnapshot?: IdeaExplorerRefinements;
  isSaved?: boolean;
  modelUsed?: string;
}

export interface IdeaExplorerBatch {
  id: string;
  sessionId: string;
  ideaIds: string[];
  parentIdeaIds?: string[];
  refinementSnapshot?: IdeaExplorerRefinements;
  creativeDirection?: string;
  createdAt: string;
  generationType: 'initial' | 'refined' | 'branched';
  modelUsed?: string;
}

export interface IdeaExplorerSession {
  id: string;
  title: string;
  originalTopic: string;
  createdAt: string;
  updatedAt: string;
  activeRefinements: IdeaExplorerRefinements;
  creativeDirection: string;
  batchIds: string[];
  currentBatchId: string;
  selectedIdeaIds: string[];
}

export interface IdeaExplorerSavedItem {
  id: string;
  idea: IdeaExplorerIdea;
  savedAt: string;
  customNotes?: string;
  tags?: string[];
}

export interface IdeaExplorerBackupData {
  version: '1.0';
  app: 'ScienceOfGifts.IdeaExplorer';
  exportedAt: string;
  sessions: IdeaExplorerSession[];
  batches: IdeaExplorerBatch[];
  ideas: IdeaExplorerIdea[];
  savedLibrary: IdeaExplorerSavedItem[];
}
