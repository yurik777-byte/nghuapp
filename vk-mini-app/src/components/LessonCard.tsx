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
  const isDynamo = lesson.building === 'dynamo' || /динамо/i.test(lesson.room) || /динамо/i.test(lesson.subject);
  const isSpartaka = !isDynamo && lesson.building === 'spartaka';

  const subjectDisplay = formatSubjectTitle(lesson.subject);

  const campusConfig = isDynamo
    ? {
        label: 'ст. Динамо',
        color: '#0099b8',
        bg: 'rgba(0, 153, 184, 0.12)',
        border: 'rgba(0, 153, 184, 0.35)',
      }
    : isSpartaka
    ? {
        label: 'Спартака 12',
        color: '#E65D00',
        bg: 'rgba(230, 93, 0, 0.12)',
        border: 'rgba(230, 93, 0, 0.35)',
      }
    : {
        label: 'Красный 9',
        color: '#2688EB',
        bg: 'rgba(63, 138, 224, 0.12)',
        border: 'rgba(63, 138, 224, 0.35)',
      };

  const renderRoomBadge = () => {
    const rawRoom = (lesson.room || '').trim();
    if (!rawRoom || rawRoom === 'unknown' || rawRoom === '-' || /динамо/i.test(rawRoom)) {
      return null;
    }

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--vkui--color_background_secondary)',
          border: '1px solid var(--vkui--color_separator_primary)',
          padding: '2px 8px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--vkui--color_text_primary)',
        }}
      >
        каб. {rawRoom}
      </div>
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
            backgroundColor: campusConfig.bg,
            color: campusConfig.color,
            border: `1px solid ${campusConfig.border}`,
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
              backgroundColor: campusConfig.color,
              display: 'inline-block',
            }}
          />
          {campusConfig.label}
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
