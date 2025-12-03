// app/api/applications/[id]/approve/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function POST(req, { params }) {
  try {
    // params may be a promise in some next versions — unwrap defensively
    const { id } = await params;
    const payload = await req.json();
    const { guaranteePercentage } = payload;

    await delay(250);

    const appRef = doc(db, "applications", id);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Application not found" },
        { status: 404 }
      );
    }

    const appData = appSnap.data();
    
    // Updates
    const updates = {
      status: "Approved",
      "ncgc.approved": true,
      "ncgc.guaranteePercentage": Number(guaranteePercentage) || appData.ncgc?.guaranteePercentage || null
    };

    // Handle comments
    const newComment = {
      id: `sys_${Date.now()}`,
      author: "ncgc",
      message: `Application approved with ${updates["ncgc.guaranteePercentage"]}% guarantee.`,
      timestamp: new Date().toISOString(),
    };
    
    const comments = appData.comments || [];
    comments.push(newComment);
    updates.comments = comments;

    await updateDoc(appRef, updates);

    return NextResponse.json({
      ok: true,
      message: "Approved",
      application: { ...appData, ...updates },
    });
  } catch (err) {
    console.error("approve error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}
