import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSchedule, fetchGroups, fetchRooms, fetchTeachers, fetchMeta } from '../src/api/client';

describe('API Client Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchGroups should parse response array', async () => {
    const mockGroups = [{ id: '1', name: 'Д-11', course: 1, department: 'design', departmentName: 'Дизайн' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGroups,
    });

    const groups = await fetchGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Д-11');
  });

  it('fetchSchedule should throw on network error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(fetchSchedule('Д-11')).rejects.toThrow('Failed to load schedule: 500');
  });

  it('fetchRooms and fetchTeachers should query with correct url', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await fetchRooms('main', '2026-09-13', '10:00');
    expect(global.fetch).toHaveBeenCalledWith('/api/rooms?building=main&date=2026-09-13&time=10%3A00');

    await fetchTeachers('Иванов');
    expect(global.fetch).toHaveBeenCalledWith('/api/teachers?name=%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2');
  });

  it('fetchMeta should return metadata', async () => {
    const mockMeta = { semester: '2', academicYear: '2025/2026', updatedAt: '2026-09-13T00:00:00Z' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMeta,
    });

    const meta = await fetchMeta();
    expect(meta.semester).toBe('2');
    expect(global.fetch).toHaveBeenCalledWith('/api/meta');
  });
});
