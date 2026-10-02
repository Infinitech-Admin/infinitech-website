import React from "react";
import Hero from "@/components/user/about/hero";
import VMG from "@/components/user/about/vmg";
import Members from "@/components/user/about//members/members";

const GRID_BG: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
};

/* Adjust the three import paths above to match your project. */
const Page = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#070d1f]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[44rem]"
        style={GRID_BG}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#38bdf8]/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-[50rem] h-96 w-96 rounded-full bg-[#f5a623]/10 blur-[120px]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Hero />
        <VMG />
        <Members />
      </div>
    </div>
  );
};

export default Page;
