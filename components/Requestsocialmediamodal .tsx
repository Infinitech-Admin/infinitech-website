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

/* ============================================================================
 * VALIDATION HELPERS (same approach as InquiryForm)
 * ========================================================================== */

// Valid PH mobile prefixes (4-digit, after the leading "0")
const VALID_PH_PREFIXES = [
  "0905",
  "0906",
  "0915",
  "0916",
  "0917",
  "0918",
  "0919",
  "0920",
  "0921",
  "0928",
  "0929",
  "0930",
  "0938",
  "0939",
  "0946",
  "0947",
  "0948",
  "0949",
  "0950",
  "0951",
  "0955",
  "0956",
  "0961",
  "0963",
  "0965",
  "0966",
  "0967",
  "0975",
  "0976",
  "0977",
  "0978",
  "0979",
  "0994",
  "0995",
  "0996",
  "0997",
  "0817",
  "0904",
  "0907",
  "0908",
  "0909",
  "0910",
  "0912",
  "0932",
  "0933",
  "0934",
  "0940",
  "0941",
  "0942",
  "0943",
  "0944",
  "0945",
  "0968",
  "0969",
  "0970",
  "0971",
  "0980",
  "0981",
  "0982",
  "0989",
  "0991",
  "0993",
  "0998",
  "0999",
];

const BLOCKED_NAME_WORDS = [
  "test",
  "asdf",
  "asd",
  "qwe",
  "qwerty",
  "sample",
  "example",
  "none",
  "n/a",
  "na",
  "xxx",
  "abc",
  "unknown",
  "anonymous",
];

const KEYBOARD_PATTERNS = [
  "qwerty",
  "asdf",
  "asdfgh",
  "zxcv",
  "zxcvbn",
  "qwe",
  "wer",
  "ert",
  "sdf",
  "dfg",
  "fgh",
  "xcv",
  "cvb",
  "vbn",
  "jkl",
  "hjk",
  "poiuy",
];

const COMMON_BIGRAMS = new Set([
  "th",
  "he",
  "in",
  "en",
  "nt",
  "re",
  "er",
  "an",
  "ti",
  "es",
  "on",
  "at",
  "se",
  "nd",
  "or",
  "ar",
  "al",
  "te",
  "co",
  "de",
  "to",
  "ra",
  "et",
  "ed",
  "it",
  "sa",
  "em",
  "ro",
  "is",
  "ng",
  "of",
  "as",
  "le",
  "ou",
  "ea",
  "hi",
  "el",
  "ic",
  "me",
  "be",
  "ne",
  "ll",
  "st",
  "ve",
  "so",
  "ma",
  "io",
  "ta",
  "la",
  "ri",
  "ch",
  "sh",
  "ay",
  "ie",
  "ow",
  "wa",
  "un",
  "ly",
  "ce",
  "wi",
  "ho",
  "ur",
  "no",
  "ni",
  "us",
  "pe",
  "om",
  "pa",
  "di",
  "up",
]);

const bigramScore = (word: string) => {
  const lower = word.toLowerCase().replace(/[^a-z]/g, "");
  if (lower.length < 2) return 1;

  let commonCount = 0;
  const totalBigrams = lower.length - 1;

  for (let i = 0; i < totalBigrams; i++) {
    const pair = lower.slice(i, i + 2);
    if (COMMON_BIGRAMS.has(pair)) commonCount++;
  }

  return commonCount / totalBigrams;
};

const isGibberishText = (text: string) => {
  const lower = text.toLowerCase().replace(/[^a-z]/g, "");
  if (!lower) return true;

  for (const pattern of KEYBOARD_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }

  if (/[^aeiou]{4,}/.test(lower)) return true;

  const vowelCount = (lower.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / lower.length;
  if (vowelRatio < 0.25) return true;

  if (lower.length >= 5 && bigramScore(lower) < 0.3) return true;

  return false;
};

const getNameError = (value: string): string | null => {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length < 4) return "Name is too short.";
  if (trimmed.length > 60) return "Name is too long.";

  const words = trimmed.split(" ");
  if (words.length < 2)
    return "Please enter your full name (e.g. Juan Dela Cruz).";
  if (words.length > 4)
    return "Please enter your full name (e.g. Juan Dela Cruz).";

  const seen = new Set<string>();
  for (const word of words) {
    const lower = word.toLowerCase();
    if (word.length < 2) return "Please enter a valid name.";
    if (!/^[A-Za-z'-]+$/.test(word)) return "Name should contain letters only.";
    if (isGibberishText(word)) return "Please enter a valid name.";
    if (BLOCKED_NAME_WORDS.includes(lower)) return "Please enter a valid name.";
    if (seen.has(lower)) return "Please enter a valid name.";
    seen.add(lower);
  }

  return null;
};

const getEmailError = (value: string): string | null => {
  const trimmed = value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Please enter a valid email address.";
  }

  const localPart = trimmed.split("@")[0]?.toLowerCase();
  if (!localPart) return "Please enter a valid email address.";
  if (/^\d+$/.test(localPart)) return "Please enter a valid email address.";
  if (isGibberishText(localPart)) return "Please enter a valid email address.";

  return null;
};

const getPhoneError = (value: string): string | null => {
  if (value.trim() === "") return null; // phone is optional

  const digitsOnly = value.replace(/[^0-9]/g, "");
  if (!/^09\d{9}$/.test(digitsOnly)) {
    return "Enter a valid PH mobile number (e.g. 09171234567).";
  }

  const prefix = digitsOnly.slice(0, 4);
  if (!VALID_PH_PREFIXES.includes(prefix)) {
    return "Enter a valid PH mobile number (e.g. 09171234567).";
  }

  if (/^(\d)\1{9,}$/.test(digitsOnly.slice(2))) {
    return "Enter a valid PH mobile number (e.g. 09171234567).";
  }

  return null;
};

const RequestSocialMediaModal = ({
  isOpen,
  onOpenChange,
}: RequestSocialMediaModalProps) => {
  const [form, setForm] = useState<SocialMediaFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  });

  const handleChange = (
    field: keyof Omit<SocialMediaFormData, "platforms">,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "name")
      setNameError(touched.name ? getNameError(value) : null);
    if (field === "email")
      setEmailError(touched.email ? getEmailError(value) : null);
  };

  const handleBlur = (field: "name" | "email") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "name") setNameError(getNameError(form.name));
    if (field === "email") setEmailError(getEmailError(form.email));
  };

  const togglePlatform = (platform: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  // Only allow digits, spaces, +, -, ( ) while typing
  const PHONE_ALLOWED_CHARS = /^[0-9+\-()\s]*$/;

  const handlePhoneChange = (value: string) => {
    if (!PHONE_ALLOWED_CHARS.test(value)) return;

    handleChange("phone", value);
    setPhoneError(touched.phone ? getPhoneError(value) : null);
  };

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    setPhoneError(getPhoneError(form.phone));
  };

  const isValid =
    getNameError(form.name) === null &&
    getEmailError(form.email) === null &&
    getPhoneError(form.phone) === null;

  const handleSubmit = async () => {
    // force-validate everything on submit, even untouched fields
    const nErr = getNameError(form.name);
    const eErr = getEmailError(form.email);
    const pErr = getPhoneError(form.phone);

    setNameError(nErr);
    setEmailError(eErr);
    setPhoneError(pErr);
    setTouched({ name: true, email: true, phone: true });

    if (nErr || eErr || pErr) return;

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
        setNameError(null);
        setEmailError(null);
        setPhoneError(null);
        setTouched({ name: false, email: false, phone: false });
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
                  onBlur={() => handleBlur("name")}
                  isInvalid={!!nameError}
                  errorMessage={nameError ?? undefined}
                  isRequired
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="juan@company.com"
                  value={form.email}
                  onValueChange={(v) => handleChange("email", v)}
                  onBlur={() => handleBlur("email")}
                  isInvalid={!!emailError}
                  errorMessage={emailError ?? undefined}
                  isRequired
                />
                <Input
                  label="Phone Number"
                  placeholder="09XX XXX XXXX"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onValueChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
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
