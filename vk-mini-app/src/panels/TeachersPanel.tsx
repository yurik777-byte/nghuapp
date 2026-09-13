import React, { useState, useEffect, useCallback } from 'react';
import {
  Panel,
  PanelHeader,
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

const InitialsAvatar: React.FC<{ size?: number; children?: string }> = ({ size = 40, children }) => (
  <Avatar size={size} initials={children} gradientColor="blue" />
);

export const TeachersPanel: React.FC<{ id: string }> = ({ id }) => {
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
      <PanelHeader>Преподаватели</PanelHeader>
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
                  subtitle={t.subjects.join(', ')}
                >
                  {t.name}
                </SimpleCell>
              </Accordion.Summary>
              <Accordion.Content>
                <div style={{ padding: '8px 16px', background: 'var(--vkui--color_background_secondary)' }}>
                  {t.schedule && t.schedule.length > 0 ? (
                    t.schedule.map((item, idx) => (
                      <Footnote key={idx} style={{ padding: '4px 0' }}>
                        {item.dayOfWeek}, {item.pairNumber} пара ({item.timeStart}-{item.timeEnd}): <b>{item.subject}</b> (гр. {item.group}, каб. {item.room})
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
          <Placeholder icon={<Icon28Users3Outline width={48} height={48} />} title="Преподаватели не найдены" />
        )}
      </Group>
    </Panel>
  );
};
