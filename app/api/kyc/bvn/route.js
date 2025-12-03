// /app/api/kyc/bvn/route.js
import { NextResponse } from "next/server";

const simulateDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const { bvnNumber = "", simulateDelayMs = 600 } = await req.json();
    const bvn = bvnNumber;

    if (!bvn || typeof bvn !== "string") {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing or invalid BVN",
        },
        { status: 400 }
      );
    }

    await simulateDelay(simulateDelayMs);
    const normalized = bvn.trim();

    // BVN is exactly 11 digits
    if (/^\d{11}$/.test(normalized)) {
      return NextResponse.json({
        ok: true,
        message: "BVN verified",
        detail: {
          value: normalized,
          name: "Demo User",
          phone: "+2348010000000",
        },
      });
    }

    return NextResponse.json({
      ok: false,
      reason: "pending_manual_review",
      message: "BVN format not recognized",
      detail: { value: bvn, expected: "11-digit BVN" },
    });
  } catch (err) {
    console.error("BVN validation error:", err);
    return NextResponse.json(
      { ok: false, reason: "server_error", message: "Error validating BVN" },
      { status: 500 }
    );
  }
}
