"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await fetch("/api/banks");
        const data = await res.json();
        if (Array.isArray(data)) setBanks(data);
      } catch (err) {
        console.error("Error fetching banks:", err);
      }
    }
    fetchBanks();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Partner Banks</h1>
        <Link
          href="/ncgc_admin/dashboard/onboard"
          className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          <Plus size={18} className="mr-2" /> Onboard New Bank
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-left text-sm font-medium text-gray-700">
            <tr>
              <th className="p-4">Bank Name</th>
              <th className="p-4">CBN License</th>
              <th className="p-4">Contact Person</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Date Onboarded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {banks.length > 0 ? (
              banks.map((bank) => (
                <tr key={bank.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{bank.name}</td>
                  <td className="p-4 text-gray-600">{bank.cbnLicense}</td>
                  <td className="p-4 text-gray-600">{bank.contactPerson}</td>
                  <td className="p-4 text-gray-600">{bank.contactEmail}</td>
                  <td className="p-4 text-center">
                    {bank.status === "Verified" ? (
                      <span className="flex items-center justify-center text-emerald-700 font-medium">
                        <CheckCircle size={16} className="mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center justify-center text-amber-600 font-medium">
                        <Clock size={16} className="mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right text-gray-500">
                    {new Date(bank.onboardedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No banks onboarded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
