// components/FloatingWidgets.tsx
"use client";

import { usePathname } from "next/navigation";
import FloatingSocialMedia from "@/components/FloatingSocialMedia";
import Chatbot from "@/components/Chatbot";

const FloatingWidgets = () => {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // Hide on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <FloatingSocialMedia />
      <Chatbot />
    </>
  );
};

export default FloatingWidgets;