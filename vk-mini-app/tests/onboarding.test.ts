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

describe('Group Search Normalization & Numeric Queries', () => {
  const groups = [
    { name: 'Д-11', course: 1, departmentName: 'Дизайн' },
    { name: 'Ж-11', course: 1, departmentName: 'Живопись' },
    { name: 'Д-21', course: 2, departmentName: 'Дизайн' },
    { name: 'Ж-21', course: 2, departmentName: 'Живопись' },
    { name: 'ГД-21', course: 2, departmentName: 'Графический дизайн' },
    { name: 'ДПИ-21', course: 2, departmentName: 'Декоративно-прикладное искусство' },
    { name: 'С-21', course: 2, departmentName: 'Скульптура' },
    { name: 'А-21', course: 2, departmentName: 'Анимация' },
    { name: 'Ж-31', course: 3, departmentName: 'Живопись' },
  ];

  const filterGroups = (search: string) => {
    const clean = (s: string) => s.toLowerCase().replace(/[\s\-_.]/g, '');
    const query = search.trim();
    const cleanQ = clean(query);

    return groups.filter((g) => {
      if (!cleanQ) return true;
      const cleanName = clean(g.name);
      const cleanDept = clean(g.departmentName || '');
      const nameMatch = cleanName.includes(cleanQ) || g.name.toLowerCase().includes(query.toLowerCase());
      const deptMatch = cleanDept.includes(cleanQ);
      const courseMatch =
        query === String(g.course) ||
        cleanQ === `${g.course}курс` ||
        cleanQ === `курс${g.course}`;
      return nameMatch || deptMatch || courseMatch;
    });
  };

  it('matches Ж-21 when searching without hyphen as ж21', () => {
    const results = filterGroups('ж21');
    expect(results.some((g) => g.name === 'Ж-21')).toBe(true);
    expect(results).toHaveLength(1);
  });

  it('matches Ж-21 when searching with spaces as ж 21', () => {
    const results = filterGroups('ж 21');
    expect(results.some((g) => g.name === 'Ж-21')).toBe(true);
    expect(results).toHaveLength(1);
  });

  it('matches all 2nd course groups when searching numeric 21', () => {
    const results = filterGroups('21');
    const names = results.map((g) => g.name);
    expect(names).toContain('Д-21');
    expect(names).toContain('Ж-21');
    expect(names).toContain('ГД-21');
    expect(names).toContain('ДПИ-21');
    expect(names).toContain('С-21');
    expect(names).toContain('А-21');
    expect(names).not.toContain('Ж-11');
    expect(names).not.toContain('Ж-31');
  });

  it('matches groups by department name like дизайн or живопись', () => {
    const designResults = filterGroups('дизайн');
    expect(designResults.some((g) => g.name === 'Д-11')).toBe(true);
    expect(designResults.some((g) => g.name === 'ГД-21')).toBe(true);
  });
});

