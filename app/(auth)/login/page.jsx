"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

/* ---------------------------------------------------
   MODAL: VIEW DEMO CREDENTIALS
--------------------------------------------------- */
function CredentialModal({ isOpen, onClose }) {
  const [copiedItem, setCopiedItem] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    fetch("/api/users/credentials")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setCredentials(data.users);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
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
                className="border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <p className="font-medium text-gray-700">{cred.label}</p>

                {/* Email Row */}
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">{cred.email}</span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs"
                    onClick={() =>
                      copyToClipboard(cred.email, `email-${index}`)
                    }
                  >
                    <Copy size={14} />
                    {copiedItem === `email-${index}` ? "Copied!" : "Copy"}
                  </button>
                </div>

                {/* Password Row */}
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">
                    Password: {cred.password}
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs"
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
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
          Reset Demo Data?
        </h2>
        <p className="text-gray-600 text-sm text-center">
          This will clear all applications and bank data.
          <br />
          This action cannot be undone.
        </p>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="w-1/2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className={`w-1/2 px-4 py-2 rounded-lg text-white font-medium ${
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
      if (typeof document !== 'undefined') {
        document.cookie = `userRole=${data.user.role}; path=/; max-age=86400`; // 24 hours
        if (data.user.bank) {
          document.cookie = `userBank=${encodeURIComponent(data.user.bank)}; path=/; max-age=86400`;
        }
        document.cookie = `userEmail=${encodeURIComponent(data.user.email)}; path=/; max-age=86400`;
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
      {/* LEFT: Form Section */}
      <div className="flex-1 flex flex-col justify-center px-12 py-16 md:pl-24">
        <div className="max-w-lg">
          <div className="flex items-center space-x-3 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Welcome back
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to your NCGC Account
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 ">
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
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => setShowCredModal(true)}
              className="w-full mt-2 border text-black border-emerald-600 text-emerald-700 py-3 rounded-lg font-medium hover:bg-emerald-50"
            >
              View Demo Credentials
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Visual Section */}
      <div className="hidden md:flex flex-1 bg-gradient-to-tr from-emerald-900 via-emerald-800 to-black text-white items-center justify-center px-12 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 w-56 h-56 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center shadow-xl">
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white opacity-95"
            >
              <path
                d="M12 2C8 2 5 5 5 9v2h14V9c0-4-3-7-7-7z"
                fill="currentColor"
              />
              <rect
                x="4"
                y="13"
                width="16"
                height="8"
                rx="2"
                fill="rgba(255,255,255,0.9)"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold">
            Manage Guarantees with Confidence
          </h2>
          <p className="mt-4 text-sm text-white/80">
            Streamline loan guarantees, automate compliance, and ensure every
            SME verification is simple and secure.
          </p>
        </div>
      </div>

      {/* FLOATING RESET BUTTON — bottom-left */}
      <div
        type="button"
        onClick={() => setShowResetModal(true)}
        className="absolute bottom-6 left-6 px-4 py-2  text-red-500 cursor-pointer z-40 text-sm font-medium"
      >
        Reset Demo
      </div>

      {/* MODALS */}
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
