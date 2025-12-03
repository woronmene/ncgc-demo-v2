// app/bank_maker/dashboard/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, Send, FileText, Download, CheckCircle, User, Eye, X } from "lucide-react";

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Fetch application details
  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(`/api/applications/${id}`);
        const data = await res.json();

        if (data.ok) setApp(data.application);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [id]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);

    try {
      const res = await fetch(`/api/applications/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          author: "bank",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setApp((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), data.comment],
        }));
        setMessage("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
    setSending(false);
  };

  const handlePreview = (doc, title) => {
    if (doc?.url) {
      setPreviewDoc({ ...doc, title });
    }
  };

  if (loading || !app)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Application Details
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Application ID: {app.id}</p>
      </div>

      {/* Business Summary Card */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
          Business Summary
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Field label="Business Name" value={app.businessName} />
          <Field label="Sector" value={app.sector} />
          <Field label="Business Focus" value={app.thematicArea} />
          <Field label="RC Number" value={app.rcNumber} />
          <Field label="TIN Number" value={app.tinNumber} />
          <Field label="CAC Number" value={app.cacNumber} />
          <Field
            label="Loan Amount"
            value={`₦${Number(app.loanAmount).toLocaleString()}`}
          />
          <Field
            label="Loan Tenor"
            value={`${app.tenure || app.loanTenor || "—"} months`}
          />
          <Field label="Guarantee Type" value={app.guaranteeType} />
          <Field 
            label="Monthly Revenue" 
            value={app.monthlyRevenue ? `₦${Number(app.monthlyRevenue).toLocaleString()}` : "—"} 
          />
        </div>

        <div className="mt-3">
          <Field
            label="Loan Purpose"
            value={app.purpose || app.loanPurpose}
          />
        </div>
      </div>

      {/* Directors/Owners */}
      {app.owners && app.owners.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
            Directors / Owners
          </h2>

          <div className="space-y-4">
            {app.owners.map((owner, index) => (
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
                  <Field label="Gender" value={owner.gender} />
                  <Field label="State of Origin" value={owner.state} />
                  <Field label="LGA" value={owner.lga} />
                  <Field label="BVN Number" value={owner.bvnNumber} />
                  <Field label="NIN Number" value={owner.ninNumber} />
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

      {/* Uploaded Documents */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
          Uploaded Documents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {app.documents?.incorporationCert && (
            <DocumentCard
              title="Certificate of Incorporation"
              document={app.documents.incorporationCert}
              onPreview={() => handlePreview(app.documents.incorporationCert, "Certificate of Incorporation")}
            />
          )}
          {app.documents?.taxClearance && (
            <DocumentCard
              title="Tax Clearance Certificate"
              document={app.documents.taxClearance}
              onPreview={() => handlePreview(app.documents.taxClearance, "Tax Clearance Certificate")}
            />
          )}
          {app.documents?.performanceBond && (
            <DocumentCard
              title="Performance Bond"
              document={app.documents.performanceBond}
              onPreview={() => handlePreview(app.documents.performanceBond, "Performance Bond")}
            />
          )}
        </div>
        
        {!app.documents && (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        )}
      </div>

      {/* Status Information */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
          Application Status
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Field label="Current Status" value={app.status} />
          <Field 
            label="NCGC Approved" 
            value={app.ncgc?.approved ? "Yes" : "No"} 
          />
          <Field 
            label="Guarantee Coverage" 
            value={app.ncgc?.guaranteePercentage ? `${app.ncgc.guaranteePercentage}%` : "—"} 
          />
          <Field 
            label="Bank Approved" 
            value={app.bank?.approved ? "Yes" : "No"} 
          />
          <Field 
            label="Created At" 
            value={app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"} 
          />
        </div>
      </div>

      {/* Comments Chat */}
      <div
        className="bg-white p-6 rounded-xl shadow flex flex-col"
        style={{ height: "450px" }}
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Messages</h2>

        {/* Chat scroll area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {(app.comments || []).map((c) => (
            <ChatBubble key={c.id} comment={c} />
          ))}
        </div>

        {/* Input box */}
        <div className="flex items-center mt-4 border rounded-lg p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            className="ml-2 bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-emerald-700 transition-colors"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>

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

/* ---------------------------- */
/* Helper Components            */
/* ---------------------------- */

function Field({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}

function ChatBubble({ comment }) {
  const isNCGC = comment.author === "ncgc";

  return (
    <div className={`flex ${isNCGC ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg text-sm shadow
          ${isNCGC ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"}
        `}
      >
        <p>{comment.message}</p>
        <p className="text-[10px] opacity-70 mt-1">
          {new Date(comment.timestamp).toLocaleString()}
        </p>
      </div>
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
