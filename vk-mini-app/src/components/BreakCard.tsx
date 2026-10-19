import React from 'react';
import { Div, Footnote } from '@vkontakte/vkui';

interface BreakCardProps {
  durationMinutes: number;
}

export const BreakCard: React.FC<BreakCardProps> = ({ durationMinutes }) => {
  return (
    <Div style={{ textAlign: 'center', padding: '6px 0', opacity: 0.6 }}>
      <Footnote>— Перемена {durationMinutes} мин —</Footnote>
    </Div>
  );
};
