import React, { useState } from 'react';
import {
  ModalPage,
  ModalPageHeader,
  Search,
  HorizontalScroll,
  Tabs,
  TabsItem,
  Group,
  SimpleCell,
  Banner,
} from '@vkontakte/vkui';
import { GroupItem } from '../types';
import { triggerHaptic } from '../utils/storage';

interface GroupModalProps {
  id: string;
  isOpen?: boolean;
  onClose: () => void;
  groups: GroupItem[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
  isFirstLaunch?: boolean;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  id,
  onClose,
  groups,
  selectedGroup,
  onSelectGroup,
  isFirstLaunch,
}) => {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<number>(0);

  const filtered = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 0 || g.course === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <ModalPage
      id={id}
      onClose={onClose}
      header={<ModalPageHeader>Выбор учебной группы</ModalPageHeader>}
    >
      <Group>
        {isFirstLaunch && (
          <Banner
            mode="tint"
            style={{ margin: '8px 12px 14px' }}
            before={<span style={{ fontSize: 28, lineHeight: 1 }}>👋</span>}
            title="Добро пожаловать в НГХУ!"
            subtitle="Выберите вашу группу. Приложение сохранит выбор и при каждом входе будет сразу открывать ваше расписание."
          />
        )}

        <Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск группы (например: Д-11, ГД-21)..."
        />

        <HorizontalScroll>
          <Tabs>
            <TabsItem selected={courseFilter === 0} onClick={() => setCourseFilter(0)}>
              Все курсы
            </TabsItem>
            <TabsItem selected={courseFilter === 1} onClick={() => setCourseFilter(1)}>
              1 курс
            </TabsItem>
            <TabsItem selected={courseFilter === 2} onClick={() => setCourseFilter(2)}>
              2 курс
            </TabsItem>
            <TabsItem selected={courseFilter === 3} onClick={() => setCourseFilter(3)}>
              3 курс
            </TabsItem>
            <TabsItem selected={courseFilter === 4} onClick={() => setCourseFilter(4)}>
              4 курс
            </TabsItem>
          </Tabs>
        </HorizontalScroll>

        <div style={{ marginTop: 8 }}>
          {filtered.map((g) => {
            const isSelected = selectedGroup === g.name;
            return (
              <SimpleCell
                key={g.id || g.name}
                onClick={() => {
                  triggerHaptic('medium');
                  onSelectGroup(g.name);
                  onClose();
                }}
                indicator={isSelected ? 'Выбрана' : undefined}
                subtitle={`${g.course} курс • ${g.departmentName}`}
                style={{
                  backgroundColor: isSelected ? 'var(--vkui--color_background_secondary)' : undefined,
                  borderRadius: 8,
                }}
              >
                <span style={{ fontWeight: isSelected ? 700 : 500 }}>{g.name}</span>
              </SimpleCell>
            );
          })}
        </div>
      </Group>
    </ModalPage>
  );
};
