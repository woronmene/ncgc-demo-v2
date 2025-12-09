import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, collection, addDoc } from "firebase/firestore";

export async function POST(req, ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { action, comments } = body;

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { ok: false, message: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    if (action === "reject" && !comments?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Comments are required when rejecting a claim" },
        { status: 400 }
      );
    }

    const claimRef = doc(db, "claims", id);
    const claimSnap = await getDoc(claimRef);

    if (!claimSnap.exists()) {
      return NextResponse.json(
        { ok: false, message: "Claim not found" },
        { status: 404 }
      );
    }

    const claim = claimSnap.data();

    if (claim.status !== "pending_review") {
      return NextResponse.json(
        { ok: false, message: "Claim has already been reviewed" },
        { status: 400 }
      );
    }

    // Update claim
    const updateData = {
      status: action === "approve" ? "approved" : "rejected",
      reviewedAt: new Date().toISOString(),
      reviewedBy: "NCGC Analyst", // In production, get from auth
      reviewComments: comments || null,
    };

    // If approving, add payment information
    if (action === "approve") {
      const claimId = claimSnap.id; // Use the document ID from Firestore
      updateData.payment = {
        amount: claim.claimAmount,
        status: "paid",
        paidAt: new Date().toISOString(),
        paymentReference: `PAY-${Date.now()}-${claimId.substring(0, 8).toUpperCase()}`,
      };
    }

    await updateDoc(claimRef, updateData);

    // Update application claim status
    if (claim.applicationId) {
      const appRef = doc(db, "applications", claim.applicationId);
      const appUpdate = {
        "claim.status": updateData.status,
        "claim.reviewedAt": updateData.reviewedAt,
      };
      
      if (action === "approve" && updateData.payment) {
        appUpdate["claim.payment"] = updateData.payment;
      }
      
      await updateDoc(appRef, appUpdate);
    }

    // Create notification for PFI if approved
    if (action === "approve") {
      try {
        const notificationsRef = collection(db, "notifications");
        await addDoc(notificationsRef, {
          type: "claim_payment",
          recipient: "pfi", // In production, get actual PFI ID
          title: "Claim Payment Processed",
          message: `Your claim for ${claim.businessName} has been approved and payment of ₦${Number(claim.claimAmount).toLocaleString()} has been processed. Payment Reference: ${updateData.payment.paymentReference}`,
          claimId: id,
          applicationId: claim.applicationId,
          amount: claim.claimAmount,
          paymentReference: updateData.payment.paymentReference,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } catch (notifErr) {
        console.error("Error creating notification:", notifErr);
        // Don't fail the whole operation if notification fails
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Claim ${action === "approve" ? "approved" : "rejected"} successfully`,
      claim: { ...claim, ...updateData, id: claimSnap.id }
    });
  } catch (err) {
    console.error("Review claim error:", err);
    return NextResponse.json(
      { ok: false, message: "Error processing claim review" },
      { status: 500 }
    );
  }
}

