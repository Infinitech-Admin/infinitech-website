"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Divider, Chip, Skeleton } from "@heroui/react";
import { poetsen_one } from "@/config/fonts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: number;
  name: string;
  position: string | null;
  company: string | null;
  message: string;
  image_url: string | null;
  page: "home" | "solutions" | "both";
  is_active: boolean;
  sort_order: number;
}

interface TestimonialFormData {
  name: string;
  position: string;
  company: string;
  message: string;
  page: "home" | "solutions" | "both";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ─── Testimonial Modal ────────────────────────────────────────────────────────

function TestimonialModal({
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Full Testimonial</h2>
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

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Quote icon */}
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

            {/* Full message */}
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8">
              "{testimonial.message}"
            </p>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-6 mb-6" />

            {/* Author info */}
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

// ─── Testimonial Card ─────────────────────────────────────────────────────────

function TestimonialCard({
  testimonial,
  onClick,
}: {
  testimonial: Testimonial;
  onClick: (testimonial: Testimonial) => void;
}) {
  return (
    <button
      onClick={() => onClick(testimonial)}
      className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer text-left"
    >
      {/* Quote icon */}
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

      {/* Message */}
      <p className="text-sm text-gray-700 leading-relaxed flex-1 line-clamp-4">
        "{testimonial.message}"
      </p>

      {/* Divider + author */}
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

// ─── Card Slider ──────────────────────────────────────────────────────────────

const AUTO_DELAY = 3500;

function TestimonialSlider({
  testimonials,
  onCardClick,
}: {
  testimonials: Testimonial[];
  onCardClick: (testimonial: Testimonial) => void;
}) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = testimonials.length;

  // Scroll a specific card into view — works on any screen size
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, total - 1));
      setCurrent(clamped);
      const card = cardRefs.current[clamped];
      if (card && trackRef.current) {
        const trackLeft = trackRef.current.getBoundingClientRect().left;
        const cardLeft = card.getBoundingClientRect().left;
        const offset = trackRef.current.scrollLeft + (cardLeft - trackLeft);
        trackRef.current.scrollTo({ left: offset, behavior: "smooth" });
      }
    },
    [total],
  );

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = prev >= total - 1 ? 0 : prev + 1;
        const card = cardRefs.current[next];
        if (card && trackRef.current) {
          const trackLeft = trackRef.current.getBoundingClientRect().left;
          const cardLeft = card.getBoundingClientRect().left;
          const offset = trackRef.current.scrollLeft + (cardLeft - trackLeft);
          trackRef.current.scrollTo({ left: offset, behavior: "smooth" });
        }
        return next;
      });
    }, AUTO_DELAY);
  }, [total]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  // Sync active dot while user scrolls freely
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // Find which card's left edge is closest to the track's left edge
        let closest = 0;
        let minDist = Infinity;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const dist = Math.abs(
            card.getBoundingClientRect().left -
              track.getBoundingClientRect().left,
          );
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });
        setCurrent(closest);
      }, 80);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimer);
    };
  }, [total]);

  return (
    <div className="mt-8">
      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 touch-pan-x"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties
        }
      >
        <style>{`.testimonial-track::-webkit-scrollbar{display:none}`}</style>
        {testimonials.map((t, i) => (
          <div
            key={t.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="flex-shrink-0"
          >
            <TestimonialCard testimonial={t} onClick={onCardClick} />
          </div>
        ))}
        {/* Right padding sentinel */}
        <div className="flex-shrink-0 w-4" aria-hidden />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={() => {
            goTo(current - 1);
            resetTimer();
          }}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors flex-shrink-0"
          aria-label="Previous"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() => {
            goTo(current + 1);
            resetTimer();
          }}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors flex-shrink-0"
          aria-label="Next"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex gap-1.5 ml-1 flex-wrap">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-5 bg-primary" : "w-1.5 bg-gray-200"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
          {current + 1} / {total}
        </span>
      </div>
    </div>
  );
}

// ─── Review platforms ─────────────────────────────────────────────────────────

function ReviewPlatforms() {
  const platforms = [
    {
      name: "Trustpilot",
      logo: "/images/trust-pilot.png",
      rating: 4.5,
      count: "7,584+",
      color: "#00B67A",
    },
    {
      name: "Clutch",
      logo: "/images/clutch.png",
      rating: 5,
      count: "1,500+",
      color: "#FF3D2E",
    },
  ];

  const renderStars = (rating: number, color: string) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill={
            star <= Math.floor(rating)
              ? color
              : star - 0.5 === rating
                ? `url(#half-${color.replace("#", "")})`
                : "#e5e7eb"
          }
        >
          <defs>
            <linearGradient id={`half-${color.replace("#", "")}`}>
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.13L8 10.25l-3.71 1.95.71-4.13L2 5.35l4.15-.6z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {platforms.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100"
        >
          <img src={p.logo} alt={p.name} className="w-7 h-7 object-contain" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Review on
            </p>
            <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {renderStars(p.rating, p.color)}
              <span className="text-xs text-gray-400">{p.count} reviews</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex gap-4 mt-8 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4"
        >
          <Skeleton className="w-7 h-7 rounded-lg" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <div className="border-t border-gray-100 pt-3 flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Category filter ──────────────────────────────────────────────────────────

function CategoryFilter({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-5">
      {["All", ...categories].map((cat) => (
        <Chip
          key={cat}
          variant={active === cat ? "solid" : "bordered"}
          color={active === cat ? "primary" : "default"}
          className="cursor-pointer"
          onClick={() => onChange(cat)}
        >
          {cat}
        </Chip>
      ))}
    </div>
  );
}

// ─── Testimonial submission form ──────────────────────────────────────────────

const EMPTY_FORM: TestimonialFormData = {
  name: "",
  position: "",
  company: "",
  message: "",
  page: "solutions",
};

function TestimonialForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [form, setForm] = useState<TestimonialFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<TestimonialFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<TestimonialFormData> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.message.trim()) newErrors.message = "Message is required";
    if (form.message.trim().length < 20)
      newErrors.message = "Please write at least 20 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof TestimonialFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Submission failed");
      }

      setSuccess(true);
      setForm(EMPTY_FORM);
      setTimeout(() => {
        setSuccess(false);
        onSubmitted();
      }, 3000);
    } catch (err) {
      console.error(err);
      setErrors({ message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-green-500"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-800">
          Thank you for your feedback!
        </h3>
        <p className="text-gray-500 text-sm">
          Your testimonial has been submitted and is pending review.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3
            className={`text-3xl text-primary font-bold ${poetsen_one.className}`}
          >
            Share Your Experience
          </h3>
          <p className="text-gray-500 mt-2 text-sm">
            We'd love to hear how we've helped your business grow.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Juan dela Cruz"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                  errors.name
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Position */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Position / Title
              </label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="e.g. Marketing Manager"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Company */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g. Eurotel Makati"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Page */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Which service did we help you with?
              </label>
              <select
                name="page"
                value={form.page}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="solutions">Solutions</option>
                <option value="home">General</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Your Testimonial <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us about your experience working with Infinitech..."
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors resize-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                  errors.message
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              />
              <div className="flex justify-between items-center">
                {errors.message ? (
                  <p className="text-xs text-red-500">{errors.message}</p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs ml-auto ${form.message.length < 20 ? "text-gray-400" : "text-green-500"}`}
                >
                  {form.message.length} / 20 min
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22 11 13 2 9l20-7z" />
                </svg>
                Submit Testimonial
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filtered, setFiltered] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);

  const categories = Array.from(
    new Set(
      testimonials.map((t) => t.company).filter((c): c is string => c !== null),
    ),
  );

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/testimonials?page=solutions", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load testimonials");
      const json = await res.json();
      const data: Testimonial[] = json.data ?? [];
      setTestimonials(data);
      setFiltered(data);
    } catch (err) {
      setError("Could not load testimonials. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(testimonials);
    } else {
      setFiltered(testimonials.filter((t) => t.company === activeCategory));
    }
  }, [activeCategory, testimonials]);

  return (
    <>
      <section>
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="max-w-2xl mt-12 mx-auto text-center">
            <h2 className="font-bold text-accent text-4xl tracking-wider uppercase">
              Testimonials
            </h2>
            <h1
              className={`text-4xl text-primary mt-2 ${poetsen_one.className}`}
            >
              Our work brings to life the success stories of our partners
            </h1>
          </div>

          {/* Category filter */}
          {!loading && !error && categories.length > 1 && (
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={(cat) => {
                setActiveCategory(cat);
              }}
            />
          )}

          {/* Slider */}
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <p className="text-center text-red-500 py-12">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No testimonials yet. Be the first to share your experience!
            </p>
          ) : (
            <TestimonialSlider
              key={activeCategory}
              testimonials={filtered}
              onCardClick={setSelectedTestimonial}
            />
          )}

          <Divider className="my-12" />

          {/* Review platforms */}
          <ReviewPlatforms />

          <Divider className="my-12" />

          {/* Submission form */}
          <TestimonialForm onSubmitted={fetchTestimonials} />
        </div>
      </section>

      {/* Modal */}
      <TestimonialModal
        testimonial={selectedTestimonial}
        isOpen={selectedTestimonial !== null}
        onClose={() => setSelectedTestimonial(null)}
      />
    </>
  );
};

export default TestimonialsPage;
