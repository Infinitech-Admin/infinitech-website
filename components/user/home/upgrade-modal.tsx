"use client";
import React, { useState } from "react";

const UpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border p-6"
        style={{
          backgroundColor: "#0a0f2c",
          borderColor: "rgba(34,211,238,0.3)",
          boxShadow: "0 0 40px rgba(34,211,238,0.25)",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border text-cyan-300 transition hover:text-white"
          style={{ borderColor: "rgba(34,211,238,0.3)" }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon */}
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
          style={{
            borderColor: "rgba(34,211,238,0.4)",
            backgroundColor: "rgba(34,211,238,0.1)",
          }}
        >
          <span className="text-2xl">🚧</span>
        </div>

        <h2 className="mb-2 text-xl font-bold text-white">
          Website Under <span style={{ color: "#22d3ee" }}>Upgrade</span>
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-300">
          We&apos;re currently rolling out improvements to bring you a better
          experience. Some sections may look a little different or be
          temporarily unavailable. Thanks for your patience!
        </p>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full rounded-lg py-2.5 text-sm font-semibold transition"
          style={{
            backgroundColor: "#22d3ee",
            color: "#0a0f2c",
            boxShadow: "0 0 20px rgba(34,211,238,0.4)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#67e8f9")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#22d3ee")
          }
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;
