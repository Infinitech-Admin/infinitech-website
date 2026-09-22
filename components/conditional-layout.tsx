"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/user/layout/navbar";
import Footer from "@/components/user/layout/footer/footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isPortalDemoRoute = pathname?.startsWith("/portal-demos");

  if (isAdminRoute || isPortalDemoRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
