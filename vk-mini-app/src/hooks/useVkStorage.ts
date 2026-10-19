import { useState, useEffect } from 'react';
import { loadSelectedGroup, saveSelectedGroup } from '../utils/storage';

export function useVkStorage(defaultGroup: string = 'Д-11') {
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSavedGroup, setHasSavedGroup] = useState<boolean | null>(null);

  useEffect(() => {
    loadSelectedGroup().then((group) => {
      if (group && group.trim().length > 0) {
        setSelectedGroup(group.trim());
        setHasSavedGroup(true);
      } else {
        setHasSavedGroup(false);
      }
      setIsLoaded(true);
    });
  }, []);

  const updateGroup = async (group: string) => {
    const trimmed = group.trim();
    setSelectedGroup(trimmed);
    setHasSavedGroup(true);
    await saveSelectedGroup(trimmed);
  };

  return { selectedGroup, updateGroup, isLoaded, hasSavedGroup };
}
