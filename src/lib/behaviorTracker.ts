// src/lib/behaviorTracker.ts
import { storage } from './storage';

export type EventType =
  | 'page_view'
  | 'task_complete'
  | 'task_skip'
  | 'coach_message'
  | 'interview_add'
  | 'lead_add'
  | 'checkin_submit'
  | 'stay_duration';

export interface BehaviorEvent {
  type: EventType;
  data: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export function track(event: Omit<BehaviorEvent, 'timestamp' | 'sessionId'>): void {
  const fullEvent: BehaviorEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  // Store in localStorage queue for later sync
  const key = `behavior_queue`;
  const queue = storage.get<BehaviorEvent[]>(key, []);
  queue.push(fullEvent);
  storage.set(key, queue);

  // Async send to backend (doesn't block UI)
  sendToBackend(fullEvent);
}

async function sendToBackend(event: BehaviorEvent): Promise<void> {
  try {
    await fetch('/api/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch {
    // Silent failure - data is stored in localStorage queue
  }
}

// Simplified API
export const behaviorTracker = {
  pageView: (page: string) => track({ type: 'page_view', data: { page } }),
  taskComplete: (taskId: string) => track({ type: 'task_complete', data: { taskId } }),
  taskSkip: (taskId: string) => track({ type: 'task_skip', data: { taskId } }),
  coachMessage: (messageLength: number) => track({ type: 'coach_message', data: { messageLength } }),
  interviewAdd: () => track({ type: 'interview_add', data: {} }),
  leadAdd: () => track({ type: 'lead_add', data: {} }),
  checkinSubmit: (valueScore: number) => track({ type: 'checkin_submit', data: { valueScore } }),
  stayDuration: (page: string, duration: number) => track({ type: 'stay_duration', data: { page, duration } }),
};