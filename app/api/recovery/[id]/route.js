import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req, ctx) {
  try {
    const { id } = await ctx.params;

    const recoveryRef = doc(db, "recoveries", id);
    const recoverySnap = await getDoc(recoveryRef);

    if (!recoverySnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Recovery not found" },
        { status: 404 }
      );
    }

    const recovery = recoverySnap.data();

    return NextResponse.json({
      ok: true,
      recovery: { ...recovery, id: recoverySnap.id }
    });
  } catch (err) {
    console.error("Get recovery error:", err);
    return NextResponse.json(
      { ok: false, message: "Error fetching recovery" },
      { status: 500 }
    );
  }
}

