
export interface Participant {
  id: string;
  name: string;
  timezone: string;
  isMe: boolean;
  unavailability?: string; // Natural language: "No Fridays", "Busy 2pm-4pm", etc.
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export enum HourType {
  WORKING = 'working', // 9 AM - 6 PM
  WAKING = 'waking',   // 7 AM - 9 AM & 6 PM - 10 PM
  SLEEPING = 'sleeping' // 10 PM - 7 AM
}

export interface TimeSlot {
  utcHour: number;
  participants: {
    participantId: string;
    localHour: number;
    type: HourType;
  }[];
  score: number; // 0 to 1
}

export interface AISuggestion {
  startTime: string; // ISO String or human readable
  reason: string;
  impact: string;
}
