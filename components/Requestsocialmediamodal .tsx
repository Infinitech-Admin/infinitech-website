"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";
import { FaHashtag } from "react-icons/fa";
import { GoCheck } from "react-icons/go";

interface RequestSocialMediaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SocialMediaFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  platforms: string[];
  details: string;
}

const initialForm: SocialMediaFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  platforms: [],
  details: "",
};

const PLATFORM_OPTIONS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "X (Twitter)",
  "YouTube",
];

// Allows digits, spaces, +, -, ( ) — rejects any letters or other symbols.
const PHONE_ALLOWED_CHARS = /^[0-9+\-()\s]*$/;
// Final validity check: needs at least 7 digits once formatting chars are stripped.
const PHONE_VALID = /^[0-9]{7,15}$/;

const RequestSocialMediaModal = ({
  isOpen,
  onOpenChange,
}: RequestSocialMediaModalProps) => {
  const [form, setForm] = useState<SocialMediaFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleChange = (
    field: keyof Omit<SocialMediaFormData, "platforms">,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platform: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handlePhoneChange = (value: string) => {
    if (!PHONE_ALLOWED_CHARS.test(value)) {
      return;
    }

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
    form.name.trim() !== "" && form.email.trim() !== "" && isPhoneValid;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/social-media-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          platforms: form.platforms.join(","),
        }),
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

  // Reset internal state whenever the modal closes
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        setForm(initialForm);
        setSubmitted(false);
        setSubmitting(false);
        setErrorMsg(null);
        setPhoneError(null);
      }, 200); // wait for close animation
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange} placement="center">
      <ModalContent>
        {(onClose) =>
          submitted ? (
            <>
              <ModalBody className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <GoCheck className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-primary font-bold text-lg">
                  Request Sent!
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Our team will reach out about managing your social media
                  shortly.
                </p>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button
                  className="bg-accent text-white font-medium"
                  onPress={onClose}
                >
                  Done
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 shrink-0">
                  <FaHashtag className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-primary font-bold text-base leading-tight">
                    Request Social Media Management
                  </p>
                  <p className="text-gray-500 text-xs font-normal">
                    Tell us about your brand and we&apos;ll follow up with a
                    plan.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  label="Full Name"
                  placeholder="Juan Dela Cruz"
                  value={form.name}
                  onValueChange={(v) => handleChange("name", v)}
                  isRequired
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="juan@company.com"
                  value={form.email}
                  onValueChange={(v) => handleChange("email", v)}
                  isRequired
                />
                <Input
                  label="Phone Number"
                  placeholder="09XX XXX XXXX"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onValueChange={handlePhoneChange}
                  isInvalid={!!phoneError}
                  errorMessage={phoneError ?? undefined}
                />
                <Input
                  label="Company Name"
                  placeholder="Your Business Inc."
                  value={form.company}
                  onValueChange={(v) => handleChange("company", v)}
                />

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Which platforms do you want managed?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((platform) => {
                      const selected = form.platforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            selected
                              ? "bg-accent text-white border-accent"
                              : "bg-white text-gray-600 border-gray-300 hover:border-accent"
                          }`}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Textarea
                  label="Tell us about your current presence & goals"
                  placeholder="e.g. We post occasionally on Facebook, want consistent content and better engagement..."
                  value={form.details}
                  onValueChange={(v) => handleChange("details", v)}
                  minRows={3}
                />
                {errorMsg && (
                  <p className="text-red-500 text-sm px-1">{errorMsg}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-accent text-white font-medium"
                  isDisabled={!isValid}
                  isLoading={submitting}
                  onPress={handleSubmit}
                >
                  Submit Request
                </Button>
              </ModalFooter>
            </>
          )
        }
      </ModalContent>
    </Modal>
  );
};

export default RequestSocialMediaModal;
