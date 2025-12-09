"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileWarning, CheckCircle, Clock, XCircle, Eye, ChevronRight } from "lucide-react";

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClaims() {
      try {
        const res = await fetch("/api/claims", { cache: "no-store" });
        const data = await res.json();
        if (data.ok && Array.isArray(data.claims)) {
          setClaims(data.claims);
        }
      } catch (err) {
        console.error("Error fetching claims:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClaims();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_review":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock size={14} className="mr-1" />
            Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle size={14} className="mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={14} className="mr-1" />
            Rejected
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
            Claims Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Review and manage claim requests from Partner Financial Institutions
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-2 text-emerald-600" size={32} />
              <p>Loading claims...</p>
            </div>
          </div>
        ) : claims.length > 0 ? (
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-left text-sm font-medium text-gray-700">
              <tr>
                <th className="p-4">Business Name</th>
                <th className="p-4">Claim Amount</th>
                <th className="p-4">Default Date</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {claims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium text-gray-800">
                    {claim.businessName || "—"}
                  </td>
                  <td className="p-4 text-gray-900 font-medium">
                    ₦{Number(claim.claimAmount || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-600">
                    {claim.defaultDate 
                      ? new Date(claim.defaultDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {claim.submittedAt
                      ? new Date(claim.submittedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(claim.status)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => router.push(`/ncgc_analyst/claims/${claim.id}`)}
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
            <FileWarning className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg font-medium mb-2">No Claims Found</p>
            <p className="text-gray-400 text-sm">
              There are no claim requests at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

