# VK Mini App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать нативное мини-приложение ВКонтакте (VK Mini App) на React + VKUI для отображения расписания занятий, занятости аудиторий и расписания преподавателей НГХУ с поддержкой облачного сохранения группы в VK и офлайн-кеширования.

**Architecture:** Клиентское SPA-приложение на React 19 + TypeScript + Vite + VKUI v7, интегрированное с платформой через `@vkontakte/vk-bridge`. Взаимодействует с существующим REST API Express-сервера через проксируемый клиент, кеширует данные в `localStorage` и синхронизирует настройки в `VKWebAppStorage`.

**Tech Stack:** React 18/19, TypeScript, Vite, `@vkontakte/vkui` v7, `@vkontakte/vk-bridge`, `@vkontakte/icons`, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-13-vk-mini-app-design.md`

## Global Constraints
- Размещение в монорепозитории в подпапке `vk-mini-app/`.
- Не изменять существующий рабочий код `server/` и `android/`.
- Дизайн-система: только официальные компоненты `@vkontakte/vkui`.
- Поддержка тем: динамическое переключение Light / Dark темы на основе событий VK Bridge.
- Офлайн-поддержка: при отсутствии сети показывать сохраненный кеш с баннером офлайн-режима.
- Звонки и пары:
  - 1 пара: 09:00 - 10:35 (перемена 10 мин)
  - 2 пара: 10:45 - 12:20 (большая перемена 40 мин)
  - 3 пара: 13:00 - 14:35 (перемена 10 мин)
  - 4 пара: 14:45 - 16:20 (перемена 10 мин)
  - 5 пара: 16:30 - 18:05
- Корпуса:
  - Главный корпус: Красный пр-т, 9
  - Второй корпус: ул. Спартака, 12
  - Предупреждение о переходе между корпусами при смене адреса в последовательных парах.

---

### Task 1: Сборка окружения и конфигурация проекта `vk-mini-app/`

**Files:**
- Create: `vk-mini-app/package.json`
- Create: `vk-mini-app/tsconfig.json`
- Create: `vk-mini-app/vite.config.ts`
- Create: `vk-mini-app/index.html`
- Create: `vk-mini-app/src/vite-env.d.ts`
- Test: `vk-mini-app/tests/config.test.ts`

**Interfaces:**
- Consumes: Ничего (начальный шаг).
- Produces: Рабочая среда сборки Vite + Vitest с установленными `@vkontakte/vkui` и `@vkontakte/vk-bridge`.

- [ ] **Step 1: Создать `vk-mini-app/package.json` с зависимостями**

```json
{
  "name": "nghu-vk-mini-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@vkontakte/icons": "^3.0.0",
    "@vkontakte/vk-bridge": "^2.15.0",
    "@vkontakte/vkui": "^7.1.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Создать `vk-mini-app/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Создать `vk-mini-app/vite.config.ts` с реверс-прокси к Express серверу**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
```

- [ ] **Step 4: Создать базовый `vk-mini-app/index.html` и `src/vite-env.d.ts`**

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>Расписание НГХУ</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 5: Написать тест проверки конфигурации `vk-mini-app/tests/config.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';

describe('Project Config Test', () => {
  it('should verify vitest is operational', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Выполнить `npm install` в `vk-mini-app/` и запустить тест**

Запуск:
```bash
cd vk-mini-app && npm install && npm test
```
Ожидается: PASS `tests/config.test.ts`.

- [ ] **Step 7: Закоммитить изменения**

```bash
git add vk-mini-app
git commit -m "chore(vk): initialize vk-mini-app workspace and configs"
```

---

### Task 2: Модели данных TypeScript и HTTP API-клиент

**Files:**
- Create: `vk-mini-app/src/types/index.ts`
- Create: `vk-mini-app/src/api/client.ts`
- Test: `vk-mini-app/tests/api.test.ts`

**Interfaces:**
- Consumes: REST API бэкенда (`server/src/routes/api.ts`).
- Produces: Функции `fetchSchedule`, `fetchGroups`, `fetchRooms`, `fetchTeachers`, `fetchMeta`.

- [ ] **Step 1: Создать `vk-mini-app/src/types/index.ts`**

```typescript
export interface Lesson {
  pairNumber: number;
  timeStart: string;
  timeEnd: string;
  subject: string;
  room: string;
  building: 'main' | 'spartaka';
  buildingAddress: string;
  teacher: string;
  category?: 'core' | 'academic' | 'general';
  subgroup?: number;
}

export interface DaySchedule {
  date: string;       // YYYY-MM-DD
  dayOfWeek: string;  // Понедельник, Вторник...
  lessons: Lesson[];
}

export interface ScheduleResponse {
  group: string;
  updatedAt: string;
  days: DaySchedule[];
}

export interface GroupItem {
  id: string;
  name: string;
  course: number;
  department: 'design' | 'painting' | 'theater';
  departmentName: string;
}

export interface RoomScheduleItem {
  timeStart: string;
  timeEnd: string;
  subject: string;
  group: string;
  teacher: string;
}

export interface RoomItem {
  room: string;
  building: 'main' | 'spartaka';
  buildingAddress: string;
  status: 'free' | 'occupied';
  currentLesson: RoomScheduleItem | null;
  nextLesson: RoomScheduleItem | null;
  schedule: RoomScheduleItem[];
}

export interface TeacherLessonItem {
  date: string;
  dayOfWeek: string;
  pairNumber: number;
  timeStart: string;
  timeEnd: string;
  subject: string;
  group: string;
  room: string;
  buildingAddress: string;
}

export interface TeacherItem {
  name: string;
  subjects: string[];
  schedule: TeacherLessonItem[];
}

export interface MetaResponse {
  semester: string;
  academicYear: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Создать `vk-mini-app/src/api/client.ts`**

```typescript
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
```

- [ ] **Step 3: Написать тест `vk-mini-app/tests/api.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSchedule, fetchGroups } from '../src/api/client';

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
});
```

- [ ] **Step 4: Запустить тесты API клиента**

Запуск:
```bash
cd vk-mini-app && npm test tests/api.test.ts
```
Ожидается: PASS.

- [ ] **Step 5: Закоммитить изменения**

```bash
git add vk-mini-app/src/types vk-mini-app/src/api vk-mini-app/tests/api.test.ts
git commit -m "feat(vk): implement domain types and REST API client"
```

---

### Task 3: Доменная логика времени, пар и переходов между корпусами (TDD)

**Files:**
- Create: `vk-mini-app/src/utils/timeUtils.ts`
- Create: `vk-mini-app/src/hooks/useLiveStatus.ts`
- Test: `vk-mini-app/tests/timeUtils.test.ts`

**Interfaces:**
- Consumes: `Lesson` из `types/index.ts`.
- Produces:
  - `getCurrentLessonStatus(lessons: Lesson[], now: Date): LiveState`
  - `checkBuildingTransfer(currentLesson: Lesson, nextLesson: Lesson): boolean`
  - `formatDuration(minutes: number): string`
  - `formatShortDay(dateStr: string): string`

- [ ] **Step 1: Написать падающий тест `vk-mini-app/tests/timeUtils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { getCurrentLessonStatus, checkBuildingTransfer } from '../src/utils/timeUtils';
import { Lesson } from '../src/types';

describe('TimeUtils & LiveStatus', () => {
  const sampleLessons: Lesson[] = [
    {
      pairNumber: 1,
      timeStart: '09:00',
      timeEnd: '10:35',
      subject: 'Живопись',
      room: '109',
      building: 'main',
      buildingAddress: 'Красный пр-т, 9',
      teacher: 'Иванов И. И.',
    },
    {
      pairNumber: 2,
      timeStart: '10:45',
      timeEnd: '12:20',
      subject: 'Рисунок',
      room: '204',
      building: 'spartaka',
      buildingAddress: 'ул. Спартака, 12',
      teacher: 'Петров П. П.',
    },
  ];

  it('detects lesson in progress', () => {
    const mockNow = new Date('2026-09-13T09:30:00');
    const status = getCurrentLessonStatus(sampleLessons, mockNow);
    expect(status.type).toBe('lesson');
    expect(status.currentLesson?.subject).toBe('Живопись');
    expect(status.remainingMinutes).toBe(65);
    expect(status.progress).toBeGreaterThan(0);
  });

  it('detects break and flags building transfer', () => {
    const mockNow = new Date('2026-09-13T10:40:00');
    const status = getCurrentLessonStatus(sampleLessons, mockNow);
    expect(status.type).toBe('break');
    expect(status.remainingMinutes).toBe(5);
    expect(status.hasBuildingTransfer).toBe(true);
    expect(status.transferFrom).toBe('Красный пр-т, 9');
    expect(status.transferTo).toBe('ул. Спартака, 12');
  });

  it('detects completed day', () => {
    const mockNow = new Date('2026-09-13T19:00:00');
    const status = getCurrentLessonStatus(sampleLessons, mockNow);
    expect(status.type).toBe('finished');
  });

  it('detects building transfer helper', () => {
    expect(checkBuildingTransfer(sampleLessons[0], sampleLessons[1])).toBe(true);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск:
```bash
cd vk-mini-app && npm test tests/timeUtils.test.ts
```
Ожидается: FAIL ("Cannot find module '../src/utils/timeUtils'").

- [ ] **Step 3: Реализовать `vk-mini-app/src/utils/timeUtils.ts`**

```typescript
import { Lesson } from '../types';

export interface LiveState {
  type: 'before_classes' | 'lesson' | 'break' | 'finished' | 'no_lessons';
  currentLesson?: Lesson;
  nextLesson?: Lesson;
  remainingMinutes?: number;
  progress?: number; // 0..100
  hasBuildingTransfer?: boolean;
  transferFrom?: string;
  transferTo?: string;
}

export function checkBuildingTransfer(curr?: Lesson | null, next?: Lesson | null): boolean {
  if (!curr || !next) return false;
  return curr.building !== next.building && curr.buildingAddress !== next.buildingAddress;
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getCurrentLessonStatus(lessons: Lesson[], now: Date = new Date()): LiveState {
  if (!lessons || lessons.length === 0) {
    return { type: 'no_lessons' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const sorted = [...lessons].sort((a, b) => timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart));
  const firstLesson = sorted[0];
  const lastLesson = sorted[sorted.length - 1];

  const firstStart = timeToMinutes(firstLesson.timeStart);
  const lastEnd = timeToMinutes(lastLesson.timeEnd);

  if (currentMinutes < firstStart) {
    return {
      type: 'before_classes',
      nextLesson: firstLesson,
      remainingMinutes: firstStart - currentMinutes,
    };
  }

  if (currentMinutes >= lastEnd) {
    return { type: 'finished' };
  }

  for (let i = 0; i < sorted.length; i++) {
    const lesson = sorted[i];
    const start = timeToMinutes(lesson.timeStart);
    const end = timeToMinutes(lesson.timeEnd);

    if (currentMinutes >= start && currentMinutes < end) {
      const nextLesson = sorted[i + 1];
      const hasTransfer = checkBuildingTransfer(lesson, nextLesson);
      const total = end - start;
      const elapsed = currentMinutes - start;
      const progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

      return {
        type: 'lesson',
        currentLesson: lesson,
        nextLesson,
        remainingMinutes: end - currentMinutes,
        progress,
        hasBuildingTransfer: hasTransfer,
        transferFrom: lesson.buildingAddress,
        transferTo: nextLesson?.buildingAddress,
      };
    }

    if (i < sorted.length - 1) {
      const nextLesson = sorted[i + 1];
      const nextStart = timeToMinutes(nextLesson.timeStart);
      if (currentMinutes >= end && currentMinutes < nextStart) {
        const hasTransfer = checkBuildingTransfer(lesson, nextLesson);
        return {
          type: 'break',
          currentLesson: lesson,
          nextLesson,
          remainingMinutes: nextStart - currentMinutes,
          hasBuildingTransfer: hasTransfer,
          transferFrom: lesson.buildingAddress,
          transferTo: nextLesson.buildingAddress,
        };
      }
    }
  }

  return { type: 'finished' };
}

export function formatMinutesWord(mins: number): string {
  const m = Math.abs(mins) % 100;
  const rem = m % 10;
  if (m > 10 && m < 20) return `${mins} минут`;
  if (rem > 1 && rem < 5) return `${mins} минуты`;
  if (rem === 1) return `${mins} минута`;
  return `${mins} минут`;
}
```

- [ ] **Step 4: Создать React-хук `vk-mini-app/src/hooks/useLiveStatus.ts`**

```typescript
import { useState, useEffect } from 'react';
import { Lesson } from '../types';
import { getCurrentLessonStatus, LiveState } from '../utils/timeUtils';

export function useLiveStatus(lessons: Lesson[]): LiveState {
  const [status, setStatus] = useState<LiveState>(() => getCurrentLessonStatus(lessons, new Date()));

  useEffect(() => {
    setStatus(getCurrentLessonStatus(lessons, new Date()));
    const interval = setInterval(() => {
      setStatus(getCurrentLessonStatus(lessons, new Date()));
    }, 15000); // каждые 15 сек

    return () => clearInterval(interval);
  }, [lessons]);

  return status;
}
```

- [ ] **Step 5: Запустить тесты времени и убедиться, что они проходят**

Запуск:
```bash
cd vk-mini-app && npm test tests/timeUtils.test.ts
```
Ожидается: PASS.

- [ ] **Step 6: Закоммитить изменения**

```bash
git add vk-mini-app/src/utils/timeUtils.ts vk-mini-app/src/hooks/useLiveStatus.ts vk-mini-app/tests/timeUtils.test.ts
git commit -m "feat(vk): implement live lesson status, break detection and building alert"
```

---

### Task 4: Интеграция с VK Bridge, хранилище профиля и офлайн-кеш (TDD)

**Files:**
- Create: `vk-mini-app/src/utils/storage.ts`
- Create: `vk-mini-app/src/hooks/useVkStorage.ts`
- Test: `vk-mini-app/tests/storage.test.ts`

**Interfaces:**
- Consumes: `@vkontakte/vk-bridge`.
- Produces:
  - `saveSelectedGroup(group: string): Promise<void>`
  - `loadSelectedGroup(): Promise<string | null>`
  - `cacheSchedule(group: string, data: ScheduleResponse): void`
  - `getCachedSchedule(group: string): ScheduleResponse | null`
  - `triggerHaptic(style?: 'light' | 'medium' | 'heavy'): void`

- [ ] **Step 1: Написать тест `vk-mini-app/tests/storage.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSelectedGroup, loadSelectedGroup, cacheSchedule, getCachedSchedule } from '../src/utils/storage';

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
    const mockSchedule = { group: 'Ж-11', updatedAt: '2026-09-13', days: [] };
    cacheSchedule('Ж-11', mockSchedule);
    const cached = getCachedSchedule('Ж-11');
    expect(cached?.group).toBe('Ж-11');
  });

  it('returns null for non-cached group', () => {
    expect(getCachedSchedule('Т-31')).toBeNull();
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск:
```bash
cd vk-mini-app && npm test tests/storage.test.ts
```
Ожидается: FAIL.

- [ ] **Step 3: Реализовать `vk-mini-app/src/utils/storage.ts`**

```typescript
import vkBridge from '@vkontakte/vk-bridge';
import { ScheduleResponse } from '../types';

const STORAGE_KEY_GROUP = 'nghu_selected_group';
const CACHE_KEY_SCHEDULE_PREFIX = 'nghu_cached_schedule_';

export async function saveSelectedGroup(groupName: string): Promise<void> {
  localStorage.setItem(STORAGE_KEY_GROUP, groupName);
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
  return localStorage.getItem(STORAGE_KEY_GROUP);
}

export function cacheSchedule(group: string, data: ScheduleResponse): void {
  try {
    localStorage.setItem(`${CACHE_KEY_SCHEDULE_PREFIX}${group}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to cache schedule in localStorage', e);
  }
}

export function getCachedSchedule(group: string): ScheduleResponse | null {
  try {
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
```

- [ ] **Step 4: Создать хук `vk-mini-app/src/hooks/useVkStorage.ts`**

```typescript
import { useState, useEffect } from 'react';
import { loadSelectedGroup, saveSelectedGroup } from '../utils/storage';

export function useVkStorage(defaultGroup: string = 'Д-11') {
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSelectedGroup().then((group) => {
      if (group) setSelectedGroup(group);
      setIsLoaded(true);
    });
  }, []);

  const updateGroup = async (group: string) => {
    setSelectedGroup(group);
    await saveSelectedGroup(group);
  };

  return { selectedGroup, updateGroup, isLoaded };
}
```

- [ ] **Step 5: Запустить тесты `tests/storage.test.ts`**

Запуск:
```bash
cd vk-mini-app && npm test tests/storage.test.ts
```
Ожидается: PASS.

- [ ] **Step 6: Закоммитить изменения**

```bash
git add vk-mini-app/src/utils/storage.ts vk-mini-app/src/hooks/useVkStorage.ts vk-mini-app/tests/storage.test.ts
git commit -m "feat(vk): implement VK storage, offline cache and haptic feedback"
```

---

### Task 5: UI-компоненты экрана расписания (DaySelector, LiveWidget, LessonCard, BreakCard, GroupModal)

**Files:**
- Create: `vk-mini-app/src/components/DaySelector.tsx`
- Create: `vk-mini-app/src/components/LiveWidget.tsx`
- Create: `vk-mini-app/src/components/LessonCard.tsx`
- Create: `vk-mini-app/src/components/BreakCard.tsx`
- Create: `vk-mini-app/src/components/GroupModal.tsx`
- Create: `vk-mini-app/src/panels/SchedulePanel.tsx`

**Interfaces:**
- Consumes: `useLiveStatus`, `useVkStorage`, `types/index.ts`, `api/client.ts`.
- Produces: Готовый экран `SchedulePanel`.

- [ ] **Step 1: Создать `vk-mini-app/src/components/DaySelector.tsx`**

```tsx
import React from 'react';
import { HorizontalScroll, Tabs, TabsItem } from '@vkontakte/vkui';
import { triggerHaptic } from '../utils/storage';

interface DaySelectorProps {
  days: { date: string; dayOfWeek: string }[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days, selectedDate, onSelectDate }) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const getShortDayName = (dayName: string) => {
    const map: Record<string, string> = {
      'Понедельник': 'ПН',
      'Вторник': 'ВТ',
      'Среда': 'СР',
      'Четверг': 'ЧТ',
      'Пятница': 'ПТ',
      'Суббота': 'СБ',
      'Воскресенье': 'ВС',
    };
    return map[dayName] || dayName.slice(0, 2).toUpperCase();
  };

  return (
    <HorizontalScroll showArrows={false}>
      <Tabs mode="accent">
        {days.map((d) => {
          const isSelected = d.date === selectedDate;
          const isToday = d.date === todayStr;
          return (
            <TabsItem
              key={d.date}
              selected={isSelected}
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(d.date);
              }}
              status={isToday ? 'Сегодня' : undefined}
            >
              {getShortDayName(d.dayOfWeek)}
            </TabsItem>
          );
        })}
      </Tabs>
    </HorizontalScroll>
  );
};
```

- [ ] **Step 2: Создать `vk-mini-app/src/components/LiveWidget.tsx`**

```tsx
import React from 'react';
import { Card, Div, Headline, Footnote, Progress, Banner } from '@vkontakte/vkui';
import { Icon28WarningTriangleOutline, Icon24ClockOutline } from '@vkontakte/icons';
import { LiveState, formatMinutesWord } from '../utils/timeUtils';

interface LiveWidgetProps {
  status: LiveState;
}

export const LiveWidget: React.FC<LiveWidgetProps> = ({ status }) => {
  if (status.type === 'no_lessons' || status.type === 'finished') {
    return null;
  }

  return (
    <Div style={{ paddingBottom: 4 }}>
      {status.hasBuildingTransfer && (
        <Banner
          style={{ marginBottom: 8 }}
          before={<Icon28WarningTriangleOutline fill="var(--vkui--color_accent_red)" />}
          header="Переход между корпусами!"
          subheader={`${status.transferFrom} → ${status.transferTo}`}
          mode="tint"
        />
      )}

      {status.type === 'lesson' && status.currentLesson && (
        <Card mode="shadow" style={{ padding: 12, background: 'var(--vkui--color_background_secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Headline level="2" weight="2">
              Идёт {status.currentLesson.pairNumber} пара: {status.currentLesson.subject}
            </Headline>
            <Footnote style={{ color: 'var(--vkui--color_text_subhead)' }}>
              каб. {status.currentLesson.room}
            </Footnote>
          </div>
          <Footnote style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon24ClockOutline width={16} height={16} />
            До конца пары {formatMinutesWord(status.remainingMinutes || 0)}
          </Footnote>
          <Progress style={{ marginTop: 8 }} value={status.progress || 0} />
        </Card>
      )}

      {status.type === 'break' && (
        <Card mode="shadow" style={{ padding: 12, background: 'var(--vkui--color_background_secondary)' }}>
          <Headline level="2" weight="2">Перемена</Headline>
          <Footnote style={{ marginTop: 4 }}>
            До начала следующей пары осталось {formatMinutesWord(status.remainingMinutes || 0)}
          </Footnote>
        </Card>
      )}

      {status.type === 'before_classes' && (
        <Card mode="shadow" style={{ padding: 12, background: 'var(--vkui--color_background_secondary)' }}>
          <Headline level="2" weight="2">Скоро начало занятий</Headline>
          <Footnote style={{ marginTop: 4 }}>
            1 пара начнётся через {formatMinutesWord(status.remainingMinutes || 0)}
          </Footnote>
        </Card>
      )}
    </Div>
  );
};
```

- [ ] **Step 3: Создать `vk-mini-app/src/components/LessonCard.tsx` и `BreakCard.tsx`**

`LessonCard.tsx`:
```tsx
import React from 'react';
import { Card, Div, Headline, Subhead, Footnote, Badge } from '@vkontakte/vkui';
import { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  isCurrent?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, isCurrent }) => {
  const isMain = lesson.building === 'main';

  return (
    <Card
      mode={isCurrent ? 'outline' : 'shadow'}
      style={{
        margin: '8px 12px',
        padding: 12,
        borderLeft: isCurrent ? '4px solid var(--vkui--color_accent_blue)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Footnote style={{ color: 'var(--vkui--color_text_subhead)', fontWeight: 600 }}>
            {lesson.pairNumber} пара • {lesson.timeStart} - {lesson.timeEnd}
          </Footnote>
          <Headline level="2" weight="2" style={{ marginTop: 4 }}>
            {lesson.subject}
          </Headline>
        </div>
        <Badge
          mode="prominent"
          style={{
            backgroundColor: isMain ? '#3F8AE0' : '#E65D00',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          {isMain ? 'Красный 9' : 'Спартака 12'}
        </Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <Subhead style={{ color: 'var(--vkui--color_text_secondary)' }}>
          {lesson.teacher || 'Преподаватель не указан'}
        </Subhead>
        <Subhead weight="2">каб. {lesson.room}</Subhead>
      </div>
    </Card>
  );
};
```

`BreakCard.tsx`:
```tsx
import React from 'react';
import { Div, Footnote } from '@vkontakte/vkui';

interface BreakCardProps {
  durationMinutes: number;
}

export const BreakCard: React.FC<BreakCardProps> = ({ durationMinutes }) => (
  <Div style={{ textAlign: 'center', padding: '4px 0', opacity: 0.7 }}>
    <Footnote>— Перемена {durationMinutes} мин —</Footnote>
  </Div>
);
```

- [ ] **Step 4: Создать `vk-mini-app/src/components/GroupModal.tsx`**

```tsx
import React, { useState } from 'react';
import { ModalPage, ModalPageHeader, Search, HorizontalScroll, Tabs, TabsItem, Group, SimpleCell } from '@vkontakte/vkui';
import { GroupItem } from '../types';
import { triggerHaptic } from '../utils/storage';

interface GroupModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  groups: GroupItem[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  id,
  onClose,
  groups,
  selectedGroup,
  onSelectGroup,
}) => {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<number>(0); // 0 = Все

  const filtered = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 0 || g.course === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <ModalPage id={id} onClose={onClose} header={<ModalPageHeader>Выбор группы</ModalPageHeader>}>
      <Group>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        <HorizontalScroll>
          <Tabs>
            <TabsItem selected={courseFilter === 0} onClick={() => setCourseFilter(0)}>Все курсы</TabsItem>
            <TabsItem selected={courseFilter === 1} onClick={() => setCourseFilter(1)}>1 курс</TabsItem>
            <TabsItem selected={courseFilter === 2} onClick={() => setCourseFilter(2)}>2 курс</TabsItem>
            <TabsItem selected={courseFilter === 3} onClick={() => setCourseFilter(3)}>3 курс</TabsItem>
            <TabsItem selected={courseFilter === 4} onClick={() => setCourseFilter(4)}>4 курс</TabsItem>
          </Tabs>
        </HorizontalScroll>

        {filtered.map((g) => (
          <SimpleCell
            key={g.id || g.name}
            onClick={() => {
              triggerHaptic('medium');
              onSelectGroup(g.name);
              onClose();
            }}
            indicator={selectedGroup === g.name ? 'Выбрано' : undefined}
            description={`${g.course} курс • ${g.departmentName}`}
          >
            {g.name}
          </SimpleCell>
        ))}
      </Group>
    </ModalPage>
  );
};
```

- [ ] **Step 5: Реализовать `vk-mini-app/src/panels/SchedulePanel.tsx`**

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Panel, PanelHeader, PullToRefresh, Group, Spinner, Placeholder, Button, Banner } from '@vkontakte/vkui';
import { Icon28CalendarOutline } from '@vkontakte/icons';
import { ScheduleResponse, GroupItem, Lesson } from '../types';
import { fetchSchedule, fetchGroups } from '../api/client';
import { cacheSchedule, getCachedSchedule } from '../utils/storage';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { DaySelector } from '../components/DaySelector';
import { LiveWidget } from '../components/LiveWidget';
import { LessonCard } from '../components/LessonCard';
import { BreakCard } from '../components/BreakCard';

interface SchedulePanelProps {
  id: string;
  selectedGroup: string;
  onOpenGroupModal: () => void;
}

export const SchedulePanel: React.FC<SchedulePanelProps> = ({ id, selectedGroup, onOpenGroupModal }) => {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSchedule(selectedGroup);
      setSchedule(data);
      cacheSchedule(selectedGroup, data);
      setIsOffline(false);
      if (data.days.length > 0 && !data.days.some((d) => d.date === selectedDate)) {
        setSelectedDate(data.days[0].date);
      }
    } catch (err) {
      console.warn('Network error, falling back to cache', err);
      const cached = getCachedSchedule(selectedGroup);
      if (cached) {
        setSchedule(cached);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, selectedDate]);

  useEffect(() => {
    loadData();
  }, [selectedGroup]);

  const activeDay = schedule?.days.find((d) => d.date === selectedDate);
  const currentLessons: Lesson[] = activeDay?.lessons || [];
  const liveStatus = useLiveStatus(currentLessons);

  return (
    <Panel id={id}>
      <PanelHeader
        before={
          <Button mode="tertiary" size="m" onClick={onOpenGroupModal}>
            Группа {selectedGroup} ▾
          </Button>
        }
      >
        Расписание
      </PanelHeader>

      <PullToRefresh onRefresh={loadData} isFetching={loading}>
        {isOffline && (
          <Banner
            mode="tint"
            header="Офлайн-режим"
            subheader="Отображаются сохранённые данные. Проверьте соединение с сетью."
          />
        )}

        {schedule && schedule.days.length > 0 && (
          <DaySelector
            days={schedule.days.map((d) => ({ date: d.date, dayOfWeek: d.dayOfWeek }))}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        <LiveWidget status={liveStatus} />

        <Group>
          {loading && !schedule ? (
            <Spinner size="medium" style={{ margin: '40px 0' }} />
          ) : currentLessons.length > 0 ? (
            currentLessons.map((lesson, idx) => {
              const isCurrent = liveStatus.type === 'lesson' && liveStatus.currentLesson?.pairNumber === lesson.pairNumber;
              const next = currentLessons[idx + 1];
              let breakMins = 0;
              if (next) {
                const [curH, curM] = lesson.timeEnd.split(':').map(Number);
                const [nextH, nextM] = next.timeStart.split(':').map(Number);
                breakMins = (nextH * 60 + nextM) - (curH * 60 + curM);
              }

              return (
                <React.Fragment key={`${lesson.pairNumber}-${lesson.subject}`}>
                  <LessonCard lesson={lesson} isCurrent={isCurrent} />
                  {breakMins > 0 && <BreakCard durationMinutes={breakMins} />}
                </React.Fragment>
              );
            })
          ) : (
            <Placeholder icon={<Icon28CalendarOutline width={48} height={48} />} header="В этот день пар нет">
              Занятия отсутствуют или расписание ещё не опубликовано.
            </Placeholder>
          )}
        </Group>
      </PullToRefresh>
    </Panel>
  );
};
```

- [ ] **Step 6: Закоммитить изменения**

```bash
git add vk-mini-app/src/components vk-mini-app/src/panels/SchedulePanel.tsx
git commit -m "feat(vk): implement schedule panel, day selector, cards and group modal"
```

---

### Task 6: Экраны Аудиторий и Преподавателей (RoomsPanel & TeachersPanel)

**Files:**
- Create: `vk-mini-app/src/panels/RoomsPanel.tsx`
- Create: `vk-mini-app/src/panels/TeachersPanel.tsx`
- Test: `vk-mini-app/tests/filters.test.ts`

**Interfaces:**
- Consumes: `fetchRooms`, `fetchTeachers`, `types/index.ts`.
- Produces: Готовые панели `RoomsPanel` и `TeachersPanel`.

- [ ] **Step 1: Написать тест фильтрации аудиторий и преподавателей `vk-mini-app/tests/filters.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { RoomItem } from '../src/types';

describe('Rooms & Teachers Filter Logic', () => {
  const rooms: RoomItem[] = [
    {
      room: '101',
      building: 'main',
      buildingAddress: 'Красный пр-т, 9',
      status: 'free',
      currentLesson: null,
      nextLesson: null,
      schedule: [],
    },
    {
      room: '205',
      building: 'spartaka',
      buildingAddress: 'ул. Спартака, 12',
      status: 'occupied',
      currentLesson: null,
      nextLesson: null,
      schedule: [],
    },
  ];

  it('filters rooms by building and counts free/occupied', () => {
    const mainRooms = rooms.filter((r) => r.building === 'main');
    expect(mainRooms).toHaveLength(1);
    expect(mainRooms[0].room).toBe('101');

    const freeCount = rooms.filter((r) => r.status === 'free').length;
    const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
    expect(freeCount).toBe(1);
    expect(occupiedCount).toBe(1);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он проходит**

Запуск:
```bash
cd vk-mini-app && npm test tests/filters.test.ts
```
Ожидается: PASS.

- [ ] **Step 3: Реализовать `vk-mini-app/src/panels/RoomsPanel.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { Panel, PanelHeader, Search, HorizontalScroll, Tabs, TabsItem, Group, SimpleCell, Footnote, Badge, Spinner, Placeholder, Accordion } from '@vkontakte/vkui';
import { Icon28DoorArrowRightOutline } from '@vkontakte/icons';
import { RoomItem } from '../types';
import { fetchRooms } from '../api/client';

export const RoomsPanel: React.FC<{ id: string }> = ({ id }) => {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<'all' | 'main' | 'spartaka'>('all');

  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rooms.filter((r) => {
    const matchesBuilding = buildingFilter === 'all' || r.building === buildingFilter;
    const matchesSearch = r.room.toLowerCase().includes(search.toLowerCase()) ||
      (r.currentLesson?.subject || '').toLowerCase().includes(search.toLowerCase());
    return matchesBuilding && matchesSearch;
  });

  const freeCount = filtered.filter((r) => r.status === 'free').length;
  const occupiedCount = filtered.filter((r) => r.status === 'occupied').length;

  return (
    <Panel id={id}>
      <PanelHeader>Аудитории</PanelHeader>
      <Group>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск кабинета или предмета..." />
        <HorizontalScroll>
          <Tabs>
            <TabsItem selected={buildingFilter === 'all'} onClick={() => setBuildingFilter('all')}>Все корпуса</TabsItem>
            <TabsItem selected={buildingFilter === 'main'} onClick={() => setBuildingFilter('main')}>Красный пр-т, 9</TabsItem>
            <TabsItem selected={buildingFilter === 'spartaka'} onClick={() => setBuildingFilter('spartaka')}>ул. Спартака, 12</TabsItem>
          </Tabs>
        </HorizontalScroll>

        <div style={{ display: 'flex', gap: 12, padding: '8px 16px' }}>
          <Badge mode="prominent" style={{ backgroundColor: '#4bb34b', color: '#fff', padding: '4px 8px' }}>
            Свободно: {freeCount}
          </Badge>
          <Badge mode="prominent" style={{ backgroundColor: '#e64646', color: '#fff', padding: '4px 8px' }}>
            Занято: {occupiedCount}
          </Badge>
        </div>

        {loading ? (
          <Spinner size="medium" style={{ margin: '40px 0' }} />
        ) : filtered.length > 0 ? (
          filtered.map((room) => (
            <Accordion key={`${room.building}-${room.room}`}>
              <Accordion.Summary>
                <SimpleCell
                  indicator={room.status === 'free' ? 'Свободна' : 'Занята'}
                  description={`${room.buildingAddress} • ${room.currentLesson ? room.currentLesson.subject : 'Сейчас нет занятий'}`}
                >
                  Кабинет {room.room}
                </SimpleCell>
              </Accordion.Summary>
              <Accordion.Content>
                <div style={{ padding: '8px 16px', background: 'var(--vkui--color_background_secondary)' }}>
                  {room.schedule && room.schedule.length > 0 ? (
                    room.schedule.map((s, idx) => (
                      <Footnote key={idx} style={{ padding: '4px 0' }}>
                        {s.timeStart}-{s.timeEnd}: <b>{s.subject}</b> ({s.group}) — {s.teacher}
                      </Footnote>
                    ))
                  ) : (
                    <Footnote>На сегодня занятий больше нет</Footnote>
                  )}
                </div>
              </Accordion.Content>
            </Accordion>
          ))
        ) : (
          <Placeholder icon={<Icon28DoorArrowRightOutline width={48} height={48} />} header="Аудитории не найдены" />
        )}
      </Group>
    </Panel>
  );
};
```

- [ ] **Step 4: Реализовать `vk-mini-app/src/panels/TeachersPanel.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { Panel, PanelHeader, Search, Group, SimpleCell, InitialsAvatar, Spinner, Placeholder, Accordion, Footnote } from '@vkontakte/vkui';
import { Icon28Users3Outline } from '@vkontakte/icons';
import { TeacherItem } from '../types';
import { fetchTeachers } from '../api/client';

export const TeachersPanel: React.FC<{ id: string }> = ({ id }) => {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeachers()
      .then(setTeachers)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = teachers.filter((t) => {
    const matchesName = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesName || matchesSubject;
  });

  return (
    <Panel id={id}>
      <PanelHeader>Преподаватели</PanelHeader>
      <Group>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Фамилия педагога или предмет..." />

        {loading ? (
          <Spinner size="medium" style={{ margin: '40px 0' }} />
        ) : filtered.length > 0 ? (
          filtered.map((t) => (
            <Accordion key={t.name}>
              <Accordion.Summary>
                <SimpleCell
                  before={<InitialsAvatar size={40}>{t.name.slice(0, 2)}</InitialsAvatar>}
                  description={t.subjects.join(', ')}
                >
                  {t.name}
                </SimpleCell>
              </Accordion.Summary>
              <Accordion.Content>
                <div style={{ padding: '8px 16px', background: 'var(--vkui--color_background_secondary)' }}>
                  {t.schedule && t.schedule.length > 0 ? (
                    t.schedule.map((item, idx) => (
                      <Footnote key={idx} style={{ padding: '4px 0' }}>
                        {item.dayOfWeek}, {item.pairNumber} пара ({item.timeStart}-{item.timeEnd}): {item.subject} (гр. {item.group}, каб. {item.room})
                      </Footnote>
                    ))
                  ) : (
                    <Footnote>Нет запланированных пар в расписании</Footnote>
                  )}
                </div>
              </Accordion.Content>
            </Accordion>
          ))
        ) : (
          <Placeholder icon={<Icon28Users3Outline width={48} height={48} />} header="Преподаватели не найдены" />
        )}
      </Group>
    </Panel>
  );
};
```

- [ ] **Step 5: Закоммитить изменения**

```bash
git add vk-mini-app/src/panels/RoomsPanel.tsx vk-mini-app/src/panels/TeachersPanel.tsx vk-mini-app/tests/filters.test.ts
git commit -m "feat(vk): implement rooms and teachers panels with search and expandable schedules"
```

---

### Task 7: Корневой макет, переключение тем, модальные окна и сквозная верификация

**Files:**
- Create: `vk-mini-app/src/App.tsx`
- Create: `vk-mini-app/src/main.tsx`
- Create: `vk-mini-app/src/index.css`
- Test: `vk-mini-app/package.json` (`npm run build`)

**Interfaces:**
- Consumes: Все созданные компоненты и панели.
- Produces: Полностью скомпилированное и готовое к деплою мини-приложение VK.

- [ ] **Step 1: Создать `vk-mini-app/src/index.css`**

```css
body {
  margin: 0;
  padding: 0;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Segoe UI', sans-serif;
}
```

- [ ] **Step 2: Создать `vk-mini-app/src/App.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import {
  ConfigProvider,
  AdaptivityProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
  Tabbar,
  TabbarItem,
  ModalRoot,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import vkBridge, { AppearanceType } from '@vkontakte/vk-bridge';
import { Icon28CalendarOutline, Icon28DoorArrowRightOutline, Icon28Users3Outline } from '@vkontakte/icons';
import { SchedulePanel } from './panels/SchedulePanel';
import { RoomsPanel } from './panels/RoomsPanel';
import { TeachersPanel } from './panels/TeachersPanel';
import { GroupModal } from './components/GroupModal';
import { useVkStorage } from './hooks/useVkStorage';
import { fetchGroups } from './api/client';
import { GroupItem } from './types';
import { triggerHaptic } from './utils/storage';

export const App: React.FC = () => {
  const [appearance, setAppearance] = useState<AppearanceType>('light');
  const [activeTab, setActiveTab] = useState<'schedule' | 'rooms' | 'teachers'>('schedule');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const { selectedGroup, updateGroup } = useVkStorage('Д-11');

  useEffect(() => {
    fetchGroups().then(setGroups).catch(console.error);

    vkBridge.subscribe((e) => {
      if (e.detail.type === 'VKWebAppUpdateConfig') {
        const scheme = e.detail.data.appearance || 'light';
        setAppearance(scheme);
      }
    });
  }, []);

  const modal = (
    <ModalRoot activeModal={isGroupModalOpen ? 'group-modal' : null}>
      <GroupModal
        id="group-modal"
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={(g) => updateGroup(g)}
      />
    </ModalRoot>
  );

  return (
    <ConfigProvider appearance={appearance}>
      <AdaptivityProvider>
        <AppRoot>
          <SplitLayout modal={modal}>
            <SplitCol autoSpaced>
              <View activePanel={activeTab}>
                <SchedulePanel
                  id="schedule"
                  selectedGroup={selectedGroup}
                  onOpenGroupModal={() => setIsGroupModalOpen(true)}
                />
                <RoomsPanel id="rooms" />
                <TeachersPanel id="teachers" />
              </View>

              <Tabbar>
                <TabbarItem
                  selected={activeTab === 'schedule'}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('schedule');
                  }}
                  text="Расписание"
                >
                  <Icon28CalendarOutline />
                </TabbarItem>
                <TabbarItem
                  selected={activeTab === 'rooms'}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('rooms');
                  }}
                  text="Аудитории"
                >
                  <Icon28DoorArrowRightOutline />
                </TabbarItem>
                <TabbarItem
                  selected={activeTab === 'teachers'}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('teachers');
                  }}
                  text="Педагоги"
                >
                  <Icon28Users3Outline />
                </TabbarItem>
              </Tabbar>
            </SplitCol>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};
```

- [ ] **Step 3: Создать `vk-mini-app/src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import { App } from './App';
import './index.css';

// Инициализация VK Mini Apps SDK
vkBridge.send('VKWebAppInit');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Запустить компиляцию и сборку `npm run build`**

Запуск:
```bash
cd vk-mini-app && npm run build
```
Ожидается: Успешная компиляция TypeScript (`tsc`) и создание оптимизированных бандлов в `dist/` без ошибок.

- [ ] **Step 5: Запустить полный набор всех тестов**

Запуск:
```bash
cd vk-mini-app && npm test
```
Ожидается: Все тесты проходят (PASS).

- [ ] **Step 6: Закоммитить финальные изменения**

```bash
git add vk-mini-app
git commit -m "feat(vk): implement root App shell, VKUI navigation and production build"
```
