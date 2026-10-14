import {
  IdeaExplorerSession,
  IdeaExplorerBatch,
  IdeaExplorerIdea,
  IdeaExplorerSavedItem,
  IdeaExplorerBackupData
} from '../types/ideaExplorer';

const STORAGE_KEYS = {
  SESSIONS: 'scienceOfGifts.ideaExplorer.v1.sessions',
  BATCHES: 'scienceOfGifts.ideaExplorer.v1.batches',
  IDEAS: 'scienceOfGifts.ideaExplorer.v1.ideas',
  SAVED: 'scienceOfGifts.ideaExplorer.v1.saved',
  ACTIVE_SESSION: 'scienceOfGifts.ideaExplorer.v1.activeSessionId'
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[IdeaExplorerStorage] Failed to read ${key}:`, err);
    return defaultValue;
  }
}

function safeSetItem(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[IdeaExplorerStorage] Failed to write ${key}:`, err);
    return false;
  }
}

// SESSIONS
export function getIdeaExplorerSessions(): IdeaExplorerSession[] {
  return safeGetItem<IdeaExplorerSession[]>(STORAGE_KEYS.SESSIONS, []);
}

export function getIdeaExplorerSession(id: string): IdeaExplorerSession | null {
  const sessions = getIdeaExplorerSessions();
  return sessions.find(s => s.id === id) || null;
}

export function saveIdeaExplorerSession(session: IdeaExplorerSession): void {
  const sessions = getIdeaExplorerSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  const updated = { ...session, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    sessions[idx] = updated;
  } else {
    sessions.unshift(updated);
  }
  safeSetItem(STORAGE_KEYS.SESSIONS, sessions);
}

export function deleteIdeaExplorerSession(id: string): void {
  const sessions = getIdeaExplorerSessions().filter(s => s.id !== id);
  safeSetItem(STORAGE_KEYS.SESSIONS, sessions);

  // If active session was deleted, clear or reset active ID
  if (getActiveIdeaExplorerSessionId() === id) {
    setActiveIdeaExplorerSessionId(sessions.length > 0 ? sessions[0].id : null);
  }
}

export function getActiveIdeaExplorerSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) || null;
  } catch {
    return null;
  }
}

export function setActiveIdeaExplorerSessionId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  } catch (err) {
    console.error('[IdeaExplorerStorage] Failed to set active session ID:', err);
  }
}

// BATCHES
export function getIdeaExplorerBatches(): IdeaExplorerBatch[] {
  return safeGetItem<IdeaExplorerBatch[]>(STORAGE_KEYS.BATCHES, []);
}

export function getIdeaExplorerBatch(id: string): IdeaExplorerBatch | null {
  const batches = getIdeaExplorerBatches();
  return batches.find(b => b.id === id) || null;
}

export function saveIdeaExplorerBatch(batch: IdeaExplorerBatch): void {
  const batches = getIdeaExplorerBatches();
  const idx = batches.findIndex(b => b.id === batch.id);
  if (idx >= 0) {
    batches[idx] = batch;
  } else {
    batches.push(batch);
  }
  safeSetItem(STORAGE_KEYS.BATCHES, batches);
}

// IDEAS
export function getIdeaExplorerIdeas(): IdeaExplorerIdea[] {
  return safeGetItem<IdeaExplorerIdea[]>(STORAGE_KEYS.IDEAS, []);
}

export function getIdeaExplorerIdea(id: string): IdeaExplorerIdea | null {
  const ideas = getIdeaExplorerIdeas();
  return ideas.find(i => i.id === id) || null;
}

export function saveIdeaExplorerIdeas(newIdeas: IdeaExplorerIdea[]): void {
  const ideas = getIdeaExplorerIdeas();
  const map = new Map<string, IdeaExplorerIdea>();
  ideas.forEach(i => map.set(i.id, i));
  newIdeas.forEach(i => map.set(i.id, i));
  safeSetItem(STORAGE_KEYS.IDEAS, Array.from(map.values()));
}

// SAVED LIBRARY
export function getIdeaExplorerSavedItems(): IdeaExplorerSavedItem[] {
  return safeGetItem<IdeaExplorerSavedItem[]>(STORAGE_KEYS.SAVED, []);
}

export function isIdeaExplorerItemSaved(ideaId: string): boolean {
  const saved = getIdeaExplorerSavedItems();
  return saved.some(s => s.idea.id === ideaId || s.id === ideaId);
}

export function toggleSaveIdeaExplorerItem(idea: IdeaExplorerIdea, notes?: string): boolean {
  const saved = getIdeaExplorerSavedItems();
  const existingIdx = saved.findIndex(s => s.idea.id === idea.id || s.id === idea.id);

  if (existingIdx >= 0) {
    // Remove
    saved.splice(existingIdx, 1);
    safeSetItem(STORAGE_KEYS.SAVED, saved);
    return false;
  } else {
    // Save
    const item: IdeaExplorerSavedItem = {
      id: idea.id,
      idea: { ...idea, isSaved: true },
      savedAt: new Date().toISOString(),
      customNotes: notes,
      tags: idea.tags || []
    };
    saved.unshift(item);
    safeSetItem(STORAGE_KEYS.SAVED, saved);
    return true;
  }
}

export function removeSavedIdeaExplorerItem(ideaId: string): void {
  const saved = getIdeaExplorerSavedItems().filter(s => s.idea.id !== ideaId && s.id !== ideaId);
  safeSetItem(STORAGE_KEYS.SAVED, saved);
}

// BACKUP EXPORT & IMPORT
export function exportIdeaExplorerBackup(): string {
  const backup: IdeaExplorerBackupData = {
    version: '1.0',
    app: 'ScienceOfGifts.IdeaExplorer',
    exportedAt: new Date().toISOString(),
    sessions: getIdeaExplorerSessions(),
    batches: getIdeaExplorerBatches(),
    ideas: getIdeaExplorerIdeas(),
    savedLibrary: getIdeaExplorerSavedItems()
  };
  return JSON.stringify(backup, null, 2);
}

export function importIdeaExplorerBackup(
  jsonStr: string,
  mode: 'merge' | 'replace' = 'merge'
): { success: boolean; message: string; importedCount?: number } {
  try {
    const data = JSON.parse(jsonStr);

    if (!data || data.app !== 'ScienceOfGifts.IdeaExplorer') {
      return { success: false, message: 'Invalid backup file: Not an Idea Explorer backup.' };
    }

    if (!Array.isArray(data.ideas) || !Array.isArray(data.sessions)) {
      return { success: false, message: 'Invalid backup file: Missing ideas or sessions data.' };
    }

    if (mode === 'replace') {
      safeSetItem(STORAGE_KEYS.SESSIONS, data.sessions || []);
      safeSetItem(STORAGE_KEYS.BATCHES, data.batches || []);
      safeSetItem(STORAGE_KEYS.IDEAS, data.ideas || []);
      safeSetItem(STORAGE_KEYS.SAVED, data.savedLibrary || []);
      if (Array.isArray(data.sessions) && data.sessions.length > 0) {
        setActiveIdeaExplorerSessionId(data.sessions[0].id);
      }
      return {
        success: true,
        message: `Successfully replaced library with ${data.ideas.length} ideas and ${data.sessions.length} sessions.`,
        importedCount: data.ideas.length
      };
    }

    // MERGE mode (preserves existing data, avoids duplicate IDs)
    const existingSessions = getIdeaExplorerSessions();
    const existingBatches = getIdeaExplorerBatches();
    const existingIdeas = getIdeaExplorerIdeas();
    const existingSaved = getIdeaExplorerSavedItems();

    const sessionMap = new Map<string, IdeaExplorerSession>(existingSessions.map(s => [s.id, s]));
    (data.sessions || []).forEach((s: IdeaExplorerSession) => {
      if (!sessionMap.has(s.id)) sessionMap.set(s.id, s);
    });

    const batchMap = new Map<string, IdeaExplorerBatch>(existingBatches.map(b => [b.id, b]));
    (data.batches || []).forEach((b: IdeaExplorerBatch) => {
      if (!batchMap.has(b.id)) batchMap.set(b.id, b);
    });

    const ideaMap = new Map<string, IdeaExplorerIdea>(existingIdeas.map(i => [i.id, i]));
    let newIdeasCount = 0;
    (data.ideas || []).forEach((i: IdeaExplorerIdea) => {
      if (!ideaMap.has(i.id)) {
        ideaMap.set(i.id, i);
        newIdeasCount++;
      }
    });

    const savedMap = new Map<string, IdeaExplorerSavedItem>(existingSaved.map(s => [s.id, s]));
    (data.savedLibrary || []).forEach((s: IdeaExplorerSavedItem) => {
      if (!savedMap.has(s.id)) savedMap.set(s.id, s);
    });

    safeSetItem(STORAGE_KEYS.SESSIONS, Array.from(sessionMap.values()));
    safeSetItem(STORAGE_KEYS.BATCHES, Array.from(batchMap.values()));
    safeSetItem(STORAGE_KEYS.IDEAS, Array.from(ideaMap.values()));
    safeSetItem(STORAGE_KEYS.SAVED, Array.from(savedMap.values()));

    return {
      success: true,
      message: `Merged backup successfully. Added ${newIdeasCount} new ideas without overwriting existing data.`,
      importedCount: newIdeasCount
    };
  } catch (err: any) {
    console.error('[IdeaExplorerStorage] Import error:', err);
    return { success: false, message: `Import failed: ${err?.message || 'Malformed JSON'}` };
  }
}
