import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, setDoc } from "firebase/firestore";

// Helper function to simulate HTTP call to our local validation routes
async function validateField(field, value, baseUrl) {
  const endpoints = {
    cbn: `${baseUrl}/api/validate/cbn`,
    rc: `${baseUrl}/api/validate/rc`,
    ndic: `${baseUrl}/api/validate/ndic`,
  };

  try {
    const res = await fetch(endpoints[field], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error validating ${field}:`, err);
    return {
      ok: false,
      reason: "server_error",
      message: "Validation request failed",
    };
  }
}

function generateCredentials(bankName, domain = "bank.com") {
  const cleanName = bankName.toLowerCase().replace(/\s+/g, "");
  const baseEmail = `${cleanName}@${domain}`;
  return [
    {
      label: "PFI Maker",
      email: `maker.${baseEmail}`,
      password: "bankmaker123",
      role: "bank_maker",
    },
    {
      label: "Bank Approver",
      email: `approver.${baseEmail}`,
      password: "bankapprover123",
      role: "bank_approver",
    },
  ];
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received PFI onboarding data:", body);
    
    const {
      pfiName,
      operatingAddress,
      contactPerson,
      contactEmail,
      contactPhone,
      cbnLicense,
      rcNumber,
      ndicNumber,
      licenseType,
      kycCompliant,
      amlCompliant,
      cftCompliant,
      fitAndProper,
      qualifiedManagement,
      internalControls,
      capitalAdequacy,
      liquidityCompliance,
      riskManagementFramework,
      esmsCompliant,
      creditBureaus,
      responsibleLending,
      notUnderAcquisition,
      lendingFocus,
      guaranteeProduct,
    } = body;

    // Validate required fields
    if (!pfiName || !cbnLicense || !rcNumber || !ndicNumber || !contactEmail) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing required fields",
          missing: Object.entries({
            pfiName,
            cbnLicense,
            rcNumber,
            ndicNumber,
            contactEmail,
          })
            .filter(([_, v]) => !v)
            .map(([k]) => k),
        },
        { status: 400 }
      );
    }

    // Determine base URL
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Simulate field validation
    const [cbnCheck, rcCheck, ndicCheck] = await Promise.all([
      validateField("cbn", cbnLicense, baseUrl),
      validateField("rc", rcNumber, baseUrl),
      validateField("ndic", ndicNumber, baseUrl),
    ]);

    // Determine bank overall verification status
    const allValid = cbnCheck.ok && rcCheck.ok && ndicCheck.ok;
    const overallStatus = allValid ? "Verified" : "Pending Review";

    // Create new bank/PFI record with all fields
    const newBank = {
      name: pfiName,
      operatingAddress,
      contactPerson,
      contactEmail,
      contactPhone,
      
      // Regulatory
      cbnLicense,
      rcNumber,
      ndicNumber,
      licenseType,
      kycCompliant,
      amlCompliant,
      cftCompliant,
      
      // Governance
      fitAndProper,
      qualifiedManagement,
      internalControls,
      
      // Financial
      capitalAdequacy,
      liquidityCompliance,
      riskManagementFramework,
      
      // Sustainability
      esmsCompliant,
      creditBureaus,
      responsibleLending,
      
      // Operational
      notUnderAcquisition,
      lendingFocus,
      
      // Product
      guaranteeProduct,
      
      status: overallStatus,
      onboardedAt: new Date().toISOString(),
    };

    // Add to Firestore
    const banksRef = collection(db, "banks");
    const docRef = await addDoc(banksRef, newBank);
    
    // Update with ID
    newBank.id = docRef.id;
    await setDoc(docRef, { id: docRef.id }, { merge: true });

    // Generate credentials for this bank
    const credentials = generateCredentials(pfiName);

    // Update users (for login)
    const usersRef = collection(db, "users");
    for (const c of credentials) {
      await addDoc(usersRef, {
        email: c.email,
        password: c.password,
        role: c.role,
        bank: pfiName,
      });
    }

    // Return onboarding result
    return NextResponse.json({
      ok: true,
      message: `PFI ${pfiName} onboarded successfully`,
      pfi: newBank,
      verification: {
        cbn: cbnCheck,
        rc: rcCheck,
        ndic: ndicCheck,
      },
      credentials,
    });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal error during onboarding" },
      { status: 500 }
    );
  }
}
