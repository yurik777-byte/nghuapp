import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSelectedGroup, loadSelectedGroup } from '../src/utils/storage';

// LocalStorage mock
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() {
    this.store = {};
  }
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  get length() {
    return Object.keys(this.store).length;
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null;
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new LocalStorageMock();
}

describe('First-Launch Onboarding & Group Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('detects first launch when no group is stored', async () => {
    const group = await loadSelectedGroup();
    expect(group).toBeNull();
  });

  it('persists selected group after onboarding and remembers it on next launch', async () => {
    // Initial launch: null
    let group = await loadSelectedGroup();
    expect(group).toBeNull();

    // User completes onboarding selection
    await saveSelectedGroup('Д-21');

    // Subsequent launches: returns saved group
    group = await loadSelectedGroup();
    expect(group).toBe('Д-21');
  });

  it('allows switching group at any time and overwriting previous choice', async () => {
    await saveSelectedGroup('Д-11');
    expect(await loadSelectedGroup()).toBe('Д-11');

    await saveSelectedGroup('Ж-31');
    expect(await loadSelectedGroup()).toBe('Ж-31');
  });
});
