// Shared types between the frontend and the mock Cloud Function.
// Both sides import from here — if a field changes, TypeScript catches it everywhere.

export type SessionStatus = "confirmed" | "pending" | "cancelled";

export interface Session {
  id: string;
  subject: string;
  teacherName: string;
  // Stored as UTC ISO string throughout the app.
  // The UI is responsible for converting to the parent's local time for display.
  datetime: string;
  status: SessionStatus;
}

export type RescheduleReason = "Conflict" | "Illness" | "Time zone" | "Other";

export interface RescheduleRequest {
  sessionId: string;
  // New requested slot — sent to the function as UTC ISO string.
  // The frontend converts from local time to UTC before calling the function.
  newSlot: string;
  reason: RescheduleReason;
}

export interface RescheduleResponse {
  success: boolean;
  error?: string;
}
