import React, { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Search,
  HorizontalScroll,
  Tabs,
  TabsItem,
  Group,
  SimpleCell,
  Footnote,
  Badge,
  Spinner,
  Placeholder,
  Accordion,
} from '@vkontakte/vkui';
import { Icon28DoorArrowRightOutline } from '@vkontakte/icons';
import { RoomItem } from '../types';
import { fetchRooms } from '../api/client';
import { triggerHaptic } from '../utils/storage';

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
    const matchesSearch =
      r.room.toLowerCase().includes(search.toLowerCase()) ||
      (r.currentLesson?.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.currentLesson?.teacher || '').toLowerCase().includes(search.toLowerCase());
    return matchesBuilding && matchesSearch;
  });

  const freeCount = filtered.filter((r) => r.status === 'free').length;
  const occupiedCount = filtered.filter((r) => r.status === 'occupied').length;

  return (
    <Panel id={id}>
      <PanelHeader>Аудитории</PanelHeader>
      <Group>
        <Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск кабинета или предмета..."
        />
        <HorizontalScroll>
          <Tabs>
            <TabsItem
              selected={buildingFilter === 'all'}
              onClick={() => {
                triggerHaptic('light');
                setBuildingFilter('all');
              }}
            >
              Все корпуса
            </TabsItem>
            <TabsItem
              selected={buildingFilter === 'main'}
              onClick={() => {
                triggerHaptic('light');
                setBuildingFilter('main');
              }}
            >
              Красный пр-т, 9
            </TabsItem>
            <TabsItem
              selected={buildingFilter === 'spartaka'}
              onClick={() => {
                triggerHaptic('light');
                setBuildingFilter('spartaka');
              }}
            >
              ул. Спартака, 12
            </TabsItem>
          </Tabs>
        </HorizontalScroll>

        <div style={{ display: 'flex', gap: 12, padding: '8px 16px' }}>
          <Badge
            mode="prominent"
            style={{ backgroundColor: '#4bb34b', color: '#fff', padding: '4px 8px', borderRadius: 6 }}
          >
            Свободно: {freeCount}
          </Badge>
          <Badge
            mode="prominent"
            style={{ backgroundColor: '#e64646', color: '#fff', padding: '4px 8px', borderRadius: 6 }}
          >
            Занято: {occupiedCount}
          </Badge>
        </div>

        {loading ? (
          <Spinner size="m" style={{ margin: '40px 0' }} />
        ) : filtered.length > 0 ? (
          filtered.map((room) => (
            <Accordion key={`${room.building}-${room.room}`}>
              <Accordion.Summary>
                <SimpleCell
                  indicator={room.status === 'free' ? 'Свободна' : 'Занята'}
                  subtitle={`${room.buildingAddress} • ${room.currentLesson ? room.currentLesson.subject : 'Сейчас нет занятий'}`}
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
          <Placeholder icon={<Icon28DoorArrowRightOutline width={48} height={48} />} title="Аудитории не найдены" />
        )}
      </Group>
    </Panel>
  );
};
