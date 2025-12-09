import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export async function GET(req) {
  try {
    const claimsRef = collection(db, "claims");
    const q = query(claimsRef, orderBy("submittedAt", "desc"));
    const snapshot = await getDocs(q);

    const claims = [];
    snapshot.forEach((doc) => {
      claims.push({ ...doc.data(), id: doc.id });
    });

    return NextResponse.json({
      ok: true,
      claims
    });
  } catch (err) {
    console.error("Get claims error:", err);
    return NextResponse.json(
      { ok: false, message: "Error fetching claims" },
      { status: 500 }
    );
  }
}

