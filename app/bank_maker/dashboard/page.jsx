"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, CheckCircle, Clock, XCircle } from "lucide-react";

export default function BankMakerDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [userBank, setUserBank] = useState("");

  // Get user's bank from cookie
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie;
      const bankMatch = cookies.match(/userBank=([^;]+)/);
      if (bankMatch) {
        setUserBank(decodeURIComponent(bankMatch[1]));
      }
    }
  }, []);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/applications");
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter applications to show only those created by this PFI/bank
          const filteredApps = userBank 
            ? data.filter(app => app.createdBy === userBank)
            : data;
          setApplications(filteredApps);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    }
    if (userBank) {
      fetchApplications();
    }
  }, [userBank]);

  const renderStatus = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="flex items-center justify-center text-emerald-700 font-medium">
            <CheckCircle size={16} className="mr-1" /> Approved
          </span>
        );
      case "Pending":
      case "Submitted":
      case "pending_ncgc_review":
        return (
          <span className="flex items-center justify-center text-amber-600 font-medium">
            <Clock size={16} className="mr-1" /> Pending
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center justify-center text-red-600 font-medium">
            <XCircle size={16} className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center text-gray-500">
            —
          </span>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            My Applications
          </h1>
          {userBank && (
            <p className="text-sm text-gray-500 mt-1">
              {userBank} • {applications.length} {applications.length === 1 ? 'application' : 'applications'}
            </p>
          )}
        </div>

        <Link
          href="/bank_maker/dashboard/create"
          className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} className="mr-2" /> Create Application
        </Link>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-left text-sm font-medium text-gray-700">
            <tr>
              <th className="p-4">Business Name</th>
              <th className="p-4">Loan Amount</th>
              <th className="p-4">Tenor</th>
              <th className="p-4">Coverage</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Submitted</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {applications.length > 0 ? (
              applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/bank_maker/dashboard/${app.id}`)}
                >
                  <td className="p-4 font-medium text-gray-800">
                    {app.businessName}
                  </td>

                  <td className="p-4 text-gray-600">
                    ₦{Number(app.loanAmount).toLocaleString()}
                  </td>

                  <td className="p-4 text-gray-600">
                    {(app.tenure || app.loanTenor) ?? "—"} months
                  </td>

                  <td className="p-4 text-gray-600">
                    {app.ncgc?.guaranteePercentage
                      ? `${app.ncgc.guaranteePercentage}%`
                      : "None"}
                  </td>

                  <td className="p-4 text-center">
                    {renderStatus(app.status)}
                  </td>

                  <td className="p-4 text-right text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500 bg-white"
                >
                  {userBank 
                    ? `No applications created by ${userBank} yet. Click "Create Application" to get started.`
                    : "No applications created yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
