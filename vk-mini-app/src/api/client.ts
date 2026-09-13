import { ScheduleResponse, GroupItem, RoomItem, TeacherItem, MetaResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchSchedule(group: string, date?: string): Promise<ScheduleResponse> {
  const params = new URLSearchParams({ group });
  if (date) params.append('date', date);
  const response = await fetch(`${BASE_URL}/api/schedule?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to load schedule: ${response.status}`);
  }
  return response.json();
}

export async function fetchGroups(): Promise<GroupItem[]> {
  const response = await fetch(`${BASE_URL}/api/groups`);
  if (!response.ok) {
    throw new Error(`Failed to load groups: ${response.status}`);
  }
  return response.json();
}

export async function fetchRooms(building?: string, date?: string, time?: string): Promise<RoomItem[]> {
  const params = new URLSearchParams();
  if (building) params.append('building', building);
  if (date) params.append('date', date);
  if (time) params.append('time', time);
  const url = `${BASE_URL}/api/rooms${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load rooms: ${response.status}`);
  }
  return response.json();
}

export async function fetchTeachers(name?: string): Promise<TeacherItem[]> {
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  const url = `${BASE_URL}/api/teachers${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load teachers: ${response.status}`);
  }
  return response.json();
}

export async function fetchMeta(): Promise<MetaResponse> {
  const response = await fetch(`${BASE_URL}/api/meta`);
  if (!response.ok) {
    throw new Error(`Failed to load meta: ${response.status}`);
  }
  return response.json();
}
