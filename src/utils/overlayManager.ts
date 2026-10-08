import { useEffect } from 'react';

type CloseHandler = () => void;

interface OverlayEntry {
  id: string;
  close: CloseHandler;
}

// Stack of active overlays (most recently registered overlay is at the end)
const overlayStack: OverlayEntry[] = [];

/**
 * Register an overlay's close handler onto the stack.
 * Returns a cleanup function that unregisters the overlay.
 */
export function registerOverlay(id: string, close: CloseHandler): () => void {
  // If already registered with this ID, remove existing entry first
  const existingIdx = overlayStack.findIndex(entry => entry.id === id);
  if (existingIdx !== -1) {
    overlayStack.splice(existingIdx, 1);
  }

  overlayStack.push({ id, close });

  return () => {
    unregisterOverlay(id);
  };
}

/**
 * Unregister an overlay from the stack by ID.
 */
export function unregisterOverlay(id: string): void {
  const idx = overlayStack.findIndex(entry => entry.id === id);
  if (idx !== -1) {
    overlayStack.splice(idx, 1);
  }
}

/**
 * Global Escape key handler.
 * Dismisses the top-most overlay on the stack if one exists.
 * Returns true if an overlay was dismissed, false otherwise.
 */
export function handleGlobalEscapeKey(e?: KeyboardEvent): boolean {
  if (overlayStack.length > 0) {
    const topOverlay = overlayStack.pop();
    if (topOverlay) {
      try {
        topOverlay.close();
      } catch (err) {
        console.error('Error closing overlay via Escape key:', err);
      }
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      return true;
    }
  }
  return false;
}

/**
 * React hook to register an overlay when `isOpen` is truthy.
 * Automatically handles registration on open and unregistration on close/unmount.
 */
export function useOverlay(isOpen: boolean, onClose: CloseHandler, id: string) {
  useEffect(() => {
    if (isOpen) {
      return registerOverlay(id, onClose);
    }
  }, [isOpen, onClose, id]);
}
