import { RescheduleRequest, RescheduleResponse } from "@/types/session";
import { mockSessions } from "./mockData";


export async function requestReschedule(
  req: RescheduleRequest
): Promise<RescheduleResponse> {

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const session = mockSessions.find((s) => s.id === req.sessionId);
  if (!session) {
    return { success: false, error: "Session not found." };
  }

  const now = new Date();
  const newSlot = new Date(req.newSlot);


  if (newSlot <= now) {
    return { success: false, error: "The new slot cannot be in the past." };
  }


  if (req.newSlot === session.datetime) {
    return {
      success: false,
      error: "The new slot is the same as the current slot.",
    };
  }

  return { success: true };
}
