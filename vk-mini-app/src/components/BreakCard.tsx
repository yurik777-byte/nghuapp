import React from 'react';
import { Div, Footnote } from '@vkontakte/vkui';
import { Icon20WarningTriangleOutline, Icon20InfoCircleOutline } from '@vkontakte/icons';

interface BreakCardProps {
  durationMinutes: number;
  transfer?: {
    fromAddress: string;
    toAddress: string;
  } | null;
}

export const BreakCard: React.FC<BreakCardProps> = ({ durationMinutes, transfer }) => {
  if (transfer) {
    const isUrgent = durationMinutes <= 15;
    return (
      <div
        style={{
          margin: '6px 12px',
          padding: '8px 12px',
          backgroundColor: isUrgent ? 'rgba(230, 93, 0, 0.12)' : 'rgba(38, 136, 235, 0.08)',
          border: `1px solid ${isUrgent ? 'rgba(230, 93, 0, 0.4)' : 'rgba(38, 136, 235, 0.25)'}`,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {isUrgent ? (
          <Icon20WarningTriangleOutline fill="#E65D00" style={{ flexShrink: 0 }} />
        ) : (
          <Icon20InfoCircleOutline fill="#2688EB" style={{ flexShrink: 0 }} />
        )}
        <div style={{ fontSize: 13, lineHeight: '18px', color: 'var(--vkui--color_text_primary)' }}>
          <span style={{ fontWeight: 700, color: isUrgent ? '#E65D00' : 'var(--vkui--color_accent_blue)' }}>
            {isUrgent ? 'Срочный переход между корпусами!' : 'Переход между корпусами:'}
          </span>{' '}
          {transfer.fromAddress} → {transfer.toAddress}
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
            Перемена: {durationMinutes} мин {isUrgent ? '(рассчитывайте время на дорогу)' : ''}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Div style={{ textAlign: 'center', padding: '4px 0', opacity: 0.7 }}>
      <Footnote>— Перемена {durationMinutes} мин —</Footnote>
    </Div>
  );
};
