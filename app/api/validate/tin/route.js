// /app/api/validate/tin/route.js
import { NextResponse } from "next/server";

const simulateDelay = (ms = 1000) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const { tinNumber = "", simulateDelayMs = 1000 } = await req.json();

    console.log("tin", tinNumber);
    const tin = tinNumber;

    if (!tin || typeof tin !== "string") {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing or invalid TIN",
        },
        { status: 400 }
      );
    }

    await simulateDelay(simulateDelayMs);
    const normalized = tin.trim().toUpperCase();
    console.log("tin", normalized);

    // Valid if starts with TIN- or TIN/ OR is 9–14 digits
    const startsPattern =
      normalized.startsWith("TIN-") ||
      normalized.startsWith("TIN/") ||
      normalized.startsWith("TIN");
    const digitsPattern = /^\d{9,14}$/.test(normalized);

    if (startsPattern || digitsPattern) {
      return NextResponse.json({
        ok: true,
        message: "TIN validated successfully",
        detail: { value: tin.trim() },
      });
    }

    return NextResponse.json({
      ok: false,
      reason: "pending_manual_review",
      message: "Requires manual review: TIN format not recognized",
      detail: {
        value: tin,
        expected: "Starts with 'TIN-' or 'TIN/' or be 9–14 digits",
      },
    });
  } catch (err) {
    console.error("TIN validation error:", err);
    return NextResponse.json(
      { ok: false, reason: "server_error", message: "Error validating TIN" },
      { status: 500 }
    );
  }
}
