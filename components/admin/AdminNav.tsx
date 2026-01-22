"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  Tag,
  Settings,
  LayoutDashboard,
  Mail,
  BarChart3,
  Image,
  Send,
  Heart,
  Shield,
  FolderOpen,
  ClipboardList,
  CheckSquare,
  UserPlus,
  CreditCard,
  HelpCircle,
  Sparkles
} from "lucide-react";

// Navigation sections matching Bloomberg Connect style
const navSections = [
  {
    title: "CONTENT",
    items: [
      { name: "Posts", href: "/admin/posts", icon: FileText },
      { name: "Categories", href: "/admin/categories", icon: Tag },
      { name: "Approvals", href: "/admin/approvals", icon: CheckSquare },
    ],
  },
  {
    title: "ASSETS",
    items: [
      { name: "Media Library", href: "/admin/media", icon: FolderOpen },
      { name: "Animal Photos", href: "/admin/animal-photos", icon: Image },
      { name: "Animals", href: "/admin/animals", icon: Heart },
    ],
  },
  {
    title: "USERS",
    items: [
      { name: "All Users", href: "/admin/users", icon: Users },
      { name: "Roles & Permissions", href: "/admin/roles", icon: Shield },
      { name: "Volunteers", href: "/admin/volunteers", icon: UserPlus },
      { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
      { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    ],
  },
  {
    title: "REPORTS",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
    ],
  },
  {
    title: "TOOLS",
    items: [
      { name: "Photo Moderation", href: "/admin/photos", icon: Shield },
      { name: "AI Moderation", href: "/admin/photos/ai-moderation", icon: Sparkles },
      { name: "Send Newsletter", href: "/admin/send-newsletter", icon: Send },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-[#1a1a1a] text-white w-60 h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-[#2a2a2a] flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-3 group">
          <img
            src="/images/logo-dark.png"
            alt="TOD"
            className="w-9 h-9 rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white group-hover:text-[#a5b4fc] transition-colors">The Open Draft</span>
            <span className="text-[10px] text-[#666] uppercase tracking-wider">Content Studio</span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {/* Section Title */}
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-[11px] font-semibold text-[#666] tracking-wider">
                {section.title}
              </span>
              {section.title === "CONTENT" && (
                <button className="text-[#666] hover:text-white transition-colors">
                  <HelpCircle size={14} />
                </button>
              )}
            </div>

            {/* Section Items */}
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`nav-item flex items-center gap-3 px-4 py-2 text-sm transition-colors relative ${
                        active
                          ? "bg-[#2a2a2a] text-white"
                          : "text-[#999] hover:text-white hover:bg-[#222]"
                      }`}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#4f46e5]" />
                      )}
                      <Icon size={18} strokeWidth={1.5} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[#2a2a2a] flex-shrink-0">
        <Link
          href="/app"
          className="flex items-center gap-2 text-sm text-[#999] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Site
        </Link>
      </div>
    </nav>
  );
}
