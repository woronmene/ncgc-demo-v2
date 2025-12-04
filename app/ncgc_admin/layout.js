"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, Settings, LogOut, Menu, X } from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname() || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Nav items use base paths so child routes still match with startsWith
  const navItems = [
    {
      name: "Banks",
      href: "/ncgc_admin/dashboard",
      icon: <Building2 size={18} />,
    },
  ];

  const isActive = (href) => {
    // exact match or any child route that starts with href
    if (!href || href === "#") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

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

      {/* Sidebar */}
      <aside
        className={`fixed lg:static bg-[#f1f7f3] inset-y-0 left-0 z-50 w-64  border-r border-gray-200 flex flex-col justify-between h-full overflow-y-auto shrink-0 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="p-6 flex items-center justify-between ">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/ncgc-logo.png" 
                  alt="NCGC Logo" 
                  className="h-12 w-12 object-contain"
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">NCGC Admin</h2>
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
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">NCGC Admin</h1>
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
