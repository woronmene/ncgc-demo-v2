// /app/api/kyc/nin/route.js
import { NextResponse } from "next/server";

const simulateDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const { ninNumber = "", simulateDelayMs = 600 } = await req.json();
    const nin = ninNumber;

    if (!nin || typeof nin !== "string") {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing or invalid NIN",
        },
        { status: 400 }
      );
    }

    await simulateDelay(simulateDelayMs);
    const normalized = nin.trim();

    // NIN assumed as 11 digits
    if (/^\d{11}$/.test(normalized)) {
      // Include the recent government note about linking credit scores (simulated)
      return NextResponse.json({
        ok: true,
        message: "NIN verified",
        detail: {
          value: normalized,
          name: "Demo Citizen",
          linkedCreditScore: true,
        },
      });
    }

    return NextResponse.json({
      ok: false,
      reason: "pending_manual_review",
      message: "NIN format not recognized",
      detail: { value: nin, expected: "11-digit NIN" },
    });
  } catch (err) {
    console.error("NIN validation error:", err);
    return NextResponse.json(
      { ok: false, reason: "server_error", message: "Error validating NIN" },
      { status: 500 }
    );
  }
}
