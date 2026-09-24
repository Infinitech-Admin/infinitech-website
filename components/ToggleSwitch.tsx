"use client";

import type React from "react";

interface ToggleSwitchProps {
  leftLabel: string;
  rightLabel: string;
  /** false = left option active, true = right option active */
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Sliding pill toggle (green -> cyan/blue gradient track, white knob),
 * used for Monthly/Yearly and PHP/USD switches.
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  leftLabel,
  rightLabel,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`text-sm font-semibold transition-colors duration-300 ${
          !checked ? "text-white" : "text-slate-500"
        }`}
      >
        {leftLabel}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-14 h-7 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 shadow-inner shadow-black/20 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
            checked ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>

      <span
        className={`text-sm font-semibold transition-colors duration-300 ${
          checked ? "text-white" : "text-slate-500"
        }`}
      >
        {rightLabel}
      </span>
    </div>
  );
};

export default ToggleSwitch;
