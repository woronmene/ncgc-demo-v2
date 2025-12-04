"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LogOut, Menu, X } from "lucide-react";

export default function AnalystLayout({ children }) {
  const pathname = usePathname() || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      name: "Applications",
      href: "/ncgc_analyst/dashboard",
      icon: <FileText size={18} />,
    },
    {
      name: "Ongoing Loans",
      href: "/ncgc_analyst/loans",
      icon: <FileText size={18} />,
    },
  ];

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-full overflow-y-auto shrink-0 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  NCGC Analyst
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Analyst console</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="mt-6">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center px-6 py-3 text-sm font-medium ${
                    active
                      ? "bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            className="flex items-center cursor-pointer text-gray-600 hover:text-emerald-700 text-sm w-full"
            onClick={() => (window.location.href = "/login")}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">NCGC Analyst</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
