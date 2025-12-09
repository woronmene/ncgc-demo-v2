"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, FileWarning, CheckCircle, XCircle, Clock, AlertCircle, Download, Eye, RefreshCw } from "lucide-react";

export default function ClaimDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [claim, setClaim] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewComments, setReviewComments] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [recoveryExists, setRecoveryExists] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Load claim
        const claimRes = await fetch(`/api/claims/${id}`);
        const claimData = await claimRes.json();
        
        if (claimData.ok) {
          setClaim(claimData.claim);
          
          // Load application
          if (claimData.claim.applicationId) {
            const appRes = await fetch(`/api/applications/${claimData.claim.applicationId}`);
            const appData = await appRes.json();
            if (appData.ok) {
              setApplication(appData.application);
              // Check if recovery already exists for this application
              if (appData.application.recovery?.id) {
                setRecoveryExists(true);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading claim:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleReview = async (action) => {
    if (action === "approve") {
      setShowApproveModal(true);
      return;
    }
    
    if (action === "reject") {
      if (!reviewComments.trim()) {
        alert("Please provide review comments for rejection");
        return;
      }
      setShowRejectModal(true);
      return;
    }
  };

  const confirmApprove = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/claims/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          comments: reviewComments,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Network error occurred" }));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.ok) {
        setShowApproveModal(false);
        // Reload claim data
        const claimRes = await fetch(`/api/claims/${id}`);
        const claimData = await claimRes.json();
        if (claimData.ok) {
          setClaim(claimData.claim);
          setReviewComments("");
        }
      } else {
        alert(data.message || "Failed to process claim review");
      }
    } catch (err) {
      console.error("Review error:", err);
      alert(`Error processing review: ${err.message || "Unknown error occurred"}`);
    } finally {
      setProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!reviewComments.trim()) {
      alert("Please provide review comments for rejection");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/claims/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          comments: reviewComments,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setShowRejectModal(false);
        // Reload claim data
        const claimRes = await fetch(`/api/claims/${id}`);
        const claimData = await claimRes.json();
        if (claimData.ok) {
          setClaim(claimData.claim);
          setReviewComments("");
        }
      } else {
        alert(data.message || "Failed to process claim review");
      }
    } catch (err) {
      console.error("Review error:", err);
      alert("Error processing review");
    } finally {
      setProcessing(false);
    }
  };

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
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Claim not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/ncgc_analyst/claims")}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Claims
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Claim Review
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Application ID: {claim.applicationId}
          </p>
        </div>
        {getStatusBadge(claim.status)}
      </div>

      {/* Claim Summary */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <FileWarning className="text-red-600 mr-2" size={20} />
          Claim Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Business Name</p>
            <p className="font-medium text-gray-800">{claim.businessName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
            <p className="font-medium text-gray-800">₦{Number(claim.loanAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Guarantee Coverage</p>
            <p className="font-medium text-gray-800">{claim.guaranteePercentage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Claim Amount</p>
            <p className="font-medium text-emerald-700 text-lg">₦{Number(claim.claimAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Default Date</p>
            <p className="font-medium text-gray-800">
              {claim.defaultDate ? new Date(claim.defaultDate).toLocaleDateString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Submitted At</p>
            <p className="font-medium text-gray-800">
              {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Outstanding Amounts */}
      {(claim.totalOutstanding || claim.principalOutstanding || claim.interestOutstanding || claim.penaltyOutstanding) && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Outstanding Amounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {claim.totalOutstanding && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Outstanding</p>
                <p className="font-medium text-gray-800">₦{Number(claim.totalOutstanding).toLocaleString()}</p>
              </div>
            )}
            {claim.principalOutstanding && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Principal Outstanding</p>
                <p className="font-medium text-gray-800">₦{Number(claim.principalOutstanding).toLocaleString()}</p>
              </div>
            )}
            {claim.interestOutstanding && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Interest Outstanding</p>
                <p className="font-medium text-gray-800">₦{Number(claim.interestOutstanding).toLocaleString()}</p>
              </div>
            )}
            {claim.penaltyOutstanding && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Penalty Outstanding</p>
                <p className="font-medium text-gray-800">₦{Number(claim.penaltyOutstanding).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Default Reason */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Default Reason</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{claim.defaultReason || "—"}</p>
      </div>

      {/* Actions Taken */}
      {claim.actionsTaken && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Actions Taken to Recover</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{claim.actionsTaken}</p>
        </div>
      )}

      {/* Supporting Documents */}
      {claim.supportingDocuments && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Supporting Documents</h2>
          <div className="flex items-center gap-4">
            {claim.supportingDocuments.url && (
              <>
                <a
                  href={claim.supportingDocuments.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Eye size={18} />
                  View Document
                </a>
                <a
                  href={claim.supportingDocuments.url}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download size={18} />
                  Download
                </a>
              </>
            )}
            <p className="text-sm text-gray-600">{claim.supportingDocuments.name || "Document"}</p>
          </div>
        </div>
      )}

      {/* Review Section - Only show if pending */}
      {claim.status === "pending_review" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Review & Decision</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Comments
              </label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800"
                placeholder="Enter your review comments..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Comments are required when rejecting a claim
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleReview("approve")}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve Claim
              </button>
              <button
                onClick={() => handleReview("reject")}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review History */}
      {claim.reviewedAt && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Review History</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Reviewed By</p>
              <p className="font-medium text-gray-800">{claim.reviewedBy || "NCGC Analyst"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reviewed At</p>
              <p className="font-medium text-gray-800">
                {new Date(claim.reviewedAt).toLocaleString()}
              </p>
            </div>
            {claim.reviewComments && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Review Comments</p>
                <p className="text-gray-700 whitespace-pre-wrap">{claim.reviewComments}</p>
              </div>
            )}
            {claim.payment && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Payment Information</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium text-emerald-800">
                    Amount Paid: ₦{Number(claim.payment.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Payment Reference: {claim.payment.paymentReference}
                  </p>
                  <p className="text-xs text-emerald-700">
                    Paid At: {claim.payment.paidAt ? new Date(claim.payment.paidAt).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recovery Process Section - Show for approved claims */}
      {claim.status === "approved" && claim.payment?.status === "paid" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <RefreshCw className="text-emerald-600 mr-2" size={20} />
            Recovery Process
          </h2>
          
          {recoveryExists ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">
                Recovery Process Already Started
              </p>
              <p className="text-xs text-blue-700 mb-3">
                A recovery process has already been initiated for this claim. You can view and manage it from the Recovery section.
              </p>
              <button
                onClick={() => {
                  // Get recovery ID from application
                  if (application?.recovery?.id) {
                    router.push(`/ncgc_analyst/recovery/${application.recovery.id}`);
                  } else {
                    router.push("/ncgc_analyst/recovery");
                  }
                }}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium underline"
              >
                View Recovery Process →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Next Step:</strong> Since this claim has been approved and paid, you can now initiate a recovery process to recover the paid amount from the defaulting borrower.
                </p>
                <p className="text-xs text-gray-600">
                  The recovery process will help track efforts to recover ₦{Number(claim.claimAmount || 0).toLocaleString()} that was paid to the PFI.
                </p>
              </div>
              
              <button
                onClick={() => {
                  // Navigate to recovery create page with pre-filled application ID
                  router.push(`/ncgc_analyst/recovery/create?applicationId=${claim.applicationId}`);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <RefreshCw size={18} />
                Start Recovery Process
              </button>
            </div>
          )}
        </div>
      )}

      {/* Link to Application */}
      {application && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-2">
            View the original application for more context
          </p>
          <button
            onClick={() => router.push(`/ncgc_analyst/dashboard/applications/${claim.applicationId}`)}
            className="text-sm text-blue-700 hover:text-blue-800 font-medium underline"
          >
            View Application Details →
          </button>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle className="text-emerald-600" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
              Approve Claim and Pay?
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to approve this claim and process payment to the PFI?
            </p>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
              <p className="text-2xl font-bold text-emerald-700">
                ₦{Number(claim.claimAmount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This amount will be paid to the Partner Financial Institution
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing Payment..." : "Approve Claim and Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="text-red-600" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
              Reject Claim?
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to reject this claim? This action cannot be undone.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> Review comments are required for rejection. Please ensure you have provided detailed comments explaining the reason for rejection.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={processing || !reviewComments.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Reject Claim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

