import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Panel,
  Search,
  Tabs,
  TabsItem,
  Group,
  SimpleCell,
  Spinner,
  Placeholder,
  Button,
  Badge,
  Accordion,
  Footnote,
  HorizontalScroll,
} from '@vkontakte/vkui';
import { Icon28DoorArrowRightOutline, Icon28WarningTriangleOutline } from '@vkontakte/icons';
import { RoomItem } from '../types';
import { fetchRooms } from '../api/client';
import { triggerHaptic } from '../utils/storage';
import { AppHeader, AppTab } from '../components/AppHeader';

interface RoomsPanelProps {
  id: string;
  isDesktop?: boolean;
  activeTab?: AppTab;
  onSelectTab?: (tab: AppTab) => void;
  selectedGroup?: string;
  onOpenGroupModal?: () => void;
  colorScheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const RoomsPanel: React.FC<RoomsPanelProps> = ({
  id,
  isDesktop = false,
  activeTab = 'rooms',
  onSelectTab = () => {},
  selectedGroup = '',
  onOpenGroupModal = () => {},
  colorScheme = 'light',
  onToggleTheme = () => {},
}) => {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<'all' | 'main' | 'spartaka'>('all');

  const loadRooms = useCallback(() => {
    setLoading(true);
    setHasError(false);
    fetchRooms()
      .then((data) => {
        setRooms(data);
        setHasError(false);
      })
      .catch((e) => {
        console.error(e);
        setHasError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      const matchesSearch =
        r.room.toLowerCase().includes(search.toLowerCase()) ||
        (r.currentLesson && r.currentLesson.subject.toLowerCase().includes(search.toLowerCase())) ||
        (r.currentLesson && r.currentLesson.teacher.toLowerCase().includes(search.toLowerCase())) ||
        (r.lastLesson && r.lastLesson.group.toLowerCase().includes(search.toLowerCase()));

      const matchesBuilding = buildingFilter === 'all' || r.building === buildingFilter;
      return matchesSearch && matchesBuilding;
    });
  }, [rooms, search, buildingFilter]);

  const freeCount = useMemo(() => filtered.filter((r) => r.status === 'free').length, [filtered]);
  const occupiedCount = useMemo(() => filtered.filter((r) => r.status === 'occupied').length, [filtered]);

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
        title="Аудитории"
      />

      <Group>
        {!hasError && (
          <>
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск аудитории, предмета или группы..."
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

            <div style={{ display: 'flex', gap: 12, padding: '10px 16px' }}>
              <Badge
                mode="prominent"
                style={{ backgroundColor: '#4bb34b', color: '#fff', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}
              >
                Свободно: {freeCount}
              </Badge>
              <Badge
                mode="prominent"
                style={{ backgroundColor: '#e64646', color: '#fff', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}
              >
                Занято: {occupiedCount}
              </Badge>
            </div>
          </>
        )}

        {loading ? (
          <Spinner size="m" style={{ margin: '40px 0' }} />
        ) : hasError ? (
          <Placeholder
            icon={<Icon28WarningTriangleOutline width={48} height={48} />}
            title="Не удалось загрузить аудитории"
            action={
              <Button size="m" mode="primary" onClick={loadRooms}>
                Повторить попытку
              </Button>
            }
          >
            Проверьте соединение с интернетом и попробуйте снова.
          </Placeholder>
        ) : filtered.length > 0 ? (
          filtered.map((room) => {
            const isFree = room.status === 'free';
            const isMain = room.building === 'main';

            return (
              <Accordion key={`${room.building}-${room.room}`}>
                <Accordion.Summary>
                  <SimpleCell
                    indicator={
                      <Badge
                        mode="prominent"
                        style={{
                          backgroundColor: isFree ? '#4bb34b' : '#e64646',
                          color: '#fff',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {isFree ? 'Свободна' : 'Занята'}
                      </Badge>
                    }
                    subtitle={
                      <div style={{ marginTop: 2 }}>
                        <span style={{ color: isMain ? '#3F8AE0' : '#E65D00', fontWeight: 600 }}>
                          {isMain ? 'Красный 9' : 'Спартака 12'}
                        </span>
                        {' • '}
                        {isFree ? (
                          <span style={{ color: 'var(--vkui--color_text_subhead)' }}>
                            {room.nextLesson
                              ? `до ${room.nextLesson.timeStart} (далее: ${room.nextLesson.subject})`
                              : 'на весь день'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--vkui--color_text_primary)', fontWeight: 500 }}>
                            {room.currentLesson
                              ? `${room.currentLesson.subject} (${room.currentLesson.group}) • до ${room.currentLesson.timeEnd}`
                              : 'Идёт пара'}
                          </span>
                        )}

                        {/* Who studied here last time */}
                        {isFree && room.lastLesson && (
                          <div
                            style={{
                              marginTop: 6,
                              padding: '6px 8px',
                              background: 'rgba(75, 179, 75, 0.08)',
                              borderRadius: 6,
                              fontSize: 12,
                              lineHeight: '16px',
                              color: 'var(--vkui--color_text_subhead)',
                            }}
                          >
                            <span style={{ color: '#2b8830', fontWeight: 600 }}>В прошлый раз была пара: </span>
                            Группа <b>{room.lastLesson.group}</b> • {room.lastLesson.dayOfWeek ? `${room.lastLesson.dayOfWeek}, ` : ''}
                            {room.lastLesson.timeStart}-{room.lastLesson.timeEnd} • {room.lastLesson.subject}
                            {room.lastLesson.teacher ? ` (${room.lastLesson.teacher})` : ''}
                          </div>
                        )}
                      </div>
                    }
                  >
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Кабинет {room.room}</span>
                  </SimpleCell>
                </Accordion.Summary>

                <Accordion.Content>
                  <div style={{ padding: '8px 16px', background: 'var(--vkui--color_background_secondary)' }}>
                    <Footnote style={{ fontWeight: 600, color: 'var(--vkui--color_text_subhead)', marginBottom: 6 }}>
                      График аудитории:
                    </Footnote>
                    {room.schedule && room.schedule.length > 0 ? (
                      room.schedule.map((s, idx) => (
                        <Footnote key={idx} style={{ padding: '4px 0', borderBottom: '1px solid var(--vkui--color_separator_primary)' }}>
                          {s.dayOfWeek ? `${s.dayOfWeek} ` : ''}
                          <b>{s.timeStart}-{s.timeEnd}</b>: {s.subject} (Группа <b>{s.group}</b>) — {s.teacher}
                        </Footnote>
                      ))
                    ) : (
                      <Footnote>На сегодня пар в этом кабинете нет</Footnote>
                    )}
                  </div>
                </Accordion.Content>
              </Accordion>
            );
          })
        ) : (
          <Placeholder icon={<Icon28DoorArrowRightOutline width={48} height={48} />} title="Аудитории не найдены" />
        )}
      </Group>
    </Panel>
  );
};
