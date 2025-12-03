// /app/api/applications/comment/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const simulateDelay = (ms = 200) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const { id, by = "unknown", message = "" } = await req.json();
    if (!id || !message) {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing id or message",
        },
        { status: 400 }
      );
    }

    await simulateDelay(200);

    const appRef = doc(db, "applications", id);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, reason: "not_found", message: "Application not found" },
        { status: 404 }
      );
    }

    const appData = appSnap.data();
    const comment = { by, message, timestamp: new Date().toISOString() };
    
    const comments = appData.comments || [];
    comments.push(comment);

    await updateDoc(appRef, { comments });

    return NextResponse.json({
      ok: true,
      message: "Comment added",
      comment,
      application: { ...appData, comments },
    });
  } catch (err) {
    console.error("Add comment error:", err);
    return NextResponse.json(
      { ok: false, reason: "server_error", message: "Error adding comment" },
      { status: 500 }
    );
  }
}
