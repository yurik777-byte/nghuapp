import React, { useState } from 'react';
import { ModalPage, ModalPageHeader, Search, HorizontalScroll, Tabs, TabsItem, Group, SimpleCell } from '@vkontakte/vkui';
import { GroupItem } from '../types';
import { triggerHaptic } from '../utils/storage';

interface GroupModalProps {
  id: string;
  isOpen?: boolean;
  onClose: () => void;
  groups: GroupItem[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  id,
  onClose,
  groups,
  selectedGroup,
  onSelectGroup,
}) => {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<number>(0);

  const filtered = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 0 || g.course === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <ModalPage id={id} onClose={onClose} header={<ModalPageHeader>Выбор группы</ModalPageHeader>}>
      <Group>
        <Search value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск группы..." />
        <HorizontalScroll>
          <Tabs>
            <TabsItem selected={courseFilter === 0} onClick={() => setCourseFilter(0)}>Все курсы</TabsItem>
            <TabsItem selected={courseFilter === 1} onClick={() => setCourseFilter(1)}>1 курс</TabsItem>
            <TabsItem selected={courseFilter === 2} onClick={() => setCourseFilter(2)}>2 курс</TabsItem>
            <TabsItem selected={courseFilter === 3} onClick={() => setCourseFilter(3)}>3 курс</TabsItem>
            <TabsItem selected={courseFilter === 4} onClick={() => setCourseFilter(4)}>4 курс</TabsItem>
          </Tabs>
        </HorizontalScroll>

        {filtered.map((g) => (
          <SimpleCell
            key={g.id || g.name}
            onClick={() => {
              triggerHaptic('medium');
              onSelectGroup(g.name);
              onClose();
            }}
            indicator={selectedGroup === g.name ? 'Выбрано' : undefined}
            subtitle={`${g.course} курс • ${g.departmentName}`}
          >
            {g.name}
          </SimpleCell>
        ))}
      </Group>
    </ModalPage>
  );
};
