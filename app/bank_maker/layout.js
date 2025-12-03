"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Plus, LogOut } from "lucide-react";

export default function BankMakerLayout({ children }) {
  const pathname = usePathname() || "";

  const navItems = [
    {
      name: "Applications",
      href: "/bank_maker/dashboard",
      icon: <FileText size={18} />,
    },
    {
      name: "Create Application",
      href: "/bank_maker/dashboard/create",
      icon: <Plus size={18} />,
    },
  ];

  const isActive = (href) => {
    if (!href || href === "#") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Bank Maker
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Partner bank console
              </p>
            </div>
          </div>

          <nav className="mt-6">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
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
            className="flex items-center text-gray-600 hover:text-emerald-700 text-sm w-full"
            onClick={() => {
              // placeholder logout behaviour — replace with real sign-out logic
              // e.g., call auth signout endpoint or redirect to /login
              window.location.href = "/login";
            }}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
