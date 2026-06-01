"use client";

// Add to your globals.css: @import "keen-slider/keen-slider.min.css";
import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
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

// ─── Slider ───────────────────────────────────────────────────────────────────

function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  return (
    <div className="mt-10">
      <div ref={sliderRef} className="keen-slider">
        {testimonials.map((t) => (
          <div key={t.id} className="keen-slider__slide">
            <div className="flex flex-col gap-6 px-2 py-4 md:px-8">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-primary opacity-20"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.127 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
              <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-medium">
                "{t.message}"
              </p>
              <div>
                <Divider className="mb-4" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div>
                    <p className="text-2xl font-bold uppercase text-gray-900 tracking-wide">
                      {t.name}
                    </p>
                    {(t.position || t.company) && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {[t.position, t.company].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6 px-2 md:px-8">
        <button
          onClick={() => instanceRef.current?.prev()}
          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
          aria-label="Previous"
        >
          <svg
            width="18"
            height="18"
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
          onClick={() => instanceRef.current?.next()}
          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
          aria-label="Next"
        >
          <svg
            width="18"
            height="18"
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
        <div className="flex gap-1.5 ml-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => instanceRef.current?.moveToIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-gray-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <span className="ml-auto text-sm text-gray-400">
          {currentSlide + 1} / {testimonials.length}
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
          width="16"
          height="16"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
      {platforms.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-5 border border-gray-100"
        >
          <img src={p.logo} alt={p.name} className="w-8 h-8 object-contain" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Review on
            </p>
            <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
            <div className="flex items-center gap-2 mt-1">
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
    <div className="flex flex-col gap-6 px-2 py-4 md:px-8">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-5 w-3/4 rounded-lg" />
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-lg" />
      </div>
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
    <div className="flex flex-wrap gap-2 justify-center mt-6">
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
      // Notify parent to refresh the list
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
    <section>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-2xl mt-12 mx-auto text-center">
          <h2 className="font-bold text-accent text-4xl tracking-wider uppercase">
            Testimonials
          </h2>
          <h1 className={`text-4xl text-primary mt-2 ${poetsen_one.className}`}>
            Our work brings to life the success stories of our partners
          </h1>
        </div>

        {/* Category filter */}
        {!loading && !error && categories.length > 1 && (
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        )}

        {/* Slider */}
        <div className="mt-6">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <p className="text-center text-red-500 py-12">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No testimonials yet. Be the first to share your experience!
            </p>
          ) : (
            <TestimonialSlider key={activeCategory} testimonials={filtered} />
          )}
        </div>

        <Divider className="my-12" />

        {/* Review platforms */}
        <ReviewPlatforms />

        <Divider className="my-12" />

        {/* Submission form */}
        <TestimonialForm onSubmitted={fetchTestimonials} />
      </div>
    </section>
  );
};

export default TestimonialsPage;
