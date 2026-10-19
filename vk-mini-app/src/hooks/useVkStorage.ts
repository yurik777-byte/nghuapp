import { useState, useEffect } from 'react';
import { loadSelectedGroup, saveSelectedGroup } from '../utils/storage';

export function useVkStorage(defaultGroup: string = 'Д-11') {
  const [selectedGroup, setSelectedGroup] = useState<string>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('nghu_selected_group');
        if (stored && stored.trim().length > 0) {
          return stored.trim();
        }
      }
    } catch {
      // ignore
    }
    return defaultGroup;
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSavedGroup, setHasSavedGroup] = useState<boolean | null>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('nghu_selected_group');
        if (stored && stored.trim().length > 0) {
          return true;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

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
