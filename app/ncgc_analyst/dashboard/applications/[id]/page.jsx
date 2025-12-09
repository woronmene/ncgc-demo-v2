// app/ncgc_analyst/dashboard/applications/[id]/page.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  FileText,
  Download,
  User,
  Eye,
  X,
  AlertTriangle,
  ShieldCheck,
  ChevronLeft,
  FileWarning,
  Clock,
} from "lucide-react";

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params?.id;

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [claim, setClaim] = useState(null);
  const [guarantee, setGuarantee] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Risk Simulation State
  const [riskScore, setRiskScore] = useState(75);
  const [isPrioritySector, setIsPrioritySector] = useState(false);
  const [riskCategory, setRiskCategory] = useState("");
  const [suggestedCoverage, setSuggestedCoverage] = useState(0);

  // Risk Score Breakdown
  const [creditScore, setCreditScore] = useState(70); // Simulated credit score (60-80)
  const [performanceBondPoints, setPerformanceBondPoints] = useState(0);
  const [collateralPoints, setCollateralPoints] = useState(0);
  const [businessFocusPoints, setBusinessFocusPoints] = useState(0);

  const mountedRef = useRef(true);

  // Helper function to calculate business focus points
  function calculateBusinessFocusPoints(thematicArea) {
    if (!thematicArea) return 0;

    const area = thematicArea.toLowerCase();

    // Priority sectors (highest points: 20)
    if (
      area.includes("agriculture") ||
      area.includes("agribusiness") ||
      area.includes("women") ||
      area.includes("youth") ||
      area.includes("green") ||
      area.includes("sustainable")
    ) {
      return 20;
    }

    // High priority sectors (15 points)
    if (
      area.includes("innovation") ||
      area.includes("technology") ||
      area.includes("manufacturing") ||
      area.includes("health") ||
      area.includes("education")
    ) {
      return 15;
    }

    // Medium priority sectors (10 points)
    if (
      area.includes("construction") ||
      area.includes("infrastructure") ||
      area.includes("transport") ||
      area.includes("logistics") ||
      area.includes("financial")
    ) {
      return 10;
    }

    // Lower priority sectors (5 points)
    if (
      area.includes("trade") ||
      area.includes("tourism") ||
      area.includes("business services") ||
      area.includes("mining")
    ) {
      return 5;
    }

    return 0;
  }

  useEffect(() => {
    mountedRef.current = true;
    async function load() {
      if (!appId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/applications/${appId}`);
        const data = await res.json();
        if (data?.ok) {
          setApplication(data.application);
          setComments(data.application.comments || []);
          if (data.application.ncgc?.guaranteePercentage) {
            setGuarantee(String(data.application.ncgc.guaranteePercentage));
          }

          // Load claim if exists
          if (data.application.claim?.id) {
            try {
              const claimRes = await fetch(
                `/api/claims/${data.application.claim.id}`
              );
              const claimData = await claimRes.json();
              if (claimData.ok) {
                setClaim(claimData.claim);
              }
            } catch (err) {
              console.error("Error loading claim:", err);
            }
          }

          // Check if sector matches priority sectors to auto-toggle
          const prioritySectors = [
            "Agriculture",
            "Green Energy",
            "Youth-Led",
            "Women-Led",
          ];
          const thematicArea = data.application.thematicArea || "";
          const isPriority = prioritySectors.some(
            (s) =>
              data.application.sector?.includes(s) ||
              thematicArea.includes(s) ||
              thematicArea.includes("Women") ||
              thematicArea.includes("Youth") ||
              thematicArea.includes("Agriculture") ||
              thematicArea.includes("Green")
          );

          if (isPriority) {
            setIsPrioritySector(true);
            setBusinessFocusPoints(20); // Highest points for priority sectors
          } else {
            // Calculate business focus points based on thematic area
            const focusPoints = calculateBusinessFocusPoints(thematicArea);
            setBusinessFocusPoints(focusPoints);
          }

          // Check for performance bond and collateral
          if (data.application.documents?.performanceBond) {
            setPerformanceBondPoints(10);
          }
          if (data.application.documents?.collateral) {
            setCollateralPoints(10);
          }

          // Simulate credit score (60-80 range)
          const simulatedCredit = Math.floor(Math.random() * 21) + 60; // 60-80
          setCreditScore(simulatedCredit);
        }
      } catch (err) {
        console.error("Fetch app error", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    load();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  // Calculate total risk score from components
  useEffect(() => {
    const totalScore =
      creditScore +
      performanceBondPoints +
      collateralPoints +
      businessFocusPoints;
    // Cap at 100
    const cappedScore = Math.min(100, totalScore);
    setRiskScore(cappedScore);
  }, [
    creditScore,
    performanceBondPoints,
    collateralPoints,
    businessFocusPoints,
  ]);

  // Calculate Risk Category and Coverage whenever risk score changes
  useEffect(() => {
    let category = "";
    let coverage = 0;

    if (isPrioritySector) {
      category = "Special High-Risk (Priority Sector)";
      coverage = 60;
    } else {
      if (riskScore >= 80) {
        category = "Low Risk";
        // Low risk: 50-55% guarantee
        // Map 80-100 to 50-55% (higher score = lower risk = lower coverage needed)
        coverage = Math.round(55 - ((riskScore - 80) / 20) * 5); // 80->55%, 100->50%
      } else if (riskScore >= 50) {
        category = "Moderate Risk";
        // Moderate risk: 55-60% guarantee
        // Map 50-79 to 55-60%
        coverage = Math.round(60 - ((riskScore - 50) / 29) * 5); // 50->60%, 79->55%
      } else {
        category = "High Risk";
        coverage = 60; // Max coverage for high risk
      }
    }

    setRiskCategory(category);
    setSuggestedCoverage(coverage);

    // Only auto-update guarantee if it hasn't been set by the backend yet
    if (!application?.ncgc?.guaranteePercentage) {
      setGuarantee(String(coverage));
    }
  }, [riskScore, isPrioritySector, application]);

  async function refreshComments() {
    try {
      const res = await fetch(`/api/applications/${appId}`);
      const data = await res.json();
      if (data?.ok) {
        setComments(data.application.comments || []);
      }
    } catch (err) {
      console.error("refresh comments", err);
    }
  }

  async function handleApprove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/applications/${appId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guaranteePercentage: Number(guarantee) }),
      });
      const data = await res.json();
      if (data?.ok) {
        router.push("/ncgc_analyst/dashboard");
      } else {
        alert(data?.message || "Failed to approve");
      }
    } catch (err) {
      console.error("approve err", err);
      alert("Approve failed");
    } finally {
      setBusy(false);
      setShowApproveModal(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/applications/${appId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data?.ok) {
        router.push("/ncgc_analyst/dashboard");
      } else {
        alert(data?.message || "Failed to reject");
      }
    } catch (err) {
      console.error("reject err", err);
      alert("Reject failed");
    } finally {
      setBusy(false);
      setShowRejectModal(false);
    }
  }

  const [commentText, setCommentText] = useState("");
  async function postComment(author = "ncgc") {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/applications/${appId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commentText, author }),
      });
      const data = await res.json();
      if (data?.ok) {
        setCommentText("");
        await refreshComments();
      } else {
        alert(data?.message || "Failed to post comment");
      }
    } catch (err) {
      console.error("comment err", err);
    }
  }

  const handlePreview = (doc, title) => {
    if (doc?.url) {
      setPreviewDoc({ ...doc, title });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!application) return <div>Application not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <button
        onClick={() => router.push("/ncgc_analyst/dashboard")}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl text-black font-semibold">
              {application.businessName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {application.businessAddress || "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Loan: ₦{Number(application.loanAmount).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2 text-right">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-lg text-black font-semibold">
              {application.status}
            </div>
          </div>
        </div>
      </div>

      {/* RISK ASSESSMENT CARD */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <ShieldCheck className="text-emerald-600 mr-2" size={20} />
            Risk Scorecard
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold 
            ${
              riskCategory.includes("Low")
                ? "bg-emerald-100 text-emerald-800"
                : riskCategory.includes("Moderate")
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {riskCategory}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Risk Score Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-4">
              Risk Score Calculation Breakdown
            </h4>
            <div className="space-y-3">
              {/* Credit Score */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    Credit Score (Simulated)
                  </p>
                  <p className="text-xs text-gray-500">
                    Based on credit history (60-80 range)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="60"
                    max="80"
                    value={creditScore}
                    onChange={(e) => setCreditScore(Number(e.target.value))}
                    disabled={
                      application.ncgc?.approved || application.ncgc?.rejected
                    }
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50"
                  />
                  <span className="text-sm font-bold text-emerald-600 w-12 text-right">
                    {creditScore}
                  </span>
                </div>
              </div>

              {/* Performance Bond */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    Performance Bond
                  </p>
                  <p className="text-xs text-gray-500">
                    {application.documents?.performanceBond
                      ? "Document uploaded"
                      : "No document uploaded"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {application.documents?.performanceBond ? (
                    <span className="text-sm font-bold text-emerald-600">
                      +10 points
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">+0 points</span>
                  )}
                </div>
              </div>

              {/* Collateral */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    Collateral Documents
                  </p>
                  <p className="text-xs text-gray-500">
                    {application.documents?.collateral
                      ? "Document uploaded"
                      : "No document uploaded"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {application.documents?.collateral ? (
                    <span className="text-sm font-bold text-emerald-600">
                      +10 points
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">+0 points</span>
                  )}
                </div>
              </div>

              {/* Business Focus */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    Business Focus / Thematic Area
                  </p>
                  <p className="text-xs text-gray-500">
                    {application.thematicArea || "Not specified"}
                    {isPrioritySector && " (Priority Sector)"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-600">
                    +{businessFocusPoints} points
                  </span>
                </div>
              </div>

              {/* Total Risk Score */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200 mt-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Total Risk Score
                  </p>
                  <p className="text-xs text-gray-600">
                    Sum of all components (max 100)
                  </p>
                </div>
                <span className="text-2xl font-bold text-emerald-700">
                  {riskScore}
                </span>
              </div>
            </div>
          </div>

          {/* Priority Sector Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Priority Sector Override
              </p>
              <p className="text-xs text-gray-500">
                Agriculture, Youth/Women-led, Green Energy (60% guarantee)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPrioritySector}
                onChange={(e) => {
                  setIsPrioritySector(e.target.checked);
                  if (e.target.checked) {
                    setBusinessFocusPoints(20);
                  } else {
                    setBusinessFocusPoints(
                      calculateBusinessFocusPoints(
                        application.thematicArea || ""
                      )
                    );
                  }
                }}
                disabled={
                  application.ncgc?.approved || application.ncgc?.rejected
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
            </label>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Results */}
          <div className="bg-emerald-50 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-emerald-100">
            <p className="text-sm text-emerald-800 font-medium uppercase tracking-wide mb-2">
              Suggested Guarantee Coverage
            </p>
            <div className="text-5xl font-bold text-emerald-700 mb-2">
              {suggestedCoverage}%
            </div>
            <p className="text-xs text-emerald-600 max-w-xs mb-3">
              Based on{" "}
              {isPrioritySector
                ? "Priority Sector status"
                : "calculated risk score"}{" "}
              and borrower profile.
            </p>
            <div className="text-xs text-gray-600 bg-white/60 rounded px-3 py-2 mt-2 mb-4">
              <p className="font-medium mb-1">Risk Category:</p>
              <p className="text-emerald-700">{riskCategory}</p>
            </div>

            <div className="mt-4 w-full flex gap-3">
              {application.ncgc?.approved ? (
                <div className="flex-1 px-4 py-3 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 font-medium flex items-center justify-center">
                  <CheckCircle size={18} className="mr-2" />
                  Application Approved
                </div>
              ) : application.ncgc?.rejected ? (
                <div className="flex-1 px-4 py-3 bg-red-100 text-red-800 rounded-lg border border-red-200 font-medium flex items-center justify-center">
                  <XCircle size={18} className="mr-2" />
                  Application Rejected
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setGuarantee(String(suggestedCoverage));
                      setShowApproveModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    Approve with {suggestedCoverage}%
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Information - Only show if application is approved */}
      {application.ncgc?.approved && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <FileWarning className="text-red-600 mr-2" size={20} />
              Claim Information
            </h3>
            {claim && (
              <button
                onClick={() => router.push(`/ncgc_analyst/claims/${claim.id}`)}
                className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                View Full Details
                <ChevronLeft size={16} className="rotate-180" />
              </button>
            )}
          </div>

          {claim ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Claim Amount</p>
                  <p className="text-lg font-semibold text-emerald-700">
                    ₦{Number(claim.claimAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Default Date</p>
                  <p className="text-sm font-medium text-gray-800">
                    {claim.defaultDate
                      ? new Date(claim.defaultDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {claim.status === "pending_review" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <Clock size={12} className="mr-1" />
                      Pending Review
                    </span>
                  ) : claim.status === "approved" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle size={12} className="mr-1" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle size={12} className="mr-1" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {claim.defaultReason && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Default Reason</p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {claim.defaultReason}
                  </p>
                </div>
              )}

              {claim.status === "pending_review" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Action Required
                  </p>
                  <p className="text-xs text-amber-700">
                    This claim is pending your review. Click "View Full Details"
                    to review and make a decision.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <FileWarning className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600">
                No claim has been submitted for this application yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
            Business Identity
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            <InfoRow label="RC Number" value={application.rcNumber} />
            <InfoRow label="TIN Number" value={application.tinNumber} />
            <InfoRow label="CAC Number" value={application.cacNumber} />
            <InfoRow label="Sector" value={application.sector} />
            <InfoRow label="Business Focus" value={application.thematicArea} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
            Loan Details
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            <InfoRow
              label="Amount"
              value={`₦${Number(application.loanAmount).toLocaleString()}`}
            />
            <InfoRow
              label="Tenure"
              value={`${application.tenure || "—"} months`}
            />
            <InfoRow label="Purpose" value={application.purpose} />
            <InfoRow label="Guarantee Type" value={application.guaranteeType} />
            <InfoRow
              label="Monthly Revenue"
              value={
                application.monthlyRevenue
                  ? `₦${Number(application.monthlyRevenue).toLocaleString()}`
                  : "—"
              }
            />
            <InfoRow
              label="Proposed Coverage"
              value={
                application.ncgc?.guaranteePercentage
                  ? `${application.ncgc.guaranteePercentage}%`
                  : "—"
              }
            />
          </div>
        </div>
      </div>

      {/* Directors/Owners */}
      {application.owners && application.owners.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
            Directors / Owners
          </h3>
          <div className="space-y-4">
            {application.owners.map((owner, index) => (
              <div
                key={owner.id || index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center mb-3">
                  <User size={20} className="text-emerald-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">
                    {owner.name || `Owner ${index + 1}`}
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <InfoRow label="Gender" value={owner.gender} />
                  <InfoRow label="State" value={owner.state} />
                  <InfoRow label="LGA" value={owner.lga} />
                  <InfoRow label="BVN" value={owner.bvnNumber} />
                  <InfoRow label="NIN" value={owner.ninNumber} />
                  {owner.validId && (
                    <div className="col-span-2 md:col-span-3">
                      <DocumentCard
                        title="Valid ID"
                        document={owner.validId}
                        onPreview={() =>
                          handlePreview(
                            owner.validId,
                            `${owner.name}'s Valid ID`
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
          Uploaded Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {application.documents?.incorporationCert && (
            <DocumentCard
              title="Certificate of Incorporation"
              document={application.documents.incorporationCert}
              onPreview={() =>
                handlePreview(
                  application.documents.incorporationCert,
                  "Certificate of Incorporation"
                )
              }
            />
          )}
          {application.documents?.taxClearance && (
            <DocumentCard
              title="Tax Clearance Certificate"
              document={application.documents.taxClearance}
              onPreview={() =>
                handlePreview(
                  application.documents.taxClearance,
                  "Tax Clearance Certificate"
                )
              }
            />
          )}
          {application.documents?.performanceBond && (
            <DocumentCard
              title="Performance Bond"
              document={application.documents.performanceBond}
              onPreview={() =>
                handlePreview(
                  application.documents.performanceBond,
                  "Performance Bond"
                )
              }
            />
          )}
          {application.documents?.collateral && (
            <DocumentCard
              title="Collateral Documents"
              document={application.documents.collateral}
              onPreview={() =>
                handlePreview(
                  application.documents.collateral,
                  "Collateral Documents"
                )
              }
            />
          )}
        </div>
        {!application.documents && (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        )}
      </div>

      {/* COMMENTS / CHAT */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Messages</h3>

        <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
          {comments.length === 0 ? (
            <div className="text-sm text-gray-500">No messages yet.</div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-lg ${
                  c.author === "ncgc" ? "bg-emerald-50 self-end" : "bg-gray-100"
                }`}
              >
                <div className="text-xs text-gray-500">
                  {c.author === "ncgc" ? "NCGC" : "Bank"} •{" "}
                  {new Date(c.timestamp).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-gray-800">{c.message}</div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-start gap-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            placeholder="Write a message..."
            className="flex-1 px-3 py-2 border rounded-lg text-black"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => postComment("ncgc")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
            >
              Send
            </button>
            <button
              onClick={() => {
                setCommentText("Thanks, we'll review and come back to you.");
                postComment("ncgc");
              }}
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
            >
              Quick
            </button>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex text-black items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirm Approval</h3>
            <p className="text-sm text-gray-600 mb-4">
              Adjust guarantee if needed and confirm approval.
            </p>

            <label className="block text-sm text-gray-600 mb-2">
              Guarantee Percentage
            </label>
            <input
              type="number"
              value={guarantee}
              onChange={(e) => setGuarantee(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 text-black"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={busy}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                {busy ? "Processing..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50  text-black flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Reject Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejection (required).
            </p>

            <label className="block text-sm text-gray-600 mb-2">Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg mb-4 text-black"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={busy || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                {busy ? "Processing..." : "Reject Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

// Helper Components
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}

function DocumentCard({ title, document, onPreview }) {
  if (!document || typeof document !== "object") return null;

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onDoubleClick={onPreview}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <FileText className="text-emerald-600 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-gray-800 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">
              {document.name || "Document"}
            </p>
            {document.status === "uploaded" && (
              <span className="inline-flex items-center mt-2 text-xs text-emerald-600">
                <CheckCircle size={12} className="mr-1" />
                Uploaded
              </span>
            )}
          </div>
        </div>
        {document.url && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              className="text-emerald-600 hover:text-emerald-700 transition-colors"
              title="Preview document"
            >
              <Eye size={18} />
            </button>
            <a
              href={document.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Download document"
            >
              <Download size={18} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentPreviewModal({ doc, onClose }) {
  if (!doc) return null;

  const isImage =
    doc.name?.match(/\.(jpeg|jpg|gif|png)$/i) ||
    doc.url?.match(/\.(jpeg|jpg|gif|png)$/i);
  const isPdf = doc.name?.match(/\.pdf$/i) || doc.url?.match(/\.pdf$/i);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 truncate pr-4">
            {doc.title || doc.name || "Document Preview"}
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={doc.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              title="Download"
            >
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-4">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.url}
              alt="Preview"
              className="max-w-full max-h-full object-contain shadow-lg rounded"
            />
          ) : (
            <iframe
              src={doc.url}
              className="w-full h-full rounded shadow-sm bg-white"
              title="Document Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
