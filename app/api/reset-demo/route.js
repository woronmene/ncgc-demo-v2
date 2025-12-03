import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, where, writeBatch } from "firebase/firestore";

export async function POST() {
  try {
    // 1. Clear applications
    const appsRef = collection(db, "applications");
    const appsSnap = await getDocs(appsRef);
    const batch1 = writeBatch(db);
    appsSnap.docs.forEach((d) => {
      batch1.delete(d.ref);
    });
    await batch1.commit();

    // 2. Clear partner banks
    const banksRef = collection(db, "banks");
    const banksSnap = await getDocs(banksRef);
    const batch2 = writeBatch(db);
    banksSnap.docs.forEach((d) => {
      batch2.delete(d.ref);
    });
    await batch2.commit();

    // 3. Remove users with role bank_maker or bank_approver
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "in", ["bank_maker", "bank_approver"]));
    const usersSnap = await getDocs(q);
    const batch3 = writeBatch(db);
    usersSnap.docs.forEach((d) => {
      batch3.delete(d.ref);
    });
    await batch3.commit();

    return NextResponse.json({
      ok: true,
      message: "Demo reset completed successfully",
    });
  } catch (err) {
    console.error("RESET ERROR:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to reset demo" },
      { status: 500 }
    );
  }
}
