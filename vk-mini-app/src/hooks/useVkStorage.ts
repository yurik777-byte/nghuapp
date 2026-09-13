import { useState, useEffect } from 'react';
import { loadSelectedGroup, saveSelectedGroup } from '../utils/storage';

export function useVkStorage(defaultGroup: string = 'Д-11') {
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSelectedGroup().then((group) => {
      if (group) setSelectedGroup(group);
      setIsLoaded(true);
    });
  }, []);

  const updateGroup = async (group: string) => {
    setSelectedGroup(group);
    await saveSelectedGroup(group);
  };

  return { selectedGroup, updateGroup, isLoaded };
}
