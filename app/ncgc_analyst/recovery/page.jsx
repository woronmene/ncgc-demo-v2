"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Plus, AlertTriangle, CheckCircle, Clock, XCircle, Eye } from "lucide-react";

export default function RecoveryPage() {
  const router = useRouter();
  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecoveries() {
      try {
        const res = await fetch("/api/recovery", { cache: "no-store" });
        const data = await res.json();
        if (data.ok && Array.isArray(data.recoveries)) {
          setRecoveries(data.recoveries);
        }
      } catch (err) {
        console.error("Error fetching recoveries:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecoveries();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "initiated":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={14} className="mr-1" />
            Initiated
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <RefreshCw size={14} className="mr-1" />
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle size={14} className="mr-1" />
            Completed
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle size={14} className="mr-1" />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Recovery Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Monitor and manage recovery processes for defaulted loans
          </p>
        </div>
        <button
          onClick={() => router.push("/ncgc_analyst/recovery/create")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Start Recovery Process
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-2 text-emerald-600" size={32} />
              <p>Loading recovery processes...</p>
            </div>
          </div>
        ) : recoveries.length > 0 ? (
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-left text-sm font-medium text-gray-700">
              <tr>
                <th className="p-4">Business Name</th>
                <th className="p-4">Recovery Amount</th>
                <th className="p-4">Recovery Method</th>
                <th className="p-4">Started</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recoveries.map((recovery) => (
                <tr
                  key={recovery.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium text-gray-800">
                    {recovery.businessName || "—"}
                  </td>
                  <td className="p-4 text-gray-900 font-medium">
                    ₦{Number(recovery.recoveryAmount || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-600">
                    {recovery.recoveryMethod || "—"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {recovery.startedAt
                      ? new Date(recovery.startedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(recovery.status)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => router.push(`/ncgc_analyst/recovery/${recovery.id}`)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Eye size={16} className="mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <RefreshCw className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg font-medium mb-2">No Recovery Processes</p>
            <p className="text-gray-400 text-sm mb-4">
              Start a recovery process to recover funds from defaulted loans.
            </p>
            <button
              onClick={() => router.push("/ncgc_analyst/recovery/create")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Start Recovery Process
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

