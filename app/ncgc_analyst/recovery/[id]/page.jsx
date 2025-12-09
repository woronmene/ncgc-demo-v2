"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, RefreshCw, AlertTriangle, CheckCircle, Clock, XCircle, FileText, Plus } from "lucide-react";

export default function RecoveryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [recovery, setRecovery] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/recovery/${id}`);
        const data = await res.json();
        
        if (data.ok) {
          setRecovery(data.recovery);
          
          // Load application
          if (data.recovery.applicationId) {
            const appRes = await fetch(`/api/applications/${data.recovery.applicationId}`);
            const appData = await appRes.json();
            if (appData.ok) {
              setApplication(appData.application);
            }
          }
        }
      } catch (err) {
        console.error("Error loading recovery:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/recovery/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        // Reload recovery data
        const recoveryRes = await fetch(`/api/recovery/${id}`);
        const recoveryData = await recoveryRes.json();
        if (recoveryData.ok) {
          setRecovery(recoveryData.recovery);
        }
        setShowStatusModal(false);
        setNewStatus("");
        setStatusNotes("");
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

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

  if (!recovery) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Recovery process not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/ncgc_analyst/recovery")}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Recovery
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Recovery Process Details
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Application ID: {recovery.applicationId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(recovery.status)}
          {recovery.status !== "completed" && recovery.status !== "closed" && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
            >
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Recovery Summary */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <RefreshCw className="text-emerald-600 mr-2" size={20} />
          Recovery Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Business Name</p>
            <p className="font-medium text-gray-800">{recovery.businessName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
            <p className="font-medium text-gray-800">₦{Number(recovery.loanAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Claim Amount Paid</p>
            <p className="font-medium text-gray-800">₦{Number(recovery.claimAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Recovery Amount</p>
            <p className="font-medium text-emerald-700 text-lg">₦{Number(recovery.recoveryAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Recovery Method</p>
            <p className="font-medium text-gray-800">{recovery.recoveryMethod || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Priority</p>
            <p className="font-medium text-gray-800 capitalize">{recovery.priority || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Assigned To</p>
            <p className="font-medium text-gray-800">{recovery.assignedTo || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Started At</p>
            <p className="font-medium text-gray-800">
              {recovery.startedAt ? new Date(recovery.startedAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {recovery.notes && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{recovery.notes}</p>
        </div>
      )}

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Recovery Milestones</h2>
          <button className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
            <Plus size={16} />
            Add Milestone
          </button>
        </div>
        {recovery.milestones && recovery.milestones.length > 0 ? (
          <div className="space-y-3">
            {recovery.milestones.map((milestone, index) => (
              <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                <p className="font-medium text-gray-800">{milestone.title}</p>
                <p className="text-sm text-gray-600">{milestone.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {milestone.date ? new Date(milestone.date).toLocaleDateString() : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No milestones added yet.</p>
        )}
      </div>

      {/* Link to Application */}
      {application && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-2">
            View the original application for more context
          </p>
          <button
            onClick={() => router.push(`/ncgc_analyst/dashboard/applications/${recovery.applicationId}`)}
            className="text-sm text-blue-700 hover:text-blue-800 font-medium underline"
          >
            View Application Details →
          </button>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Recovery Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800"
                  required
                >
                  <option value="">Select status...</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-gray-800"
                  placeholder="Add notes about the status update..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus("");
                  setStatusNotes("");
                }}
                disabled={updating}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

