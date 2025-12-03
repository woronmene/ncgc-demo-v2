import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => doc.data());

    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error("Error reading users:", error);
    return NextResponse.json(
      { ok: false, message: "Error loading credentials" },
      { status: 500 }
    );
  }
}
