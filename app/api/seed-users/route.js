import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

const users = [
  {
    "id": 2,
    "email": "analyst@ncgc.gov.ng",
    "password": "analyst123",
    "role": "ncgc_analyst",
    "name": "NCGC Analyst"
  },
  {
    "email": "pfi.onboard@ncgc.gov.ng",
    "password": "pfi123",
    "role": "pfi_onboard",
    "name": "PFI Onboarding"
  }
];

export async function GET() {
  try {
    const usersRef = collection(db, "users");
    const results = [];

    for (const user of users) {
      // Check if user already exists
      const q = query(usersRef, where("email", "==", user.email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        const docRef = await addDoc(usersRef, user);
        results.push({ email: user.email, status: "added", id: docRef.id });
      } else {
        results.push({ email: user.email, status: "skipped (already exists)" });
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Seeding completed",
      results,
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { ok: false, message: "Error seeding users", error: error.message },
      { status: 500 }
    );
  }
}
