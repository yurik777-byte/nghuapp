import React from 'react';
import { Div, Footnote } from '@vkontakte/vkui';

interface BreakCardProps {
  durationMinutes: number;
}

export const BreakCard: React.FC<BreakCardProps> = ({ durationMinutes }) => (
  <Div style={{ textAlign: 'center', padding: '4px 0', opacity: 0.7 }}>
    <Footnote>— Перемена {durationMinutes} мин —</Footnote>
  </Div>
);
