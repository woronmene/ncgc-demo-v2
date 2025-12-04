// /app/api/applications/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const simulateDelay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export async function GET() {
  try {
    await simulateDelay(400);
    
    const appsRef = collection(db, "applications");
    const snapshot = await getDocs(appsRef);
    
    const apps = snapshot.docs.map(doc => doc.data());

    // Return all or a lightweight list
    const list = apps.map((a) => ({
      id: a.id,
      businessName: a.businessName,
      loanAmount: a.loanAmount,
      status: a.status,
      createdAt: a.createdAt,
      ncgc: a.ncgc,
      tenure: a.tenure,
      createdBy: a.createdBy,
    }));

    return NextResponse.json(list);
  } catch (err) {
    console.error("List applications error:", err);
    return NextResponse.json(
      {
        ok: false,
        reason: "server_error",
        message: "Error reading applications",
      },
      { status: 500 }
    );
  }
}
