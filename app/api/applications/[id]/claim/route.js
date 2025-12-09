import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";

export async function POST(req, ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    // Get the application
    const appRef = doc(db, "applications", id);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Application not found" },
        { status: 404 }
      );
    }

    const application = appSnap.data();

    // Validate that application is approved
    if (!application.ncgc?.approved) {
      return NextResponse.json(
        { ok: false, message: "Claims can only be submitted for approved applications" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.claimAmount || !body.defaultDate || !body.defaultReason) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate maximum claimable amount
    const guaranteePercentage = application.ncgc?.guaranteePercentage || 0;
    const maxClaimable = (Number(application.loanAmount) * guaranteePercentage) / 100;
    const claimAmount = Number(body.claimAmount);

    if (claimAmount > maxClaimable) {
      return NextResponse.json(
        { 
          ok: false, 
          message: `Claim amount cannot exceed maximum claimable amount of ₦${Math.round(maxClaimable).toLocaleString()}` 
        },
        { status: 400 }
      );
    }

    // Create claim record
    const claimData = {
      applicationId: id,
      businessName: application.businessName,
      loanAmount: application.loanAmount,
      guaranteePercentage: guaranteePercentage,
      claimAmount: claimAmount,
      defaultDate: body.defaultDate,
      totalOutstanding: body.totalOutstanding || null,
      principalOutstanding: body.principalOutstanding || null,
      interestOutstanding: body.interestOutstanding || null,
      penaltyOutstanding: body.penaltyOutstanding || null,
      defaultReason: body.defaultReason,
      actionsTaken: body.actionsTaken || null,
      supportingDocuments: body.supportingDocuments || null,
      status: "pending_review",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      reviewComments: null,
    };

    // Add claim to claims collection
    const claimsRef = collection(db, "claims");
    const claimDoc = await addDoc(claimsRef, claimData);

    // Update application to include claim reference
    await updateDoc(appRef, {
      claim: {
        id: claimDoc.id,
        status: "pending_review",
        submittedAt: claimData.submittedAt,
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Claim request submitted successfully",
      claimId: claimDoc.id,
      claim: { ...claimData, id: claimDoc.id }
    });
  } catch (err) {
    console.error("Create claim error:", err);
    return NextResponse.json(
      { ok: false, message: "Error submitting claim request" },
      { status: 500 }
    );
  }
}

