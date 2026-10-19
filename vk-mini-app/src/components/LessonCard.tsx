import React from 'react';
import { Card, Headline, Subhead, Footnote } from '@vkontakte/vkui';
import { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  isCurrent?: boolean;
}

export function formatSubjectTitle(subject: string): string {
  if (!subject) return 'Занятие';
  const clean = subject.trim();
  const lower = clean.toLowerCase();

  const MAP: Record<string, string> = {
    'пластическая анат': 'Пластическая анатомия',
    'пластическая анат.': 'Пластическая анатомия',
    'ин.язык': 'Иностранный язык',
    'ин. язык': 'Иностранный язык',
    'естествознаяние': 'Естествознание',
    'история тетра': 'История театра',
    'худ.оформление спект': 'Художественное оформление спектакля',
    'худ.оформление спектакля': 'Художественное оформление спектакля',
    'имк': 'ИМК',
    'сидп (вирт.мат.)': 'СИДП (Вирт. мат.)',
    'физкультура динамо': 'Физкультура',
    'поптд': 'ПОПТД (Правовые основы)',
    'опг': 'ОПГ (Основы произв. графики)',
    'анализ произв. изо': 'Анализ произведений ИЗО',
  };

  return MAP[lower] || clean;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, isCurrent }) => {
  const isSpartaka = lesson.building === 'spartaka';
  const isDinamo = /динамо/i.test(lesson.room) || /динамо/i.test(lesson.subject);
  const subjectDisplay = formatSubjectTitle(lesson.subject);

  // Campus badge: only show for physical academic buildings (Spartaka 12 or Krasny 9)
  const campusLabel = isDinamo ? null : isSpartaka ? 'Спартака 12' : 'Красный 9';

  const renderRoom = () => {
    const rawRoom = (lesson.room || '').trim();
    if (!rawRoom || rawRoom === 'unknown' || rawRoom === '-') {
      return null;
    }
    const label = /динамо/i.test(rawRoom) ? 'Динамо' : `каб. ${rawRoom}`;
    return (
      <Footnote style={{ color: 'var(--vkui--color_text_secondary)', fontWeight: 600 }}>
        {label}
      </Footnote>
    );
  };

  return (
    <Card
      mode={isCurrent ? 'outline' : 'shadow'}
      style={{
        margin: '8px 12px',
        padding: 12,
        borderLeft: isCurrent ? '4px solid var(--vkui--color_accent_blue)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Footnote style={{ color: 'var(--vkui--color_text_subhead)' }}>
            {lesson.pairNumber} пара • {lesson.timeStart} – {lesson.timeEnd}
          </Footnote>
          <Headline level="2" weight="2" style={{ marginTop: 4 }}>
            {subjectDisplay}
          </Headline>
        </div>
        {campusLabel && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: isSpartaka ? 'rgba(230, 93, 0, 0.12)' : 'rgba(38, 136, 235, 0.12)',
              color: isSpartaka ? '#E65D00' : 'var(--vkui--color_accent_blue)',
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              lineHeight: '16px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {campusLabel}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <Subhead style={{ color: 'var(--vkui--color_text_secondary)' }}>
          {lesson.teacher || 'Преподаватель не указан'}
        </Subhead>
        {renderRoom()}
      </div>
    </Card>
  );
};
