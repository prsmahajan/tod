"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import Chatbot from "@/components/Chatbot";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export function PublicLayoutWrapper() {
  const pathname = usePathname();

  // Don't render public layout components on admin pages
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <Header />
      <ExitIntentPopup />
      <Chatbot />
      <ThemeSwitcher isFixed={true} />
    </>
  );
}
