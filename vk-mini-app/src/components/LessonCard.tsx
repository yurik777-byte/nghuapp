import React from 'react';
import { Card, Headline, Subhead, Footnote, Badge } from '@vkontakte/vkui';
import { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  isCurrent?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, isCurrent }) => {
  const isMain = lesson.building === 'main';

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
            {lesson.subject}
          </Headline>
        </div>
        <Badge
          mode="prominent"
          style={{
            backgroundColor: isMain ? '#3F8AE0' : '#E65D00',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          {isMain ? 'Красный 9' : 'Спартака 12'}
        </Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <Subhead style={{ color: 'var(--vkui--color_text_secondary)' }}>
          {lesson.teacher || 'Преподаватель не указан'}
        </Subhead>
        <Subhead weight="2">каб. {lesson.room}</Subhead>
      </div>
    </Card>
  );
};
