// src/hooks/useBehaviorTracking.ts
import { useEffect, useRef } from 'react';
import { behaviorTracker, getSessionId } from '../lib/behaviorTracker';

// Page stay duration tracking
export function usePageTracking(pageName: string) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Track page view on entry
    behaviorTracker.pageView(pageName);

    return () => {
      // Track stay duration on exit
      const duration = Date.now() - startTime.current;
      if (duration > 1000) {
        // Only track stays longer than 1 second
        behaviorTracker.stayDuration(pageName, duration);
      }
    };
  }, [pageName]);
}

// Task tracking
export function useTaskTracking(taskId: string, status: 'complete' | 'skip') {
  useEffect(() => {
    if (status === 'complete') {
      behaviorTracker.taskComplete(taskId);
    } else {
      behaviorTracker.taskSkip(taskId);
    }
  }, [taskId, status]);
}

// Coach message tracking
export function useCoachTracking(messageLength: number) {
  useEffect(() => {
    behaviorTracker.coachMessage(messageLength);
  }, [messageLength]);
}