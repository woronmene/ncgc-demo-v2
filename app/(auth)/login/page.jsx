"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, BookOpen } from "lucide-react";

/* ---------------------------------------------------
   MODAL: VIEW DEMO CREDENTIALS
--------------------------------------------------- */
function CredentialModal({ isOpen, onClose }) {
  const [copiedItem, setCopiedItem] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleDescriptions = {
    ncgc_admin: "Manages system settings and onboards banks.",
    ncgc_analyst: "Reviews and approves guarantee applications.",
    bank_maker: "Creates and submits loan guarantee applications.",
  };

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    fetch("/api/users/credentials")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          const allowedRoles = ["ncgc_admin", "ncgc_analyst", "bank_maker"];
          // Filter and maybe deduplicate if needed, but for now just filter by role
          const filtered = data.users.filter((u) =>
            allowedRoles.includes(u.role)
          );
          setCredentials(filtered);
        }
      })
      .catch(() => setCredentials([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(key);
      setTimeout(() => setCopiedItem(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          Demo Credentials
        </h2>

        {/* Loading state */}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading credentials...</p>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {credentials.map((cred, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-700 text-sm sm:text-base">
                      {cred.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {roleDescriptions[cred.role] || "System User"}
                    </p>
                  </div>
                </div>

                {/* Email Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm mt-3 gap-2">
                  <span className="text-gray-600 truncate">{cred.email}</span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs flex-shrink-0"
                    onClick={() =>
                      copyToClipboard(cred.email, `email-${index}`)
                    }
                  >
                    <Copy size={14} />
                    {copiedItem === `email-${index}` ? "Copied!" : "Copy"}
                  </button>
                </div>

                {/* Password Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm mt-1 gap-2">
                  <span className="text-gray-600 truncate">
                    Password: {cred.password}
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs flex-shrink-0"
                    onClick={() =>
                      copyToClipboard(cred.password, `password-${index}`)
                    }
                  >
                    <Copy size={14} />
                    {copiedItem === `password-${index}` ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm sm:text-base"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   MODAL: RESET DEMO CONFIRMATION
--------------------------------------------------- */
function ResetDemoModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/reset-demo", { method: "POST" });
      const data = await res.json();

      if (data.ok) {
        alert("Demo reset successfully!");
        window.location.reload();
      } else {
        alert("Failed to reset demo.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center mb-4">
          Reset Demo Data?
        </h2>
        <p className="text-gray-600 text-sm text-center">
          This will clear all applications and bank data.
          <br />
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm sm:text-base"
          >
            Cancel
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium text-sm sm:text-base ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Resetting..." : "Reset Demo"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   MAIN LOGIN PAGE
--------------------------------------------------- */
export default function AuthLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCredModal, setShowCredModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      // Store user info in cookies for session management
      if (typeof document !== "undefined") {
        document.cookie = `userRole=${data.user.role}; path=/; max-age=86400`; // 24 hours
        if (data.user.bank) {
          document.cookie = `userBank=${encodeURIComponent(
            data.user.bank
          )}; path=/; max-age=86400`;
        }
        document.cookie = `userEmail=${encodeURIComponent(
          data.user.email
        )}; path=/; max-age=86400`;
      }

      router.push(`${encodeURIComponent(data.user.role)}/dashboard`);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex flex-col md:flex-row relative">
      {/* Documentation Link - Top Left */}
      <Link
        href="/documentation"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-lg shadow-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
      >
        <BookOpen
          className="text-emerald-600 group-hover:text-emerald-700"
          size={18}
        />
        <span className="text-sm font-medium text-emerald-700 group-hover:text-emerald-800">
          Documentation
        </span>
      </Link>

      {/* LEFT: Form Section */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-8 sm:py-16 md:pl-24 bg-[#f1f7f3]">
        <div className="max-w-lg w-full mx-auto md:mx-0">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 mb-6 sm:mb-8">
            <div className="h-24 w-24 flex items-center justify-center flex-shrink-0">
              <img
                src="/ncgc-logo.png"
                alt="NCGC Logo"
                className="h-24 w-24 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                Welcome back
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to your NCGC Account (
                <Link
                  href="/documentation"
                  className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2 transition-colors"
                >
                  please read documentation
                </Link>{" "}
                )
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 bg-white focus:ring-2 focus:ring-emerald-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 bg-white focus:ring-2 focus:ring-emerald-400"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                loading
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 space-y-3">
            <button
              onClick={() => setShowCredModal(true)}
              className="w-full py-2.5 border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium text-sm"
            >
              View Demo Credentials
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="w-full py-2.5 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 font-medium text-sm"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Branding Section */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-emerald-600 to-emerald-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-40 h-40 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 p-8">
              <img
                src="/ncgc-logo.png"
                alt="NCGC Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            National Credit Guarantee Corporation
          </h2>
          <p className="text-emerald-100 leading-relaxed">
            Empowering MSMEs through innovative credit guarantee solutions.
            Secure, reliable, and built for growth.
          </p>
        </div>
      </div>

      {/* Modals */}
      <CredentialModal
        isOpen={showCredModal}
        onClose={() => setShowCredModal(false)}
      />

      <ResetDemoModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  );
}
