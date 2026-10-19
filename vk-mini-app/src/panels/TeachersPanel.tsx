import React, { useState, useEffect, useCallback } from 'react';
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
import { TeacherItem } from '../types';
import { fetchTeachers } from '../api/client';
import { AppHeader, AppTab } from '../components/AppHeader';
import { formatSubjectTitle } from '../components/LessonCard';

const InitialsAvatar: React.FC<{ size?: number; children?: string }> = ({ size = 40, children }) => (
  <Avatar size={size} initials={children} gradientColor="blue" />
);

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

  const filtered = teachers.filter((t) => {
    const matchesName = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesName || matchesSubject;
  });

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
            placeholder="Фамилия педагога или предмет..."
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
          filtered.map((t) => (
            <Accordion key={t.name}>
              <Accordion.Summary>
                <SimpleCell
                  before={<InitialsAvatar size={40}>{t.name.slice(0, 2)}</InitialsAvatar>}
                  subtitle={t.subjects.map(formatSubjectTitle).join(', ')}
                >
                  <span style={{ fontWeight: 600 }}>{t.name}</span>
                </SimpleCell>
              </Accordion.Summary>
              <Accordion.Content>
                <div style={{ padding: '8px 16px', background: 'var(--vkui--color_background_secondary)' }}>
                  {t.schedule && t.schedule.length > 0 ? (
                    t.schedule.map((item, idx) => {
                      const roomLabel = !item.room || item.room === 'unknown' ? '' : /динамо/i.test(item.room) ? 'ст. Динамо' : `каб. ${item.room}`;
                      return (
                        <Footnote key={idx} style={{ padding: '4px 0', borderBottom: '1px solid var(--vkui--color_separator_primary)' }}>
                          {item.dayOfWeek}, {item.pairNumber} пара ({item.timeStart}-{item.timeEnd}): <b>{formatSubjectTitle(item.subject)}</b> (гр. {item.group}{roomLabel ? `, ${roomLabel}` : ''})
                        </Footnote>
                      );
                    })
                  ) : (
                    <Footnote>Нет запланированных пар в расписании</Footnote>
                  )}
                </div>
              </Accordion.Content>
            </Accordion>
          ))
        ) : (
          <Placeholder icon={<Icon28Users3Outline width={48} height={48} />} title="Преподаватели не найдены" />
        )}
      </Group>
    </Panel>
  );
};
