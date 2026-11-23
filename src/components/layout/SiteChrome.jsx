"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      {children}
    </>
  );
}
