import React from 'react';
import {
  PanelHeader,
  Tabs,
  TabsItem,
  Button,
  IconButton,
} from '@vkontakte/vkui';
import {
  Icon28CalendarOutline,
  Icon28DoorArrowRightOutline,
  Icon28Users3Outline,
  Icon20SunOutline,
  Icon20MoonOutline,
  Icon16Dropdown,
} from '@vkontakte/icons';
import { triggerHaptic } from '../utils/storage';

export type AppTab = 'schedule' | 'rooms' | 'teachers';

interface AppHeaderProps {
  isDesktop: boolean;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  selectedGroup: string;
  onOpenGroupModal: () => void;
  colorScheme: 'light' | 'dark';
  onToggleTheme: () => void;
  title: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isDesktop,
  activeTab,
  onSelectTab,
  selectedGroup,
  onOpenGroupModal,
  colorScheme,
  onToggleTheme,
  title,
}) => {
  if (isDesktop) {
    return (
      <PanelHeader
        before={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12 }}>
            <div
              style={{
                backgroundColor: 'var(--vkui--color_accent_blue)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 14,
                padding: '4px 10px',
                borderRadius: 8,
                letterSpacing: '0.5px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              }}
            >
              НГХУ
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--vkui--color_text_primary)' }}>
              {title || 'Расписание'}
            </span>
          </div>
        }
        after={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 8 }}>
            <Button
              mode="secondary"
              size="m"
              after={<Icon16Dropdown />}
              onClick={() => {
                triggerHaptic('light');
                onOpenGroupModal();
              }}
            >
              {selectedGroup ? `Группа ${selectedGroup}` : 'Выбрать группу'}
            </Button>
            <IconButton
              aria-label="Сменить тему"
              onClick={() => {
                triggerHaptic('light');
                onToggleTheme();
              }}
            >
              {colorScheme === 'dark' ? <Icon20SunOutline /> : <Icon20MoonOutline />}
            </IconButton>
          </div>
        }
      >
        <Tabs mode="accent" style={{ maxWidth: 440, margin: '0 auto' }}>
          <TabsItem
            selected={activeTab === 'schedule'}
            onClick={() => {
              triggerHaptic('light');
              onSelectTab('schedule');
            }}
            before={<Icon28CalendarOutline width={18} height={18} />}
          >
            Расписание
          </TabsItem>
          <TabsItem
            selected={activeTab === 'rooms'}
            onClick={() => {
              triggerHaptic('light');
              onSelectTab('rooms');
            }}
            before={<Icon28DoorArrowRightOutline width={18} height={18} />}
          >
            Аудитории
          </TabsItem>
          <TabsItem
            selected={activeTab === 'teachers'}
            onClick={() => {
              triggerHaptic('light');
              onSelectTab('teachers');
            }}
            before={<Icon28Users3Outline width={18} height={18} />}
          >
            Педагоги
          </TabsItem>
        </Tabs>
      </PanelHeader>
    );
  }

  // Mobile layout
  return (
    <PanelHeader
      before={
        <Button
          mode="tertiary"
          size="m"
          after={<Icon16Dropdown />}
          onClick={() => {
            triggerHaptic('light');
            onOpenGroupModal();
          }}
        >
          {selectedGroup || 'Группа'}
        </Button>
      }
      after={
        <IconButton
          aria-label="Сменить тему"
          onClick={() => {
            triggerHaptic('light');
            onToggleTheme();
          }}
        >
          {colorScheme === 'dark' ? <Icon20SunOutline /> : <Icon20MoonOutline />}
        </IconButton>
      }
    >
      {title}
    </PanelHeader>
  );
};
