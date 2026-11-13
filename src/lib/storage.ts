import type { Workspace } from './model';
import { createSeedWorkspace, parseWorkspace, serializeWorkspace } from './model';

export const STORAGE_KEY = 'restack.workspace.v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function loadWorkspace(storage: StorageLike | undefined): Workspace {
  if (!storage) return createSeedWorkspace();
  try {
    const saved = storage.getItem(STORAGE_KEY);
    return saved ? parseWorkspace(saved) : createSeedWorkspace();
  } catch {
    return createSeedWorkspace();
  }
}

export function saveWorkspace(storage: StorageLike | undefined, workspace: Workspace): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, serializeWorkspace(workspace));
    return true;
  } catch {
    return false;
  }
}

export function clearWorkspace(storage: StorageLike | undefined): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be blocked by browser privacy settings; memory state still works.
  }
}
