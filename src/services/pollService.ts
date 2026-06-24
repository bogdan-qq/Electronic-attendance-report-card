// src/services/pollService.ts

export interface Poll {
  id: string;
  groupId: string;
  disciplineId: string;
  disciplineName: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  studentStatuses: {
    [studentId: string]: {
      marked: boolean;
      status: 'П' | 'Н';
    };
  };
}

const POLL_STORAGE_KEY = 'active_poll';
const POLL_DURATION = 10 * 60 * 1000;

export const pollService = {
  createPoll: (groupId: string, disciplineId: string, disciplineName: string): Poll => {
    const now = Date.now();
    const poll: Poll = {
      id: `${groupId}_${disciplineId}_${now}`,
      groupId,
      disciplineId,
      disciplineName,
      startTime: now,
      endTime: now + POLL_DURATION,
      isActive: true,
      studentStatuses: {},
    };
    localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(poll));
    return poll;
  },

  getActivePoll: (): Poll | null => {
    const data = localStorage.getItem(POLL_STORAGE_KEY);
    if (!data) return null;
    try {
      const poll: Poll = JSON.parse(data);
      if (Date.now() > poll.endTime) {
        poll.isActive = false;
        localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(poll));
        return poll;
      }
      return poll;
    } catch {
      return null;
    }
  },

  isPollActive: (): boolean => {
    const poll = pollService.getActivePoll();
    return poll ? poll.isActive : false;
  },

  markStudent: (studentId: string): boolean => {
    const poll = pollService.getActivePoll();
    if (!poll || !poll.isActive) return false;
    if (Date.now() > poll.endTime) {
      poll.isActive = false;
      localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(poll));
      return false;
    }
    poll.studentStatuses[studentId] = {
      marked: true,
      status: 'П',
    };
    localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(poll));
    return true;
  },

  getStudentStatus: (studentId: string): 'П' | 'Н' | null => {
    const poll = pollService.getActivePoll();
    if (!poll) return null;
    if (poll.studentStatuses[studentId]) {
      return poll.studentStatuses[studentId].status;
    }
    if (!poll.isActive || Date.now() > poll.endTime) {
      return 'Н';
    }
    return null;
  },

  isStudentMarked: (studentId: string): boolean => {
    const poll = pollService.getActivePoll();
    if (!poll) return false;
    return poll.studentStatuses[studentId]?.marked || false;
  },

  closePoll: (): void => {
    localStorage.removeItem(POLL_STORAGE_KEY);
  },

  finishPoll: (): { [studentId: string]: 'П' | 'Н' } => {
    const poll = pollService.getActivePoll();
    const results: { [studentId: string]: 'П' | 'Н' } = {};
    if (!poll) return results;
    for (const [studentId, status] of Object.entries(poll.studentStatuses)) {
      results[studentId] = status.status;
    }
    localStorage.removeItem(POLL_STORAGE_KEY);
    return results;
  },
};