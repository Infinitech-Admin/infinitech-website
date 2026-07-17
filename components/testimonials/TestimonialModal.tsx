"use client";

import { useEffect } from "react";
import { Testimonial } from "./types";
import { getInitials, avatarColor } from "./utils";

export default function TestimonialModal({
  testimonial,
  isOpen,
  onClose,
}: {
  testimonial: Testimonial | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !testimonial) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Full Testimonial
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6l-12 12M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 md:p-8">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-gray-200 mb-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.127 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>

            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8">
              "{testimonial.message}"
            </p>

            <div className="border-t border-gray-100 pt-6 mb-6" />

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor(testimonial.id)}`}
              >
                {getInitials(testimonial.name)}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                  {testimonial.name}
                </p>
                {testimonial.position && (
                  <p className="text-sm text-gray-600 mt-1">
                    {testimonial.position}
                  </p>
                )}
                {testimonial.company && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {testimonial.company}
                  </p>
                )}
                {testimonial.position && testimonial.company && (
                  <p className="text-xs text-gray-400 mt-2">
                    {testimonial.position} at {testimonial.company}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
