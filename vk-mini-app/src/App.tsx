import React, { useState, useEffect } from 'react';
import {
  ConfigProvider,
  AdaptivityProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
  Tabbar,
  TabbarItem,
  ModalRoot,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import vkBridge from '@vkontakte/vk-bridge';
import { Icon28CalendarOutline, Icon28DoorArrowRightOutline, Icon28Users3Outline } from '@vkontakte/icons';
import { SchedulePanel } from './panels/SchedulePanel';
import { RoomsPanel } from './panels/RoomsPanel';
import { TeachersPanel } from './panels/TeachersPanel';
import { GroupModal } from './components/GroupModal';
import { useVkStorage } from './hooks/useVkStorage';
import { fetchGroups } from './api/client';
import { GroupItem } from './types';
import { triggerHaptic } from './utils/storage';

export const App: React.FC = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    return new URLSearchParams(window.location.search).get('vk_appearance') === 'dark' ? 'dark' : 'light';
  });
  const [activeTab, setActiveTab] = useState<'schedule' | 'rooms' | 'teachers'>('schedule');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const { selectedGroup, updateGroup } = useVkStorage('Д-11');

  useEffect(() => {
    fetchGroups().then(setGroups).catch(console.error);

    const listener = (e: any) => {
      if (e.detail?.type === 'VKWebAppUpdateConfig') {
        const scheme = e.detail?.data?.appearance === 'dark' ? 'dark' : 'light';
        setColorScheme(scheme);
      }
    };
    vkBridge.subscribe(listener);
    return () => {
      vkBridge.unsubscribe(listener);
    };
  }, []);

  const modal = (
    <ModalRoot activeModal={isGroupModalOpen ? 'group-modal' : null}>
      <GroupModal
        id="group-modal"
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={(g) => updateGroup(g)}
      />
    </ModalRoot>
  );

  return (
    <ConfigProvider colorScheme={colorScheme}>
      <AdaptivityProvider>
        <AppRoot>
          <SplitLayout modal={modal}>
            <SplitCol autoSpaced>
              <View activePanel={activeTab}>
                <SchedulePanel
                  id="schedule"
                  selectedGroup={selectedGroup}
                  onOpenGroupModal={() => setIsGroupModalOpen(true)}
                />
                <RoomsPanel id="rooms" />
                <TeachersPanel id="teachers" />
              </View>

              <Tabbar>
                <TabbarItem
                  selected={activeTab === 'schedule'}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('schedule');
                  }}
                  label="Расписание"
                >
                  <Icon28CalendarOutline />
                </TabbarItem>
                <TabbarItem
                  selected={activeTab === 'rooms'}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('rooms');
                  }}
                  label="Аудитории"
                >
                  <Icon28DoorArrowRightOutline />
                </TabbarItem>
                <TabbarItem
                  selected={activeTab === 'teachers'}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('teachers');
                  }}
                  label="Педагоги"
                >
                  <Icon28Users3Outline />
                </TabbarItem>
              </Tabbar>
            </SplitCol>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};
