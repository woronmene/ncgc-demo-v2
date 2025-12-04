// app/ncgc_analyst/dashboard/applications/[id]/page.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle, XCircle, FileText, Download, User, Eye, X, AlertTriangle, ShieldCheck, ChevronLeft } from "lucide-react";

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params?.id;

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [guarantee, setGuarantee] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  
  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Risk Simulation State
  const [riskScore, setRiskScore] = useState(75);
  const [isPrioritySector, setIsPrioritySector] = useState(false);
  const [riskCategory, setRiskCategory] = useState("");
  const [suggestedCoverage, setSuggestedCoverage] = useState(0);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    async function load() {
      if (!appId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/applications/${appId}`);
        const data = await res.json();
        if (data?.ok) {
          setApplication(data.application);
          setComments(data.application.comments || []);
          if (data.application.ncgc?.guaranteePercentage) {
            setGuarantee(String(data.application.ncgc.guaranteePercentage));
          }
          
          // Check if sector matches priority sectors to auto-toggle
          const prioritySectors = ["Agriculture", "Green Energy", "Youth-Led", "Women-Led"];
          if (prioritySectors.some(s => data.application.sector?.includes(s) || data.application.thematicArea?.includes(s))) {
            setIsPrioritySector(true);
          }
        }
      } catch (err) {
        console.error("Fetch app error", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    load();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  // Calculate Risk Category and Coverage whenever inputs change
  useEffect(() => {
    let category = "";
    let coverage = 0;

    if (isPrioritySector) {
      category = "Special High-Risk (Priority Sector)";
      coverage = 60;
    } else {
      if (riskScore >= 80) {
        category = "Low Risk";
        // Map 80-100 to 50-55%
        // 80 -> 55%, 100 -> 50% (Higher score = lower risk = lower coverage needed? Or strictly 50-55 range)
        // Let's just say 50% for very high score, 55% for 80.
        // Actually, usually better risk = lower guarantee needed.
        coverage = 50; 
      } else if (riskScore >= 50) {
        category = "Moderate Risk";
        coverage = 55;
      } else {
        category = "High Risk";
        coverage = 60;
      }
    }

    setRiskCategory(category);
    setSuggestedCoverage(coverage);
    
    // Only auto-update guarantee if it hasn't been set by the backend yet (i.e. first load simulation)
    // or if we want the simulation to drive the input. Let's make the simulation drive the input for now.
    if (!application?.ncgc?.guaranteePercentage) {
      setGuarantee(String(coverage));
    }
  }, [riskScore, isPrioritySector, application]);

  async function refreshComments() {
    try {
      const res = await fetch(`/api/applications/${appId}`);
      const data = await res.json();
      if (data?.ok) {
        setComments(data.application.comments || []);
      }
    } catch (err) {
      console.error("refresh comments", err);
    }
  }

  async function handleApprove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/applications/${appId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guaranteePercentage: Number(guarantee) }),
      });
      const data = await res.json();
      if (data?.ok) {
        router.push("/ncgc_analyst/dashboard");
      } else {
        alert(data?.message || "Failed to approve");
      }
    } catch (err) {
      console.error("approve err", err);
      alert("Approve failed");
    } finally {
      setBusy(false);
      setShowApproveModal(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/applications/${appId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data?.ok) {
        router.push("/ncgc_analyst/dashboard");
      } else {
        alert(data?.message || "Failed to reject");
      }
    } catch (err) {
      console.error("reject err", err);
      alert("Reject failed");
    } finally {
      setBusy(false);
      setShowRejectModal(false);
    }
  }

  const [commentText, setCommentText] = useState("");
  async function postComment(author = "ncgc") {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/applications/${appId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commentText, author }),
      });
      const data = await res.json();
      if (data?.ok) {
        setCommentText("");
        await refreshComments();
      } else {
        alert(data?.message || "Failed to post comment");
      }
    } catch (err) {
      console.error("comment err", err);
    }
  }

  const handlePreview = (doc, title) => {
    if (doc?.url) {
      setPreviewDoc({ ...doc, title });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!application) return <div>Application not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <button
        onClick={() => router.push("/ncgc_analyst/dashboard")}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl text-black font-semibold">
              {application.businessName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {application.businessAddress || "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Loan: ₦{Number(application.loanAmount).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2 text-right">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-lg text-black font-semibold">
              {application.status}
            </div>
          </div>
        </div>
      </div>

      {/* RISK ASSESSMENT CARD */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <ShieldCheck className="text-emerald-600 mr-2" size={20} />
            Risk Assessment & Guarantee Simulation
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold 
            ${riskCategory.includes("Low") ? "bg-emerald-100 text-emerald-800" : 
              riskCategory.includes("Moderate") ? "bg-amber-100 text-amber-800" : 
              "bg-red-100 text-red-800"}`}>
            {riskCategory}
          </span>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Simulation Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Risk Score (0-100)</label>
                <span className="text-sm font-bold text-emerald-600">{riskScore}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={riskScore} 
                onChange={(e) => setRiskScore(Number(e.target.value))}
                disabled={application.ncgc?.approved || application.ncgc?.rejected}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>High Risk</span>
                <span>Moderate</span>
                <span>Low Risk</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">Priority Sector?</p>
                <p className="text-xs text-gray-500">Agriculture, Youth/Women-led, Green Energy</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPrioritySector} 
                  onChange={(e) => setIsPrioritySector(e.target.checked)} 
                  disabled={application.ncgc?.approved || application.ncgc?.rejected}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="bg-emerald-50 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-emerald-100">
            <p className="text-sm text-emerald-800 font-medium uppercase tracking-wide mb-2">Suggested Guarantee Coverage</p>
            <div className="text-5xl font-bold text-emerald-700 mb-2">
              {suggestedCoverage}%
            </div>
            <p className="text-xs text-emerald-600 max-w-xs">
              Based on {isPrioritySector ? "Priority Sector status" : "calculated risk score"} and borrower profile.
            </p>

            <div className="mt-6 w-full flex gap-3">
              {application.ncgc?.approved ? (
                <div className="flex-1 px-4 py-3 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 font-medium flex items-center justify-center">
                  <CheckCircle size={18} className="mr-2" />
                  Application Approved
                </div>
              ) : application.ncgc?.rejected ? (
                <div className="flex-1 px-4 py-3 bg-red-100 text-red-800 rounded-lg border border-red-200 font-medium flex items-center justify-center">
                  <XCircle size={18} className="mr-2" />
                  Application Rejected
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setGuarantee(String(suggestedCoverage));
                      setShowApproveModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    Approve with {suggestedCoverage}%
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
            Business Identity
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            <InfoRow label="RC Number" value={application.rcNumber} />
            <InfoRow label="TIN Number" value={application.tinNumber} />
            <InfoRow label="CAC Number" value={application.cacNumber} />
            <InfoRow label="Sector" value={application.sector} />
            <InfoRow label="Business Focus" value={application.thematicArea} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
            Loan Details
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            <InfoRow
              label="Amount"
              value={`₦${Number(application.loanAmount).toLocaleString()}`}
            />
            <InfoRow
              label="Tenure"
              value={`${application.tenure || "—"} months`}
            />
            <InfoRow label="Purpose" value={application.purpose} />
            <InfoRow label="Guarantee Type" value={application.guaranteeType} />
            <InfoRow
              label="Monthly Revenue"
              value={application.monthlyRevenue ? `₦${Number(application.monthlyRevenue).toLocaleString()}` : "—"}
            />
            <InfoRow
              label="Proposed Coverage"
              value={
                application.ncgc?.guaranteePercentage
                  ? `${application.ncgc.guaranteePercentage}%`
                  : "—"
              }
            />
          </div>
        </div>
      </div>

      {/* Directors/Owners */}
      {application.owners && application.owners.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
            Directors / Owners
          </h3>
          <div className="space-y-4">
            {application.owners.map((owner, index) => (
              <div
                key={owner.id || index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center mb-3">
                  <User size={20} className="text-emerald-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">
                    {owner.name || `Owner ${index + 1}`}
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <InfoRow label="Gender" value={owner.gender} />
                  <InfoRow label="State" value={owner.state} />
                  <InfoRow label="LGA" value={owner.lga} />
                  <InfoRow label="BVN" value={owner.bvnNumber} />
                  <InfoRow label="NIN" value={owner.ninNumber} />
                  {owner.validId && (
                    <div className="col-span-2 md:col-span-3">
                      <DocumentCard
                        title="Valid ID"
                        document={owner.validId}
                        onPreview={() => handlePreview(owner.validId, `${owner.name}'s Valid ID`)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
          Uploaded Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {application.documents?.incorporationCert && (
            <DocumentCard
              title="Certificate of Incorporation"
              document={application.documents.incorporationCert}
              onPreview={() => handlePreview(application.documents.incorporationCert, "Certificate of Incorporation")}
            />
          )}
          {application.documents?.taxClearance && (
            <DocumentCard
              title="Tax Clearance Certificate"
              document={application.documents.taxClearance}
              onPreview={() => handlePreview(application.documents.taxClearance, "Tax Clearance Certificate")}
            />
          )}
          {application.documents?.performanceBond && (
            <DocumentCard
              title="Performance Bond"
              document={application.documents.performanceBond}
              onPreview={() => handlePreview(application.documents.performanceBond, "Performance Bond")}
            />
          )}
        </div>
        {!application.documents && (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        )}
      </div>

      {/* COMMENTS / CHAT */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Messages</h3>

        <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
          {comments.length === 0 ? (
            <div className="text-sm text-gray-500">No messages yet.</div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-lg ${
                  c.author === "ncgc" ? "bg-emerald-50 self-end" : "bg-gray-100"
                }`}
              >
                <div className="text-xs text-gray-500">
                  {c.author === "ncgc" ? "NCGC" : "Bank"} •{" "}
                  {new Date(c.timestamp).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-gray-800">{c.message}</div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-start gap-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            placeholder="Write a message..."
            className="flex-1 px-3 py-2 border rounded-lg text-black"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => postComment("ncgc")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
            >
              Send
            </button>
            <button
              onClick={() => {
                setCommentText("Thanks, we'll review and come back to you.");
                postComment("ncgc");
              }}
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
            >
              Quick
            </button>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex text-black items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirm Approval</h3>
            <p className="text-sm text-gray-600 mb-4">
              Adjust guarantee if needed and confirm approval.
            </p>

            <label className="block text-sm text-gray-600 mb-2">
              Guarantee Percentage
            </label>
            <input
              type="number"
              value={guarantee}
              onChange={(e) => setGuarantee(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 text-black"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={busy}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                {busy ? "Processing..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50  text-black flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Reject Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejection (required).
            </p>

            <label className="block text-sm text-gray-600 mb-2">Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg mb-4 text-black"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={busy || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                {busy ? "Processing..." : "Reject Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

// Helper Components
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}

function DocumentCard({ title, document, onPreview }) {
  if (!document || typeof document !== 'object') return null;
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onDoubleClick={onPreview}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <FileText className="text-emerald-600 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-gray-800 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">{document.name || "Document"}</p>
            {document.status === "uploaded" && (
              <span className="inline-flex items-center mt-2 text-xs text-emerald-600">
                <CheckCircle size={12} className="mr-1" />
                Uploaded
              </span>
            )}
          </div>
        </div>
        {document.url && (
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              className="text-emerald-600 hover:text-emerald-700 transition-colors"
              title="Preview document"
            >
              <Eye size={18} />
            </button>
            <a 
              href={document.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Download document"
            >
              <Download size={18} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentPreviewModal({ doc, onClose }) {
  if (!doc) return null;

  const isImage = doc.name?.match(/\.(jpeg|jpg|gif|png)$/i) || doc.url?.match(/\.(jpeg|jpg|gif|png)$/i);
  const isPdf = doc.name?.match(/\.pdf$/i) || doc.url?.match(/\.pdf$/i);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 truncate pr-4">
            {doc.title || doc.name || "Document Preview"}
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={doc.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              title="Download"
            >
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-4">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={doc.url} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain shadow-lg rounded"
            />
          ) : (
            <iframe
              src={doc.url}
              className="w-full h-full rounded shadow-sm bg-white"
              title="Document Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
