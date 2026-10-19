import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Panel,
  Search,
  Group,
  SimpleCell,
  Avatar,
  Spinner,
  Placeholder,
  Button,
  Accordion,
  Footnote,
} from '@vkontakte/vkui';
import { Icon28Users3Outline, Icon28WarningTriangleOutline } from '@vkontakte/icons';
import { TeacherItem, TeacherLessonItem } from '../types';
import { fetchTeachers } from '../api/client';
import { AppHeader, AppTab } from '../components/AppHeader';
import { formatSubjectTitle } from '../components/LessonCard';
import { formatDateWithDay } from '../utils/timeUtils';

const InitialsAvatar: React.FC<{ size?: number; children?: string }> = ({ size = 40, children }) => (
  <Avatar size={size} initials={children} gradientColor="blue" />
);

interface DayGroup {
  date: string;
  dayOfWeek: string;
  lessons: TeacherLessonItem[];
}

function groupTeacherLessons(lessons: TeacherLessonItem[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const item of lessons) {
    const key = item.date || item.dayOfWeek || 'other';
    if (!map.has(key)) {
      map.set(key, {
        date: item.date,
        dayOfWeek: item.dayOfWeek,
        lessons: [],
      });
    }
    map.get(key)!.lessons.push(item);
  }
  return Array.from(map.values());
}

interface TeachersPanelProps {
  id: string;
  isDesktop?: boolean;
  activeTab?: AppTab;
  onSelectTab?: (tab: AppTab) => void;
  selectedGroup?: string;
  onOpenGroupModal?: () => void;
  colorScheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const TeachersPanel: React.FC<TeachersPanelProps> = ({
  id,
  isDesktop = false,
  activeTab = 'teachers',
  onSelectTab = () => {},
  selectedGroup = '',
  onOpenGroupModal = () => {},
  colorScheme = 'light',
  onToggleTheme = () => {},
}) => {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [search, setSearch] = useState('');

  const loadTeachers = useCallback(() => {
    setLoading(true);
    setHasError(false);
    fetchTeachers()
      .then((data) => {
        setTeachers(data);
        setHasError(false);
      })
      .catch((e) => {
        console.error(e);
        setHasError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    const cleanSearch = searchLower.replace(/[\s\-_.]/g, '');
    const clean = (s: string) => s.toLowerCase().replace(/[\s\-_.]/g, '');

    return teachers.filter((t) => {
      if (!cleanSearch) return true;
      const matchesName = t.name.toLowerCase().includes(searchLower) || clean(t.name).includes(cleanSearch);
      const matchesSubject = t.subjects.some(
        (s) => s.toLowerCase().includes(searchLower) || clean(s).includes(cleanSearch)
      );
      const matchesGroup = t.schedule.some((l) => clean(l.group).includes(cleanSearch));
      return matchesName || matchesSubject || matchesGroup;
    });
  }, [teachers, search]);

  return (
    <Panel id={id}>
      <AppHeader
        isDesktop={isDesktop}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        selectedGroup={selectedGroup}
        onOpenGroupModal={onOpenGroupModal}
        colorScheme={colorScheme}
        onToggleTheme={onToggleTheme}
        title="Преподаватели"
      />

      <Group>
        {!hasError && (
          <Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Фамилия педагога, предмет или группа (напр. 21)..."
          />
        )}

        {loading ? (
          <Spinner size="m" style={{ margin: '40px 0' }} />
        ) : hasError ? (
          <Placeholder
            icon={<Icon28WarningTriangleOutline width={48} height={48} />}
            title="Не удалось загрузить преподавателей"
            action={
              <Button size="m" mode="primary" onClick={loadTeachers}>
                Повторить попытку
              </Button>
            }
          >
            Проверьте соединение с интернетом и попробуйте снова.
          </Placeholder>
        ) : filtered.length > 0 ? (
          filtered.map((t) => {
            const dayGroups = groupTeacherLessons(t.schedule);

            return (
              <Accordion key={t.name}>
                <Accordion.Summary>
                  <SimpleCell
                    before={<InitialsAvatar size={40}>{t.name.slice(0, 2)}</InitialsAvatar>}
                    subtitle={t.subjects.map(formatSubjectTitle).join(', ')}
                    indicator={
                      <span
                        style={{
                          backgroundColor: 'var(--vkui--color_background_secondary)',
                          color: 'var(--vkui--color_text_subhead)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {t.schedule.length} {t.schedule.length === 1 ? 'пара' : t.schedule.length < 5 ? 'пары' : 'пар'}
                      </span>
                    }
                  >
                    <span style={{ fontWeight: 600 }}>{t.name}</span>
                  </SimpleCell>
                </Accordion.Summary>
                <Accordion.Content>
                  <div style={{ padding: '8px 16px', background: 'var(--vkui--color_background_secondary)' }}>
                    {dayGroups.length > 0 ? (
                      dayGroups.map((dayGroup, gIdx) => {
                        const headerText =
                          formatDateWithDay(dayGroup.date, dayGroup.dayOfWeek) ||
                          dayGroup.dayOfWeek ||
                          dayGroup.date ||
                          'Занятия';

                        return (
                          <div key={dayGroup.date || `group-${gIdx}`} style={{ marginBottom: 12 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 10px',
                                margin: '8px 0 4px',
                                backgroundColor: 'var(--vkui--color_background_tertiary)',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--vkui--color_text_primary)',
                              }}
                            >
                              <span style={{ fontSize: 14 }}>📅</span>
                              <span>{headerText}</span>
                            </div>

                            {dayGroup.lessons.map((item, idx) => {
                              const rawRoom = (item.room || '').trim();
                              const isDynamo = /динамо/i.test(rawRoom) || /динамо/i.test(item.subject);
                              const roomLabel = !rawRoom || rawRoom === 'unknown' ? '' : isDynamo ? 'ст. Динамо' : `каб. ${rawRoom}`;
                              const isMain = /красный/i.test(item.buildingAddress);

                              return (
                                <div
                                  key={`${item.pairNumber}-${item.timeStart}-${idx}`}
                                  style={{
                                    padding: '8px 10px',
                                    borderBottom: '1px solid var(--vkui--color_separator_primary)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 6,
                                  }}
                                >
                                  <div>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: 'var(--vkui--color_text_primary)',
                                      }}
                                    >
                                      {item.pairNumber} пара ({item.timeStart}–{item.timeEnd}):{' '}
                                      <b>{formatSubjectTitle(item.subject)}</b>
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: 'var(--vkui--color_text_subhead)',
                                        marginTop: 2,
                                      }}
                                    >
                                      Группа: <b>{item.group}</b>
                                      {roomLabel ? ` • ${roomLabel}` : ''}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: isMain ? '#2688EB' : '#E65D00',
                                      backgroundColor: isMain
                                        ? 'rgba(63, 138, 224, 0.12)'
                                        : 'rgba(230, 93, 0, 0.12)',
                                      padding: '2px 6px',
                                      borderRadius: 6,
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 5,
                                        height: 5,
                                        borderRadius: '50%',
                                        backgroundColor: isMain ? '#2688EB' : '#E65D00',
                                        display: 'inline-block',
                                      }}
                                    />
                                    {isMain ? 'Красный 9' : 'Спартака 12'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })
                    ) : (
                      <Footnote>Нет запланированных пар в расписании</Footnote>
                    )}
                  </div>
                </Accordion.Content>
              </Accordion>
            );
          })
        ) : (
          <Placeholder icon={<Icon28Users3Outline width={48} height={48} />} title="Преподаватели не найдены" />
        )}
      </Group>
    </Panel>
  );
};

