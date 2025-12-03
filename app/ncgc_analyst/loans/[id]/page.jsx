// app/ncgc_analyst/loans/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export default function LoanDetailsPage() {
  const params = useParams();
  const id = params?.id;

  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  
  // Simulation State
  const [daysPastDue, setDaysPastDue] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/applications/${id}`);
        const data = await res.json();
        if (data.ok) {
          setLoan(data.application);
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
          </div>
        </div>
      </div>

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
