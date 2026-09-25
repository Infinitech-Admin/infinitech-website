"use client";
import React, { useState } from "react";

const UpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-400/30 bg-[#0a0f2c] p-6 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:text-white transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <span className="text-2xl">🚧</span>
        </div>

        <h2 className="mb-2 text-xl font-bold text-white">
          Website Under <span className="text-cyan-400">Upgrade</span>
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-300">
          We&apos;re currently rolling out improvements to bring you a better
          experience. Some sections may look a little different or be
          temporarily unavailable. Thanks for your patience!
        </p>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full rounded-lg bg-cyan-400 py-2.5 text-sm font-semibold text-[#0a0f2c] shadow-[0_0_20px_rgba(34,211,238,0.4)] transition hover:bg-cyan-300"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;
