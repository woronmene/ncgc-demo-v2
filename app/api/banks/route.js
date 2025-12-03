// app/api/banks/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const banksRef = collection(db, "banks");
    const snapshot = await getDocs(banksRef);
    const data = snapshot.docs.map(doc => doc.data());
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
