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
import { formatSubjectTitle } from '../components/LessonCard';

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
    const clean = (s: string) => s.toLowerCase().replace(/[\s\-_.]/g, '');
    const cleanSearch = clean(search);
    const searchLower = search.toLowerCase();

    return rooms
      .filter((r) => r.room && r.room.trim().length > 0 && r.room !== 'unknown' && !/динамо/i.test(r.room))
      .filter((r) => {
        const matchesSearch =
          !cleanSearch ||
          r.room.toLowerCase().includes(searchLower) ||
          clean(r.room).includes(cleanSearch) ||
          (r.currentLesson && r.currentLesson.subject.toLowerCase().includes(searchLower)) ||
          (r.currentLesson && clean(r.currentLesson.subject).includes(cleanSearch)) ||
          (r.currentLesson && clean(r.currentLesson.group).includes(cleanSearch)) ||
          (r.currentLesson && r.currentLesson.teacher.toLowerCase().includes(searchLower)) ||
          (r.lastLesson && clean(r.lastLesson.group).includes(cleanSearch));

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
                    multiline
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
                              ? `до ${room.nextLesson.timeStart} (далее: ${formatSubjectTitle(room.nextLesson.subject)})`
                              : 'на весь день'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--vkui--color_text_primary)', fontWeight: 500 }}>
                            {room.currentLesson
                              ? `${formatSubjectTitle(room.currentLesson.subject)} (${room.currentLesson.group}) • до ${room.currentLesson.timeEnd}`
                              : 'Идёт пара'}
                          </span>
                        )}
                      </div>
                    }
                  >
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Кабинет {room.room}</span>
                  </SimpleCell>

                  {/* Who studied here last time - rendered as full-width banner with zero truncation */}
                  {isFree && room.lastLesson && (
                    <div style={{ padding: '0 16px 10px 16px' }}>
                      <div
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(75, 179, 75, 0.08)',
                          border: '1px solid rgba(75, 179, 75, 0.22)',
                          borderRadius: 8,
                          fontSize: 13,
                          lineHeight: '18px',
                          color: 'var(--vkui--color_text_subhead)',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        <div style={{ color: '#2b8830', fontWeight: 700, marginBottom: 2 }}>
                          🕒 В прошлый раз была пара:
                        </div>
                        <div style={{ color: 'var(--vkui--color_text_primary)', fontWeight: 600 }}>
                          Группа <b>{room.lastLesson.group}</b> • {room.lastLesson.dayOfWeek ? `${room.lastLesson.dayOfWeek}, ` : ''}
                          {room.lastLesson.timeStart}–{room.lastLesson.timeEnd}
                        </div>
                        <div style={{ marginTop: 2, fontSize: 12 }}>
                          {formatSubjectTitle(room.lastLesson.subject)}
                          {room.lastLesson.teacher ? ` • ${room.lastLesson.teacher}` : ''}
                        </div>
                      </div>
                    </div>
                  )}
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
                          <b>{s.timeStart}-{s.timeEnd}</b>: {formatSubjectTitle(s.subject)} (Группа <b>{s.group}</b>) — {s.teacher}
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
