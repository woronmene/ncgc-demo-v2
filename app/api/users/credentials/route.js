import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => {
      const userData = doc.data();
      // Add label field if it doesn't exist (use name or generate from role/email)
      if (!userData.label) {
        if (userData.name) {
          userData.label = userData.name;
        } else if (userData.role === "pfi_onboard") {
          userData.label = "PFI Onboarding";
        } else if (userData.role === "bank_maker") {
          userData.label = `PFI Maker - ${userData.bank || "PFI"}`;
        } else if (userData.role === "bank_approver") {
          userData.label = `Bank Approver - ${userData.bank || "Bank"}`;
        } else {
          // Generate label from role
          userData.label = userData.role
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }
      return userData;
    });

    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error("Error reading users:", error);
    return NextResponse.json(
      { ok: false, message: "Error loading credentials" },
      { status: 500 }
    );
  }
}
