import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export async function POST(req, ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { ok: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["initiated", "in_progress", "completed", "closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const recoveryRef = doc(db, "recoveries", id);
    const recoverySnap = await getDoc(recoveryRef);

    if (!recoverySnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Recovery not found" },
        { status: 404 }
      );
    }

    const recovery = recoverySnap.data();

    // Update recovery status
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Add milestone if notes provided
    if (notes) {
      const milestones = recovery.milestones || [];
      milestones.push({
        title: `Status changed to ${status.replace('_', ' ')}`,
        description: notes,
        date: new Date().toISOString(),
      });
      updateData.milestones = milestones;
    }

    await updateDoc(recoveryRef, updateData);

    // Update application recovery status
    if (recovery.applicationId) {
      const appRef = doc(db, "applications", recovery.applicationId);
      await updateDoc(appRef, {
        "recovery.status": status,
        "recovery.updatedAt": updateData.updatedAt,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Recovery status updated successfully",
      recovery: { ...recovery, ...updateData, id: recoverySnap.id }
    });
  } catch (err) {
    console.error("Update recovery status error:", err);
    return NextResponse.json(
      { ok: false, message: "Error updating recovery status" },
      { status: 500 }
    );
  }
}

