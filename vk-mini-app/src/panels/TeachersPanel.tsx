import React, { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Search,
  Group,
  SimpleCell,
  Avatar,
  Spinner,
  Placeholder,
  Accordion,
  Footnote,
} from '@vkontakte/vkui';
import { Icon28Users3Outline } from '@vkontakte/icons';
import { TeacherItem } from '../types';
import { fetchTeachers } from '../api/client';

const InitialsAvatar: React.FC<{ size?: number; children?: string }> = ({ size = 40, children }) => (
  <Avatar size={size} initials={children} gradientColor="blue" />
);

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
        <Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Фамилия педагога или предмет..."
        />

        {loading ? (
          <Spinner size="m" style={{ margin: '40px 0' }} />
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
