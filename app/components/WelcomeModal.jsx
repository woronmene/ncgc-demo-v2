"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, X, Sparkles, ExternalLink, HelpCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function WelcomeModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);

  // Define page-specific content (reusing DocumentationWidget structure)
  const pageContent = {
    "/login": {
      title: "Welcome to NCGC Demo Platform",
      description: "This is the entry point for the National Credit Guarantee Corporation (NCGC) demo platform.",
      sections: [
        {
          title: "Available Roles",
          items: [
            "PFI Onboarding: Use generic credentials to onboard your financial institution as a PFI.",
            "NCGC Admin: Manages system settings and views onboarded PFIs.",
            "NCGC Analyst: Reviews, approves, and monitors guarantee applications.",
            "Bank Maker: Represents a PFI. Creates and submits loan guarantee applications."
          ]
        },
        {
          title: "Getting Started",
          items: [
            "Click 'View Demo Credentials' to see available users and their login credentials.",
            "To test the full flow: Login with PFI onboarding credentials → Complete onboarding → Logout → Login as that Bank's Maker → Create Application → Logout → Login as Analyst → Approve Application."
          ]
        }
      ],
      specialNote: "Click 'View Demo Credentials' to get started with PFI onboarding credentials."
    },
    "/ncgc_admin/dashboard": {
      title: "Admin Dashboard",
      description: "Overview of all onboarded Partner Financial Institutions (PFIs).",
      sections: [
        {
          title: "What You Can Do",
          items: [
            "View list of all partner banks and their verification status.",
            "Click 'Onboard New Bank' to register a new financial institution."
          ]
        }
      ]
    },
    "/ncgc_admin/dashboard/onboard": {
      title: "PFI Console Portal - Self-Onboarding",
      description: "Register your financial institution as a Partner Financial Institution (PFI) with NCGC. PFIs onboard themselves through this portal.",
      sections: [
        {
          title: "Process",
          items: [
            "Fill in your institution's details (Name, License, etc.).",
            "The system automatically validates regulatory numbers (simulated).",
            "Once all required fields are correctly provided, your onboarding is automatically approved.",
            "Upon success, login credentials for your institution (Maker & Approver) are generated automatically."
          ]
        },
        {
          title: "Important",
          items: [
            "This is a self-service onboarding process. You initiate and complete the onboarding yourself.",
            "Approval is automatic once all required fields are correctly provided.",
            "The credentials will automatically be added to the credentials in the login page when you click on 'View Demo Credentials'.",
            "After onboarding, use the generated credentials to log in and create applications."
          ]
        }
      ]
    },
    "/bank_maker/dashboard": {
      title: "Bank Maker Dashboard",
      description: "Manage your institution's guarantee applications.",
      sections: [
        {
          title: "What You Can Do",
          items: [
            "Track status of applications (Pending, Approved, Rejected).",
            "Click 'Create Application' to submit a new loan guarantee request.",
            "Click on any application row to view its full details, repayment tracking, and create claims if needed."
          ]
        }
      ]
    },
    "/bank_maker/dashboard/create": {
      title: "Create Loan Guarantee Application",
      description: "Submit a new loan guarantee request to NCGC. Note: This is a loan guarantee application, not a direct loan application.",
      sections: [
        {
          title: "Steps",
          items: [
            "1. Business Details: Basic info about the SME.",
            "2. Identity: Directors/Owners info and KYC (BVN/NIN validation).",
            "3. Documents: Upload required files including Certificate of Incorporation, Tax Clearance, Performance Bond (if applicable), and Collateral Documents (if applicable).",
            "4. Loan Guarantee Request Details: Amount, tenor, and guarantee type."
          ]
        }
      ]
    },
    "/ncgc_analyst/dashboard": {
      title: "Analyst Dashboard",
      description: "Central hub for reviewing all incoming guarantee requests.",
      sections: [
        {
          title: "What You Can Do",
          items: [
            "View applications from ALL partner banks.",
            "Click on any application to open the detailed review view.",
            "Navigate to 'Loans' to monitor active guarantees.",
            "Access 'Claims' to review and process claim requests.",
            "Manage 'Recovery' processes for defaulted loans."
          ]
        }
      ]
    },
    "/ncgc_analyst/loans": {
      title: "Loan Monitoring",
      description: "Track the performance of active guarantees and monitor repayment status.",
      sections: [
        {
          title: "What You Can Do",
          items: [
            "View all ongoing loans across all PFIs.",
            "Monitor repayment schedules and payment status.",
            "Click on any loan to view detailed performance metrics and simulate Days Past Due (DPD)."
          ]
        }
      ]
    },
    "/ncgc_analyst/claims": {
      title: "Claims Management",
      description: "View and manage all claims submitted by PFIs for defaulted loans.",
      sections: [
        {
          title: "What You Can Do",
          items: [
            "View all claims across all PFIs.",
            "See claim status: Pending, Approved, Rejected, or Paid.",
            "Click 'View Details' to review a specific claim and make approval/rejection decisions."
          ]
        }
      ]
    },
    "/ncgc_analyst/recovery": {
      title: "Recovery Management",
      description: "Manage recovery processes to reclaim funds from defaulting borrowers after claims have been paid.",
      sections: [
        {
          title: "What You Can Do",
          items: [
            "View all recovery processes initiated by NCGC.",
            "Track recovery status: Initiated, In Progress, Completed, or Closed.",
            "Click 'Create Recovery Process' to start a new recovery for a paid claim."
          ]
        }
      ]
    }
  };

  // Determine content based on current path
  useEffect(() => {
    let pageKey = pathname;

    // Handle dynamic routes
    if (pathname.includes("/ncgc_analyst/dashboard/applications/")) {
      pageKey = "/ncgc_analyst/dashboard/applications";
      setContent({
        title: "Application Review",
        description: "Detailed assessment of a specific loan guarantee application, including risk scoring and claim information.",
        sections: [
          {
            title: "What You Can Do",
            items: [
              "Verify business and owner details.",
              "Preview uploaded documents including collateral (if applicable).",
              "Use the Risk Assessment tool to calculate risk scores based on multiple factors.",
              "Approve or Reject the application based on your findings.",
              "View claim information if a claim has been submitted."
            ]
          }
        ]
      });
    } else if (pathname.includes("/bank_maker/dashboard/") && pathname !== "/bank_maker/dashboard/create") {
      if (pathname.includes("/claim")) {
        setContent({
          title: "Create Claim",
          description: "Submit a claim request for a defaulted loan. Claims can be created when a loan exceeds 180 days past due.",
          sections: [
            {
              title: "What You Can Do",
              items: [
                "Fill in the claim amount (automatically calculated based on guarantee percentage).",
                "Provide the default date and reason for default.",
                "Document outstanding amounts and actions taken.",
                "Upload supporting documents if available."
              ]
            }
          ]
        });
      } else {
        setContent({
          title: "Application Details",
          description: "View the details of your submitted loan guarantee application, including repayment tracking and claim management.",
          sections: [
            {
              title: "What You Can Do",
              items: [
                "View the current status of your application.",
                "Review all submitted information and documents.",
                "Use the 'Days Past Due' slider to simulate loan performance.",
                "View the repayment schedule and track payment status.",
                "Create a claim when DPD exceeds 180 days."
              ]
            }
          ]
        });
      }
    } else if (pathname.includes("/ncgc_analyst/loans/")) {
      setContent({
        title: "Loan Details & Monitoring",
        description: "Detailed view of a specific loan's performance, including repayment tracking and claim management.",
        sections: [
          {
            title: "What You Can Do",
            items: [
              "View the complete repayment schedule.",
              "Use the 'Days Past Due' slider to simulate loan performance (0-200 days).",
              "Monitor when loans exceed 180 days past due (default threshold).",
              "View claim information if a claim has been submitted."
            ]
          }
        ]
      });
    } else if (pathname.includes("/ncgc_analyst/claims/")) {
      setContent({
        title: "Claim Review & Decision",
        description: "Review claim details, verify documentation, and make approval/rejection decisions.",
        sections: [
          {
            title: "What You Can Do",
            items: [
              "Review all claim information including default date, reason, and outstanding amounts.",
              "Check supporting documents uploaded by the PFI.",
              "Approve or reject the claim with review comments.",
              "Process payment for approved claims.",
              "Start a recovery process after paying a claim."
            ]
          }
        ]
      });
    } else if (pathname.includes("/ncgc_analyst/recovery/create")) {
      setContent({
        title: "Create Recovery Process",
        description: "Initiate a new recovery process for a defaulted loan where a claim has been paid.",
        sections: [
          {
            title: "What You Can Do",
            items: [
              "Select an application from the dropdown (only shows applications with approved and paid claims).",
              "Choose a recovery method (Legal Action, Asset Seizure, Negotiation, etc.).",
              "Set the recovery amount and assign personnel.",
              "Set priority level and add notes."
            ]
          }
        ]
      });
    } else if (pathname.includes("/ncgc_analyst/recovery/") && pathname !== "/ncgc_analyst/recovery") {
      setContent({
        title: "Recovery Process Details",
        description: "View and update the status of a specific recovery process.",
        sections: [
          {
            title: "What You Can Do",
            items: [
              "View recovery method, amount, assignee, and priority.",
              "Track recovery status and milestones.",
              "Update recovery status with comments.",
              "View the complete history of status changes."
            ]
          }
        ]
      });
    } else if (pageContent[pageKey]) {
      setContent(pageContent[pageKey]);
    } else {
      // Default fallback
      setContent({
        title: "Welcome to NCGC Demo",
        description: "Navigate through the application to see specific documentation.",
        sections: []
      });
    }
  }, [pathname]);

  // Check if user has seen this page's welcome modal before
  useEffect(() => {
    if (!content) return;
    
    const pageKey = `ncgc_welcome_${pathname}`;
    const hasSeenPageWelcome = localStorage.getItem(pageKey);
    
    if (!hasSeenPageWelcome) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        setIsOpen(true);
      }, 500);
    }
  }, [content, pathname]);

  const handleClose = () => {
    setIsOpen(false);
    const pageKey = `ncgc_welcome_${pathname}`;
    localStorage.setItem(pageKey, "true");
  };

  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-t-2xl text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{content.title}</h2>
                <p className="text-emerald-50 mt-1">First time on this page? Here's what you can do</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Page Description */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* Page-Specific Sections */}
          {content.sections && content.sections.length > 0 && (
            <div className="space-y-4">
              {content.sections.map((section, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                    {section.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start leading-snug">
                        <ChevronRight size={14} className="text-emerald-400 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Special Note for Login Page */}
          {content.specialNote && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-medium">
                💡 {content.specialNote}
              </p>
            </div>
          )}

          {/* Guide Button Highlight */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white border-2 border-emerald-400">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                <BookOpen size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">💡 Your Context-Sensitive Guide</h3>
                <p className="text-emerald-50 mb-3 leading-relaxed">
                  <strong className="text-white">Look for the green "Guide" button in the bottom-right corner of this page.</strong> 
                  Click it anytime to see detailed help and instructions specific to what you're viewing.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-3 border border-white/20">
                  <p className="text-sm text-emerald-50">
                    <strong className="text-white">Tip:</strong> The Guide button is available on every page and automatically 
                    shows relevant information for the page you're currently viewing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documentation Link */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">📚 Complete Documentation</h3>
            <p className="text-sm text-gray-700 mb-4">
              For detailed information about the platform, user roles, complete workflows, and testing instructions, 
              visit our comprehensive documentation page.
            </p>
            <Link
              href="/documentation"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm"
              onClick={handleClose}
            >
              View Full Documentation
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <p className="text-sm text-gray-600">
            This modal won't appear again on this page. Use the Guide button for help anytime.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
