"use client";

import { Testimonial } from "./types";
import { getInitials, avatarColor } from "./utils";

export default function TestimonialCard({
  testimonial,
  onClick,
}: {
  testimonial: Testimonial;
  onClick: (testimonial: Testimonial) => void;
}) {
  return (
    <button
      onClick={() => onClick(testimonial)}
      className="flex-shrink-0 w-[320px] sm:w-[360px] h-full bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer text-left"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-gray-200 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.127 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>

      <p className="text-sm text-gray-700 leading-relaxed flex-1 line-clamp-4">
        "{testimonial.message}"
      </p>

      <div className="border-t border-gray-100 pt-3 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(testimonial.id)}`}
        >
          {getInitials(testimonial.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide truncate">
            {testimonial.name}
          </p>
          {(testimonial.position || testimonial.company) && (
            <p className="text-xs text-gray-400 truncate">
              {[testimonial.position, testimonial.company]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
