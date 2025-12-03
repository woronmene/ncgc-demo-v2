// /app/api/kyc/cac/route.js
import { NextResponse } from "next/server";

const simulateDelay = (ms = 800) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  try {
    const { cacNumber = "", simulateDelayMs = 800 } = await req.json();

    if (!cacNumber || typeof cacNumber !== "string") {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing or invalid CAC number",
        },
        { status: 400 }
      );
    }

    await simulateDelay(simulateDelayMs);
    const normalized = cacNumber.trim().toUpperCase();

    // Accept common forms: starts with CAC or RC or numeric 6-12 digits
    const startsWith =
      normalized.startsWith("CAC") || normalized.startsWith("RC");
    const digitsPattern = /^\d{6,12}$/.test(normalized);

    if (startsWith || digitsPattern) {
      return NextResponse.json({
        ok: true,
        message: "CAC lookup successful",
        detail: {
          value: cacNumber.trim(),
          companyName: "ACME Demo Ltd",
          registeredYear: 2015,
        },
      });
    }

    return NextResponse.json({
      ok: false,
      reason: "pending_manual_review",
      message: "Requires manual review: CAC format not recognized",
      detail: {
        value: cacNumber,
        expected: "Starts with 'CAC' or 'RC' or be 6–12 digits",
      },
    });
  } catch (err) {
    console.error("CAC validation error:", err);
    return NextResponse.json(
      { ok: false, reason: "server_error", message: "Error validating CAC" },
      { status: 500 }
    );
  }
}
