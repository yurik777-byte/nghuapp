import React from 'react';
import { Card, Headline, Subhead, Footnote } from '@vkontakte/vkui';
import { Lesson } from '../types';
import { formatSubjectTitle } from '../utils/formatters';

export { formatSubjectTitle };

interface LessonCardProps {
  lesson: Lesson;
  isCurrent?: boolean;
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
