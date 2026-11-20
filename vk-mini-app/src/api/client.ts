import { ScheduleResponse, GroupItem, RoomItem, TeacherItem, MetaResponse } from '../types';
import {
  getStaticGroups,
  getStaticSchedule,
  getStaticRooms,
  getStaticTeachers,
  getStaticMeta,
  getStaticDays,
  loadStaticSchedule,
  resetStaticScheduleCache,
} from './staticSchedule';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function isNetworkError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || '');
  return (
    err.name === 'TypeError' ||
    msg.includes('fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('Load failed')
  );
}

export async function fetchSchedule(
  group: string,
  date?: string,
  forceRefresh?: boolean
): Promise<ScheduleResponse> {
  const params = new URLSearchParams({ group });
  if (date) params.append('date', date);

  const loadStaticFallback = async () => {
    if (forceRefresh) {
      resetStaticScheduleCache();
      await loadStaticSchedule(true);
    }
    return await getStaticSchedule(group, date);
  };

  try {
    const response = await fetch(`${BASE_URL}/api/schedule?${params.toString()}`);
    if (!response.ok) {
      if (!BASE_URL && response.status === 404) {
        return await loadStaticFallback();
      }
      throw new Error(`Failed to load schedule: ${response.status}`);
    }
    return response.json();
  } catch (err: any) {
    if (!BASE_URL && isNetworkError(err)) {
      try {
        return await loadStaticFallback();
      } catch {
        // rethrow original error
      }
    }
    throw err;
  }
}

export async function fetchGroups(): Promise<GroupItem[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/groups`);
    if (!response.ok) {
      if (!BASE_URL && response.status === 404) {
        return await getStaticGroups();
      }
      throw new Error(`Failed to load groups: ${response.status}`);
    }
    return response.json();
  } catch (err: any) {
    if (!BASE_URL && isNetworkError(err)) {
      try {
        return await getStaticGroups();
      } catch {
        // rethrow original error
      }
    }
    throw err;
  }
}

export async function fetchRooms(building?: string, date?: string, time?: string): Promise<RoomItem[]> {
  const params = new URLSearchParams();
  if (building) params.append('building', building);
  if (date) params.append('date', date);
  if (time) params.append('time', time);
  const url = `${BASE_URL}/api/rooms${params.toString() ? '?' + params.toString() : ''}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (!BASE_URL && response.status === 404) {
        return await getStaticRooms(building, date, time);
      }
      throw new Error(`Failed to load rooms: ${response.status}`);
    }
    return response.json();
  } catch (err: any) {
    if (!BASE_URL && isNetworkError(err)) {
      try {
        return await getStaticRooms(building, date, time);
      } catch {
        // rethrow original error
      }
    }
    throw err;
  }
}

export async function fetchTeachers(name?: string): Promise<TeacherItem[]> {
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  const url = `${BASE_URL}/api/teachers${params.toString() ? '?' + params.toString() : ''}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (!BASE_URL && response.status === 404) {
        return await getStaticTeachers(name);
      }
      throw new Error(`Failed to load teachers: ${response.status}`);
    }
    return response.json();
  } catch (err: any) {
    if (!BASE_URL && isNetworkError(err)) {
      try {
        return await getStaticTeachers(name);
      } catch {
        // rethrow original error
      }
    }
    throw err;
  }
}

export async function fetchMeta(): Promise<MetaResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/meta`);
    if (!response.ok) {
      if (!BASE_URL && response.status === 404) {
        return await getStaticMeta();
      }
      throw new Error(`Failed to load meta: ${response.status}`);
    }
    return response.json();
  } catch (err: any) {
    if (!BASE_URL && isNetworkError(err)) {
      try {
        return await getStaticMeta();
      } catch {
        // rethrow original error
      }
    }
    throw err;
  }
}

export async function fetchDays(): Promise<{ date: string; dayOfWeek: string }[]> {
  if (BASE_URL) {
    try {
      const response = await fetch(`${BASE_URL}/api/schedule`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.days)) {
          return data.days.map((d: any) => ({ date: d.date, dayOfWeek: d.dayOfWeek }));
        }
      }
    } catch {
      // fall back to static days
    }
  }
  try {
    return await getStaticDays();
  } catch {
    return [];
  }
}
