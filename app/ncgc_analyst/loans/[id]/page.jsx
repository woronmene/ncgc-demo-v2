// app/ncgc_analyst/loans/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, Info, XCircle, ChevronLeft, FileWarning, Clock, Eye } from "lucide-react";

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [claim, setClaim] = useState(null);
  
  // Simulation State
  const [daysPastDue, setDaysPastDue] = useState(0);
  const [savingDPD, setSavingDPD] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/applications/${id}`);
        const data = await res.json();
        if (data.ok) {
          setLoan(data.application);
          // Load stored DPD if available
          if (data.application.loan?.daysPastDue !== undefined) {
            setDaysPastDue(data.application.loan.daysPastDue);
          }
          
          // Load claim if exists
          if (data.application.claim?.id) {
            try {
              const claimRes = await fetch(`/api/claims/${data.application.claim.id}`);
              const claimData = await claimRes.json();
              if (claimData.ok) {
                setClaim(claimData.claim);
              }
            } catch (err) {
              console.error("Error loading claim:", err);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [id]);

  // Re-generate schedule whenever loan or daysPastDue changes
  useEffect(() => {
    if (loan) {
      generateSchedule(loan, daysPastDue);
    }
  }, [loan, daysPastDue]);

  // Save DPD to database when changed (with debounce)
  useEffect(() => {
    if (!loan || daysPastDue === (loan.loan?.daysPastDue || 0)) return;

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
          // Update local loan state
          setLoan(prev => ({
            ...prev,
            loan: { ...prev.loan, daysPastDue }
          }));
        }
      } catch (err) {
        console.error("Error saving DPD:", err);
      } finally {
        setSavingDPD(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [daysPastDue, id, loan]);

  function generateSchedule(app, dpd) {
    const months = Number(app.tenure || app.loanTenor);
    const amountPerMonth = Math.round(Number(app.loanAmount) / months);

    const scheduleItems = [];
    const now = new Date();

    // Let's assume the loan started 3 months ago for simulation purposes
    const loanStartDate = new Date();
    loanStartDate.setMonth(now.getMonth() - 3);

    for (let i = 1; i <= months; i++) {
      const due = new Date(loanStartDate);
      due.setMonth(loanStartDate.getMonth() + i);

      let status = "Pending";
      let overdueDays = 0;

      // Logic: 
      // Month 1 & 2 are paid.
      // Month 3 is the one that might be overdue based on 'dpd'.
      
      if (i <= 2) {
        status = "Paid";
      } else if (i === 3) {
        // This is the current active installment in our simulation
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
        overdueDays
      });
    }

    setSchedule(scheduleItems);
  }

  const getGrading = (dpd) => {
    if (dpd <= 30) return { label: "Performing", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Fully performing, low risk.", icon: CheckCircle };
    if (dpd <= 60) return { label: "Watch List", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", desc: "Early signs of weakness in repayment performance.", icon: AlertTriangle };
    if (dpd <= 90) return { label: "Substandard", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", desc: "Significant arrears; repayment issues becoming serious.", icon: AlertTriangle };
    if (dpd <= 180) return { label: "Doubtful", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", desc: "Major repayment problems; account is close to default.", icon: AlertTriangle };
    return { label: "Loss / Default", color: "text-red-900", bg: "bg-red-100", border: "border-red-300", desc: "The account is in default; claim initiation is required.", icon: XCircle };
  };

  const grading = getGrading(daysPastDue);
  const Icon = grading.icon;

  if (!loan) return <div>Loading...</div>;

  return (
    <div className="space-y-8 text-black max-w-5xl mx-auto p-6">
      <button
        onClick={() => router.push("/ncgc_analyst/loans")}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Loans
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Loan Monitoring – {loan.businessName}
        </h1>
        <div className="text-sm text-gray-500">
          Loan ID: {loan.id}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SUMMARY */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Loan Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Loan Amount</p>
              <p className="font-medium text-lg">₦{Number(loan.loanAmount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Tenor</p>
              <p className="font-medium text-lg">{loan.tenure || loan.loanTenor} months</p>
            </div>
            <div>
              <p className="text-gray-500">Guarantee Coverage</p>
              <p className="font-medium text-lg">{loan.ncgc?.guaranteePercentage}%</p>
            </div>
            <div>
              <p className="text-gray-500">Current Status</p>
              <p className="font-medium text-lg">Ongoing</p>
            </div>
          </div>
        </div>

        {/* GRADING CARD */}
        <div className={`p-6 rounded-xl shadow-sm border ${grading.bg} ${grading.border}`}>
          <div className="flex items-start justify-between mb-4">
            <h2 className={`text-lg font-bold ${grading.color} flex items-center gap-2`}>
              <Icon size={20} />
              {grading.label}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/60 ${grading.color}`}>
              {daysPastDue} Days Past Due
            </span>
          </div>
          <p className={`text-sm ${grading.color} opacity-90`}>
            {grading.desc}
          </p>
          
          {/* Simulation Control */}
          <div className="mt-8 pt-4 border-t border-black/5">
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Simulate Days Past Due
            </label>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={daysPastDue} 
              onChange={(e) => setDaysPastDue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
            />
            <div className="flex justify-between text-xs mt-1 opacity-50">
              <span>0d</span>
              <span>90d</span>
              <span>180d+</span>
            </div>
            {savingDPD && (
              <p className="text-xs text-gray-500 mt-2 text-center">Saving...</p>
            )}
          </div>
        </div>
      </div>

      {/* Claim Information - Show when DPD > 180 or claim exists */}
      {(daysPastDue > 180 || claim) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <FileWarning className="text-red-600 mr-2" size={20} />
              Claim Information
            </h2>
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
                  <p className="text-sm text-gray-700 line-clamp-2">{claim.defaultReason}</p>
                </div>
              )}

              {claim.status === "pending_review" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Action Required
                  </p>
                  <p className="text-xs text-amber-700">
                    This claim is pending your review. Click "View Full Details" to review and make a decision.
                  </p>
                </div>
              )}
            </div>
          ) : daysPastDue > 180 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="text-red-600 mr-3 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Loan in Default
                  </p>
                  <p className="text-xs text-red-700 mb-3">
                    This loan has exceeded 180 days past due and is in default. A claim may be initiated by the PFI.
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Note:</strong> Adjust the "Days Past Due" slider above to simulate different scenarios. 
                    When DPD exceeds 180 days, PFIs can initiate claims for the guaranteed portion.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* REPAYMENT SCHEDULE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
                <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{row.month}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(row.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-gray-900 font-medium">₦{Number(row.amount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        row.status === "Paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : row.status === "Overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    `}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {row.overdueDays > 0 ? (
                      <span className="text-red-600 font-medium">{row.overdueDays} days</span>
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
    </div>
  );
}
