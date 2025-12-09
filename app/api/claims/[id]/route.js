import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req, ctx) {
  try {
    const { id } = await ctx.params;

    const claimRef = doc(db, "claims", id);
    const claimSnap = await getDoc(claimRef);

    if (!claimSnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Claim not found" },
        { status: 404 }
      );
    }

    const claim = claimSnap.data();

    return NextResponse.json({
      ok: true,
      claim: { ...claim, id: claimSnap.id }
    });
  } catch (err) {
    console.error("Get claim error:", err);
    return NextResponse.json(
      { ok: false, message: "Error fetching claim" },
      { status: 500 }
    );
  }
}

