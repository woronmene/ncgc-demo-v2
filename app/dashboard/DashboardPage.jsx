"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role");

  const roleMeta = {
    "bank-maker": {
      label: "Bank Officer (Maker)",
      description:
        "Create and submit new loan guarantee applications, upload borrower documents, and verify company and director details before submission.",
      actions: ["Start New Application", "View My Applications"],
      color: "emerald",
    },
    "bank-manager": {
      label: "Bank Manager (Checker)",
      description:
        "Review and approve applications submitted by bank officers, ensuring accuracy and completeness before submission to NCGC.",
      actions: ["Review Pending Applications", "Manage Team"],
      color: "blue",
    },
    "ncgc-analyst": {
      label: "NCGC Analyst",
      description:
        "Assess applications, perform KYC checks, and prepare risk assessments for final approval.",
      actions: ["Review Applications", "Generate Reports"],
      color: "indigo",
    },
    "ncgc-approver": {
      label: "NCGC Approver",
      description:
        "Approve or reject guarantees, issue guarantee certificates, and oversee portfolio exposure.",
      actions: ["Approve Applications", "Monitor Guarantees"],
      color: "violet",
    },
    admin: {
      label: "NCGC Admin / Support",
      description:
        "Manage bank onboarding, user accounts, and overall system administration.",
      actions: ["Onboard New Bank", "Manage Users"],
      color: "teal",
    },
  };

  const meta = roleMeta[role] || {
    label: "Unknown Role",
    description: "No role was selected. Please return to login.",
    actions: ["Return to Login"],
    color: "gray",
  };

  const gradient =
    {
      emerald: "from-emerald-600 via-emerald-500 to-emerald-400",
      blue: "from-blue-600 via-blue-500 to-blue-400",
      indigo: "from-indigo-600 via-indigo-500 to-indigo-400",
      violet: "from-violet-600 via-violet-500 to-violet-400",
      teal: "from-teal-600 via-teal-500 to-teal-400",
      gray: "from-gray-600 via-gray-500 to-gray-400",
    }[meta.color] || "from-gray-600 to-gray-400";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT PANEL: Info / Actions */}
      <div className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-10 md:p-20 flex flex-col justify-center">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800 mb-3">
            Welcome, <span className="text-emerald-600">{meta.label}</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            {meta.description}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {meta.actions.map((action, index) => (
              <button
                key={index}
                className="px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                {action}
              </button>
            ))}
          </div>

          <p className="mt-12 text-sm text-gray-500">
            Not the right role?{" "}
            <button
              className="text-emerald-600 hover:underline"
              onClick={() => router.push("/login")}
            >
              Return to Login
            </button>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Visual summary */}
      <div
        className={`flex-1 bg-gradient-to-tr ${gradient} text-white p-10 md:p-20 flex flex-col justify-center`}
      >
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold mb-3">System Overview</h2>
          <p className="text-white/80 text-sm leading-relaxed mb-6">
            This dashboard shows what each user role can do in the Credit
            Guarantee System. You’ll later see real stats, alerts, and tasks
            here.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-5">
              <p className="text-sm text-white/70">Applications</p>
              <h3 className="text-3xl font-semibold">42</h3>
            </div>
            <div className="bg-white/10 rounded-xl p-5">
              <p className="text-sm text-white/70">Approvals</p>
              <h3 className="text-3xl font-semibold">30</h3>
            </div>
            <div className="bg-white/10 rounded-xl p-5">
              <p className="text-sm text-white/70">Pending</p>
              <h3 className="text-3xl font-semibold">8</h3>
            </div>
            <div className="bg-white/10 rounded-xl p-5">
              <p className="text-sm text-white/70">Rejected</p>
              <h3 className="text-3xl font-semibold">4</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
