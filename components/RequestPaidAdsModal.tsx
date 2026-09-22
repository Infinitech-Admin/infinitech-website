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
import { FaBullhorn } from "react-icons/fa";
import { GoCheck } from "react-icons/go";
import {
  getNameError,
  getEmailError,
  getPhoneError,
  PHONE_ALLOWED_CHARS,
} from "@/lib/form-validation";

interface RequestPaidAdsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaidAdsFormData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  adPlatforms: string[];
  monthlyBudget: string;
  details: string;
}

const initialForm: PaidAdsFormData = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  adPlatforms: [],
  monthlyBudget: "",
  details: "",
};

const AD_PLATFORM_OPTIONS = [
  "Facebook Ads",
  "Instagram Ads",
  "Google Ads",
  "TikTok Ads",
  "YouTube Ads",
  "LinkedIn Ads",
];

const BUDGET_OPTIONS = [
  "Under ₱10,000/mo",
  "₱10,000 - ₱30,000/mo",
  "₱30,000 - ₱75,000/mo",
  "₱75,000+/mo",
  "Not sure yet",
];

const RequestPaidAdsModal = ({
  isOpen,
  onOpenChange,
}: RequestPaidAdsModalProps) => {
  const [form, setForm] = useState<PaidAdsFormData>(initialForm);
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
    field: keyof Omit<PaidAdsFormData, "adPlatforms">,
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

  const toggleAdPlatform = (platform: string) => {
    setForm((prev) => ({
      ...prev,
      adPlatforms: prev.adPlatforms.includes(platform)
        ? prev.adPlatforms.filter((p) => p !== platform)
        : [...prev.adPlatforms, platform],
    }));
  };

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
      const res = await fetch("/api/paid-ads-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          adPlatforms: form.adPlatforms.join(","),
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
      }, 200);
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
                  Our ads team will reach out to build your campaign shortly.
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
                  <FaBullhorn className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-primary font-bold text-base leading-tight">
                    Request Paid Ads
                  </p>
                  <p className="text-gray-500 text-xs font-normal">
                    Tell us about your goals and we&apos;ll get your campaign
                    live.
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
                  label="Business Name"
                  placeholder="Your Business Inc."
                  value={form.businessName}
                  onValueChange={(v) => handleChange("businessName", v)}
                />

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Which platforms do you want to advertise on?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AD_PLATFORM_OPTIONS.map((platform) => {
                      const selected = form.adPlatforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => toggleAdPlatform(platform)}
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

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Estimated monthly ad budget
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map((budget) => {
                      const selected = form.monthlyBudget === budget;
                      return (
                        <button
                          key={budget}
                          type="button"
                          onClick={() => handleChange("monthlyBudget", budget)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            selected
                              ? "bg-accent text-white border-accent"
                              : "bg-white text-gray-600 border-gray-300 hover:border-accent"
                          }`}
                        >
                          {budget}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Textarea
                  label="Tell us about your campaign goals"
                  placeholder="e.g. We want to drive more foot traffic to our store and increase online orders..."
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

export default RequestPaidAdsModal;
