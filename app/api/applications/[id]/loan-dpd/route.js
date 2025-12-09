import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export async function POST(req, ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { daysPastDue } = body;

    if (daysPastDue === undefined || daysPastDue < 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid daysPastDue value" },
        { status: 400 }
      );
    }

    const appRef = doc(db, "applications", id);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Get current application data
    const currentData = appSnap.data();
    
    // Update loan.daysPastDue (preserve existing loan data if any)
    await updateDoc(appRef, {
      loan: {
        ...(currentData.loan || {}),
        daysPastDue: Number(daysPastDue),
        updatedAt: new Date().toISOString(),
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Days Past Due updated successfully",
      daysPastDue: Number(daysPastDue)
    });
  } catch (err) {
    console.error("Update DPD error:", err);
    return NextResponse.json(
      { ok: false, message: "Error updating days past due" },
      { status: 500 }
    );
  }
}

