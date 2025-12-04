"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/applications");
        const data = await res.json();
        if (Array.isArray(data)) {
          setLoans(data.filter((a) => a.status === "Approved"));
        }
      } catch (err) {
        console.error("Error fetching loans:", err);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Ongoing Loans
      </h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-left text-sm font-medium text-gray-700">
            <tr>
              <th className="p-4">Business Name</th>
              <th className="p-4">Loan Amount</th>
              <th className="p-4">Tenor</th>
              <th className="p-4">Guarantee %</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody  className="divide-y divide-gray-100 text-sm">
            {loans.length > 0 ? (
              loans.map((loan) => (
                <tr onClick={() => router.push(`/ncgc_analyst/loans/${loan.id}`)} key={loan.id} className="hover:bg-gray-50 cursor-pointer transition">
                  <td className="p-4 font-medium text-gray-800">
                    {loan.businessName}
                  </td>
                  <td className="p-4 text-gray-600">
                    ₦{Number(loan.loanAmount).toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-600">
                    {loan.tenure || loan.loanTenor} months
                  </td>
                  <td className="p-4 text-gray-600">
                    {loan.ncgc.guaranteePercentage}%
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/ncgc_analyst/loans/${loan.id}`}
                      className="text-emerald-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500 bg-white"
                >
                  No ongoing loans.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
