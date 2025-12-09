"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Clock,
  FileText,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  FileWarning,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Login
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <BookOpen className="text-emerald-700" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                NCGC Demo Documentation
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Complete Guide to Understanding and Testing the Platform
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-6">
            <p className="text-sm text-amber-800 font-medium">
              <strong>⚠️ Important:</strong> Please read this documentation in
              full before using the demo. This guide will help you understand
              the project's purpose, features, and how to effectively test all
              functionality.
            </p>
          </div>
        </div>

        {/* Guide Button Section - Prominent */}
        <section
          id="guide-button"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-xl p-8 mb-8 text-white border-2 border-emerald-400"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
              <BookOpen size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  ESSENTIAL
                </span>
                The Guide Button - Your Context-Sensitive Helper
              </h2>
              <p className="text-emerald-50 text-lg mb-4 leading-relaxed">
                <strong className="text-white">
                  Look for the green "Guide" button in the bottom-right corner
                  of every page.
                </strong>
                This is your instant, context-sensitive help system that
                provides page-specific guidance wherever you are in the
                platform.
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 mt-4 border border-white/20">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  What It Does
                </h3>
                <ul className="space-y-2 text-emerald-50">
                  <li className="flex items-start gap-2">
                    <span className="text-white font-bold mt-1">•</span>
                    <span>
                      <strong className="text-white">
                        Context-Sensitive Help:
                      </strong>{" "}
                      The Guide button automatically shows relevant information
                      for the page you're currently viewing. Each page has its
                      own customized guide content.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white font-bold mt-1">•</span>
                    <span>
                      <strong className="text-white">Always Available:</strong>{" "}
                      The button appears on every page in the bottom-right
                      corner, so help is never more than one click away.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white font-bold mt-1">•</span>
                    <span>
                      <strong className="text-white">
                        Attention-Grabbing:
                      </strong>{" "}
                      The button gently shakes after a few seconds to remind you
                      it's available if you need help.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white font-bold mt-1">•</span>
                    <span>
                      <strong className="text-white">Quick Reference:</strong>{" "}
                      Instead of scrolling through this full documentation,
                      click the Guide button for instant, page-specific tips and
                      instructions.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 mt-4 border border-white/20">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  How to Use It
                </h3>
                <ol className="space-y-2 text-emerald-50 list-decimal list-inside">
                  <li>
                    <strong className="text-white">Locate the Button:</strong>{" "}
                    Look for the green circular button with a book icon in the
                    bottom-right corner of any page. On larger screens, it will
                    also show the word "Guide".
                  </li>
                  <li>
                    <strong className="text-white">Click to Open:</strong> Click
                    the button to open a helpful panel with information specific
                    to the page you're viewing.
                  </li>
                  <li>
                    <strong className="text-white">Read the Guidance:</strong>{" "}
                    The panel shows a description of the page and organized
                    sections with tips and instructions relevant to that
                    specific page.
                  </li>
                  <li>
                    <strong className="text-white">Close When Done:</strong>{" "}
                    Click the X button or click outside the panel to close it
                    and continue working.
                  </li>
                </ol>
              </div>

              <div className="mt-5 p-4 bg-white/20 rounded-lg border border-white/30">
                <p className="text-white font-semibold text-center">
                  💡 <strong>Pro Tip:</strong> Use the Guide button as your
                  first stop when you're unsure about what to do on any page.
                  It's faster than searching through this full documentation!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="mr-2 text-emerald-600" size={24} />
            Table of Contents
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <a
                href="#guide-button"
                className="text-emerald-600 hover:underline font-semibold"
              >
                ⭐ The Guide Button (Read This First!)
              </a>
            </li>
            <li>
              <a href="#overview" className="text-emerald-600 hover:underline">
                1. Project Overview
              </a>
            </li>
            <li>
              <a href="#purpose" className="text-emerald-600 hover:underline">
                2. What It's For
              </a>
            </li>
            <li>
              <a href="#roles" className="text-emerald-600 hover:underline">
                3. User Roles
              </a>
            </li>
            <li>
              <a href="#flow" className="text-emerald-600 hover:underline">
                4. Complete Demo Flow
              </a>
            </li>
            <li>
              <a href="#features" className="text-emerald-600 hover:underline">
                5. Key Features
              </a>
            </li>
            <li>
              <a href="#analyst" className="text-emerald-600 hover:underline">
                6. Analyst View & Risk Assessment
              </a>
            </li>
            <li>
              <a href="#testing" className="text-emerald-600 hover:underline">
                7. Testing Configurations
              </a>
            </li>
            <li>
              <a href="#payment" className="text-emerald-600 hover:underline">
                8. Loan Monitoring & DPD Simulation
              </a>
            </li>
            <li>
              <a href="#claims" className="text-emerald-600 hover:underline">
                9. Claims Management
              </a>
            </li>
            <li>
              <a href="#recovery" className="text-emerald-600 hover:underline">
                10. Recovery Process
              </a>
            </li>
          </ul>
        </div>

        {/* Section 1: Project Overview */}
        <section
          id="overview"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Building2 className="mr-3 text-emerald-600" size={28} />
            1. Project Overview
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              The{" "}
              <strong>
                National Credit Guarantee Corporation (NCGC) Demo Platform
              </strong>{" "}
              is a comprehensive web application that simulates a credit
              guarantee system for Micro, Small, and Medium Enterprises (MSMEs)
              in Nigeria. This platform demonstrates how financial institutions
              (Partner Financial Institutions - PFIs) can submit loan guarantee
              applications on behalf of their clients, and how NCGC analysts
              review, assess, and approve these applications.
            </p>
            <p>
              The system showcases the complete lifecycle of a credit guarantee
              application, from PFI self-onboarding, through initial submission
              by a bank officer, KYC verification, risk assessment,
              approval/rejection, and ongoing loan monitoring with payment delay
              simulation.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-emerald-800">
                <strong>Note on PFI Onboarding:</strong> In this demo, PFIs
                onboard themselves through the PFI Console Portal. Once all
                required fields are correctly provided, the onboarding is
                automatically approved - no manual NCGC admin approval is
                required.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: What It's For */}
        <section
          id="purpose"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-3 text-emerald-600" size={28} />
            2. What It's For
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>This demo platform serves multiple purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Demonstration:</strong> Showcase how a credit guarantee
                system works in practice, including the workflow between banks
                and NCGC.
              </li>
              <li>
                <strong>Training:</strong> Help stakeholders understand the
                application review process, risk assessment methodologies, and
                decision-making criteria.
              </li>
              <li>
                <strong>Testing:</strong> Allow users to test different
                scenarios including application approvals, rejections, and
                payment delay simulations.
              </li>
              <li>
                <strong>Evaluation:</strong> Demonstrate the platform's
                capabilities for potential implementation or integration.
              </li>
            </ul>
            <p>
              The platform simulates real-world operations including document
              uploads, KYC verification, risk scoring, guarantee percentage
              calculations, and loan performance monitoring.
            </p>
          </div>
        </section>

        {/* Section 3: User Roles */}
        <section
          id="roles"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="mr-3 text-emerald-600" size={28} />
            3. User Roles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 bg-emerald-50">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Building2 className="mr-2 text-emerald-600" size={20} />
                NCGC Admin
              </h3>
              <p className="text-sm text-gray-700">
                Manages system settings and views onboarded Partner Financial
                Institutions (PFIs). Note: PFIs now onboard themselves through
                the PFI Console Portal.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <ShieldCheck className="mr-2 text-blue-600" size={20} />
                NCGC Analyst
              </h3>
              <p className="text-sm text-gray-700">
                Reviews and analyzes guarantee applications. Performs risk
                assessments, sets guarantee percentages, and makes
                approval/rejection decisions. Monitors loan performance.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 bg-purple-50">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <FileText className="mr-2 text-purple-600" size={20} />
                Bank Maker
              </h3>
              <p className="text-sm text-gray-700">
                Creates and submits loan guarantee applications on behalf of
                MSME borrowers. Uploads required documents and verifies business
                and director information.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Complete Demo Flow */}
        <section
          id="flow"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="mr-3 text-emerald-600" size={28} />
            4. Complete Demo Flow
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Step 1: PFI Self-Onboarding
              </h3>
              <p className="text-gray-700 text-sm">
                Use the "View Demo Credentials" button on the login page to see
                available credentials. Login with the generic PFI onboarding
                credentials (pfi.onboard@ncgc.gov.ng / pfi123) to access the PFI
                Console Portal. Fill in your institution's details, including
                CBN License, RC Number, NDIC Number, and compliance information.
                The system will automatically verify these credentials.{" "}
                <strong>
                  Your onboarding will be automatically approved once all
                  required fields are correctly provided
                </strong>{" "}
                - no manual NCGC admin approval is needed in this demo.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Step 2: Receive Your Credentials
              </h3>
              <p className="text-gray-700 text-sm">
                After successful onboarding, you will receive login credentials
                for your institution (Bank Maker and Bank Approver roles). These
                credentials are automatically generated and displayed upon
                completion. You can copy them for future use.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Step 3: Login as Bank Maker
              </h3>
              <p className="text-gray-700 text-sm">
                Logout and login as a Bank Maker using the credentials you
                received during onboarding. You'll see the Bank Maker dashboard
                with options to create new applications.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Step 4: Create an Application
              </h3>
              <p className="text-gray-700 text-sm">
                Click "Create New Application" and follow the 4-step wizard:
              </p>
              <ul className="list-disc pl-6 mt-2 text-sm text-gray-600 space-y-1">
                <li>
                  <strong>Business Details:</strong> Enter business name,
                  address, sector, and business focus
                </li>
                <li>
                  <strong>Identity & Verification:</strong> Enter RC Number,
                  TIN, CAC Number, and director/owner details with BVN/NIN
                  verification
                </li>
                <li>
                  <strong>Required Documents:</strong> Upload Certificate of
                  Incorporation, Tax Clearance, Performance Bond (if
                  applicable), and Collateral Documents (if applicable)
                </li>
                <li>
                  <strong>Loan Guarantee Request Details:</strong> Specify loan
                  amount, tenure, purpose, and guarantee type
                </li>
              </ul>
              <p className="text-gray-700 text-sm mt-2">
                The system performs real-time KYC verification as you enter
                information. Documents are uploaded to cloud storage and can be
                previewed later.
              </p>
            </div>

            <div className="border-l-4 border-indigo-500 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Step 4: Login as NCGC Analyst
              </h3>
              <p className="text-gray-700 text-sm">
                Logout and login as an NCGC Analyst. Navigate to the
                Applications dashboard to see all submitted applications. Click
                on any application to view details and perform analysis.
              </p>
            </div>

            <div className="border-l-4 border-emerald-600 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Step 5: Analyze and Decide
              </h3>
              <p className="text-gray-700 text-sm">
                On the application detail page, use the Risk Assessment tools
                to:
              </p>
              <ul className="list-disc pl-6 mt-2 text-sm text-gray-600 space-y-1">
                <li>
                  Adjust the Risk Score slider (0-100) to see how it affects
                  guarantee percentage
                </li>
                <li>
                  Toggle "Priority Sector" for Agriculture, Youth/Women-led, or
                  Green Energy businesses
                </li>
                <li>Review all uploaded documents and verified information</li>
                <li>
                  Approve with a specific guarantee percentage or reject with a
                  reason
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Step 6: Monitor Loan Performance
              </h3>
              <p className="text-gray-700 text-sm">
                After approving an application, navigate to the "Loans" section
                to view active loans. Click on any loan to access the monitoring
                dashboard where you can simulate payment delays and see how they
                affect loan grading.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Key Features */}
        <section
          id="features"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="mr-3 text-emerald-600" size={28} />
            5. Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-emerald-500 rounded-lg p-5 bg-emerald-50">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <BookOpen className="text-emerald-600" size={18} />
                Context-Sensitive Guide Button
              </h3>
              <p className="text-sm text-gray-600">
                A floating help button on every page that provides instant,
                page-specific guidance. Click it anytime for quick tips and
                instructions relevant to what you're currently viewing.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                Real-time KYC Verification
              </h3>
              <p className="text-sm text-gray-600">
                Automatic verification of RC Numbers, TIN, CAC, BVN, and NIN as
                you type. Status indicators show verification progress.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                Document Upload & Preview
              </h3>
              <p className="text-sm text-gray-600">
                Secure cloud storage for documents. Preview PDFs and images
                directly in the browser without downloading.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                Risk Assessment Simulation
              </h3>
              <p className="text-sm text-gray-600">
                Interactive risk scoring tool that dynamically calculates
                suggested guarantee percentages based on risk level and priority
                sector status.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                Multi-step Application Wizard
              </h3>
              <p className="text-sm text-gray-600">
                Intuitive 4-step form with progress tracking. Supports multiple
                directors/owners with individual verification.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                Application Comments/Messaging
              </h3>
              <p className="text-sm text-gray-600">
                Communication channel between banks and NCGC analysts for
                clarifications and feedback during the review process.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                Loan Performance Monitoring
              </h3>
              <p className="text-sm text-gray-600">
                Track repayment schedules and simulate payment delays to see how
                they affect loan grading and risk classification.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Analyst View & Risk Assessment */}
        <section
          id="analyst"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <ShieldCheck className="mr-3 text-emerald-600" size={28} />
            6. Analyst View & Risk Assessment
          </h2>
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Application Detail Page
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                When an NCGC Analyst clicks on an application from the
                dashboard, they are taken to a comprehensive detail page that
                includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Business Information:</strong> Complete business
                  details, registration numbers, sector, and address
                </li>
                <li>
                  <strong>Loan Details:</strong> Amount, tenure, purpose, and
                  guarantee type
                </li>
                <li>
                  <strong>Directors/Owners:</strong> Full information including
                  BVN, NIN, and uploaded identification documents
                </li>
                <li>
                  <strong>Uploaded Documents:</strong> All submitted documents including Certificate of Incorporation, Tax Clearance, Performance Bond (if applicable), and Collateral Documents (if applicable) with preview and download capabilities
                </li>
                <li>
                  <strong>Claim Information:</strong> If a claim has been submitted for this application, view claim details and status
                </li>
                <li>
                  <strong>Messages/Comments:</strong> Communication history
                  between bank and NCGC
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Risk Scorecard
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                The most important feature on the analyst view is the{" "}
                <strong>Risk Assessment & Guarantee Simulation</strong> card:
              </p>

              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">
                  Risk Score Calculation
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  The risk assessment tool calculates a comprehensive risk score based on multiple factors. The system automatically computes the total score and suggests guarantee coverage:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                  <li>
                    <strong>Credit Score (Simulated):</strong> Based on credit history, ranges from 60-80 points. This is simulated since we don't have access to actual credit bureaus.
                  </li>
                  <li>
                    <strong>Performance Bond:</strong> +10 points if Performance Bond documents were uploaded as part of the application.
                  </li>
                  <li>
                    <strong>Collateral Documents:</strong> +10 points if Collateral Documents were uploaded (optional field).
                  </li>
                  <li>
                    <strong>Business Focus / Thematic Area:</strong> Points vary based on sector priority:
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li>Youth-led / Women-led / Green Energy programs: 20 points</li>
                      <li>Agriculture: 15 points</li>
                      <li>Other priority sectors: 10 points</li>
                      <li>Standard sectors: 5 points</li>
                      <li>High-risk sectors: 0 points</li>
                    </ul>
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 font-medium">
                  Total Risk Score determines the suggested guarantee coverage:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mt-2">
                  <li>
                    <strong>80-100 (Low Risk):</strong> 50-55% guarantee coverage
                  </li>
                  <li>
                    <strong>50-79 (Moderate Risk):</strong> 55-60% guarantee coverage
                  </li>
                  <li>
                    <strong>0-49 (High Risk):</strong> 60% guarantee coverage (maximum)
                  </li>
                  <li>
                    <strong>Special High-Risk (Priority Sectors):</strong> Agriculture, Youth-led, Women-led, Green Energy - 60% guarantee coverage regardless of other factors
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">
                  Visual Feedback
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  The system provides immediate visual feedback:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                  <li>
                    Risk category badge (Low Risk, Moderate Risk, High Risk, or
                    Special High-Risk)
                  </li>
                  <li>Large display of suggested guarantee percentage</li>
                  <li>
                    Color-coded indicators (green for low risk, amber for
                    moderate, red for high)
                  </li>
                  <li>
                    Quick action buttons to approve with suggested percentage or
                    reject
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Tip:</strong> Try adjusting the risk score slider and
                toggling the priority sector to see how the guarantee percentage
                changes in real-time. This helps analysts understand the impact
                of their risk assessment on the guarantee coverage.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Testing Configurations */}
        <section
          id="testing"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="mr-3 text-emerald-600" size={28} />
            7. Testing Different Configurations
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Testing Approval Scenarios
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                To test the approval process:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-700">
                <li>
                  Navigate to an application detail page as an NCGC Analyst
                </li>
                <li>
                  Use the Risk Score slider to set different risk levels (try
                  30, 60, 85)
                </li>
                <li>
                  Toggle Priority Sector on/off to see how it affects the
                  guarantee
                </li>
                <li>
                  Click "Approve with X%" button (where X is the suggested
                  percentage)
                </li>
                <li>
                  In the confirmation modal, you can adjust the guarantee
                  percentage if needed
                </li>
                <li>Click "Confirm Approval" to finalize</li>
              </ol>
              <p className="text-gray-700 text-sm mt-3">
                After approval, the application status changes to "Approved" and
                appears in the Loans section for monitoring.
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-6 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Testing Rejection Scenarios
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                To test the rejection process:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-700">
                <li>
                  Navigate to an application detail page as an NCGC Analyst
                </li>
                <li>
                  Review the application details and identify potential issues
                </li>
                <li>Click the "Reject" button</li>
                <li>
                  In the rejection modal, enter a detailed reason (required
                  field)
                </li>
                <li>Click "Reject Application" to finalize</li>
              </ol>
              <p className="text-gray-700 text-sm mt-3">
                The rejection reason is saved as a comment and the application
                status changes to "Rejected". The bank can view this feedback
                when they check the application status.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <AlertTriangle className="mr-2 text-amber-600" size={20} />
                Testing Tips
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>
                  Try approving applications with different risk scores to see
                  how guarantee percentages vary
                </li>
                <li>
                  Test the Priority Sector feature by selecting applications
                  from Agriculture, Youth/Women-led, or Green Energy sectors
                </li>
                <li>
                  Create multiple applications with varying loan amounts and
                  tenures to see different scenarios
                </li>
                <li>
                  Use the "Reset Demo Data" button on the login page to start
                  fresh if needed
                </li>
                <li>
                  Test the messaging feature by adding comments during the
                  review process
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 8: Payment Delay Simulation */}
        <section
          id="payment"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-3 text-emerald-600" size={28} />
            8. Payment Delay Simulation
          </h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Accessing the Loan Monitoring Dashboard
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                After approving an application, navigate to the "Loans" section
                from the NCGC Analyst dashboard. Click on any approved loan to
                access the detailed monitoring page. PFIs can also view repayment tracking from their application detail pages.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Understanding the Simulation
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                The loan monitoring page simulates a loan that started 3 months
                ago:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Months 1 & 2:</strong> Marked as "Paid" (simulated
                  successful payments)
                </li>
                <li>
                  <strong>Month 3:</strong> The current installment that can be
                  simulated as overdue
                </li>
                <li>
                  <strong>Future Months:</strong> Marked as "Pending" (not yet
                  due)
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Using the Days Past Due Slider
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                The monitoring dashboard includes an interactive slider to
                simulate payment delays:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-700">
                <li>
                  Locate the "Simulate Days Past Due" slider in the grading card
                  (top right)
                </li>
                <li>Adjust the slider from 0 to 200 days</li>
                <li>Watch how the loan grading changes in real-time</li>
                <li>
                  Observe the repayment schedule table update to show overdue
                  status
                </li>
              </ol>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Loan Grading System
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                As you adjust the days past due, the system automatically
                updates the loan grading:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-emerald-500 pl-4 py-2">
                  <h4 className="font-medium text-emerald-700 mb-1">
                    Performing (0-30 days)
                  </h4>
                  <p className="text-xs text-gray-600">
                    Fully performing, low risk
                  </p>
                </div>
                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="font-medium text-amber-700 mb-1">
                    Watch List (31-60 days)
                  </h4>
                  <p className="text-xs text-gray-600">
                    Early signs of weakness
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <h4 className="font-medium text-orange-700 mb-1">
                    Substandard (61-90 days)
                  </h4>
                  <p className="text-xs text-gray-600">Significant arrears</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <h4 className="font-medium text-red-700 mb-1">
                    Doubtful (91-180 days)
                  </h4>
                  <p className="text-xs text-gray-600">
                    Major repayment problems
                  </p>
                </div>
                <div className="border-l-4 border-red-700 pl-4 py-2 md:col-span-2">
                  <h4 className="font-medium text-red-900 mb-1">
                    Loss / Default (180+ days)
                  </h4>
                  <p className="text-xs text-gray-600">
                    Account in default; claim initiation required
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Visual Feedback
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                The system provides comprehensive visual feedback:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Grading Card:</strong> Color-coded card showing
                  current loan status with icon and description
                </li>
                <li>
                  <strong>Days Past Due Badge:</strong> Displays the exact
                  number of days overdue
                </li>
                <li>
                  <strong>Repayment Schedule Table:</strong> Shows each
                  installment with status (Paid, Pending, Overdue) and days
                  overdue
                </li>
                <li>
                  <strong>Color Coding:</strong> Green for performing, amber for
                  watch list, orange for substandard, red for doubtful/default
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Testing Tip:</strong> Try setting the slider to
                different values (30, 60, 90, 120, 180 days) to see how the loan
                grading transitions through each category. This demonstrates how
                payment delays trigger different risk classifications and
                potential claim initiation requirements. The DPD value is saved to the database and persists across sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Claims Management */}
        <section
          id="claims"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <FileWarning className="mr-3 text-emerald-600" size={28} />
            9. Claims Management
          </h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Overview
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                When a loan exceeds 180 days past due (DPD), it enters default status. At this point, 
                Partner Financial Institutions (PFIs) can initiate a claim to recover the guaranteed 
                portion of the defaulted loan from NCGC.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                PFI: Creating a Claim
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                From the Bank Maker's application detail page (for approved applications):
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-700">
                <li>Use the "Days Past Due" slider to simulate loan performance (or wait until DPD exceeds 180 days)</li>
                <li>When DPD exceeds 180 days, a "Create Claim" button will appear</li>
                <li>Click "Create Claim" to navigate to the claim submission form</li>
                <li>Fill in the claim details:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Claim amount (automatically calculated based on guarantee percentage, cannot exceed maximum claimable)</li>
                    <li>Default date</li>
                    <li>Outstanding principal and interest amounts</li>
                    <li>Default reason (required)</li>
                    <li>Actions taken before default</li>
                    <li>Supporting documents (optional)</li>
                  </ul>
                </li>
                <li>Submit the claim for NCGC review</li>
              </ol>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                NCGC Analyst: Reviewing Claims
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                NCGC Analysts can view and manage claims in two ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li><strong>Claims Menu:</strong> Navigate to "Claims" from the side menu to see all claims across all PFIs</li>
                <li><strong>From Application Details:</strong> View claim information directly from ongoing application detail pages</li>
                <li><strong>From Loan Monitoring:</strong> Access claims from the loan details page when monitoring ongoing loans</li>
              </ul>
              <p className="text-gray-700 text-sm mt-4 mb-3">
                When reviewing a claim:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-700">
                <li>Review all claim information including default date, reason, and outstanding amounts</li>
                <li>Check supporting documents uploaded by the PFI</li>
                <li>Verify the claim amount against the guaranteed portion</li>
                <li>Make a decision:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><strong>Approve:</strong> Click "Approve Claim" - a confirmation dialog will show the exact payment amount. Click "Approve Claim and Pay" to simulate payment processing. The PFI will receive a notification.</li>
                    <li><strong>Reject:</strong> Click "Reject Claim" and provide review comments explaining the rejection reason (required)</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Important:</strong> Claims can only be submitted for approved applications. 
                The claim amount cannot exceed the maximum claimable amount based on the guarantee percentage. 
                Once a claim is approved and paid, NCGC can initiate a recovery process to attempt to recover funds from the defaulting borrower.
              </p>
            </div>
          </div>
        </section>

        {/* Section 10: Recovery Process */}
        <section
          id="recovery"
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <RefreshCw className="mr-3 text-emerald-600" size={28} />
            10. Recovery Process
          </h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Overview
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                After NCGC approves and pays a claim to a PFI, NCGC initiates a recovery process to 
                attempt to recover the funds from the defaulting borrower. This process is managed 
                entirely by NCGC analysts.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Creating a Recovery Process
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                Recovery processes can be initiated in two ways:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-700">
                <li><strong>From Claims Page:</strong> After approving and paying a claim, click "Start Recovery Process" from the claim details page</li>
                <li><strong>From Recovery Menu:</strong> Navigate to "Recovery" from the side menu, then click "Create Recovery Process"</li>
              </ol>
              <p className="text-gray-700 text-sm mt-4 mb-3">
                When creating a recovery process:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>Select an application from the dropdown (only shows applications with approved and paid claims, no existing recovery)</li>
                <li>Choose a recovery method (Legal Action, Asset Seizure, Negotiation, etc.)</li>
                <li>Set the recovery amount (auto-filled from claim payment amount, can be adjusted)</li>
                <li>Assign recovery personnel</li>
                <li>Set priority level (High, Medium, Low)</li>
                <li>Add notes and observations</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Managing Recovery Processes
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                View all recovery processes from the "Recovery" menu. Each recovery process shows:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>Business name and application details</li>
                <li>Recovery method and amount</li>
                <li>Assigned personnel</li>
                <li>Current status (Initiated, In Progress, Completed, Closed)</li>
                <li>Creation date</li>
              </ul>
              <p className="text-gray-700 text-sm mt-4 mb-3">
                From the recovery detail page, analysts can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>View complete recovery information</li>
                <li>Update recovery status with comments</li>
                <li>Track milestones and status change history</li>
                <li>Link back to the original application</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Note:</strong> Recovery processes are only available for applications with 
                approved and paid claims. Each application can only have one active recovery process at a time.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
          <p className="text-gray-600 text-sm mb-4">
            Use the "Reset Demo Data" feature to start fresh.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
