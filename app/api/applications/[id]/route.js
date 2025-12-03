// /app/api/applications/[id]/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const simulateDelay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export async function GET(req, ctx) {
  try {
    await simulateDelay(300);
    const { id } = await ctx.params;

    const appRef = doc(db, "applications", id);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, reason: "not_found", message: "Application not found" },
        { status: 404 }
      );
    }

    let app = appSnap.data();

    // ---------------------------------------------------------
    // OPTION B: Generate suggested guarantee ONCE
    // ---------------------------------------------------------
    if (!app.ncgc || !app.ncgc.suggestedGuarantee) {
      const randomPercent = Math.floor(Math.random() * 21) + 70; // between 70–90

      if (!app.ncgc) app.ncgc = {};
      app.ncgc.suggestedGuarantee = randomPercent;
      
      // Save permanently
      await updateDoc(appRef, {
        "ncgc.suggestedGuarantee": randomPercent
      });
    }

    return NextResponse.json({ ok: true, application: app });
  } catch (err) {
    console.error("Get application error:", err);
    return NextResponse.json(
      {
        ok: false,
        reason: "server_error",
        message: "Error fetching application",
      },
      { status: 500 }
    );
  }
}
