// /app/api/applications/bank-approve/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const simulateDelay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const {
      id,
      bankApproved = false,
      by = "bank-manager",
      message = null,
    } = await req.json();

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

    await simulateDelay(400);

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
      "bank.approved": !!bankApproved,
      status: bankApproved ? "bank_approved" : "bank_rejected"
    };

    if (message) {
      const entry = { by, message, timestamp: new Date().toISOString() };
      const comments = appData.comments || [];
      comments.push(entry);
      updates.comments = comments;
    }

    await updateDoc(appRef, updates);

    return NextResponse.json({
      ok: true,
      message: "Bank decision saved",
      application: { ...appData, ...updates },
    });
  } catch (err) {
    console.error("Bank approve error:", err);
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
