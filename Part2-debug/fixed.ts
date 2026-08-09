import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

interface BookingRequest {
    studentId: string;
    teacherId: string;
    slot: string;
    subject: string;
}

// The handler must be async because it performs multiple awaited Firestore operations.
export const bookSession = functions.https.onCall(async (data: BookingRequest, context) => {

    // Missing auth check: unauthenticated users could book sessions, bypassing any
    // user-level security. In production this exposes the endpoint to abuse and spam.
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to book a session.");
    }

    // Missing input validation: writing documents with undefined fields corrupts the
    // Firestore data model and causes silent failures downstream (e.g. broken queries).
    if (!data.studentId || !data.teacherId || !data.slot || !data.subject) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required booking fields.");
    }

    const booking = {
        studentId: data.studentId,
        teacherId: data.teacherId,
        slot: data.slot,
        subject: data.subject,
        status: "confirmed",
        createdAt: new Date(),
    };

    const teacherRef = db.collection("teachers").doc(data.teacherId);

    // Missing await: .get() returns a Promise, so without await, existing is a Promise
    // object — not a QuerySnapshot. existing.docs is always undefined, meaning the
    // double-booking check never runs and the same slot can be booked multiple times.
    const existing = await teacherRef.collection("bookings").where("slot", "==", data.slot).get();

    if (existing.docs.length > 0) {
        return { success: false, message: "Slot already booked" };
    }

    // Missing await: without await the function returns { success: true } before the
    // Firestore write completes. In production the booking is frequently never saved,
    // especially when the Cloud Function instance shuts down immediately after returning.
    await db.collection("bookings").add(booking);

    return { success: true };
});
