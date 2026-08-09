import { RescheduleRequest, RescheduleResponse } from "@/types/session";
import { mockSessions } from "./mockData";

// Stub simulating the Firebase Cloud Function `requestReschedule`.
// In production this would be: httpsCallable(functions, "requestReschedule").
// The validation logic here mirrors what the real function would enforce server-side.
export async function requestReschedule(
  req: RescheduleRequest
): Promise<RescheduleResponse> {
  // Simulate network latency so loading states are visible during development.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const session = mockSessions.find((s) => s.id === req.sessionId);
  if (!session) {
    return { success: false, error: "Session not found." };
  }

  const now = new Date();
  const newSlot = new Date(req.newSlot);

  // Validation 1: new slot must not be in the past.
  // A past slot would create a confirmed booking that can never be attended.
  if (newSlot <= now) {
    return { success: false, error: "The new slot cannot be in the past." };
  }

  // Validation 2: new slot must differ from the existing slot.
  // Rescheduling to the same time is a no-op and wastes teacher availability.
  if (req.newSlot === session.datetime) {
    return {
      success: false,
      error: "The new slot is the same as the current slot.",
    };
  }

  return { success: true };
}
