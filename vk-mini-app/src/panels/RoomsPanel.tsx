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
  Accordion,
  Footnote,
  HorizontalScroll,
} from '@vkontakte/vkui';
import { Icon28DoorArrowRightOutline, Icon28WarningTriangleOutline } from '@vkontakte/icons';
import { RoomItem } from '../types';
import { fetchRooms, fetchDays } from '../api/client';
import { triggerHaptic } from '../utils/storage';
import { getLocalDateString, formatDateRussian, formatDateWithDay } from '../utils/timeUtils';
import { AppHeader, AppTab } from '../components/AppHeader';
import { DaySelector } from '../components/DaySelector';
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
  const [days, setDays] = useState<{ date: string; dayOfWeek: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<'all' | 'main' | 'spartaka'>('all');

  // Load available schedule days
  useEffect(() => {
    fetchDays()
      .then((daysList) => {
        if (daysList && daysList.length > 0) {
          setDays(daysList);
          const today = getLocalDateString();
          if (!daysList.some((d) => d.date === today)) {
            setSelectedDate(daysList[0].date);
          }
        }
      })
      .catch((e) => console.error('Failed to load days:', e));
  }, []);

  const loadRooms = useCallback((dateToLoad: string) => {
    setLoading(true);
    setHasError(false);
    fetchRooms(undefined, dateToLoad)
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
    loadRooms(selectedDate);
  }, [loadRooms, selectedDate]);

  const [onlyFree, setOnlyFree] = useState(false);

  const clean = (s: string) => s.toLowerCase().replace(/[\s\-_.]/g, '');
  const cleanSearch = clean(search);
  const searchLower = search.toLowerCase();

  const filtered = useMemo(() => {
    return rooms
      .filter((r) => r.room && r.room.trim().length > 0 && r.room !== 'unknown' && !/динамо/i.test(r.room))
      .filter((r) => {
        const matchesStatus = !onlyFree || r.status === 'free';
        const matchesSearch =
          !cleanSearch ||
          r.room.toLowerCase().includes(searchLower) ||
          clean(r.room).includes(cleanSearch) ||
          (r.currentLesson && r.currentLesson.subject.toLowerCase().includes(searchLower)) ||
          (r.currentLesson && clean(r.currentLesson.subject).includes(cleanSearch)) ||
          (r.currentLesson && clean(r.currentLesson.group).includes(cleanSearch)) ||
          (r.currentLesson && r.currentLesson.teacher.toLowerCase().includes(searchLower)) ||
          (r.lastLesson && clean(r.lastLesson.group).includes(cleanSearch)) ||
          r.schedule.some(
            (s) =>
              clean(s.group).includes(cleanSearch) ||
              clean(s.subject).includes(cleanSearch) ||
              s.teacher.toLowerCase().includes(searchLower)
          );

        const matchesBuilding = buildingFilter === 'all' || r.building === buildingFilter;
        return matchesStatus && matchesSearch && matchesBuilding;
      });
  }, [rooms, search, buildingFilter, onlyFree, cleanSearch, searchLower]);

  const isToday = selectedDate === getLocalDateString();
  const activeDayObj = days.find((d) => d.date === selectedDate);
  const dayTitle = formatDateRussian(selectedDate) + (activeDayObj?.dayOfWeek ? ` (${activeDayObj.dayOfWeek})` : '');

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
              placeholder="Поиск аудитории, предмета или группы (напр. 21)..."
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

            {days.length > 0 && (
              <DaySelector
                days={days}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                }}
                isDesktop={isDesktop}
              />
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--vkui--color_text_subhead)' }}>
                {isToday ? `Сегодня, ${dayTitle}` : dayTitle}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button
                  size="s"
                  mode={onlyFree ? 'primary' : 'secondary'}
                  onClick={() => {
                    triggerHaptic('light');
                    setOnlyFree((v) => !v);
                  }}
                >
                  {onlyFree ? '✓ Только свободные' : 'Только свободные'}
                </Button>
                <span
                  style={{
                    backgroundColor: 'rgba(75, 179, 75, 0.15)',
                    color: '#2b8830',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Свободно: {freeCount}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(230, 70, 70, 0.15)',
                    color: '#d03030',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Занято: {occupiedCount}
                </span>
              </div>
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
              <Button size="m" mode="primary" onClick={() => loadRooms(selectedDate)}>
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
                      <span
                        style={{
                          backgroundColor: isToday
                            ? isFree
                              ? '#4bb34b'
                              : '#e64646'
                            : 'var(--vkui--color_background_secondary)',
                          color: isToday ? '#fff' : 'var(--vkui--color_text_subhead)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {isToday ? (isFree ? 'Свободна' : 'Занята') : `${room.schedule.length} пар`}
                      </span>
                    }
                    subtitle={
                      <div style={{ marginTop: 2 }}>
                        <span
                          style={{
                            color: isMain ? '#2688EB' : '#E65D00',
                            fontWeight: 600,
                          }}
                        >
                          {isMain ? 'Красный 9' : 'Спартака 12'}
                        </span>
                        {' • '}
                        {isToday ? (
                          isFree ? (
                            <span style={{ color: 'var(--vkui--color_text_subhead)' }}>
                              {room.nextLesson
                                ? `до ${room.nextLesson.timeStart} (далее: ${formatSubjectTitle(room.nextLesson.subject)})`
                                : room.lastLesson || (new Date().getHours() * 60 + new Date().getMinutes() >= 18 * 60)
                                ? 'занятия окончены (до завтра)'
                                : 'свободна на весь день'}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--vkui--color_text_primary)', fontWeight: 500 }}>
                              {room.currentLesson
                                ? `${formatSubjectTitle(room.currentLesson.subject)} (${room.currentLesson.group}) • до ${room.currentLesson.timeEnd}`
                                : 'Идёт пара'}
                            </span>
                          )
                        ) : (
                          <span style={{ color: 'var(--vkui--color_text_subhead)' }}>
                            {room.schedule.length > 0
                              ? `1-я пара с ${room.schedule[0].timeStart}`
                              : 'В этот день пар нет'}
                          </span>
                        )}
                      </div>
                    }
                  >
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Кабинет {room.room}</span>
                  </SimpleCell>

                  {/* Who studied here earlier today - rendered as full-width banner with zero truncation and exact date */}
                  {isToday && isFree && room.lastLesson && (
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
                          🕒 В прошлый раз была пара ({formatDateWithDay(room.lastLesson.date, room.lastLesson.dayOfWeek)}):
                        </div>
                        <div style={{ color: 'var(--vkui--color_text_primary)', fontWeight: 600 }}>
                          Группа <b>{room.lastLesson.group}</b> • {room.lastLesson.timeStart}–{room.lastLesson.timeEnd}
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
                      Расписание на {dayTitle}:
                    </Footnote>
                    {room.schedule && room.schedule.length > 0 ? (
                      room.schedule.map((s, idx) => (
                        <Footnote key={idx} style={{ padding: '4px 0', borderBottom: '1px solid var(--vkui--color_separator_primary)' }}>
                          <b>{s.timeStart}-{s.timeEnd}</b> ({s.pairNumber} пара): {formatSubjectTitle(s.subject)} (Группа <b>{s.group}</b>) — {s.teacher}
                        </Footnote>
                      ))
                    ) : (
                      <Footnote>На этот день пар в этом кабинете нет</Footnote>
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

