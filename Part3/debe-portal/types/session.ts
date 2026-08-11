// Shared types between the frontend and the mock Cloud Function.

export type SessionStatus = "confirmed" | "pending" | "cancelled";

export interface Session {
  id: string;
  subject: string;
  teacherName: string;
  // Stored as UTC ISO string throughout the app.
  datetime: string;
  status: SessionStatus;
}

export type RescheduleReason = "Conflict" | "Illness" | "Time zone" | "Other";

export interface RescheduleRequest {
  sessionId: string;
  // New requested slot — sent to the function as UTC ISO string.

  newSlot: string;
  reason: RescheduleReason;
}

export interface RescheduleResponse {
  success: boolean;
  error?: string;
}
