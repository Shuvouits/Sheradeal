
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import SiteFooter from "@/components/frontend/footer/SiteFooter";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
