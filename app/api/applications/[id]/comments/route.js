// /app/api/applications/[id]/comments/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req, ctx) {
  try {
    // 🔥 FIX: unwrap params because it's a Promise
    const { id: appId } = await ctx.params;

    const payload = await req.json();
    const { message, author = "bank" } = payload;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { ok: false, message: "Message is required" },
        { status: 400 }
      );
    }

    const appRef = doc(db, "applications", appId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Application not found" },
        { status: 404 }
      );
    }
    
    const appData = appSnap.data();

    const newComment = {
      id: `msg_${Date.now()}`,
      author, // "bank" or "ncgc"
      message,
      timestamp: new Date().toISOString(),
    };

    const comments = appData.comments || [];
    comments.push(newComment);

    await updateDoc(appRef, { comments });

    return NextResponse.json({ ok: true, comment: newComment });
  } catch (err) {
    console.error("Comment error:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to add comment" },
      { status: 500 }
    );
  }
}
