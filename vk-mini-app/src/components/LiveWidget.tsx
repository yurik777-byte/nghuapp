import React from 'react';
import { Card, Div, Headline, Footnote, Progress, Banner } from '@vkontakte/vkui';
import { Icon28WarningTriangleOutline, Icon24ClockOutline } from '@vkontakte/icons';
import { LiveState, formatMinutesWord } from '../utils/timeUtils';

interface LiveWidgetProps {
  status: LiveState;
}

export const LiveWidget: React.FC<LiveWidgetProps> = ({ status }) => {
  if (status.type === 'no_lessons' || status.type === 'finished') {
    return null;
  }

  return (
    <Div style={{ paddingBottom: 4 }}>
      {status.hasBuildingTransfer && (
        <Banner
          style={{ marginBottom: 8 }}
          before={<Icon28WarningTriangleOutline fill="var(--vkui--color_accent_red)" />}
          title="Переход между корпусами!"
          subtitle={`${status.transferFrom} → ${status.transferTo}`}
          mode="tint"
        />
      )}

      {status.type === 'lesson' && status.currentLesson && (
        <Card mode="shadow" style={{ padding: 12, background: 'var(--vkui--color_background_secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Headline level="2" weight="2">
              Идёт {status.currentLesson.pairNumber} пара: {status.currentLesson.subject}
            </Headline>
            <Footnote style={{ color: 'var(--vkui--color_text_subhead)' }}>
              каб. {status.currentLesson.room}
            </Footnote>
          </div>
          <Footnote style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon24ClockOutline width={16} height={16} />
            До конца пары {formatMinutesWord(status.remainingMinutes || 0)}
          </Footnote>
          <Progress style={{ marginTop: 8 }} value={status.progress || 0} />
        </Card>
      )}

      {status.type === 'break' && (
        <Card mode="shadow" style={{ padding: 12, background: 'var(--vkui--color_background_secondary)' }}>
          <Headline level="2" weight="2">Перемена</Headline>
          <Footnote style={{ marginTop: 4 }}>
            До начала следующей пары осталось {formatMinutesWord(status.remainingMinutes || 0)}
          </Footnote>
        </Card>
      )}

      {status.type === 'before_classes' && (
        <Card mode="shadow" style={{ padding: 12, background: 'var(--vkui--color_background_secondary)' }}>
          <Headline level="2" weight="2">Скоро начало занятий</Headline>
          <Footnote style={{ marginTop: 4 }}>
            1 пара начнётся через {formatMinutesWord(status.remainingMinutes || 0)}
          </Footnote>
        </Card>
      )}
    </Div>
  );
};
