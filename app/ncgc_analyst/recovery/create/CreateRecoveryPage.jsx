"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

function CreateRecoveryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [form, setForm] = useState({
    applicationId: "",
    recoveryMethod: "",
    recoveryAmount: "",
    assignedTo: "",
    priority: "medium",
    notes: "",
  });

  useEffect(() => {
    async function loadApplications() {
      try {
        // Check if applicationId is provided in URL params
        const applicationIdParam = searchParams.get("applicationId");

        if (applicationIdParam) {
          // Load specific application
          const res = await fetch(`/api/applications/${applicationIdParam}`);
          const data = await res.json();
          if (data.ok && data.application) {
            // Check if eligible for recovery
            if (
              data.application.ncgc?.approved &&
              data.application.claim?.status === "approved" &&
              data.application.claim?.payment?.status === "paid" &&
              !data.application.recovery?.id
            ) {
              setApplications([data.application]);
              setForm((prev) => ({
                ...prev,
                applicationId: applicationIdParam,
              }));
            } else {
              setApplications([]);
            }
          }
        } else {
          // Load all approved applications with claims that have been paid
          const res = await fetch("/api/applications");
          const data = await res.json();
          if (Array.isArray(data)) {
            // Filter for applications with approved claims and no existing recovery
            const eligibleApps = data.filter(
              (app) =>
                app.ncgc?.approved &&
                app.claim?.status === "approved" &&
                app.claim?.payment?.status === "paid" &&
                !app.recovery?.id
            );
            setApplications(eligibleApps);
          }
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, [searchParams]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-fill recovery amount when application is selected
  useEffect(() => {
    if (form.applicationId) {
      const selectedApp = applications.find(
        (app) => app.id === form.applicationId
      );
      if (selectedApp && selectedApp.claim?.payment?.amount) {
        setForm((prev) => ({
          ...prev,
          recoveryAmount: selectedApp.claim.payment.amount.toString(),
        }));
      }
    }
  }, [form.applicationId, applications]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.applicationId || !form.recoveryMethod || !form.recoveryAmount) {
      setModalData({
        ok: false,
        message: "Please fill in all required fields",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setModalData(data);
    } catch (error) {
      console.error("Submit error:", error);
      setModalData({ ok: false, message: "Network or server error" });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalData(null);
    if (modalData?.ok) {
      router.push("/ncgc_analyst/recovery");
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/ncgc_analyst/recovery")}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Recovery
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <RefreshCw className="text-emerald-600" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Start Recovery Process
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Initiate a recovery process to recover funds from a defaulted loan
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-start">
          <AlertCircle className="text-blue-600 mr-3 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">
              Recovery Process Information
            </p>
            <p className="text-sm text-blue-700">
              Recovery processes are initiated for loans where claims have been
              paid. The goal is to recover the paid amount from the defaulting
              borrower through various recovery methods.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-6"
      >
        {/* Application Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Application (with Paid Claim) *
          </label>
          <select
            value={form.applicationId}
            onChange={(e) => handleChange("applicationId", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
            disabled={
              searchParams.get("applicationId") !== null &&
              applications.length === 1
            }
          >
            <option value="">Select an application...</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.businessName} - Claim: ₦
                {Number(app.claim?.payment?.amount || 0).toLocaleString()}
              </option>
            ))}
          </select>
          {applications.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {searchParams.get("applicationId")
                ? "This application is not eligible for recovery (may already have a recovery process or claim not paid)."
                : "No applications with paid claims available. Claims must be approved and paid first."}
            </p>
          )}
          {searchParams.get("applicationId") && applications.length === 1 && (
            <p className="text-xs text-emerald-600 mt-1">
              Application pre-selected from claim. You can proceed to fill in
              recovery details.
            </p>
          )}
        </div>

        {/* Recovery Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recovery Method *
          </label>
          <select
            value={form.recoveryMethod}
            onChange={(e) => handleChange("recoveryMethod", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800"
            required
          >
            <option value="">Select recovery method...</option>
            <option value="negotiation">Negotiation & Settlement</option>
            <option value="collateral_liquidation">
              Collateral Liquidation
            </option>
            <option value="legal_action">Legal Action</option>
            <option value="debt_collection_agency">
              Debt Collection Agency
            </option>
            <option value="restructuring">Loan Restructuring</option>
            <option value="asset_seizure">Asset Seizure</option>
          </select>
        </div>

        {/* Recovery Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recovery Amount (₦) *
          </label>
          <input
            type="number"
            value={form.recoveryAmount}
            onChange={(e) => handleChange("recoveryAmount", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800"
            placeholder="Enter recovery amount"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This should match or be less than the claim amount paid
          </p>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={form.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <input
            type="text"
            value={form.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800"
            placeholder="Enter assignee name or department"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800"
            placeholder="Add any additional notes or instructions..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/ncgc_analyst/recovery")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || applications.length === 0}
            className={`px-8 py-3 rounded-lg text-white font-medium transition-all ${
              submitting || applications.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {submitting ? "Creating..." : "Start Recovery Process"}
          </button>
        </div>
      </form>

      {/* Success/Error Modal */}
      {modalData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md">
            {modalData.ok ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="text-emerald-600" size={48} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                  Recovery Process Started
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  The recovery process has been initiated successfully.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <XCircle className="text-red-500" size={48} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                  Failed to Start Recovery
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  {modalData.message}
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => setModalData(null)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateRecoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 flex justify-center">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      }
    >
      <CreateRecoveryForm />
    </Suspense>
  );
}
