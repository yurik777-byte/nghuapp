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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Headline level="2" weight="2">Перемена</Headline>
            <Footnote style={{ color: 'var(--vkui--color_accent_blue)', fontWeight: 600 }}>
              До звонка {formatMinutesWord(status.remainingMinutes || 0)}
            </Footnote>
          </div>
          {status.nextLesson && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 10px',
                backgroundColor: 'var(--vkui--color_background_content)',
                borderRadius: 8,
                border: '1px solid var(--vkui--color_separator_primary)',
              }}
            >
              <Footnote style={{ color: 'var(--vkui--color_text_subhead)', fontWeight: 600 }}>
                СЛЕДУЮЩАЯ ПАРА ({status.nextLesson.pairNumber} пара • {status.nextLesson.timeStart})
              </Footnote>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>
                {status.nextLesson.subject}
              </div>
              <Footnote style={{ color: 'var(--vkui--color_text_secondary)', marginTop: 2 }}>
                {status.nextLesson.room ? `каб. ${status.nextLesson.room}` : ''}
                {status.nextLesson.room ? ' • ' : ''}
                {status.nextLesson.buildingAddress || (status.nextLesson.building === 'spartaka' ? 'ул. Спартака, 12' : 'Красный пр-т, 9')}
              </Footnote>
            </div>
          )}
        </Card>
      )}

      {status.type === 'before_classes' && (
        <Card mode="shadow" style={{ padding: 12, background: 'var(--vkui--color_background_secondary)' }}>
          <Headline level="2" weight="2">Скоро начало занятий</Headline>
          <Footnote style={{ marginTop: 4 }}>
            {status.nextLesson ? `${status.nextLesson.pairNumber} пара начнётся через ` : 'Занятия начнутся через '}
            {formatMinutesWord(status.remainingMinutes || 0)}
          </Footnote>
          {status.nextLesson && (
            <Footnote style={{ color: 'var(--vkui--color_text_secondary)', marginTop: 4 }}>
              Первая пара: {status.nextLesson.subject} ({status.nextLesson.room ? `каб. ${status.nextLesson.room}, ` : ''}{status.nextLesson.buildingAddress})
            </Footnote>
          )}
        </Card>
      )}
    </Div>
  );
};
