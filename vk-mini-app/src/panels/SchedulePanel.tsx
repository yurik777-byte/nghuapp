import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Panel, PullToRefresh, Group, Spinner, Placeholder, Button, Banner } from '@vkontakte/vkui';
import { Icon28CalendarOutline, Icon28WarningTriangleOutline, Icon28Users3Outline } from '@vkontakte/icons';
import { ScheduleResponse, Lesson } from '../types';
import { fetchSchedule } from '../api/client';
import { cacheSchedule, getCachedSchedule, triggerHaptic } from '../utils/storage';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { getLocalDateString } from '../utils/timeUtils';
import { DaySelector } from '../components/DaySelector';
import { LiveWidget } from '../components/LiveWidget';
import { LessonCard } from '../components/LessonCard';
import { BreakCard } from '../components/BreakCard';
import { AppHeader, AppTab } from '../components/AppHeader';

interface SchedulePanelProps {
  id: string;
  selectedGroup: string;
  onOpenGroupModal: () => void;
  isDesktop?: boolean;
  activeTab?: AppTab;
  onSelectTab?: (tab: AppTab) => void;
  colorScheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const SchedulePanel: React.FC<SchedulePanelProps> = ({
  id,
  selectedGroup,
  onOpenGroupModal,
  isDesktop = false,
  activeTab = 'schedule',
  onSelectTab = () => {},
  colorScheme = 'light',
  onToggleTheme = () => {},
}) => {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  const loadData = useCallback(async () => {
    if (!selectedGroup) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setHasError(false);
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
      } else {
        setSchedule(null);
        setHasError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, selectedDate]);

  useEffect(() => {
    loadData();
  }, [selectedGroup]);

  const isTodaySelected = selectedDate === getLocalDateString();
  const activeDay = schedule?.days.find((d) => d.date === selectedDate);
  const currentLessons: Lesson[] = useMemo(() => activeDay?.lessons || [], [activeDay]);
  const liveStatus = useLiveStatus(currentLessons);

  // Navigate to next calendar day
  const goToNextDay = useCallback(() => {
    if (!schedule || !schedule.days || schedule.days.length === 0) return;
    const currentIndex = schedule.days.findIndex((d) => d.date === selectedDate);
    if (currentIndex >= 0 && currentIndex < schedule.days.length - 1) {
      triggerHaptic('light');
      setSelectedDate(schedule.days[currentIndex + 1].date);
    }
  }, [schedule, selectedDate]);

  // Navigate to previous calendar day
  const goToPrevDay = useCallback(() => {
    if (!schedule || !schedule.days || schedule.days.length === 0) return;
    const currentIndex = schedule.days.findIndex((d) => d.date === selectedDate);
    if (currentIndex > 0) {
      triggerHaptic('light');
      setSelectedDate(schedule.days[currentIndex - 1].date);
    }
  }, [schedule, selectedDate]);

  // Keyboard navigation on desktop (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        goToNextDay();
      } else if (e.key === 'ArrowLeft') {
        goToPrevDay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextDay, goToPrevDay]);

  // Touch gesture handling for horizontal day swipe on mobile
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    // If vertical scroll is established, release swipe detection so vertical scroll runs natively
    if (Math.abs(deltaY) > 25 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - start.x;
    const deltaY = endY - start.y;
    const elapsed = Date.now() - start.time;

    // Gesture criteria: deliberate flick (<550ms), distance >= 45px, horizontal dominant (>= 1.3x)
    if (elapsed < 550 && Math.abs(deltaX) >= 45 && Math.abs(deltaX) >= Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        goToNextDay();
      } else {
        goToPrevDay();
      }
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

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
        title="Расписание"
      />

      <PullToRefresh onRefresh={loadData} isFetching={loading}>
        {isOffline && (
          <Banner
            mode="tint"
            title="Офлайн-режим"
            subtitle="Отображаются сохранённые данные. Проверьте соединение с сетью."
          />
        )}

        {!selectedGroup ? (
          <Group>
            <Placeholder
              icon={<Icon28Users3Outline width={56} height={56} />}
              title="Группа не выбрана"
              action={
                <Button size="m" mode="primary" onClick={onOpenGroupModal}>
                  Выбрать учебную группу
                </Button>
              }
            >
              Выберите вашу группу для загрузки актуального расписания занятий.
            </Placeholder>
          </Group>
        ) : (
          <>
            {schedule && schedule.days.length > 0 && (
              <DaySelector
                days={schedule.days.map((d) => ({ date: d.date, dayOfWeek: d.dayOfWeek }))}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                isDesktop={isDesktop}
              />
            )}

            {/* Swipeable feed container for day navigation and safe-area scroll clearance */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              style={{
                touchAction: 'pan-y',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {isTodaySelected && schedule && <LiveWidget status={liveStatus} />}

              <Group style={{ paddingBottom: isDesktop ? 16 : 0 }}>
                {loading && !schedule ? (
                  <Spinner size="m" style={{ margin: '40px 0' }} />
                ) : hasError && !schedule ? (
                  <Placeholder
                    icon={<Icon28WarningTriangleOutline width={48} height={48} />}
                    title="Не удалось загрузить расписание"
                    action={
                      <Button size="m" mode="primary" onClick={loadData}>
                        Повторить попытку
                      </Button>
                    }
                  >
                    Проверьте соединение с интернетом и попробуйте снова.
                  </Placeholder>
                ) : currentLessons.length > 0 ? (
                  currentLessons.map((lesson, idx) => {
                    const isCurrent =
                      isTodaySelected &&
                      liveStatus.type === 'lesson' &&
                      liveStatus.currentLesson?.pairNumber === lesson.pairNumber;
                    const next = currentLessons[idx + 1];
                    let breakMins = 0;
                    if (next) {
                      const [curH, curM] = lesson.timeEnd.split(':').map(Number);
                      const [nextH, nextM] = next.timeStart.split(':').map(Number);
                      breakMins = (nextH * 60 + nextM) - (curH * 60 + curM);
                    }

                    return (
                      <React.Fragment key={`${lesson.pairNumber}-${lesson.subject}-${idx}`}>
                        <LessonCard lesson={lesson} isCurrent={isCurrent} />
                        {breakMins > 0 && <BreakCard durationMinutes={breakMins} />}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <Placeholder icon={<Icon28CalendarOutline width={48} height={48} />} title="В этот день пар нет">
                    Занятия отсутствуют или расписание ещё не опубликовано.
                  </Placeholder>
                )}
              </Group>

              {/* Bottom spacer ensuring the last pair card (e.g. 4th/5th pair or PE) is completely clear of mobile Tabbar */}
              <div
                style={{
                  height: isDesktop ? 20 : 'calc(88px + var(--vkui--safe_area_inset_bottom, 0px))',
                  minHeight: isDesktop ? 20 : 88,
                }}
                aria-hidden="true"
              />
            </div>
          </>
        )}
      </PullToRefresh>
    </Panel>
  );
};
