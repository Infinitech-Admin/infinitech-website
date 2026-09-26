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

        <p className="mb-4 text-sm leading-relaxed text-gray-300">
          We&apos;re currently improving the website&apos;s design and user
          experience to make everything cleaner, smoother, and more enjoyable
          to use.
        </p>

        <p className="mb-4 text-sm leading-relaxed text-gray-300">
          <span className="font-semibold text-cyan-300">
            The website is still fully functional.
          </span>{" "}
          You can continue using the available features as usual while we work
          behind the scenes on the improvements.
        </p>

        <div
          className="mb-6 rounded-lg border p-3"
          style={{
            borderColor: "rgba(34,211,238,0.2)",
            backgroundColor: "rgba(34,211,238,0.05)",
          }}
        >
          <p className="text-xs uppercase tracking-wide text-cyan-300">
            Target Completion
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            September 28, 2026 at 1:00 PM
          </p>
        </div>

        <p className="mb-6 text-xs leading-relaxed text-gray-400">
          During this upgrade, you may notice changes to the appearance,
          layout, or some sections of the website. We appreciate your patience
          while we make these improvements.
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

