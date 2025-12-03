// app/api/applications/[id]/reject/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const payload = await req.json();
    const { reason } = payload;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { ok: false, message: "Reason is required" },
        { status: 400 }
      );
    }

    await delay(200);

    const appRef = doc(db, "applications", id);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Application not found" },
        { status: 404 }
      );
    }

    const appData = appSnap.data();

    const comment = {
      id: `msg_${Date.now()}`,
      author: "ncgc",
      message: reason,
      timestamp: new Date().toISOString(),
    };
    
    const comments = appData.comments || [];
    comments.push(comment);

    const updates = {
      status: "Rejected",
      "ncgc.approved": false,
      comments: comments
    };

    await updateDoc(appRef, updates);

    return NextResponse.json({ ok: true, message: "Rejected", comment });
  } catch (err) {
    console.error("reject error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}
