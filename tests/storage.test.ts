import { describe, expect, it } from 'vitest';
import type { StorageLike } from '../src/lib/storage';
import { clearWorkspace, loadWorkspace, saveWorkspace, STORAGE_KEY } from '../src/lib/storage';
import { createSeedWorkspace } from '../src/lib/model';

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe('local persistence', () => {
  it('starts with the example workspace when storage is empty', () => {
    expect(loadWorkspace(new MemoryStorage())).toEqual(createSeedWorkspace());
    expect(loadWorkspace(undefined)).toEqual(createSeedWorkspace());
  });

  it('round-trips saved workspaces and clears them', () => {
    const storage = new MemoryStorage();
    const workspace = createSeedWorkspace();
    expect(saveWorkspace(storage, workspace)).toBe(true);
    expect(storage.values.has(STORAGE_KEY)).toBe(true);
    expect(loadWorkspace(storage)).toEqual(workspace);
    clearWorkspace(storage);
    expect(storage.values.size).toBe(0);
  });

  it('falls back safely when saved data is corrupt', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, '{broken');
    expect(loadWorkspace(storage)).toEqual(createSeedWorkspace());
  });

  it('surfaces write failure without crashing the in-memory app', () => {
    const blocked: StorageLike = {
      getItem() { throw new Error('blocked'); },
      setItem() { throw new Error('quota'); },
      removeItem() { throw new Error('blocked'); },
    };
    expect(loadWorkspace(blocked)).toEqual(createSeedWorkspace());
    expect(saveWorkspace(blocked, createSeedWorkspace())).toBe(false);
    expect(() => clearWorkspace(blocked)).not.toThrow();
  });
});
