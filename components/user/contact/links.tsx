"use client";

import React from "react";
import { removeSpaces } from "@/utils/formatters";
import { LuMail, LuPhone, LuSmartphone } from "react-icons/lu";

const Links = () => {
  const items = [
    {
      icon: LuPhone,
      label: "landline",
      text: "(02) 7001-6157",
      href: `tel:${removeSpaces("(02) 7001-6157")}`,
    },
    {
      icon: LuSmartphone,
      label: "mobile",
      text: "0962 253 0149",
      href: `tel:${removeSpaces("0962 253 0149")}`,
    },
    {
      icon: LuMail,
      label: "email",
      text: "infinitechadvertisingcorp@gmail.com",
      href: "mailto:infinitechadvertisingcorp@gmail.com",
    },
  ];

  return (
    <>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#38bdf8]/60 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#38bdf8]/10 text-[#38bdf8] shadow-[0_0_24px_rgba(56,189,248,0.25)] transition group-hover:bg-[#f5a623]/15 group-hover:text-[#f5a623] group-hover:shadow-[0_0_24px_rgba(245,166,35,0.35)]">
            <item.icon size={18} />
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-[11px] text-[#8a97bd]">
              {item.label}
            </span>
            <span className="block truncate font-bold text-white">
              {item.text}
            </span>
          </span>
        </a>
      ))}
    </>
  );
};

export default Links;
