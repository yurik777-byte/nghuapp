import { describe, it, expect, beforeEach, vi } from 'vitest';
import vkBridge from '@vkontakte/vk-bridge';
import {
  saveSelectedGroup,
  loadSelectedGroup,
  cacheSchedule,
  getCachedSchedule,
  triggerHaptic,
} from '../src/utils/storage';

// Polyfill localStorage for node environment if not present
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

describe('Storage & Offline Cache', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves and loads selected group in fallback localStorage', async () => {
    await saveSelectedGroup('Д-21');
    const group = await loadSelectedGroup();
    expect(group).toBe('Д-21');
  });

  it('caches schedule and retrieves it from offline cache', () => {
    const mockSchedule = {
      group: 'Ж-11',
      updatedAt: '2026-09-13',
      days: [],
    };
    cacheSchedule('Ж-11', mockSchedule);
    const cached = getCachedSchedule('Ж-11');
    expect(cached?.group).toBe('Ж-11');
  });

  it('returns null for non-cached group', () => {
    expect(getCachedSchedule('Т-31')).toBeNull();
  });

  it('interacts with VK Bridge storage when embedded', async () => {
    vi.spyOn(vkBridge, 'isEmbedded').mockReturnValue(true);
    const sendSpy = vi.spyOn(vkBridge, 'send').mockResolvedValue({
      keys: [{ key: 'nghu_selected_group', value: 'ГД-31' }],
    } as any);

    await saveSelectedGroup('ГД-31');
    expect(sendSpy).toHaveBeenCalledWith('VKWebAppStorageSet', {
      key: 'nghu_selected_group',
      value: 'ГД-31',
    });

    const group = await loadSelectedGroup();
    expect(sendSpy).toHaveBeenCalledWith('VKWebAppStorageGet', {
      keys: ['nghu_selected_group'],
    });
    expect(group).toBe('ГД-31');
  });

  it('triggers haptic feedback when embedded', () => {
    vi.spyOn(vkBridge, 'isEmbedded').mockReturnValue(true);
    const sendSpy = vi.spyOn(vkBridge, 'send').mockResolvedValue({} as any);

    triggerHaptic('medium');
    expect(sendSpy).toHaveBeenCalledWith('VKWebAppTapticImpactOccurred', {
      style: 'medium',
    });
  });

  it('does not trigger haptic feedback when not embedded', () => {
    vi.spyOn(vkBridge, 'isEmbedded').mockReturnValue(false);
    const sendSpy = vi.spyOn(vkBridge, 'send');

    triggerHaptic('light');
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('handles haptic feedback rejection gracefully', () => {
    vi.spyOn(vkBridge, 'isEmbedded').mockReturnValue(true);
    vi.spyOn(vkBridge, 'send').mockRejectedValue(new Error('Bridge failure'));

    expect(() => triggerHaptic('light')).not.toThrow();
  });
});
