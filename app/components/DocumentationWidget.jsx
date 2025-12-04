"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, X, HelpCircle, ChevronRight } from "lucide-react";

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
            "NCGC Admin: Logs in to onboard new Partner Financial Institutions (PFIs).",
            "NCGC Analyst: Reviews, approves, and monitors guarantee applications.",
            "Bank Maker: Represents a PFI. Creates and submits loan guarantee applications."
          ]
        },
        {
          title: "How to Test",
          items: [
            "Click 'View Demo Credentials' to see available users.",
            "To test the full flow: Login as Admin -> Onboard a Bank -> Logout -> Login as that Bank's Maker -> Create Application -> Logout -> Login as Analyst -> Approve Application."
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
      title: "Onboard New PFI",
      description: "Register a new Partner Financial Institution into the NCGC ecosystem.",
      sections: [
        {
          title: "Process",
          items: [
            "Fill in the institution's details (Name, License, etc.).",
            "The system automatically validates regulatory numbers (simulated).",
            "Upon success, login credentials for this bank (Maker & Approver) are generated automatically."
          ]
        },
        {
          title: "Important",
          items: [
            "The Credentials will automatically be added to the credentials in the login page when you click on 'View Demo Credentials'. Just take note of the name of the PFI you just onboarded."
          ]
        }
      ]
    },
    "/bank_maker/dashboard": {
      title: "Bank Maker Dashboard",
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
      title: "Create Application",
      description: "Submit a new loan guarantee request to NCGC.",
      sections: [
        {
          title: "Steps",
          items: [
            "1. Business Details: Basic info about the SME.",
            "2. Identity: Directors/Owners info and KYC (BVN/NIN validation).",
            "3. Documents: Upload required files (simulated).",
            "4. Loan Details: Amount, tenor, and guarantee type."
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
      description: "Detailed assessment of a specific guarantee application.",
      sections: [
        {
          title: "Review Process",
          items: [
            "Verify business and owner details.",
            "Preview uploaded documents (click the eye icon).",
            "Use the 'Risk Assessment' tool to simulate risk scoring.",
            "Approve or Reject the application based on your findings."
          ]
        }
      ]
    },
    "/ncgc_analyst/loans": {
      title: "Loan Monitoring",
      description: "Track the performance of active guarantees.",
      sections: [
        {
          title: "Features",
          items: [
            "View repayment schedules and status.",
            "Simulate loan performance (Days Past Due) to see how it affects risk grading."
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

    // Partial match for dynamic routes (e.g., /ncgc_analyst/dashboard/applications/123)
    if (pathname.includes("/ncgc_analyst/dashboard/applications/")) {
      setContent(docs["/ncgc_analyst/dashboard/applications"]);
      return;
    }
    
    if (pathname.includes("/bank_maker/dashboard/") && pathname !== "/bank_maker/dashboard/create") {
       // Re-use create or dashboard content? Or generic detail?
       // Let's make a generic detail for bank maker view
       setContent({
         title: "Application Details",
         description: "View the details of your submitted application.",
         sections: [
           {
             title: "Info",
             items: ["Check the current status of your application.", "Review the information you submitted."]
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
            <div className="p-4 border-t border-gray-100 bg-gray-50 sm:rounded-b-2xl text-center">
              <p className="text-xs text-gray-400">
                NCGC Interactive Documentation
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
