"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/user/layout/navbar";
import Footer from "@/components/user/layout/footer/footer";
import Chatbot from "@/components/Chatbot";
import FloatingSocialMedia from "@/components/FloatingSocialMedia";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  // Matches /portal-demos/<slug> only (e.g. /portal-demos/acme) — NOT the
  // bare /portal-demos listing page itself, which still keeps the
  // navbar/footer.
  const isPortalDemoSlugRoute = /^\/portal-demos\/[^/]+/.test(pathname ?? "");

  if (isAdminRoute || isPortalDemoSlugRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <Chatbot />
      <FloatingSocialMedia />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
