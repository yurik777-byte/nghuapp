import React from 'react';
import { HorizontalScroll, Tabs, TabsItem, Badge } from '@vkontakte/vkui';
import { triggerHaptic } from '../utils/storage';
import { getLocalDateString } from '../utils/timeUtils';

interface DaySelectorProps {
  days: { date: string; dayOfWeek: string }[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  isDesktop?: boolean;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  selectedDate,
  onSelectDate,
  isDesktop = false,
}) => {
  const todayStr = getLocalDateString();

  const getShortDayName = (dayName: string) => {
    const map: Record<string, string> = {
      'Понедельник': 'ПН',
      'Вторник': 'ВТ',
      'Среда': 'СР',
      'Четверг': 'ЧТ',
      'Пятница': 'ПТ',
      'Суббота': 'СБ',
      'Воскресенье': 'ВС',
    };
    return map[dayName] || dayName.slice(0, 2).toUpperCase();
  };

  return (
    <HorizontalScroll showArrows={false}>
      <Tabs mode="accent">
        {days.map((d) => {
          const isSelected = d.date === selectedDate;
          const isToday = d.date === todayStr;
          return (
            <TabsItem
              key={d.date}
              selected={isSelected}
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(d.date);
              }}
              status={isToday ? <Badge mode="prominent">Сегодня</Badge> : undefined}
            >
              {isDesktop ? d.dayOfWeek : getShortDayName(d.dayOfWeek)}
            </TabsItem>
          );
        })}
      </Tabs>
    </HorizontalScroll>
  );
};
