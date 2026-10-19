import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Panel, PullToRefresh, Group, Spinner, Placeholder, Button, Banner } from '@vkontakte/vkui';
import { Icon28CalendarOutline, Icon28WarningTriangleOutline, Icon28Users3Outline } from '@vkontakte/icons';
import { ScheduleResponse, Lesson } from '../types';
import { fetchSchedule } from '../api/client';
import { cacheSchedule, getCachedSchedule } from '../utils/storage';
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

            {isTodaySelected && schedule && <LiveWidget status={liveStatus} />}

            <Group>
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
          </>
        )}
      </PullToRefresh>
    </Panel>
  );
};
