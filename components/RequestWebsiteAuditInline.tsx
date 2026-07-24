"use client";

import React, { useState } from "react";
import { Input, Textarea } from "@heroui/react";
import { GoCheck } from "react-icons/go";
import { poetsen_one } from "@/config/fonts";

interface AuditFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  details: string;
}

const initialForm: AuditFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  details: "",
};

const PHONE_ALLOWED_CHARS = /^[0-9+\-()\s]*$/;
const PHONE_VALID = /^[0-9]{7,15}$/;

const RequestWebsiteAuditInline = () => {
  const [form, setForm] = useState<AuditFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleChange = (field: keyof AuditFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    if (!PHONE_ALLOWED_CHARS.test(value)) return;
    handleChange("phone", value);

    const digitsOnly = value.replace(/[^0-9]/g, "");
    if (value.trim() === "") {
      setPhoneError(null);
    } else if (!PHONE_VALID.test(digitsOnly)) {
      setPhoneError("Enter a valid phone number (numbers only).");
    } else {
      setPhoneError(null);
    }
  };

  const isPhoneValid = form.phone.trim() === "" || phoneError === null;

  const isValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.website.trim() !== "" &&
    isPhoneValid;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/website-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <GoCheck className="h-7 w-7 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Request Sent!</h3>
          <p className="text-gray-500 text-sm">
            Our team will reach out with your website audit shortly.
          </p>
        </div>
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
            Get a Free Website Audit
          </h3>
          <p className="text-gray-500 mt-2 text-sm">
            Tell us about your site and we&apos;ll follow up with a full audit.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Juan dela Cruz"
              value={form.name}
              onValueChange={(v) => handleChange("name", v)}
              isRequired
            />
            <Input
              label="Company"
              placeholder="e.g. Eurotel Makati"
              value={form.company}
              onValueChange={(v) => handleChange("company", v)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. juan@company.com"
              value={form.email}
              onValueChange={(v) => handleChange("email", v)}
              isRequired
            />
            <Input
              label="Phone Number"
              placeholder="e.g. 0917 123 4567"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onValueChange={handlePhoneChange}
              isInvalid={!!phoneError}
              errorMessage={phoneError ?? undefined}
            />
            <Input
              label="Website URL"
              placeholder="e.g. https://yourbusiness.com"
              value={form.website}
              onValueChange={(v) => handleChange("website", v)}
              isRequired
              className="sm:col-span-2"
            />

            <div className="sm:col-span-2">
              <Textarea
                label="What would you like us to focus on?"
                placeholder="e.g. SEO, page speed, mobile usability, conversion rate..."
                value={form.details}
                onValueChange={(v) => handleChange("details", v)}
                minRows={4}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm px-1 mt-3">{errorMsg}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestWebsiteAuditInline;
