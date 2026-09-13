import vkBridge from '@vkontakte/vk-bridge';
import { ScheduleResponse } from '../types';

const STORAGE_KEY_GROUP = 'nghu_selected_group';
const CACHE_KEY_SCHEDULE_PREFIX = 'nghu_cached_schedule_';

export async function saveSelectedGroup(groupName: string): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_GROUP, groupName);
    }
  } catch (e) {
    console.warn('localStorage setItem failed', e);
  }

  try {
    if (vkBridge.isEmbedded()) {
      await vkBridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY_GROUP,
        value: groupName,
      });
    }
  } catch (e) {
    console.warn('VKWebAppStorageSet failed, fallback used', e);
  }
}

export async function loadSelectedGroup(): Promise<string | null> {
  try {
    if (vkBridge.isEmbedded()) {
      const res = await vkBridge.send('VKWebAppStorageGet', {
        keys: [STORAGE_KEY_GROUP],
      });
      if (res?.keys?.[0]?.value) {
        return res.keys[0].value;
      }
    }
  } catch (e) {
    console.warn('VKWebAppStorageGet failed, fallback used', e);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_GROUP);
    }
  } catch (e) {
    console.warn('localStorage getItem failed', e);
  }
  return null;
}

export function cacheSchedule(group: string, data: ScheduleResponse): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${CACHE_KEY_SCHEDULE_PREFIX}${group}`, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Failed to cache schedule in localStorage', e);
  }
}

export function getCachedSchedule(group: string): ScheduleResponse | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(`${CACHE_KEY_SCHEDULE_PREFIX}${group}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  try {
    if (vkBridge.isEmbedded()) {
      vkBridge.send('VKWebAppTapticImpactOccurred', { style });
    }
  } catch {
    // Ignore in non-VK environments
  }
}
