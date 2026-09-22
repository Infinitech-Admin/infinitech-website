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
import { FaStore } from "react-icons/fa";
import { GoCheck } from "react-icons/go";
import {
  getNameError,
  getEmailError,
  getPhoneError,
  PHONE_ALLOWED_CHARS,
} from "@/lib/form-validation";

interface RequestTikTokShopModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TikTokShopFormData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  productCategories: string[];
  details: string;
}

const initialForm: TikTokShopFormData = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  productCategories: [],
  details: "",
};

const PRODUCT_CATEGORY_OPTIONS = [
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Home & Living",
  "Electronics & Gadgets",
  "Food & Beverage",
  "Health & Wellness",
  "Other",
];

const RequestTikTokShopModal = ({
  isOpen,
  onOpenChange,
}: RequestTikTokShopModalProps) => {
  const [form, setForm] = useState<TikTokShopFormData>(initialForm);
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
    field: keyof Omit<TikTokShopFormData, "productCategories">,
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

  const toggleCategory = (category: string) => {
    setForm((prev) => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter((c) => c !== category)
        : [...prev.productCategories, category],
    }));
  };

  const handlePhoneChange = (value: string) => {
    if (!PHONE_ALLOWED_CHARS.test(value)) return;
    handleChange("phone" as any, value);
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
      const res = await fetch("/api/tiktok-shop-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productCategories: form.productCategories.join(","),
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
                  Our team will reach out about opening your TikTok Shop
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
                  <FaStore className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-primary font-bold text-base leading-tight">
                    Request TikTok Shop Opening
                  </p>
                  <p className="text-gray-500 text-xs font-normal">
                    Tell us about your business and we&apos;ll get your shop
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
                    What will you be selling?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_CATEGORY_OPTIONS.map((category) => {
                      const selected =
                        form.productCategories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            selected
                              ? "bg-accent text-white border-accent"
                              : "bg-white text-gray-600 border-gray-300 hover:border-accent"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Textarea
                  label="Tell us about your products & goals"
                  placeholder="e.g. We sell handmade skincare products, want to start live selling and reach a wider audience..."
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

export default RequestTikTokShopModal;
