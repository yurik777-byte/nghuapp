import { useState, useEffect } from 'react';
import { Lesson } from '../types';
import { getCurrentLessonStatus, LiveState } from '../utils/timeUtils';

export function useLiveStatus(lessons: Lesson[]): LiveState {
  const [status, setStatus] = useState<LiveState>(() => getCurrentLessonStatus(lessons, new Date()));

  useEffect(() => {
    setStatus(getCurrentLessonStatus(lessons, new Date()));
    const interval = setInterval(() => {
      setStatus(getCurrentLessonStatus(lessons, new Date()));
    }, 15000);

    return () => clearInterval(interval);
  }, [lessons]);

  return status;
}
