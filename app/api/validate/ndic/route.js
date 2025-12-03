import { NextResponse } from "next/server";

const simulateDelay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const { ndicNumber = "", simulateDelayMs = 2000 } = await req.json();

    const ndic = ndicNumber;

    if (!ndic || typeof ndic !== "string") {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing or invalid NDIC registration number",
        },
        { status: 400 }
      );
    }

    await simulateDelay(simulateDelayMs);
    const normalized = ndic.trim().toUpperCase();

    // ✅ More flexible — allow NDIC (with or without dash/slash)
    const isValid =
      normalized.startsWith("NDIC") ||
      normalized.startsWith("NDIC-") ||
      normalized.startsWith("NDIC/") ||
      /^\d{6,12}$/.test(normalized);

    if (isValid) {
      return NextResponse.json({
        ok: true,
        message: "NDIC registration verified successfully",
        detail: { value: ndic.trim() },
      });
    }

    return NextResponse.json({
      ok: false,
      reason: "pending_manual_review",
      message:
        "Requires manual review: NDIC registration format not recognized",
      detail: {
        value: ndic,
        expected: "Format should start with 'NDIC', 'NDIC-' or 'NDIC/'",
      },
    });
  } catch (error) {
    console.error("NDIC validation error:", error);
    return NextResponse.json(
      {
        ok: false,
        reason: "server_error",
        message: "Error validating NDIC registration",
      },
      { status: 500 }
    );
  }
}
