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

  const getFormattedDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const day = parseInt(parts[2], 10);
    const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${day} ${MONTHS[monthIdx] || ''}`.trim();
  };

  return (
    <HorizontalScroll showArrows={isDesktop}>
      <Tabs mode="accent">
        {days.map((d) => {
          const isSelected = d.date === selectedDate;
          const isToday = d.date === todayStr;
          const formattedDate = getFormattedDate(d.date);

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
              {isDesktop ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px' }}>
                  <span style={{ fontWeight: 600 }}>{d.dayOfWeek}</span>
                  {formattedDate && <span style={{ fontSize: 12, opacity: 0.75 }}>({formattedDate})</span>}
                </div>
              ) : (
                <div style={{ textAlign: 'center', minWidth: 42, padding: '2px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, lineHeight: '16px' }}>
                    {getShortDayName(d.dayOfWeek)}
                  </div>
                  {formattedDate && (
                    <div style={{ fontSize: 11, opacity: 0.8, lineHeight: '14px', marginTop: 1 }}>
                      {formattedDate}
                    </div>
                  )}
                </div>
              )}
            </TabsItem>
          );
        })}
      </Tabs>
    </HorizontalScroll>
  );
};
