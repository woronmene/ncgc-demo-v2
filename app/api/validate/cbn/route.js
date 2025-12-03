import { NextResponse } from "next/server";

const simulateDelay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function POST(req) {
  console.log(req, "request json");
  console.log(req, "just request");
  try {
    const { cbnLicense = "", simulateDelayMs = 2000 } = await req.json();

    const license = cbnLicense;

    if (!license || typeof license !== "string") {
      console.log("this is licence", license);
      console.log("this is the type of license", typeof license);
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing or invalid CBN license number",
        },
        { status: 400 }
      );
    }

    await simulateDelay(simulateDelayMs);
    const normalized = license.trim().toUpperCase();

    // ✅ Make it more flexible — accepts CBN, CBN-, or CBN/
    const isValid =
      normalized.startsWith("CBN") ||
      normalized.startsWith("CBN-") ||
      normalized.startsWith("CBN/");

    if (isValid) {
      return NextResponse.json({
        ok: true,
        message: "CBN license verified successfully",
        detail: { value: license.trim() },
      });
    }

    // Pending manual check
    return NextResponse.json({
      ok: false,
      reason: "pending_manual_review",
      message: "Requires manual review: CBN license format not recognized",
      detail: {
        value: license,
        expected: "Format should start with 'CBN', 'CBN-' or 'CBN/'",
      },
    });
  } catch (error) {
    console.error("CBN validation error:", error);
    return NextResponse.json(
      {
        ok: false,
        reason: "server_error",
        message: "Error validating CBN license",
      },
      { status: 500 }
    );
  }
}
