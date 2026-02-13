"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { BarChart3, Gamepad2, User, Users, ArrowLeft } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminLinks = [
  { href: "/admin", label: "Dashboard", Icon: BarChart3 },
  { href: "/admin/games", label: "Games", Icon: Gamepad2 },
  { href: "/admin/avatars", label: "Avatars", Icon: User },
  { href: "/admin/users", label: "Users", Icon: Users },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-600">GamingHub Management</p>
          </div>
          
          <nav className="px-4">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.Icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Site</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
