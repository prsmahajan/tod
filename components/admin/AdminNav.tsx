"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users, Tag, Settings, LayoutDashboard, Mail, BarChart3, Image, Send } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Animal Photos", href: "/admin/animal-photos", icon: Image },
  { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { name: "Send Newsletter", href: "/admin/send-newsletter", icon: Send },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">CMS Admin</h1>
        <p className="text-sm text-gray-400">The Open Draft</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          ← Back to Site
        </Link>
      </div>
    </nav>
  );
}
