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
  };

  return MAP[lower] || clean;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, isCurrent }) => {
  const isMain = lesson.building === 'main';
  const subjectDisplay = formatSubjectTitle(lesson.subject);

  const renderRoomBadge = () => {
    const rawRoom = (lesson.room || '').trim();
    if (!rawRoom || rawRoom === 'unknown' || rawRoom === '-') {
      return null;
    }

    if (/динамо/i.test(rawRoom) || /динамо/i.test(lesson.subject)) {
      return (
        <Subhead weight="2" style={{ color: 'var(--vkui--color_accent_blue)', fontWeight: 600 }}>
          ст. Динамо
        </Subhead>
      );
    }

    return <Subhead weight="2">каб. {rawRoom}</Subhead>;
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
          <Footnote style={{ color: 'var(--vkui--color_text_subhead)', fontWeight: 600 }}>
            {lesson.pairNumber} пара • {lesson.timeStart} - {lesson.timeEnd}
          </Footnote>
          <Headline level="2" weight="2" style={{ marginTop: 4 }}>
            {subjectDisplay}
          </Headline>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: isMain ? 'rgba(63, 138, 224, 0.12)' : 'rgba(230, 93, 0, 0.12)',
            color: isMain ? '#2688EB' : '#E65D00',
            border: `1px solid ${isMain ? 'rgba(63, 138, 224, 0.35)' : 'rgba(230, 93, 0, 0.35)'}`,
            padding: '3px 8px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            lineHeight: '16px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isMain ? '#2688EB' : '#E65D00',
              display: 'inline-block',
            }}
          />
          {isMain ? 'Красный 9' : 'Спартака 12'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <Subhead style={{ color: 'var(--vkui--color_text_secondary)' }}>
          {lesson.teacher || 'Преподаватель не указан'}
        </Subhead>
        {renderRoomBadge()}
      </div>
    </Card>
  );
};
