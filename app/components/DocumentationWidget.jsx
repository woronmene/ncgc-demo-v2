"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, X, HelpCircle, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DocumentationWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [shake, setShake] = useState(false);

  // Trigger shake animation: initial 3s delay, then every 10s
  useEffect(() => {
    const triggerShake = () => {
      setShake(true);
      setTimeout(() => setShake(false), 1000); // Reset after animation duration
    };

    let intervalId;
    const timeoutId = setTimeout(() => {
      triggerShake();
      intervalId = setInterval(triggerShake, 10000);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Define documentation content for different routes
  const docs = {
    "/login": {
      title: "Welcome to NCGC Demo",
      description: "This is the entry point for the National Credit Guarantee Corporation (NCGC) demo platform.",
      sections: [
        {
          title: "Available Roles",
          items: [
            "PFI Onboarding: Use generic credentials to onboard your financial institution as a PFI.",
            "NCGC Admin: Manages system settings and views onboarded PFIs.",
            "NCGC Analyst: Reviews, approves, and monitors guarantee applications.",
            "PFI Maker: Represents a PFI. Creates and submits loan guarantee applications."
          ]
        },
        {
          title: "How to Test",
          items: [
            "Click 'View Demo Credentials' to see available users.",
            "To test the full flow: Login with PFI onboarding credentials -> Complete onboarding -> Logout -> Login as that Bank's Maker -> Create Application -> Logout -> Login as Analyst -> Approve Application."
          ]
        }
      ]
    },
    "/ncgc_admin/dashboard": {
      title: "Admin Dashboard",
      description: "Overview of all onboarded Partner Financial Institutions (PFIs).",
      sections: [
        {
          title: "Actions",
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
      title: "PFI Maker Dashboard",
      description: "Manage your institution's guarantee applications.",
      sections: [
        {
          title: "Overview",
          items: [
            "Track status of applications (Pending, Approved, Rejected)."
          ]
        },
        {
          title: "Actions",
          items: [
            "Click 'Create Application' to submit a new request.",
            "Click on any application row to view its full details."
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
        },
        {
          title: "Important Notes",
          items: [
            "Collateral Documents are optional - only upload if the loan includes collateral.",
            "Performance Bond is also optional but can improve risk assessment scores.",
            "All uploaded documents are stored securely and reviewed by NCGC analysts."
          ]
        }
      ]
    },
    "/ncgc_analyst/dashboard": {
      title: "Analyst Dashboard",
      description: "Central hub for reviewing all incoming guarantee requests.",
      sections: [
        {
          title: "Overview",
          items: [
            "View applications from ALL partner banks.",
            "Filter and sort applications (future feature)."
          ]
        },
        {
          title: "Actions",
          items: [
            "Click on any application to open the detailed review view.",
            "Check the status column to see which items need attention."
          ]
        }
      ]
    },
    "/ncgc_analyst/dashboard/applications": { // Fallback for dynamic routes
      title: "Application Review",
      description: "Detailed assessment of a specific loan guarantee application, including risk scoring and claim information.",
      sections: [
        {
          title: "Review Process",
          items: [
            "Verify business and owner details.",
            "Preview uploaded documents including collateral (if applicable).",
            "Use the 'Risk Assessment' tool to calculate risk scores based on multiple factors.",
            "Review the risk breakdown: Credit Score, Performance Bond, Collateral, and Sector Priority.",
            "Approve or Reject the application based on your findings."
          ]
        },
        {
          title: "Risk Assessment",
          items: [
            "Credit Score: Simulated score (60-80 range) based on credit history.",
            "Performance Bond: +10 points if uploaded.",
            "Collateral Documents: +10 points if uploaded.",
            "Sector Priority: Points vary based on thematic area (Youth-led/Women-led/Green Energy: 20pts, Agriculture: 15pts, etc.).",
            "Total risk score determines suggested guarantee coverage percentage."
          ]
        },
        {
          title: "Claim Information",
          items: [
            "If a claim has been submitted for this application, view claim details here.",
            "Click 'View Full Claim' to review and process the claim.",
            "Claims appear when PFIs submit them for defaulted loans."
          ]
        }
      ]
    },
    "/ncgc_analyst/loans": {
      title: "Loan Monitoring",
      description: "Track the performance of active guarantees and monitor repayment status.",
      sections: [
        {
          title: "Features",
          items: [
            "View all ongoing loans across all PFIs.",
            "Monitor repayment schedules and payment status.",
            "Click on any loan to view detailed performance metrics."
          ]
        }
      ]
    },
    "/ncgc_analyst/loans/[id]": {
      title: "Loan Details & Monitoring",
      description: "Detailed view of a specific loan's performance, including repayment tracking and claim management.",
      sections: [
        {
          title: "Repayment Tracking",
          items: [
            "View the complete repayment schedule.",
            "Use the 'Days Past Due' slider to simulate loan performance (0-200 days).",
            "Monitor when loans exceed 180 days past due (default threshold)."
          ]
        },
        {
          title: "Claims",
          items: [
            "View claim information if a claim has been submitted for this loan.",
            "Click 'View Full Claim' to review and process the claim.",
            "Claims can be initiated by PFIs when DPD exceeds 180 days."
          ]
        }
      ]
    },
    "/ncgc_analyst/claims": {
      title: "Claims Management",
      description: "View and manage all claims submitted by PFIs for defaulted loans.",
      sections: [
        {
          title: "Overview",
          items: [
            "View all claims across all PFIs.",
            "See claim status: Pending, Approved, Rejected, or Paid.",
            "Filter and review claims that need attention."
          ]
        },
        {
          title: "Actions",
          items: [
            "Click 'View Details' to review a specific claim.",
            "Approve or reject claims based on documentation and validity.",
            "Process payments for approved claims."
          ]
        }
      ]
    },
    "/ncgc_analyst/claims/[id]": {
      title: "Claim Review & Decision",
      description: "Review claim details, verify documentation, and make approval/rejection decisions.",
      sections: [
        {
          title: "Review Process",
          items: [
            "Review all claim information including default date, reason, and outstanding amounts.",
            "Check supporting documents uploaded by the PFI.",
            "Verify the claim amount against the guaranteed portion.",
            "Review actions taken by the PFI before default."
          ]
        },
        {
          title: "Decision Making",
          items: [
            "Approve: Click 'Approve Claim' to approve and process payment. A confirmation dialog will show the payment amount.",
            "Reject: Click 'Reject Claim' and provide review comments explaining the rejection.",
            "Payment: Approved claims are automatically marked as paid with a payment reference."
          ]
        },
        {
          title: "Recovery Process",
          items: [
            "After approving and paying a claim, you can initiate a recovery process.",
            "Click 'Start Recovery Process' to begin tracking recovery efforts.",
            "Recovery allows NCGC to attempt to recover funds from the defaulting borrower."
          ]
        }
      ]
    },
    "/ncgc_analyst/recovery": {
      title: "Recovery Management",
      description: "Manage recovery processes to reclaim funds from defaulting borrowers after claims have been paid.",
      sections: [
        {
          title: "Overview",
          items: [
            "View all recovery processes initiated by NCGC.",
            "Track recovery status: Initiated, In Progress, Completed, or Closed.",
            "Monitor recovery methods and assigned personnel."
          ]
        },
        {
          title: "Actions",
          items: [
            "Click 'Create Recovery Process' to start a new recovery.",
            "Select an application with an approved and paid claim.",
            "Choose recovery method, assign personnel, and set priority."
          ]
        }
      ]
    },
    "/ncgc_analyst/recovery/create": {
      title: "Create Recovery Process",
      description: "Initiate a new recovery process for a defaulted loan where a claim has been paid.",
      sections: [
        {
          title: "Process",
          items: [
            "Select an application from the dropdown (only shows applications with approved and paid claims).",
            "Choose a recovery method (Legal Action, Asset Seizure, Negotiation, etc.).",
            "Set the recovery amount (auto-filled from claim payment amount).",
            "Assign recovery personnel and set priority level.",
            "Add notes and observations."
          ]
        },
        {
          title: "Important",
          items: [
            "Recovery can only be initiated for applications with approved and paid claims.",
            "Applications with existing recovery processes won't appear in the dropdown.",
            "You can also start recovery directly from the claim details page."
          ]
        }
      ]
    },
    "/ncgc_analyst/recovery/[id]": {
      title: "Recovery Process Details",
      description: "View and update the status of a specific recovery process.",
      sections: [
        {
          title: "Information",
          items: [
            "View recovery method, amount, assignee, and priority.",
            "Track recovery status and milestones.",
            "View notes and observations."
          ]
        },
        {
          title: "Status Updates",
          items: [
            "Update recovery status as the process progresses.",
            "Add comments for each status change.",
            "View the complete history of status changes and milestones."
          ]
        }
      ]
    }
  };

  // Determine content based on current path
  useEffect(() => {
    // Exact match
    if (docs[pathname]) {
      setContent(docs[pathname]);
      return;
    }

    // Partial match for dynamic routes
    if (pathname.includes("/ncgc_analyst/dashboard/applications/")) {
      setContent(docs["/ncgc_analyst/dashboard/applications"]);
      return;
    }
    
    if (pathname.includes("/ncgc_analyst/claims/") && pathname !== "/ncgc_analyst/claims") {
      setContent(docs["/ncgc_analyst/claims/[id]"]);
      return;
    }
    
    if (pathname.includes("/ncgc_analyst/recovery/create")) {
      setContent(docs["/ncgc_analyst/recovery/create"]);
      return;
    }
    
    if (pathname.includes("/ncgc_analyst/recovery/") && pathname !== "/ncgc_analyst/recovery") {
      setContent(docs["/ncgc_analyst/recovery/[id]"]);
      return;
    }
    
    if (pathname.includes("/bank_maker/dashboard/") && pathname !== "/bank_maker/dashboard/create") {
       if (pathname.includes("/claim")) {
         setContent({
           title: "Create Claim",
           description: "Submit a claim request for a defaulted loan. Claims can be created when a loan exceeds 180 days past due.",
           sections: [
             {
               title: "Claim Information",
               items: [
                 "Fill in the claim amount (cannot exceed the guaranteed portion).",
                 "Provide the default date and reason for default.",
                 "Document outstanding amounts and actions taken.",
                 "Upload supporting documents if available."
               ]
             },
             {
               title: "Important",
               items: [
                 "Claims can only be submitted for approved applications.",
                 "The claim amount is automatically calculated based on the guarantee percentage.",
                 "Once submitted, NCGC analysts will review your claim."
               ]
             }
           ]
         });
         return;
       }
       // Generic application detail view
       setContent({
         title: "Application Details",
         description: "View the details of your submitted loan guarantee application, including repayment tracking and claim management.",
         sections: [
           {
             title: "Overview",
             items: [
               "View the current status of your application.",
               "Review all submitted information and documents.",
               "Check repayment schedule and performance (for approved applications)."
             ]
           },
           {
             title: "Repayment Tracking",
             items: [
               "Use the 'Days Past Due' slider to simulate loan performance.",
               "View the repayment schedule and track payment status.",
               "Monitor when the loan exceeds 180 days past due (default threshold)."
             ]
           },
           {
             title: "Claims",
             items: [
               "When DPD exceeds 180 days, a 'Create Claim' button will appear.",
               "Click to submit a claim for the guaranteed portion of the defaulted loan.",
               "View claim status and details if a claim has already been submitted."
             ]
           }
         ]
       });
       return;
    }
    
    if (pathname.includes("/ncgc_analyst/loans/")) {
        setContent({
            title: "Loan Details",
            description: "Monitor specific loan performance.",
            sections: [
                {
                    title: "Actions",
                    items: ["Adjust the 'Days Past Due' slider to simulate repayment issues.", "View the repayment schedule."]
                }
            ]
        });
        return;
    }

    // Default fallback
    setContent({
      title: "NCGC Demo",
      description: "Navigate through the application to see specific documentation.",
      sections: []
    });

  }, [pathname]);

  if (!content) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all hover:scale-105 ${shake ? 'animate-shake' : ''}`}
        title="Page Documentation"
      >
        <BookOpen size={24} />
        <span className="hidden md:inline font-medium pr-1">Guide</span>
      </button>

      {/* Modal/Popover */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:p-6">
          <div 
            className="bg-white w-full sm:w-[400px] sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-right-10 duration-300"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-emerald-50/50 sm:rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <HelpCircle size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Page Guide</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{content.title}</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              <p className="text-gray-600 mb-6 leading-relaxed">
                {content.description}
              </p>

              <div className="space-y-6">
                {content.sections?.map((section, idx) => (
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
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 sm:rounded-b-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">
                  NCGC Interactive Documentation
                </p>
                <Link
                  href="/documentation"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  Full Documentation
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
