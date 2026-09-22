// components/ConditionalWidgets.tsx
"use client";

import { usePathname } from "next/navigation";
import Chatbot from "./Chatbot";
import FloatingSocialMedia from "./FloatingSocialMedia";

const HIDDEN_PREFIXES = ["/portal-demos/"];

const ConditionalWidgets = () => {
  const pathname = usePathname();

  const isHidden = HIDDEN_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );

  if (isHidden) return null;

  return (
    <>
      <Chatbot />
      <FloatingSocialMedia />
    </>
  );
};

export default ConditionalWidgets;
