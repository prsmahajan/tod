import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAuthWrapper } from "@/components/admin/AdminAuthWrapper";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CMSThemeProvider } from "@/components/admin/CMSThemeProvider";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthWrapper>
      <CMSThemeProvider>
        <div className={`${dmSans.className} flex min-h-screen cms-layout`}>
          <AdminNav />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 cms-main overflow-auto">
              <div className="p-6">{children}</div>
            </main>
          </div>
        </div>
      </CMSThemeProvider>
    </AdminAuthWrapper>
  );
}
