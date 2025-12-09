import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc, updateDoc } from "firebase/firestore";

export async function GET(req) {
  try {
    const recoveriesRef = collection(db, "recoveries");
    const q = query(recoveriesRef, orderBy("startedAt", "desc"));
    const snapshot = await getDocs(q);

    const recoveries = [];
    snapshot.forEach((doc) => {
      recoveries.push({ ...doc.data(), id: doc.id });
    });

    return NextResponse.json({
      ok: true,
      recoveries
    });
  } catch (err) {
    console.error("Get recoveries error:", err);
    return NextResponse.json(
      { ok: false, message: "Error fetching recoveries" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { applicationId, recoveryMethod, recoveryAmount, assignedTo, priority, notes } = body;

    if (!applicationId || !recoveryMethod || !recoveryAmount) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get application details
    const appRef = doc(db, "applications", applicationId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Application not found" },
        { status: 404 }
      );
    }

    const application = appSnap.data();

    // Create recovery record
    const recoveryData = {
      applicationId,
      businessName: application.businessName,
      loanAmount: application.loanAmount,
      claimAmount: application.claim?.payment?.amount || 0,
      recoveryAmount: Number(recoveryAmount),
      recoveryMethod,
      assignedTo: assignedTo || null,
      priority: priority || "medium",
      notes: notes || null,
      status: "initiated",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: [],
      documents: [],
    };

    const recoveriesRef = collection(db, "recoveries");
    const recoveryDoc = await addDoc(recoveriesRef, recoveryData);

    // Update application to include recovery reference
    await updateDoc(appRef, {
      recovery: {
        id: recoveryDoc.id,
        status: "initiated",
        startedAt: recoveryData.startedAt,
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Recovery process started successfully",
      recoveryId: recoveryDoc.id,
      recovery: { ...recoveryData, id: recoveryDoc.id }
    });
  } catch (err) {
    console.error("Create recovery error:", err);
    return NextResponse.json(
      { ok: false, message: "Error starting recovery process" },
      { status: 500 }
    );
  }
}

