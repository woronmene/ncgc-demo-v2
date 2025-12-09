"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle, Clock, XCircle, Copy, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardPFIPage() {
  const router = useRouter();
  const [isPFIOnboarding, setIsPFIOnboarding] = useState(false);

  useEffect(() => {
    // Check if user is PFI onboarding
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split("; ");
      const roleCookie = cookies.find((c) => c.startsWith("userRole="));
      const userRole = roleCookie ? roleCookie.split("=")[1] : null;
      setIsPFIOnboarding(userRole === "pfi_onboard");
    }
  }, []);

  const [form, setForm] = useState({
    pfiName: "",
    operatingAddress: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",

    cbnLicense: "",
    rcNumber: "",
    ndicNumber: "",
    licenseType: "",
    kycCompliant: false,
    amlCompliant: false,
    cftCompliant: false,

    fitAndProper: false,
    qualifiedManagement: false,
    internalControls: false,

    capitalAdequacy: false,
    liquidityCompliance: false,
    riskManagementFramework: "",

    esmsCompliant: false,
    creditBureaus: [],
    responsibleLending: false,

    notUnderAcquisition: false,
    lendingFocus: [],

    guaranteeProduct: "",
  });

  const creditBureauOptions = [
    "CRC Credit Bureau Limited",
    "Credit Registry Nigeria",
    "First Central Credit Bureau",
  ];

  const lendingFocusOptions = [
    "MSMEs",
    "Large Corporates",
    "Credit Consumers",
  ];

  const guaranteeOptions = [
    "Individual Guarantee",
    "Portfolio Guarantee",
    "Performance Bond",
    "All",
  ];

  const licenseTypes = [
    "Commercial Bank",
    "Microfinance Bank",
    "Finance Company",
    "Mortgage Bank",
    "Merchant Bank",
    "Development Finance Institution",
  ];

  const toggleChip = (field, value) => {
    setForm((prev) => {
      let list = [...prev[field]];
      if (list.includes(value)) {
        list = list.filter((v) => v !== value);
      } else {
        list.push(value);
      }
      return { ...prev, [field]: list };
    });
  };

  const [verifications, setVerifications] = useState({
    cbnLicense: { status: "idle", message: "" },
    rcNumber: { status: "idle", message: "" },
    ndicNumber: { status: "idle", message: "" },
  });

  const lastValidatedRef = useRef({
    cbnLicense: "",
    rcNumber: "",
    ndicNumber: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (["cbnLicense", "rcNumber", "ndicNumber"].includes(field)) {
      setVerifications((prev) => ({
        ...prev,
        [field]:
          value.trim().length === 0
            ? { status: "idle", message: "" }
            : { status: "checking", message: "Checking..." },
      }));
    }
  };

  // ============================
  // VALIDATION EFFECTS (unchanged)
  // ============================

  useEffect(() => {
    const field = "cbnLicense";
    const value = form.cbnLicense?.trim() || "";
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
  }, [form.cbnLicense]);

  useEffect(() => {
    const field = "rcNumber";
    const value = form.rcNumber?.trim() || "";
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
  }, [form.rcNumber]);

  useEffect(() => {
    const field = "ndicNumber";
    const value = form.ndicNumber?.trim() || "";
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
  }, [form.ndicNumber]);

  const validateField = async (field, value) => {
    const endpoints = {
      cbnLicense: "/api/validate/cbn",
      rcNumber: "/api/validate/rc",
      ndicNumber: "/api/validate/ndic",
    };

    setVerifications((prev) => ({
      ...prev,
      [field]: { status: "checking", message: "Checking..." },
    }));

    try {
      const res = await fetch(endpoints[field], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();

      lastValidatedRef.current[field] = value;

      if (data.ok) {
        setVerifications((prev) => ({
          ...prev,
          [field]: { status: "verified", message: "Verified automatically" },
        }));
      } else if (data.reason === "pending_manual_review") {
        setVerifications((prev) => ({
          ...prev,
          [field]: { status: "pending", message: "Pending manual review" },
        }));
      } else {
        setVerifications((prev) => ({
          ...prev,
          [field]: { status: "error", message: "Invalid entry" },
        }));
      }
    } catch {
      lastValidatedRef.current[field] = value;
      setVerifications((prev) => ({
        ...prev,
        [field]: { status: "error", message: "Validation failed" },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.creditBureaus.length < 2) {
      alert("Please select at least two credit bureaus.");
      return;
    }
    if (!form.guaranteeProduct) {
      alert("Please select a guarantee product of interest.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/banks/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setModalData(data.ok ? data : { ok: false, message: data.message });
    } catch {
      setModalData({
        ok: false,
        message: "Network or server error during onboarding",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (s) =>
    s === "checking" ? (
      <Loader2 className="animate-spin text-gray-400" size={18} />
    ) : s === "verified" ? (
      <CheckCircle className="text-emerald-600" size={18} />
    ) : s === "pending" ? (
      <Clock className="text-amber-500" size={18} />
    ) : s === "error" ? (
      <XCircle className="text-red-500" size={18} />
    ) : null;

  const copyToClipboard = (t) => navigator.clipboard.writeText(t);

  const closeModal = () => {
    setModalData(null);
    if (isPFIOnboarding) {
      router.push("/login");
    } else {
      router.push("/ncgc_admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="max-w-4xl  mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-10">
        <button
          onClick={() => {
            if (isPFIOnboarding) {
              router.push("/login");
            } else {
              router.push("/ncgc_admin/dashboard");
            }
          }}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          {isPFIOnboarding ? "Back to Login" : "Back to Dashboard"}
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          🏦 Onboard Participating Financial Institution (PFI)
        </h1>
        {isPFIOnboarding && (
          <p className="text-gray-600 text-sm mt-2">
            Complete the form below to register your institution as a Partner Financial Institution (PFI) with NCGC. 
            Once all required fields are correctly provided, your onboarding will be automatically approved.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ======================= */}
          {/* SECTION 1 — BASIC INFO */}
          {/* ======================= */}
          <Section title="Basic Information">
            <TextField label="PFI Name *" field="pfiName" form={form} handleChange={handleChange} />
            <TextField label="Operating Address *" field="operatingAddress" form={form} handleChange={handleChange} />
            <div className="grid md:grid-cols-2 gap-4">
              <TextField label="Contact Person" field="contactPerson" form={form} handleChange={handleChange} />
              <TextField label="Contact Email *" type="email" field="contactEmail" form={form} handleChange={handleChange} />
            </div>
            <TextField label="Contact Phone" field="contactPhone" form={form} handleChange={handleChange} />
          </Section>

          {/* =========================== */}
          {/* SECTION 2 — REGULATORY      */}
          {/* =========================== */}
          <Section title="Regulatory Compliance">
            {["cbnLicense", "rcNumber", "ndicNumber"].map((key) => (
              <RegulatoryField
                key={key}
                label={key === "cbnLicense" ? "CBN License Number *" : key === "rcNumber" ? "RC Number *" : "NDIC Registration *"}
                field={key}
                value={form[key]}
                handleChange={handleChange}
                verifications={verifications}
                getStatusIcon={getStatusIcon}
              />
            ))}

            <SelectField
              label="License Type *"
              field="licenseType"
              options={licenseTypes}
              form={form}
              handleChange={handleChange}
            />

            <CheckboxField label="KYC Compliance" field="kycCompliant" form={form} setForm={setForm} />
            <CheckboxField label="AML Compliance" field="amlCompliant" form={form} setForm={setForm} />
            <CheckboxField label="CFT Compliance" field="cftCompliant" form={form} setForm={setForm} />
          </Section>

          {/* =============================== */}
          {/* SECTION 3 — GOVERNANCE          */}
          {/* =============================== */}
          <Section title="Governance & Management">
            <CheckboxField label="Board/Shareholders are fit & proper" field="fitAndProper" form={form} setForm={setForm} />
            <CheckboxField label="Management team is qualified" field="qualifiedManagement" form={form} setForm={setForm} />
            <CheckboxField label="Internal controls & audit processes in place" field="internalControls" form={form} setForm={setForm} />
          </Section>

          {/* =========================== */}
          {/* SECTION 4 — FINANCIAL       */}
          {/* =========================== */}
          <Section title="Financial Soundness">
            <CheckboxField label="Meets CBN Capital Adequacy requirements" field="capitalAdequacy" form={form} setForm={setForm} />
            <CheckboxField label="Meets CBN Liquidity requirements" field="liquidityCompliance" form={form} setForm={setForm} />

            <TextAreaField
              label="Risk Management Framework (brief description)"
              field="riskManagementFramework"
              form={form}
              handleChange={handleChange}
            />
          </Section>

          {/* =============================== */}
          {/* SECTION 5 — SUSTAINABILITY      */}
          {/* =============================== */}
          <Section title="Sustainability & Market Readiness">
            <CheckboxField label="ESMS Compliant (Environmental & Social Management System)" field="esmsCompliant" form={form} setForm={setForm} />

            <ChipSelector
              label="Credit Bureau Partnerships (min 2) *"
              field="creditBureaus"
              options={creditBureauOptions}
              form={form}
              toggleChip={toggleChip}
              minRequired={2}
            />

            <CheckboxField label="Responsible Lending Practices" field="responsibleLending" form={form} setForm={setForm} />
          </Section>

          {/* =============================== */}
          {/* SECTION 6 — OPERATIONAL         */}
          {/* =============================== */}
          <Section title="Operational Track Record">
            <CheckboxField label="Not under CBN/NDIC acquisition" field="notUnderAcquisition" form={form} setForm={setForm} />

            <ChipSelector
              label="Lending Focus Areas"
              field="lendingFocus"
              options={lendingFocusOptions}
              form={form}
              toggleChip={toggleChip}
            />
          </Section>

          {/* =============================== */}
          {/* SECTION 7 — GUARANTEE PRODUCT   */}
          {/* =============================== */}
          <Section title="Guarantee Product of Interest *">
            <RadioGroup
              field="guaranteeProduct"
              options={guaranteeOptions}
              form={form}
              setForm={setForm}
            />
          </Section>

          {/* SUBMIT */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 rounded-lg text-white font-medium transition-all ${
                submitting
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {submitting ? "Submitting..." : isPFIOnboarding ? "Submit Onboarding Request" : "Onboard PFI"}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL */}
      {modalData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            {modalData.ok ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="text-emerald-600" size={48} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                  {isPFIOnboarding ? "Onboarding Successful" : "PFI Onboarded Successfully"}
                </h2>
                <p className="text-center text-gray-600 mb-4">
                  {isPFIOnboarding 
                    ? `${modalData.pfi?.name} has been successfully onboarded and approved.`
                    : `${modalData.pfi?.name} has been added.`
                  }
                </p>
                {isPFIOnboarding && modalData.credentials && modalData.credentials.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-emerald-800 mb-2">
                      Your login credentials have been created:
                    </p>
                    {modalData.credentials.map((cred, idx) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        <p className="text-xs text-emerald-700 font-medium">{cred.label}:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-emerald-600 flex-1">{cred.email}</span>
                          <button
                            onClick={() => copyToClipboard(cred.email)}
                            className="text-emerald-600 hover:text-emerald-800"
                            title="Copy email"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-emerald-600 flex-1">Password: {cred.password}</span>
                          <button
                            onClick={() => copyToClipboard(cred.password)}
                            className="text-emerald-600 hover:text-emerald-800"
                            title="Copy password"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isPFIOnboarding && (
                  <p className="text-center text-sm text-gray-500 mb-6">
                    You can now use these credentials to log in and create applications.
                  </p>
                )}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                  >
                    {isPFIOnboarding ? "Go to Login" : "Done"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <XCircle className="text-red-500" size={48} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                  Onboarding Failed
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  {modalData.message}
                </p>
                <div className="mt-6 flex justify-center">
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

/* ============================= */
/* REUSABLE COMPONENTS BELOW     */
/* ============================= */

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function TextField({ label, field, form, handleChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg 
        focus:ring-2 focus:ring-emerald-400 text-gray-700 placeholder-gray-500"
      />
    </div>
  );
}

function TextAreaField({ label, field, form, handleChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label}
      </label>
      <textarea
        rows={4}
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg 
        focus:ring-2 focus:ring-emerald-400 text-gray-700"
      />
    </div>
  );
}

function CheckboxField({ label, field, form, setForm }) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <input
        type="checkbox"
        checked={form[field]}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, [field]: e.target.checked }))
        }
        className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}

function SelectField({ label, field, form, handleChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label}
      </label>
      <select
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg 
        focus:ring-2 focus:ring-emerald-400 text-gray-700"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function RegulatoryField({ label, field, value, handleChange, verifications, getStatusIcon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg 
          focus:ring-2 focus:ring-emerald-400 text-gray-700"
          required
        />
        <div className="ml-3">{getStatusIcon(verifications[field].status)}</div>
      </div>
      {verifications[field].message && (
        <p
          className={`text-xs mt-1 ${
            verifications[field].status === "verified"
              ? "text-emerald-600"
              : verifications[field].status === "pending"
              ? "text-amber-600"
              : verifications[field].status === "error"
              ? "text-red-500"
              : "text-gray-400"
          }`}
        >
          {verifications[field].message}
        </p>
      )}
    </div>
  );
}

function ChipSelector({ label, field, options, form, toggleChip, minRequired }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="flex flex-wrap gap-3">
        {options.map((o) => {
          const selected = form[field].includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggleChip(field, o)}
              className={`px-4 py-2 rounded-full border text-sm transition-all ${
                selected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>

      {minRequired && form[field].length < minRequired && (
        <p className="text-xs text-red-500 mt-2">
          Select at least {minRequired} options.
        </p>
      )}
    </div>
  );
}

function RadioGroup({ field, options, form, setForm }) {
  return (
    <div className="space-y-2">
      {options.map((o) => (
        <label key={o} className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name={field}
            checked={form[field] === o}
            onChange={() =>
              setForm((prev) => ({
                ...prev,
                [field]: o,
              }))
            }
            className="h-4 w-4 text-emerald-600 border-gray-300"
          />
          <span className="text-gray-700">{o}</span>
        </label>
      ))}
    </div>
  );
}