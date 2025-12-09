// app/ncgc_analyst/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

export default function AnalystDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/applications", { cache: "no-store" });
        const data = await res.json();
        if (mounted && Array.isArray(data)) setApplications(data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const renderStatus = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="flex items-center text-emerald-700 font-medium">
            <CheckCircle size={16} className="mr-1" /> Approved
          </span>
        );
      case "Pending":
      case "Submitted":
        return (
          <span className="flex items-center text-amber-600 font-medium">
            <Clock size={16} className="mr-1" /> Pending
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center text-red-600 font-medium">
            <XCircle size={16} className="mr-1" /> Rejected
          </span>
        );
      default:
        return <span className="text-gray-500">—</span>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          All Applications
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-left text-sm font-medium text-gray-700">
            <tr>
              <th className="p-4">Business Name</th>
              <th className="p-4">Loan Amount</th>
              <th className="p-4">Tenor</th>
              <th className="p-4">Suggested Guarantee</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Submitted</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Loader2
                      className="animate-spin mb-2 text-emerald-600"
                      size={32}
                    />
                    <p>Loading applications...</p>
                  </div>
                </td>
              </tr>
            ) : applications.length > 0 ? (
              applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/ncgc_analyst/dashboard/applications/${app.id}`
                    )
                  }
                >
                  <td className="p-4 font-medium text-gray-800">
                    {app.businessName}
                  </td>
                  <td className="p-4 text-gray-600">
                    ₦{Number(app.loanAmount).toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-600">
                    {app.tenure || app.loanTenor || "—"} months
                  </td>
                  <td className="p-4 text-gray-600">
                    {app.ncgc?.guaranteePercentage
                      ? `${app.ncgc.guaranteePercentage}%`
                      : "—"}
                  </td>
                  <td className="p-4 text-center">
                    {renderStatus(app.status)}
                  </td>
                  <td className="p-4 text-right text-gray-500">
                    {new Date(
                      app.createdAt || app.submittedAt || Date.now()
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No applications available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
