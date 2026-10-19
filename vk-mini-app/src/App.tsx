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
import { AppTab } from './components/AppHeader';
import { useVkStorage } from './hooks/useVkStorage';
import { useIsDesktop } from './hooks/useIsDesktop';
import { fetchGroups } from './api/client';
import { GroupItem } from './types';
import { triggerHaptic } from './utils/storage';

export const App: React.FC = () => {
  const isDesktop = useIsDesktop(768);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    return new URLSearchParams(window.location.search).get('vk_appearance') === 'dark' ? 'dark' : 'light';
  });
  const [activeTab, setActiveTab] = useState<AppTab>('schedule');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const { selectedGroup, updateGroup, isLoaded, hasSavedGroup } = useVkStorage('Д-11');

  // First-launch onboarding: automatically prompt user to pick their group
  useEffect(() => {
    if (isLoaded && hasSavedGroup === false) {
      setIsGroupModalOpen(true);
    }
  }, [isLoaded, hasSavedGroup]);

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

  const handleToggleTheme = () => {
    setColorScheme((s) => (s === 'dark' ? 'light' : 'dark'));
  };

  const modal = (
    <ModalRoot activeModal={isGroupModalOpen ? 'group-modal' : null}>
      <GroupModal
        id="group-modal"
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={(g) => updateGroup(g)}
        isFirstLaunch={hasSavedGroup === false}
      />
    </ModalRoot>
  );

  return (
    <ConfigProvider colorScheme={colorScheme}>
      <AdaptivityProvider>
        <AppRoot>
          <SplitLayout modal={modal} style={{ justifyContent: 'center' }}>
            <SplitCol
              width="100%"
              maxWidth="880px"
              autoSpaced
              style={{ margin: '0 auto', minHeight: '100vh' }}
            >
              <View activePanel={activeTab}>
                <SchedulePanel
                  id="schedule"
                  selectedGroup={selectedGroup}
                  onOpenGroupModal={() => setIsGroupModalOpen(true)}
                  isDesktop={isDesktop}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  colorScheme={colorScheme}
                  onToggleTheme={handleToggleTheme}
                />
                <RoomsPanel
                  id="rooms"
                  isDesktop={isDesktop}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  selectedGroup={selectedGroup}
                  onOpenGroupModal={() => setIsGroupModalOpen(true)}
                  colorScheme={colorScheme}
                  onToggleTheme={handleToggleTheme}
                />
                <TeachersPanel
                  id="teachers"
                  isDesktop={isDesktop}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  selectedGroup={selectedGroup}
                  onOpenGroupModal={() => setIsGroupModalOpen(true)}
                  colorScheme={colorScheme}
                  onToggleTheme={handleToggleTheme}
                />
              </View>

              {!isDesktop && (
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
              )}
            </SplitCol>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};
