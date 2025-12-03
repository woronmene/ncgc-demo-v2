// /app/api/applications/approve/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const simulateDelay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const payload = await req.json();
    const {
      id,
      approved = false,
      guaranteePercentage = null,
      by = "ncgc-analyst",
      comment = null,
    } = payload;

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing application id",
        },
        { status: 400 }
      );
    }

    await simulateDelay(500);

    const appRef = doc(db, "applications", id);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, reason: "not_found", message: "Application not found" },
        { status: 404 }
      );
    }

    const appData = appSnap.data();
    
    const updates = {
      "ncgc.approved": !!approved,
      "ncgc.guaranteePercentage": guaranteePercentage ?? appData.ncgc?.guaranteePercentage,
      status: approved ? "ncgc_approved" : "ncgc_rejected"
    };

    if (comment) {
      const entry = {
        by,
        message: comment,
        timestamp: new Date().toISOString(),
      };
      
      const ncgcComments = appData.ncgc?.comments || [];
      ncgcComments.push(entry);
      updates["ncgc.comments"] = ncgcComments;
      
      const comments = appData.comments || [];
      comments.push(entry);
      updates.comments = comments;
    }

    await updateDoc(appRef, updates);

    return NextResponse.json({
      ok: true,
      message: "NCGC decision recorded",
      application: { ...appData, ...updates },
    });
  } catch (err) {
    console.error("NCGC approve error:", err);
    return NextResponse.json(
      {
        ok: false,
        reason: "server_error",
        message: "Error updating application",
      },
      { status: 500 }
    );
  }
}
