"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle, Clock, XCircle, ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { focus as BUSINESS_FOCUS_AREAS, sectors as SECTORS, states_lgas as STATES_LGAS } from "@/data/constants";
// import { storage } from "@/lib/firebase";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";



export default function CreateApplicationPage() {
  const router = useRouter();

  // -------------------------------------------------
  // FORM STATE
  // -------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    businessName: "",
    rcNumber: "",
    tinNumber: "",
    businessAddress: "",
    sector: "",
    thematicArea: "",
    cacNumber: "",
    guaranteeType: "",
    loanAmount: "",
    tenure: "",
    purpose: "",
    monthlyRevenue: "",
    // Owners list instead of single fields
    owners: [
      { id: Date.now(), name: "", gender: "", state: "", lga: "", bvnNumber: "", ninNumber: "", validId: null }
    ]
  });

  // Verification state handles both static fields and dynamic owner fields
  // Keys for owners will be: `owner_${id}_${field}`
  const [verifications, setVerifications] = useState({
    rcNumber: { status: "idle", message: "" },
    tinNumber: { status: "idle", message: "" },
    cacNumber: { status: "idle", message: "" },
  });

  // Ref to track last validated values to avoid duplicate calls
  const lastValidatedRef = useRef({
    rcNumber: "",
    tinNumber: "",
    cacNumber: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [modalData, setModalData] = useState(null);

  // -------------------------------------------------
  // DOCUMENT UPLOAD STATE
  // -------------------------------------------------
  const [documents, setDocuments] = useState({
    incorporationCert: null,
    taxClearance: null,
    performanceBond: null,
    collateral: null,
  });

  const handleFileChange = async (field, file, ownerId = null) => {
    if (!file) return;

    // Helper to update state
    const updateState = (status, url = null) => {
      if (ownerId) {
        setForm(prev => ({
          ...prev,
          owners: prev.owners.map(owner => 
            owner.id === ownerId 
              ? { ...owner, validId: { name: file.name, status, url } }
              : owner
          )
        }));
      } else {
        setDocuments((prev) => ({
          ...prev,
          [field]: { name: file.name, status, url },
        }));
      }
    };

    try {
      updateState("uploading");

      // 1. Get Signed URL
      const path = ownerId 
        ? `applications/owners/${ownerId}_${Date.now()}_${file.name}`
        : `applications/documents/${field}_${Date.now()}_${file.name}`;

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

      // 2. Upload to GCS
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // 3. Update State
      updateState("uploaded", readUrl);

    } catch (error) {
      console.error('File upload error:', error);
      updateState("error");
      alert('Failed to upload file. Please try again.');
    }
  };

  // -------------------------------------------------
  // HANDLE CHANGE (STATIC FIELDS)
  // -------------------------------------------------
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (["rcNumber", "tinNumber", "cacNumber"].includes(field)) {
      setVerifications((prev) => ({
        ...prev,
        [field]:
          value.trim().length === 0
            ? { status: "idle", message: "" }
            : { status: "checking", message: "Checking..." },
      }));
    }
  };

  // -------------------------------------------------
  // OWNER MANAGEMENT
  // -------------------------------------------------
  const addOwner = () => {
    setForm((prev) => ({
      ...prev,
      owners: [
        ...prev.owners,
        { id: Date.now(), name: "", gender: "", state: "", lga: "", bvnNumber: "", ninNumber: "", validId: null }
      ]
    }));
  };

  const removeOwner = (ownerId) => {
    if (form.owners.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      owners: prev.owners.filter((o) => o.id !== ownerId)
    }));
    
    // Cleanup verifications for removed owner
    setVerifications(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.startsWith(`owner_${ownerId}`)) {
          delete next[key];
        }
      });
      return next;
    });
  };

  const handleOwnerChange = (ownerId, field, value) => {
    setForm((prev) => ({
      ...prev,
      owners: prev.owners.map((owner) =>
        owner.id === ownerId ? { ...owner, [field]: value } : owner
      ),
    }));

    // Trigger validation for verify-able fields
    if (["bvnNumber", "ninNumber"].includes(field)) {
      const key = `owner_${ownerId}_${field}`;
      
      setVerifications((prev) => ({
        ...prev,
        [key]: value.trim().length === 0
            ? { status: "idle", message: "" }
            : { status: "checking", message: "Checking..." },
      }));

      // Debounce validation
      if (value.trim().length > 0) {
        const timeoutId = setTimeout(() => {
          validateOwnerField(ownerId, field, value);
        }, 700);
        return () => clearTimeout(timeoutId);
      }
    }
  };

  // -------------------------------------------------
  // VALIDATION LOGIC
  // -------------------------------------------------
  
  // Effect for static fields
  useEffect(() => handleValidationEffect("rcNumber", form.rcNumber), [form.rcNumber]);
  useEffect(() => handleValidationEffect("tinNumber", form.tinNumber), [form.tinNumber]);
  useEffect(() => handleValidationEffect("cacNumber", form.cacNumber), [form.cacNumber]);

  function handleValidationEffect(field, valueRaw) {
    const value = valueRaw?.trim() || "";

    if (!value) {
      setVerifications((prev) => ({
        ...prev,
        [field]: { status: "idle", message: "" },
      }));
      lastValidatedRef.current[field] = "";
      return;
    }

    if (lastValidatedRef.current[field] === value) return;

    const id = setTimeout(() => validateField(field, value), 700);
    return () => clearTimeout(id);
  }

  async function validateField(field, value) {
    const endpoints = {
      rcNumber: "/api/validate/rc",
      tinNumber: "/api/validate/tin",
      cacNumber: "/api/kyc/cac",
    };

    try {
      const res = await fetch(endpoints[field], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();
      lastValidatedRef.current[field] = value;
      updateVerificationState(field, data);
    } catch {
      setVerifications((prev) => ({
        ...prev,
        [field]: { status: "error", message: "Validation failed" },
      }));
    }
  }

  async function validateOwnerField(ownerId, field, value) {
    const key = `owner_${ownerId}_${field}`;
    const endpoints = {
      bvnNumber: "/api/kyc/bvn",
      ninNumber: "/api/kyc/nin",
    };

    try {
      const res = await fetch(endpoints[field], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();
      updateVerificationState(key, data);
    } catch {
      setVerifications((prev) => ({
        ...prev,
        [key]: { status: "error", message: "Validation failed" },
      }));
    }
  }

  function updateVerificationState(key, data) {
    if (data.ok) {
      setVerifications((prev) => ({
        ...prev,
        [key]: { status: "verified", message: "Verified automatically" },
      }));
    } else if (data.reason === "pending_manual_review") {
      setVerifications((prev) => ({
        ...prev,
        [key]: { status: "pending", message: "Pending manual review" },
      }));
    } else {
      setVerifications((prev) => ({
        ...prev,
        [key]: { status: "error", message: "Invalid entry" },
      }));
    }
  }

  // -------------------------------------------------
  // STATUS ICON
  // -------------------------------------------------
  const getStatusIcon = (status) => {
    switch (status) {
      case "checking":
        return <Loader2 className="animate-spin text-gray-400" size={18} />;
      case "verified":
        return <CheckCircle className="text-emerald-600" size={18} />;
      case "pending":
        return <Clock className="text-amber-500" size={18} />;
      case "error":
        return <XCircle className="text-red-500" size={18} />;
      default:
        return null;
    }
  };

  // -------------------------------------------------
  // SUBMIT
  // -------------------------------------------------
  const handleSubmit = async () => {
    // Validate required fields
    if (!form.businessName || !form.loanAmount) {
      setModalData({ 
        ok: false, 
        message: "Please fill in all required fields (Business Name, Loan Amount)" 
      });
      return;
    }

    setSubmitting(true);

    try {
      // Prepare application data with document URLs
      const applicationData = {
        ...form,
        documents: {
          incorporationCert: documents.incorporationCert,
          taxClearance: documents.taxClearance,
          performanceBond: documents.performanceBond,
          collateral: documents.collateral,
        }
      };
      
      console.log("Submitting application data:", applicationData);

      const res = await fetch("/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
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
    router.push("/bank_maker/dashboard");
  };

  // -------------------------------------------------
  // STEPS CONFIG
  // -------------------------------------------------
  const steps = [
    { id: 1, title: "Business Details" },
    { id: 2, title: "Identity & Verification" },
    { id: 3, title: "Required Documents" },
    { id: 4, title: "Request Details" },
  ];

  const nextStep = () => {
    // Basic validation
    if (currentStep === 1 && !form.businessName?.trim()) {
      alert("Please enter a Business Name");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-8">
        <button
          onClick={() => router.push("/bank_maker/dashboard")}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Dashboard
        </button>

        <h1 className="text-2xl font-semibold text-gray-800">
          Create New Loan Guarantee Application
        </h1>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-emerald-500 -z-10 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center bg-white px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                  step.id <= currentStep
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id}
              </div>
              <span className={`text-xs mt-2 font-medium ${step.id <= currentStep ? 'text-emerald-700' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">
          {/* ------------------------------ */}
          {/* STEP 1: BUSINESS DETAILS */}
          {/* ------------------------------ */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Business Details
              </h2>
              
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 placeholder-gray-500 text-black"
                  placeholder="Enter business name"
                  required
                />
              </div>

              {/* Business Address */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Business Address
                </label>
                <input
                  type="text"
                  value={form.businessAddress}
                  onChange={(e) =>
                    handleChange("businessAddress", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 placeholder-gray-500 text-black"
                  placeholder="Enter address"
                />
              </div>

              {/* Sector & Thematic Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Sector / Industry
                  </label>
                  <select
                    value={form.sector}
                    onChange={(e) => handleChange("sector", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-black"
                  >
                    <option value="">Select sector</option>
                    {SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thematic Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                   Business Focus
                  </label>
                  <select
                    value={form.thematicArea}
                    onChange={(e) => handleChange("thematicArea", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-black"
                  >
                    <option value="">Select Business Focus</option>
                    {BUSINESS_FOCUS_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------ */}
          {/* STEP 2: IDENTITY & VERIFICATION */}
          {/* ------------------------------ */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Business Identity */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
                  Business Identity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderVerifiedField(
                    "RC Number",
                    "rcNumber",
                    form.rcNumber,
                    verifications["rcNumber"],
                    (val) => handleChange("rcNumber", val),
                    getStatusIcon
                  )}
                  {renderVerifiedField(
                    "TIN Number",
                    "tinNumber",
                    form.tinNumber,
                    verifications["tinNumber"],
                    (val) => handleChange("tinNumber", val),
                    getStatusIcon
                  )}
                  {renderVerifiedField(
                    "CAC Number",
                    "cacNumber",
                    form.cacNumber,
                    verifications["cacNumber"],
                    (val) => handleChange("cacNumber", val),
                    getStatusIcon
                  )}
                </div>
              </div>

              {/* Owners / Directors */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                    <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
                    Directors / Owners
                  </h2>
                  <button
                    type="button"
                    onClick={addOwner}
                    className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Owner
                  </button>
                </div>

                <div className="space-y-6">
                  {form.owners.map((owner, index) => (
                    <div key={owner.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 relative">
                      {form.owners.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOwner(owner.id)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Owner {index + 1}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={owner.name}
                            onChange={(e) => handleOwnerChange(owner.id, "name", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 text-black focus:ring-emerald-400 placeholder-gray-500"
                            placeholder="Enter full name"
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Gender *
                          </label>
                          <select
                            value={owner.gender}
                            onChange={(e) => handleOwnerChange(owner.id, "gender", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 text-black focus:ring-emerald-400"
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>

                        {/* State of Origin */}
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            State of Origin *
                          </label>
                          <select
                            value={owner.state}
                            onChange={(e) => {
                              handleOwnerChange(owner.id, "state", e.target.value);
                              // Reset LGA when state changes
                              handleOwnerChange(owner.id, "lga", "");
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 text-black focus:ring-emerald-400"
                          >
                            <option value="">Select state</option>
                            {Object.keys(STATES_LGAS).map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* LGA */}
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Local Government Area (LGA) *
                          </label>
                          <select
                            value={owner.lga}
                            onChange={(e) => handleOwnerChange(owner.id, "lga", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 text-black focus:ring-emerald-400"
                            disabled={!owner.state}
                          >
                            <option value="">
                              {owner.state ? "Select LGA" : "Select state first"}
                            </option>
                            {owner.state && STATES_LGAS[owner.state]?.lgas.map((lga) => (
                              <option key={lga} value={lga}>
                                {lga}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* BVN */}
                        {renderVerifiedField(
                          "BVN Number",
                          "bvnNumber",
                          owner.bvnNumber,
                          verifications[`owner_${owner.id}_bvnNumber`],
                          (val) => handleOwnerChange(owner.id, "bvnNumber", val),
                          getStatusIcon
                        )}

                        {/* NIN */}
                        {renderVerifiedField(
                          "NIN Number",
                          "ninNumber",
                          owner.ninNumber,
                          verifications[`owner_${owner.id}_ninNumber`],
                          (val) => handleOwnerChange(owner.id, "ninNumber", val),
                          getStatusIcon
                        )}

                        {/* Valid ID Upload */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Valid Identification *
                          </label>
                          <DocumentUploadField
                            label="Upload Valid ID (Passport, DL, etc.)"
                            field="validId"
                            documentState={owner.validId}
                            onUpload={(f, file) => handleFileChange(f, file, owner.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------ */}
          {/* STEP 3: DOCUMENT UPLOADS */}
          {/* ------------------------------ */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Required Documents
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload the required documents for this loan guarantee application.
              </p>
              <div className="space-y-4">
                <DocumentUploadField
                  label="Certificate of Incorporation *"
                  field="incorporationCert"
                  documentState={documents.incorporationCert}
                  onUpload={handleFileChange}
                />
                <DocumentUploadField
                  label="Tax Clearance Certificate *"
                  field="taxClearance"
                  documentState={documents.taxClearance}
                  onUpload={handleFileChange}
                />
                <DocumentUploadField
                  label="Performance Bond (If Applicable)"
                  field="performanceBond"
                  documentState={documents.performanceBond}
                  onUpload={handleFileChange}
                />
                <DocumentUploadField
                  label="Collateral Documents (If Applicable)"
                  field="collateral"
                  documentState={documents.collateral}
                  onUpload={handleFileChange}
                />
                <p className="text-xs text-gray-500 italic">
                  * Required documents. Collateral documents should be uploaded if the guarantee request involves any collateral.
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------ */}
          {/* STEP 4: LOAN DETAILS */}
          {/* ------------------------------ */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Loan Guarantee Request Details
              </h2>

              <div className="space-y-6">
                {/* Guarantee Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Guarantee Type *
                  </label>
                  <select
                    value={form.guaranteeType}
                    onChange={(e) => handleChange("guaranteeType", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-black"
                    required
                  >
                    <option value="">Select Guarantee Type</option>
                    <option value="Individual Guarantee">Individual Guarantee</option>
                    <option value="Portfolio Guarantee">Portfolio Guarantee</option>
                  </select>
                </div>

                <NormalInput
                  label="Loan Amount (₦)"
                  field="loanAmount"
                  placeholder="e.g. 20,000,000"
                  form={form}
                  handleChange={handleChange}
                />

                <NormalInput
                  label="Loan Tenor (months)"
                  field="tenure"
                  placeholder="e.g. 12"
                  form={form}
                  handleChange={handleChange}
                />

                <NormalInput
                  label="Estimated Monthly Revenue (₦)"
                  field="monthlyRevenue"
                  placeholder="e.g. 5,000,000"
                  form={form}
                  handleChange={handleChange}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Purpose of Loan
                  </label>
                  <select
                    value={form.purpose}
                    onChange={(e) => handleChange("purpose", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-black"
                  >
                    <option value="">Select Purpose</option>
                    <option value="Working Capital">Working Capital</option>
                    <option value="Equipment Purchase">Equipment Purchase</option>
                    <option value="Expansion">Expansion</option>
                    <option value="Operational Expenses">Operational Expenses</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ChevronLeft size={20} className="mr-2" />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Next
              <ChevronRight size={20} className="ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex items-center px-8 py-3 rounded-lg text-white font-medium transition-colors ${
                submitting
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            {modalData.ok ? (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="text-emerald-600" size={48} />
                </div>
                <h2 className="text-xl text-gray-800 font-semibold text-center mb-2">
                  Application Submitted Successfully
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  Your loan guarantee application has been sent to NCGC for review.
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <XCircle className="text-red-500" size={48} />
                </div>
                <h2 className="text-xl text-gray-800 font-semibold text-center mb-2">
                  Failed to Submit Application
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  {modalData.message}
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => setModalData(null)}
                    className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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

// -------------------------------------------------
// SMALL HELPER COMPONENTS
// -------------------------------------------------

function DocumentUploadField({ label, field, documentState, onUpload }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative">
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onUpload(field, e.target.files[0]);
          }
        }}
      />
      {documentState?.status === "uploading" ? (
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="animate-spin text-emerald-500" size={24} />
          <p className="text-sm text-gray-500">Uploading {documentState.name}...</p>
        </div>
      ) : documentState?.status === "uploaded" ? (
        <div className="flex flex-col items-center space-y-2">
          <CheckCircle className="text-emerald-600" size={24} />
          <p className="text-sm font-medium text-gray-800">{documentState.name}</p>
          <p className="text-xs text-emerald-600">Uploaded successfully</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2 pointer-events-none">
          <div className="p-3 bg-emerald-50 rounded-full">
            <svg
              className="w-6 h-6 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
        </div>
      )}
    </div>
  );
}

function renderVerifiedField(
  label,
  fieldKey, // Just the key name for display/logic
  value,
  verificationState,
  onChange,
  getStatusIcon
) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 text-black focus:ring-emerald-400 placeholder-gray-500"
          placeholder={`Enter ${label}`}
        />
        <div className="ml-3">
          {verificationState && getStatusIcon(verificationState.status)}
        </div>
      </div>
      {verificationState?.message && (
        <p
          className={`text-xs mt-1 ${
            verificationState.status === "verified"
              ? "text-emerald-600"
              : verificationState.status === "pending"
              ? "text-amber-600"
              : verificationState.status === "error"
              ? "text-red-500"
              : "text-gray-400"
          }`}
        >
          {verificationState.message}
        </p>
      )}
    </div>
  );
}

function NormalInput({ label, field, form, handleChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 text-black focus:ring-emerald-400 placeholder-gray-500"
        placeholder={placeholder}
      />
    </div>
  );
}
