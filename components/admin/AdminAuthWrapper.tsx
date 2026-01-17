"use client";

import { useAuth } from "@/lib/appwrite/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

interface UserRole {
  role: string;
  name: string;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdminAccess() {
      if (authLoading) return;

      if (!user) {
        router.push("/login?redirect=/admin");
        return;
      }

      // Check user role from database
      try {
        const res = await fetch(`/api/auth/check-role?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();

        if (res.ok && data.role) {
          if (["ADMIN", "EDITOR", "AUTHOR"].includes(data.role)) {
            setUserRole({ role: data.role, name: data.name });
            setChecking(false);
          } else {
            // Not authorized for admin
            router.push("/app");
          }
        } else {
          // User not found in database or error
          router.push("/app");
        }
      } catch (error) {
        console.error("Role check error:", error);
        router.push("/app");
      }
    }

    checkAdminAccess();
  }, [user, authLoading, router]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  return <>{children}</>;
}
