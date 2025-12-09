"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, FileWarning, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function CreateClaimPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [form, setForm] = useState({
    claimAmount: "",
    defaultDate: "",
    totalOutstanding: "",
    principalOutstanding: "",
    interestOutstanding: "",
    penaltyOutstanding: "",
    defaultReason: "",
    actionsTaken: "",
    supportingDocuments: null,
  });

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(`/api/applications/${id}`);
        const data = await res.json();
        if (data.ok) {
          setApplication(data.application);
          
          // If claim already exists, load it
          if (data.application.claim?.id) {
            try {
              const claimRes = await fetch(`/api/claims/${data.application.claim.id}`);
              const claimData = await claimRes.json();
              if (claimData.ok && claimData.claim) {
                const existingClaim = claimData.claim;
                setForm({
                  claimAmount: existingClaim.claimAmount?.toString() || "",
                  defaultDate: existingClaim.defaultDate || "",
                  totalOutstanding: existingClaim.totalOutstanding?.toString() || "",
                  principalOutstanding: existingClaim.principalOutstanding?.toString() || "",
                  interestOutstanding: existingClaim.interestOutstanding?.toString() || "",
                  penaltyOutstanding: existingClaim.penaltyOutstanding?.toString() || "",
                  defaultReason: existingClaim.defaultReason || "",
                  actionsTaken: existingClaim.actionsTaken || "",
                  supportingDocuments: existingClaim.supportingDocuments || null,
                });
              }
            } catch (err) {
              console.error("Fetch claim error:", err);
            }
          } else {
            // Pre-fill claim amount based on guarantee percentage for new claims
            if (data.application.ncgc?.guaranteePercentage && data.application.loanAmount) {
              const guaranteeAmount = (Number(data.application.loanAmount) * data.application.ncgc.guaranteePercentage) / 100;
              setForm(prev => ({
                ...prev,
                claimAmount: Math.round(guaranteeAmount).toString(),
                totalOutstanding: data.application.loanAmount.toString(),
              }));
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

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (field, file) => {
    if (!file) return;

    try {
      // Get Signed URL
      const path = `claims/${id}_${Date.now()}_${file.name}`;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          filename: path,
          contentType: file.type 
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, readUrl } = await res.json();

      // Upload to GCS
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      setForm(prev => ({
        ...prev,
        [field]: { name: file.name, status: "uploaded", url: readUrl }
      }));
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.claimAmount || !form.defaultDate || !form.defaultReason) {
      setModalData({
        ok: false,
        message: "Please fill in all required fields (Claim Amount, Default Date, Default Reason)"
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/applications/${id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          applicationId: id,
        }),
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
      router.push(`/bank_maker/dashboard/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!application) {
    return <div>Application not found</div>;
  }

  if (!application.ncgc?.approved) {
    return (
      <div className="p-10 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Application Not Approved
          </h2>
          <p className="text-gray-600 mb-4">
            Claims can only be initiated for approved loan guarantee applications.
          </p>
          <button
            onClick={() => router.push(`/bank_maker/dashboard/${id}`)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Application
          </button>
        </div>
      </div>
    );
  }

  const guaranteeAmount = application.ncgc?.guaranteePercentage 
    ? (Number(application.loanAmount) * application.ncgc.guaranteePercentage) / 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-8">
        <button
          onClick={() => router.push(`/bank_maker/dashboard/${id}`)}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Application
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-lg">
            <FileWarning className="text-red-600" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {application?.claim ? "Claim Request Details" : "Initiate Claim Request"}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {application?.claim 
                ? "View and manage your submitted claim request"
                : "Submit a claim for the guaranteed portion of unpaid loan amounts"
              }
            </p>
          </div>
        </div>

        {/* Application Summary */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Application Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Business Name</p>
              <p className="font-medium text-gray-800">{application.businessName}</p>
            </div>
            <div>
              <p className="text-gray-500">Loan Amount</p>
              <p className="font-medium text-gray-800">₦{Number(application.loanAmount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Guarantee Coverage</p>
              <p className="font-medium text-gray-800">{application.ncgc?.guaranteePercentage}%</p>
            </div>
            <div>
              <p className="text-gray-500">Max Claimable</p>
              <p className="font-medium text-emerald-700">₦{Math.round(guaranteeAmount).toLocaleString()}</p>
            </div>
          </div>
        </div>

          {/* Claim Status Alert */}
          {application?.claim && (
            <div className={`border-l-4 p-4 rounded-r-lg ${
              application.claim.status === "approved" 
                ? "bg-emerald-50 border-emerald-500"
                : application.claim.status === "rejected"
                ? "bg-red-50 border-red-500"
                : "bg-blue-50 border-blue-500"
            }`}>
              <div className="flex items-start">
                <AlertCircle className={`mr-3 mt-0.5 ${
                  application.claim.status === "approved" 
                    ? "text-emerald-600"
                    : application.claim.status === "rejected"
                    ? "text-red-600"
                    : "text-blue-600"
                }`} size={20} />
                <div>
                  <p className={`text-sm font-medium mb-1 ${
                    application.claim.status === "approved" 
                      ? "text-emerald-800"
                      : application.claim.status === "rejected"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}>
                    Claim Status: {application.claim.status === "pending_review" ? "Pending Review" : 
                                   application.claim.status === "approved" ? "Approved" : "Rejected"}
                  </p>
                  <p className={`text-sm ${
                    application.claim.status === "approved" 
                      ? "text-emerald-700"
                      : application.claim.status === "rejected"
                      ? "text-red-700"
                      : "text-blue-700"
                  }`}>
                    {application.claim.status === "pending_review"
                      ? "Your claim request is currently under review by NCGC. You will be notified once a decision is made."
                      : application.claim.status === "approved"
                      ? "Your claim has been approved. Payment processing will be initiated."
                      : "Your claim request was rejected. Please review the comments and contact NCGC for more information."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Alert - Only show for new claims */}
          {!application?.claim && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <AlertCircle className="text-amber-600 mr-3 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Important: Claim Information
                  </p>
                  <p className="text-sm text-amber-700">
                    You can claim up to {application.ncgc?.guaranteePercentage}% of the outstanding loan amount 
                    (maximum ₦{Math.round(guaranteeAmount).toLocaleString()}). Ensure all information provided is accurate 
                    and supported by documentation.
                  </p>
                </div>
              </div>
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Claim Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim Amount (₦) *
            </label>
            <input
              type="number"
              value={form.claimAmount}
              onChange={(e) => handleChange("claimAmount", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter claim amount"
              required
              max={guaranteeAmount}
              disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum claimable: ₦{Math.round(guaranteeAmount).toLocaleString()} ({application.ncgc?.guaranteePercentage}% of loan amount)
            </p>
          </div>

          {/* Default Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Date *
            </label>
            <input
              type="date"
              value={form.defaultDate}
              onChange={(e) => handleChange("defaultDate", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
            />
          </div>

          {/* Outstanding Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Outstanding Amount (₦)
              </label>
              <input
                type="number"
                value={form.totalOutstanding}
                onChange={(e) => handleChange("totalOutstanding", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Total outstanding"
                disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Principal Outstanding (₦)
              </label>
              <input
                type="number"
                value={form.principalOutstanding}
                onChange={(e) => handleChange("principalOutstanding", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Principal outstanding"
                disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Outstanding (₦)
              </label>
              <input
                type="number"
                value={form.interestOutstanding}
                onChange={(e) => handleChange("interestOutstanding", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Interest outstanding"
                disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penalty Outstanding (₦)
              </label>
              <input
                type="number"
                value={form.penaltyOutstanding}
                onChange={(e) => handleChange("penaltyOutstanding", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Penalty outstanding"
                disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
              />
            </div>
          </div>

          {/* Default Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Default *
            </label>
            <textarea
              value={form.defaultReason}
              onChange={(e) => handleChange("defaultReason", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Provide detailed reason for the default..."
              required
              disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
            />
          </div>

          {/* Actions Taken */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actions Taken to Recover
            </label>
            <textarea
              value={form.actionsTaken}
              onChange={(e) => handleChange("actionsTaken", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Describe actions taken to recover the loan before initiating this claim..."
              disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
            />
          </div>

          {/* Supporting Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                className="hidden"
                id="supportingDocs"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileChange("supportingDocuments", e.target.files[0]);
                  }
                }}
                disabled={application?.claim?.status === "pending_review" || application?.claim?.status === "approved"}
              />
              <label
                htmlFor="supportingDocs"
                className={`flex flex-col items-center ${
                  application?.claim?.status === "pending_review" || application?.claim?.status === "approved"
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                {form.supportingDocuments?.status === "uploaded" ? (
                  <>
                    <CheckCircle className="text-emerald-600 mb-2" size={32} />
                    <p className="text-sm font-medium text-gray-800">{form.supportingDocuments.name}</p>
                    <p className="text-xs text-emerald-600 mt-1">Uploaded successfully</p>
                  </>
                ) : (
                  <>
                    <FileWarning className="text-gray-400 mb-2" size={32} />
                    <p className="text-sm font-medium text-gray-700">Click to upload supporting documents</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, or image files</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/bank_maker/dashboard/${id}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              {application?.claim ? "Back to Application" : "Cancel"}
            </button>
            {!application?.claim && (
              <button
                type="submit"
                disabled={submitting}
                className={`px-8 py-3 rounded-lg text-white font-medium transition-all ${
                  submitting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Claim Request"}
              </button>
            )}
          </div>
        </form>
      </div>

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
                  Claim Request Submitted
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  Your claim request has been submitted successfully and is pending review by NCGC.
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
                  Submission Failed
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

