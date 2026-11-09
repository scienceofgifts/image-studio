import {
  IdeaExplorerSession,
  IdeaExplorerBatch,
  IdeaExplorerIdea,
  IdeaExplorerSavedItem,
  IdeaExplorerBackupData
} from '../types/ideaExplorer';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';

const STORAGE_KEYS = {
  SESSIONS: 'scienceOfGifts.ideaExplorer.v1.sessions',
  BATCHES: 'scienceOfGifts.ideaExplorer.v1.batches',
  IDEAS: 'scienceOfGifts.ideaExplorer.v1.ideas',
  SAVED: 'scienceOfGifts.ideaExplorer.v1.saved',
  ACTIVE_SESSION: 'scienceOfGifts.ideaExplorer.v1.activeSessionId'
};

const MAX_LOCAL_IDEAS = 150;
const MAX_LOCAL_BATCHES = 30;
const MAX_LOCAL_SESSIONS = 30;

// In-memory fallback store so the active session never loses data even if browser localStorage quota is full
const memoryStore = new Map<string, any>();

function reclaimQuotaSpace(): void {
  try {
    // 1. Compact soft-deleted tombstones and heavy base64 images in main studio keys
    const studioKeys = [
      'sog_image_projects_v2',
      'sog_inspiration_library_v2',
      'sog_saved_concepts_v2',
      'sog_synthesis_concepts_v2'
    ];

    for (const sKey of studioKeys) {
      const raw = localStorage.getItem(sKey);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) continue;
        let modified = false;
        const compacted = parsed.map((item: any) => {
          if (item && item.isDeleted) {
            modified = true;
            return {
              id: item.id,
              isDeleted: true,
              deletedAt: item.deletedAt || item.updatedAt || new Date().toISOString(),
              updatedAt: item.updatedAt || item.deletedAt || new Date().toISOString()
            };
          }
          // Strip large base64 imageDataUrl from localStorage cache if over 50KB
          if (item && typeof item.imageDataUrl === 'string' && item.imageDataUrl.length > 50000) {
            modified = true;
            const { imageDataUrl, ...rest } = item;
            return rest;
          }
          if (item && Array.isArray(item.inspirationReferences)) {
            const cleanedRefs = item.inspirationReferences.map((ref: any) => {
              if (ref && typeof ref.imageDataUrl === 'string' && ref.imageDataUrl.length > 50000) {
                modified = true;
                const { imageDataUrl, ...restRef } = ref;
                return restRef;
              }
              return ref;
            });
            if (modified) {
              return { ...item, inspirationReferences: cleanedRefs };
            }
          }
          return item;
        });
        if (modified) {
          localStorage.setItem(sKey, JSON.stringify(compacted));
        }
      } catch {
        // Ignore parse errors during compaction
      }
    }

    // 2. Trim older unsaved Idea Explorer ideas/batches in localStorage
    const rawSaved = localStorage.getItem(STORAGE_KEYS.SAVED);
    const savedIds = new Set<string>();
    if (rawSaved) {
      try {
        const savedList = JSON.parse(rawSaved);
        if (Array.isArray(savedList)) {
          savedList.forEach((s: any) => {
            if (s?.id) savedIds.add(s.id);
            if (s?.idea?.id) savedIds.add(s.idea.id);
          });
        }
      } catch {
        // Ignore
      }
    }

    const rawIdeas = localStorage.getItem(STORAGE_KEYS.IDEAS);
    if (rawIdeas) {
      try {
        const ideasList: IdeaExplorerIdea[] = JSON.parse(rawIdeas);
        if (Array.isArray(ideasList) && ideasList.length > 60) {
          const savedOnes = ideasList.filter(i => i && (i.isSaved || savedIds.has(i.id)));
          const unsavedOnes = ideasList.filter(i => i && !i.isSaved && !savedIds.has(i.id));
          const keptUnsaved = unsavedOnes.slice(-50);
          localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify([...savedOnes, ...keptUnsaved]));
        }
      } catch {
        // Ignore
      }
    }

    const rawBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (rawBatches) {
      try {
        const batchesList: IdeaExplorerBatch[] = JSON.parse(rawBatches);
        if (Array.isArray(batchesList) && batchesList.length > 15) {
          localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batchesList.slice(-15)));
        }
      } catch {
        // Ignore
      }
    }
  } catch {
    // Ignore errors during space reclamation
  }
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (memoryStore.has(key)) {
        return memoryStore.get(key) as T;
      }
      return defaultValue;
    }
    const parsed = JSON.parse(raw) as T;
    if (Array.isArray(parsed) && memoryStore.has(key)) {
      const memVal = memoryStore.get(key);
      if (Array.isArray(memVal) && memVal.length > parsed.length) {
        // Merge localStorage with in-memory items so nothing is lost if localStorage was trimmed
        const mergedMap = new Map<string, any>();
        parsed.forEach((item: any) => {
          if (item && item.id) mergedMap.set(item.id, item);
        });
        memVal.forEach((item: any) => {
          if (item && item.id) mergedMap.set(item.id, item);
        });
        return Array.from(mergedMap.values()) as unknown as T;
      }
    }
    return parsed;
  } catch (err) {
    if (memoryStore.has(key)) {
      return memoryStore.get(key) as T;
    }
    console.warn(`[IdeaExplorerStorage] Notice reading ${key}:`, err);
    return defaultValue;
  }
}

function safeSetItem(key: string, value: any): boolean {
  // Always keep full value in memory so current session works seamlessly
  memoryStore.set(key, value);

  let valueToStore = value;
  if (key === STORAGE_KEYS.IDEAS && Array.isArray(value) && value.length > MAX_LOCAL_IDEAS) {
    valueToStore = value.slice(-MAX_LOCAL_IDEAS);
  } else if (key === STORAGE_KEYS.BATCHES && Array.isArray(value) && value.length > MAX_LOCAL_BATCHES) {
    valueToStore = value.slice(-MAX_LOCAL_BATCHES);
  } else if (key === STORAGE_KEYS.SESSIONS && Array.isArray(value) && value.length > MAX_LOCAL_SESSIONS) {
    valueToStore = value.slice(0, MAX_LOCAL_SESSIONS);
  }

  try {
    localStorage.setItem(key, JSON.stringify(valueToStore));
    return true;
  } catch {
    // Reclaim space and retry
    reclaimQuotaSpace();
    try {
      const retryVal = Array.isArray(valueToStore) && valueToStore.length > 40
        ? (key === STORAGE_KEYS.SESSIONS ? valueToStore.slice(0, 20) : valueToStore.slice(-40))
        : valueToStore;
      localStorage.setItem(key, JSON.stringify(retryVal));
      return true;
    } catch {
      // Data is still safely held in memoryStore and synced to Firestore
      return false;
    }
  }
}

// SESSIONS
export function getIdeaExplorerSessions(): IdeaExplorerSession[] {
  return safeGetItem<IdeaExplorerSession[]>(STORAGE_KEYS.SESSIONS, []).filter(
    (s: any) => s && !s.isDeleted
  );
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

  if (isFirebaseConfigured() && updated.id) {
    setDoc(doc(db, 'idea_explorer_sessions', updated.id), JSON.parse(JSON.stringify(updated)), { merge: true })
      .catch(err => console.warn('[Firestore] Session write failed:', err));
  }
}

export function deleteIdeaExplorerSession(id: string): void {
  const sessions = getIdeaExplorerSessions().filter(s => s.id !== id);
  safeSetItem(STORAGE_KEYS.SESSIONS, sessions);

  // If active session was deleted, clear or reset active ID
  if (getActiveIdeaExplorerSessionId() === id) {
    setActiveIdeaExplorerSessionId(sessions.length > 0 ? sessions[0].id : null);
  }

  if (isFirebaseConfigured() && id) {
    setDoc(doc(db, 'idea_explorer_sessions', id), { id, isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true })
      .catch(err => console.warn('[Firestore] Session delete write failed:', err));
  }
}

export function getActiveIdeaExplorerSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) || memoryStore.get(STORAGE_KEYS.ACTIVE_SESSION) || null;
  } catch {
    return memoryStore.get(STORAGE_KEYS.ACTIVE_SESSION) || null;
  }
}

export function setActiveIdeaExplorerSessionId(id: string | null): void {
  if (id) {
    memoryStore.set(STORAGE_KEYS.ACTIVE_SESSION, id);
  } else {
    memoryStore.delete(STORAGE_KEYS.ACTIVE_SESSION);
  }
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  } catch {
    reclaimQuotaSpace();
    try {
      if (id) localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, id);
    } catch {
      // Held in memoryStore
    }
  }
}

export function getActiveIdeaExplorerSession(): IdeaExplorerSession | null {
  const activeId = getActiveIdeaExplorerSessionId();
  if (!activeId) return null;
  return getIdeaExplorerSession(activeId);
}

// BATCHES
export function getIdeaExplorerBatches(): IdeaExplorerBatch[] {
  return safeGetItem<IdeaExplorerBatch[]>(STORAGE_KEYS.BATCHES, []).filter(
    (b: any) => b && !b.isDeleted
  );
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

  if (isFirebaseConfigured() && batch.id) {
    setDoc(doc(db, 'idea_explorer_batches', batch.id), JSON.parse(JSON.stringify(batch)), { merge: true })
      .catch(err => console.warn('[Firestore] Batch write failed:', err));
  }
}

// IDEAS
export function getIdeaExplorerIdeas(): IdeaExplorerIdea[] {
  return safeGetItem<IdeaExplorerIdea[]>(STORAGE_KEYS.IDEAS, []).filter(
    (i: any) => i && !i.isDeleted
  );
}

export function getIdeaExplorerIdea(id: string): IdeaExplorerIdea | null {
  const ideas = getIdeaExplorerIdeas();
  return ideas.find(i => i.id === id) || null;
}

export function saveIdeaExplorerIdeas(newIdeas: IdeaExplorerIdea[]): void {
  const ideas = getIdeaExplorerIdeas();
  const map = new Map<string, IdeaExplorerIdea>();
  ideas.forEach(i => {
    if (i && i.id) map.set(i.id, i);
  });
  newIdeas.forEach(i => {
    if (i && i.id) map.set(i.id, i);
  });
  safeSetItem(STORAGE_KEYS.IDEAS, Array.from(map.values()));

  if (isFirebaseConfigured()) {
    newIdeas.forEach(idea => {
      if (idea && idea.id) {
        setDoc(doc(db, 'idea_explorer_ideas', idea.id), JSON.parse(JSON.stringify(idea)), { merge: true })
          .catch(err => console.warn('[Firestore] Idea write failed:', err));
      }
    });
  }
}

// SAVED LIBRARY
export function getIdeaExplorerSavedItems(): IdeaExplorerSavedItem[] {
  return safeGetItem<IdeaExplorerSavedItem[]>(STORAGE_KEYS.SAVED, []).filter(
    (s: any) => s && !s.isDeleted && s.idea
  );
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
    if (isFirebaseConfigured()) {
      setDoc(doc(db, 'idea_explorer_saved', idea.id), { id: idea.id, isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true })
        .catch(err => console.warn('[Firestore] Saved item delete write failed:', err));
    }
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
    if (isFirebaseConfigured()) {
      setDoc(doc(db, 'idea_explorer_saved', item.id), JSON.parse(JSON.stringify(item)), { merge: true })
        .catch(err => console.warn('[Firestore] Saved item write failed:', err));
    }
    return true;
  }
}

export function removeSavedIdeaExplorerItem(ideaId: string): void {
  const saved = getIdeaExplorerSavedItems().filter(s => s.idea.id !== ideaId && s.id !== ideaId);
  safeSetItem(STORAGE_KEYS.SAVED, saved);
  if (isFirebaseConfigured()) {
    setDoc(doc(db, 'idea_explorer_saved', ideaId), { id: ideaId, isDeleted: true, deletedAt: new Date().toISOString() }, { merge: true })
      .catch(err => console.warn('[Firestore] Remove saved item write failed:', err));
  }
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
