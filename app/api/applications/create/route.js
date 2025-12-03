// /app/api/applications/create/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const simulateDelay = (ms = 800) => new Promise((res) => setTimeout(res, ms));

function makeId() {
  return `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req) {
  try {
    const payload = await req.json();
    await simulateDelay(800);

    // Minimal validation: businessName + loanAmount required
    if (!payload.businessName || !payload.loanAmount) {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Extract user's bank from cookies for tracking who created this application
    const cookies = req.headers.get('cookie') || '';
    const userBankMatch = cookies.match(/userBank=([^;]+)/);
    const createdBy = userBankMatch ? decodeURIComponent(userBankMatch[1]) : 'Unknown';

    const newAppId = makeId();
    const newApp = {
      id: newAppId,
      businessName: payload.businessName,
      rcNumber: payload.rcNumber || null,
      tinNumber: payload.tinNumber || null,
      cacNumber: payload.cacNumber || null,
      businessAddress: payload.businessAddress || null,
      sector: payload.sector || null,
      thematicArea: payload.thematicArea || null,
      guaranteeType: payload.guaranteeType || null,
      loanAmount: payload.loanAmount,
      tenure: payload.tenure || null,
      purpose: payload.purpose || null,
      monthlyRevenue: payload.monthlyRevenue || null,
      owners: payload.owners || [],
      kyc: {
        cac: payload.cacNumber || null,
        bvn: payload.owners?.[0]?.bvnNumber || null,
        nin: payload.owners?.[0]?.ninNumber || null,
        creditScore: payload.creditScore || null,
      },
      documents: payload.documents || {
        cacDoc: false,
        statement: false,
        idDoc: false,
      },
      status: "pending_ncgc_review",
      ncgc: { approved: false, guaranteePercentage: null, comments: [] },
      bank: { approved: false },
      comments: [],
      createdBy: createdBy, // Track which PFI created this application
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "applications", newAppId), newApp);

    return NextResponse.json({
      ok: true,
      message: "Application created",
      applicationId: newApp.id,
      bank: { name: newApp.businessName },
      credentials: null,
      application: newApp,
    });
  } catch (err) {
    console.error("Create application error:", err);
    return NextResponse.json(
      {
        ok: false,
        reason: "server_error",
        message: "Error creating application",
      },
      { status: 500 }
    );
  }
}
