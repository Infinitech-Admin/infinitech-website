"use client";

import React, { useState } from "react";
import { poetsen_one } from "@/config/fonts";
import { TestimonialFormData } from "./types";

const EMPTY_FORM: TestimonialFormData = {
  name: "",
  position: "",
  company: "",
  message: "",
  page: "solutions",
};

export default function TestimonialForm({
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof TestimonialFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
            Tell Us About Your Challenge
          </h3>
          <p className="text-gray-500 mt-2 text-sm">
            Share your business challenge with us, and we'll help you find the
            right solution.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleInputChange}
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

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Position / Title
              </label>
              <input
                name="position"
                value={form.position}
                onChange={handleInputChange}
                placeholder="e.g. Marketing Manager"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                name="company"
                value={form.company}
                onChange={handleInputChange}
                placeholder="e.g. Eurotel Makati"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Which service did we help you with?
              </label>
              <select
                name="page"
                value={form.page}
                onChange={handleSelectChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="solutions">Solutions</option>
                <option value="home">General</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Describe Your Business Challenge{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleInputChange}
                rows={5}
                placeholder="Share the challenges you're facing, and we'll recommend the best solution."
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
