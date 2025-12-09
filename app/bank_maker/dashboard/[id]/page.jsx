// app/bank_maker/dashboard/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Send,
  FileText,
  Download,
  CheckCircle,
  User,
  Eye,
  X,
  ChevronLeft,
  AlertTriangle,
  XCircle,
  FileWarning,
} from "lucide-react";

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Repayment Schedule State
  const [schedule, setSchedule] = useState([]);
  const [daysPastDue, setDaysPastDue] = useState(0);
  const [savingDPD, setSavingDPD] = useState(false);

  // Fetch application details
  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(`/api/applications/${id}`);
        const data = await res.json();

        if (data.ok) {
          setApp(data.application);
          // Generate repayment schedule if approved
          if (data.application.ncgc?.approved) {
            // Use stored daysPastDue if available, otherwise default to 0
            const dpd = data.application.loan?.daysPastDue || 0;
            setDaysPastDue(dpd);
            generateSchedule(data.application, dpd);
          }

          // Load claim if exists
          if (data.application.claim?.id) {
            try {
              const claimRes = await fetch(
                `/api/claims/${data.application.claim.id}`
              );
              const claimData = await claimRes.json();
              if (claimData.ok) {
                // Claim will be shown in the UI based on claim status
              }
            } catch (err) {
              console.error("Error loading claim:", err);
            }
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [id]);

  // Generate repayment schedule
  function generateSchedule(app, dpd) {
    const months = Number(app.tenure || app.loanTenor);
    if (!months) return;

    const amountPerMonth = Math.round(Number(app.loanAmount) / months);
    const scheduleItems = [];
    const now = new Date();

    // Assume loan started 3 months ago for simulation
    const loanStartDate = new Date();
    loanStartDate.setMonth(now.getMonth() - 3);

    for (let i = 1; i <= months; i++) {
      const due = new Date(loanStartDate);
      due.setMonth(loanStartDate.getMonth() + i);

      let status = "Pending";
      let overdueDays = 0;

      // Month 1 & 2 are paid, Month 3 might be overdue
      if (i <= 2) {
        status = "Paid";
      } else if (i === 3) {
        if (dpd > 0) {
          status = "Overdue";
          overdueDays = dpd;
        } else {
          status = "Pending";
        }
      } else {
        status = "Pending";
      }

      scheduleItems.push({
        month: i,
        amount: amountPerMonth,
        dueDate: due.toISOString(),
        status,
        overdueDays,
      });
    }

    setSchedule(scheduleItems);
  }

  // Save DPD to database when changed (with debounce)
  useEffect(() => {
    if (
      !app ||
      !app.ncgc?.approved ||
      daysPastDue === (app.loan?.daysPastDue || 0)
    )
      return;

    const timeoutId = setTimeout(async () => {
      setSavingDPD(true);
      try {
        const res = await fetch(`/api/applications/${id}/loan-dpd`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daysPastDue }),
        });
        const data = await res.json();
        if (data.ok) {
          // Update local app state
          setApp((prev) => ({
            ...prev,
            loan: { ...prev.loan, daysPastDue },
          }));
        }
      } catch (err) {
        console.error("Error saving DPD:", err);
      } finally {
        setSavingDPD(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [daysPastDue, id, app]);

  // Re-generate schedule when DPD changes
  useEffect(() => {
    if (app && app.ncgc?.approved) {
      generateSchedule(app, daysPastDue);
    }
  }, [daysPastDue, app]);

  const getGrading = (dpd) => {
    if (dpd <= 30)
      return {
        label: "Performing",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        desc: "Fully performing, low risk.",
        icon: CheckCircle,
      };
    if (dpd <= 60)
      return {
        label: "Watch List",
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        desc: "Early signs of weakness in repayment performance.",
        icon: AlertTriangle,
      };
    if (dpd <= 90)
      return {
        label: "Substandard",
        color: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-200",
        desc: "Significant arrears; repayment issues becoming serious.",
        icon: AlertTriangle,
      };
    if (dpd <= 180)
      return {
        label: "Doubtful",
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        desc: "Major repayment problems; account is close to default.",
        icon: AlertTriangle,
      };
    return {
      label: "Loss / Default",
      color: "text-red-900",
      bg: "bg-red-100",
      border: "border-red-300",
      desc: "The account is in default; claim initiation is required.",
      icon: XCircle,
    };
  };

  const grading = app?.ncgc?.approved ? getGrading(daysPastDue) : null;
  const Icon = grading?.icon;

  const sendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);

    try {
      const res = await fetch(`/api/applications/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          author: "bank",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setApp((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), data.comment],
        }));
        setMessage("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
    setSending(false);
  };

  const handlePreview = (doc, title) => {
    if (doc?.url) {
      setPreviewDoc({ ...doc, title });
    }
  };

  if (loading || !app)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/bank_maker/dashboard")}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          Application Details
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Application ID: {app.id}</p>
      </div>

      {/* Business Summary Card */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
          Business Summary
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Field label="Business Name" value={app.businessName} />
          <Field label="Sector" value={app.sector} />
          <Field label="Business Focus" value={app.thematicArea} />
          <Field label="RC Number" value={app.rcNumber} />
          <Field label="TIN Number" value={app.tinNumber} />
          <Field label="CAC Number" value={app.cacNumber} />
          <Field
            label="Loan Amount"
            value={`₦${Number(app.loanAmount).toLocaleString()}`}
          />
          <Field
            label="Loan Tenor"
            value={`${app.tenure || app.loanTenor || "—"} months`}
          />
          <Field label="Guarantee Type" value={app.guaranteeType} />
          <Field
            label="Monthly Revenue"
            value={
              app.monthlyRevenue
                ? `₦${Number(app.monthlyRevenue).toLocaleString()}`
                : "—"
            }
          />
        </div>

        <div className="mt-3">
          <Field label="Loan Purpose" value={app.purpose || app.loanPurpose} />
        </div>
      </div>

      {/* Directors/Owners */}
      {app.owners && app.owners.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
            Directors / Owners
          </h2>

          <div className="space-y-4">
            {app.owners.map((owner, index) => (
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
                  <Field label="Gender" value={owner.gender} />
                  <Field label="State of Origin" value={owner.state} />
                  <Field label="LGA" value={owner.lga} />
                  <Field label="BVN Number" value={owner.bvnNumber} />
                  <Field label="NIN Number" value={owner.ninNumber} />
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

      {/* Uploaded Documents */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
          Uploaded Documents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {app.documents?.incorporationCert && (
            <DocumentCard
              title="Certificate of Incorporation"
              document={app.documents.incorporationCert}
              onPreview={() =>
                handlePreview(
                  app.documents.incorporationCert,
                  "Certificate of Incorporation"
                )
              }
            />
          )}
          {app.documents?.taxClearance && (
            <DocumentCard
              title="Tax Clearance Certificate"
              document={app.documents.taxClearance}
              onPreview={() =>
                handlePreview(
                  app.documents.taxClearance,
                  "Tax Clearance Certificate"
                )
              }
            />
          )}
          {app.documents?.performanceBond && (
            <DocumentCard
              title="Performance Bond"
              document={app.documents.performanceBond}
              onPreview={() =>
                handlePreview(app.documents.performanceBond, "Performance Bond")
              }
            />
          )}
          {app.documents?.collateral && (
            <DocumentCard
              title="Collateral Documents"
              document={app.documents.collateral}
              onPreview={() =>
                handlePreview(app.documents.collateral, "Collateral Documents")
              }
            />
          )}
        </div>

        {!app.documents && (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        )}
      </div>

      {/* Status Information */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
          Application Status
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Field label="Current Status" value={app.status} />
          <Field
            label="NCGC Approved"
            value={app.ncgc?.approved ? "Yes" : "No"}
          />
          <Field
            label="Guarantee Coverage"
            value={
              app.ncgc?.guaranteePercentage
                ? `${app.ncgc.guaranteePercentage}%`
                : "—"
            }
          />
          <Field
            label="Bank Approved"
            value={app.bank?.approved ? "Yes" : "No"}
          />
          <Field
            label="Created At"
            value={
              app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"
            }
          />
          {app.claim && (
            <Field
              label="Claim Status"
              value={
                app.claim.status === "pending_review"
                  ? "Pending Review"
                  : app.claim.status === "approved"
                  ? "Approved"
                  : app.claim.status === "rejected"
                  ? "Rejected"
                  : "Unknown"
              }
            />
          )}
        </div>
        {app.claim && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">
              Claim Information
            </p>
            <p className="text-xs text-blue-700">
              {app.claim.status === "pending_review"
                ? "A claim request has been submitted and is under review by NCGC."
                : app.claim.status === "approved"
                ? "Your claim has been approved by NCGC."
                : "Your claim request was rejected. Please check the review comments for details."}
            </p>
            <button
              onClick={() => router.push(`/bank_maker/dashboard/${id}/claim`)}
              className="mt-2 text-sm text-blue-700 hover:text-blue-800 font-medium underline"
            >
              View Claim Details
            </button>
          </div>
        )}
      </div>

      {/* Repayment Tracking - Only show if approved */}
      {app.ncgc?.approved && (
        <>
          {/* Loan Performance Summary */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
                Loan Repayment Tracking
              </h2>
              {/* Claim Button - Show if DPD > 180 or claim exists */}
              {(daysPastDue > 180 || app.claim) && (
                <button
                  onClick={() =>
                    router.push(`/bank_maker/dashboard/${id}/claim`)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    daysPastDue > 180 && !app.claim
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : app.claim?.status === "pending_review"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : app.claim?.status === "approved"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  <FileWarning size={18} />
                  {app.claim?.status === "pending_review"
                    ? "View Claim"
                    : app.claim?.status === "approved"
                    ? "View Paid Claim"
                    : daysPastDue > 180
                    ? "Create Claim"
                    : "Initiate Claim"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Loan Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                <p className="text-sm text-gray-600">Loan Amount</p>
                <p className="text-lg font-semibold text-gray-800">
                  ₦{Number(app.loanAmount).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                <p className="text-sm text-gray-600">Tenor</p>
                <p className="text-lg font-semibold text-gray-800">
                  {app.tenure || app.loanTenor} months
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                <p className="text-sm text-gray-600">Guarantee Coverage</p>
                <p className="text-lg font-semibold text-gray-800">
                  {app.ncgc?.guaranteePercentage}%
                </p>
              </div>
            </div>

            {/* Loan Grading Card */}
            {grading && (
              <div
                className={`mt-4 p-6 rounded-xl border ${grading.bg} ${grading.border}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className={`text-lg font-bold ${grading.color} flex items-center gap-2`}
                  >
                    <Icon size={20} />
                    {grading.label}
                  </h3>
                  {daysPastDue > 0 && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold bg-white/60 ${grading.color}`}
                    >
                      {daysPastDue} Days Past Due
                    </span>
                  )}
                </div>
                <p className={`text-sm ${grading.color} opacity-90 mb-4`}>
                  {grading.desc}
                </p>

                {/* DPD Simulation Control */}
                <div className="mt-6 pt-4 border-t border-black/10">
                  <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                    Simulate Days Past Due
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={daysPastDue}
                    onChange={(e) => setDaysPastDue(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs mt-1 opacity-60">
                    <span>0d</span>
                    <span>90d</span>
                    <span>180d+</span>
                  </div>
                  {savingDPD && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Saving...
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Adjust the slider to simulate different payment scenarios.
                    When DPD exceeds 180 days, you can initiate a claim.
                  </p>
                </div>

                {daysPastDue > 0 && (
                  <div className="mt-4 pt-4 border-t border-black/10">
                    {app.claim?.status === "pending_review" ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          Claim Request Submitted
                        </p>
                        <p className="text-xs text-blue-700 mb-3">
                          Your claim request is currently under review by NCGC.
                          You will be notified once a decision is made.
                        </p>
                        <button
                          onClick={() =>
                            router.push(`/bank_maker/dashboard/${id}/claim`)
                          }
                          className="text-sm text-blue-700 hover:text-blue-800 font-medium underline"
                        >
                          View Claim Details
                        </button>
                      </div>
                    ) : daysPastDue > 180 ? (
                      <>
                        <p className="text-sm font-medium text-red-800 mb-3">
                          This loan is in default. You can initiate a claim to
                          recover the guaranteed portion of unpaid amounts.
                        </p>
                        <button
                          onClick={() =>
                            router.push(`/bank_maker/dashboard/${id}/claim`)
                          }
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          <FileWarning size={18} />
                          Initiate Claim Request
                        </button>
                      </>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-amber-800 mb-2">
                          Payment Overdue
                        </p>
                        <p className="text-xs text-amber-700 mb-3">
                          This loan has overdue payments. If the borrower
                          continues to default, you may initiate a claim once
                          the account reaches 180+ days past due.
                        </p>
                        {daysPastDue > 90 && (
                          <button
                            onClick={() =>
                              router.push(`/bank_maker/dashboard/${id}/claim`)
                            }
                            className="text-sm px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                          >
                            Prepare Claim (Early)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Repayment Schedule */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Repayment Schedule
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="p-4 rounded-l-lg">Month</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 rounded-r-lg">Days Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {schedule.map((row) => (
                    <tr
                      key={row.month}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-900">
                        {row.month}
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(row.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-900 font-medium">
                        ₦{Number(row.amount).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            row.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : row.status === "Overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        `}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {row.overdueDays > 0 ? (
                          <span className="text-red-600 font-medium">
                            {row.overdueDays} days
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Comments Chat */}
      <div
        className="bg-white p-6 rounded-xl shadow flex flex-col"
        style={{ height: "450px" }}
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Messages</h2>

        {/* Chat scroll area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {(app.comments || []).map((c) => (
            <ChatBubble key={c.id} comment={c} />
          ))}
        </div>

        {/* Input box */}
        <div className="flex items-center mt-4 border rounded-lg p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            className="ml-2 bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-emerald-700 transition-colors"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>

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

/* ---------------------------- */
/* Helper Components            */
/* ---------------------------- */

function Field({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}

function ChatBubble({ comment }) {
  const isNCGC = comment.author === "ncgc";

  return (
    <div className={`flex ${isNCGC ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg text-sm shadow
          ${isNCGC ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"}
        `}
      >
        <p>{comment.message}</p>
        <p className="text-[10px] opacity-70 mt-1">
          {new Date(comment.timestamp).toLocaleString()}
        </p>
      </div>
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
