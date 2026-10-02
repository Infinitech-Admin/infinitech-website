"use client";

import React, { useState } from "react";
import { Input, Textarea } from "@heroui/react";
import { LuArrowRight } from "react-icons/lu";
import { Inquiry as Values } from "@/types/user";
import { Inquiry as validationSchema } from "@/schemas/user";
import { Formik, Form, Field, FieldProps } from "formik";
import toast from "react-hot-toast";

/* dark-theme styling for HeroUI fields */
const fieldClasses = {
  label: "!text-[#8a97bd] group-data-[filled-within=true]:!text-[#38bdf8]",
  input: "!text-white placeholder:!text-[#5d6a92]",
  inputWrapper:
    "!border-white/15 !bg-white/[0.03] hover:!border-[#38bdf8]/50 group-data-[focus=true]:!border-[#38bdf8] group-data-[focus=true]:shadow-[0_0_20px_rgba(56,189,248,0.25)]",
};

const Err = ({ children }: { children: React.ReactNode }) => (
  <small className="mt-1 block text-[#f87171]">{children}</small>
);

const InquiryForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    message: "",
  };

  const onSubmit = async (
    values: Values,
    actions: { resetForm: () => void },
  ) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        actions.resetForm();
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to submit inquiry");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Inquiry submission error:", error);
    }

    setIsSubmitting(false);
  };

  // Allow only numbers in phone field, must start with 09
  const handlePhoneInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const value = e.target.value;
    let numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 11);

    // Enforce leading "09" while typing
    if (numbersOnly.length >= 1 && numbersOnly[0] !== "0") {
      numbersOnly = "";
    } else if (numbersOnly.length >= 2 && numbersOnly[1] !== "9") {
      numbersOnly = numbersOnly[0];
    }

    setFieldValue("phone", numbersOnly);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ setFieldValue }) => (
        <Form>
          <div className="flex flex-col space-y-4">
            <Field name="name">
              {({ field, meta }: FieldProps) => (
                <div>
                  <Input
                    {...field}
                    type="text"
                    size="lg"
                    label="Full Name"
                    variant="bordered"
                    placeholder="eg. Juan Dela Cruz"
                    classNames={fieldClasses}
                  />
                  {meta.touched && meta.error && <Err>{meta.error}</Err>}
                </div>
              )}
            </Field>

            <Field name="email">
              {({ field, meta }: FieldProps) => (
                <div>
                  <Input
                    {...field}
                    type="email"
                    size="lg"
                    label="Email Address"
                    variant="bordered"
                    placeholder="eg. juandelacruz@gmail.com"
                    classNames={fieldClasses}
                  />
                  {meta.touched && meta.error && <Err>{meta.error}</Err>}
                </div>
              )}
            </Field>

            <Field name="phone">
              {({ field, meta }: FieldProps) => (
                <div>
                  <Input
                    {...field}
                    type="text"
                    size="lg"
                    label="Phone Number"
                    variant="bordered"
                    placeholder="eg. 09924401097"
                    onChange={(e) => handlePhoneInput(e, setFieldValue)}
                    maxLength={11}
                    classNames={fieldClasses}
                  />
                  {meta.touched && meta.error && <Err>{meta.error}</Err>}
                </div>
              )}
            </Field>

            <Field name="message">
              {({ field, meta }: FieldProps) => (
                <div>
                  <Textarea
                    {...field}
                    size="lg"
                    label="Message"
                    variant="bordered"
                    placeholder="Leave us a message..."
                    classNames={fieldClasses}
                  />
                  {meta.touched && meta.error && <Err>{meta.error}</Err>}
                </div>
              )}
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#f5a623] px-6 py-3 text-sm font-bold text-[#070d1f] shadow-[0_0_30px_rgba(245,166,35,0.45)] transition hover:-translate-y-0.5 hover:bg-[#ffb93f] hover:shadow-[0_0_44px_rgba(245,166,35,0.7)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
            >
              {isSubmitting ? "Sending..." : "Submit Inquiry"}
              {!isSubmitting && <LuArrowRight />}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default InquiryForm;
