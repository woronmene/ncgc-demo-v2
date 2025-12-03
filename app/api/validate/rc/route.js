import { NextResponse } from "next/server";

const simulateDelay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const { rcNumber = "", simulateDelayMs = 2000 } = await req.json();

    if (!rcNumber || typeof rcNumber !== "string") {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing or invalid RC number",
        },
        { status: 400 }
      );
    }

    await simulateDelay(simulateDelayMs);
    const normalized = rcNumber.trim().toUpperCase();

    // ✅ Broaden accepted formats — allow RC, RC-, RC/, and legacy numeric patterns
    const validPattern = /^RC\d{1,10}$/;
    const legacyPattern = /^\d{7,12}$/;
    const isValid =
      normalized.startsWith("RC") ||
      normalized.startsWith("RC-") ||
      normalized.startsWith("RC/") ||
      validPattern.test(normalized) ||
      legacyPattern.test(normalized);

    if (isValid) {
      return NextResponse.json({
        ok: true,
        message: "RC number verified successfully",
        detail: { value: rcNumber.trim() },
      });
    }

    return NextResponse.json({
      ok: false,
      reason: "pending_manual_review",
      message: "Requires manual review: RC number format not recognized",
      detail: {
        value: rcNumber,
        expected:
          "Format should start with 'RC', 'RC-' or 'RC/' or be 7–12 digits long",
      },
    });
  } catch (error) {
    console.error("RC validation error:", error);
    return NextResponse.json(
      {
        ok: false,
        reason: "server_error",
        message: "Error validating RC number",
      },
      { status: 500 }
    );
  }
}
