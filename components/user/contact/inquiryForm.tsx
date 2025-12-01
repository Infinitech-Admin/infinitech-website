"use client";

import React, { useState } from "react";
import { Button, Input, Textarea } from "@heroui/react";
import { LuArrowRight } from "react-icons/lu";
import { Inquiry as Values } from "@/types/user";
import { Inquiry as validationSchema } from "@/schemas/user";
import { Formik, Form, Field, FieldProps } from "formik";
import toast from "react-hot-toast";

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
    actions: { resetForm: () => void }
  ) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        actions.resetForm();
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to submit inquiry');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Inquiry submission error:', error);
    }

    setIsSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {() => (
        <Form>
          <div className="flex flex-col space-y-4">
            {/* Full Name */}
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
                  />
                  {meta.touched && meta.error && (
                    <small className="text-red-500">{meta.error}</small>
                  )}
                </div>
              )}
            </Field>

            {/* Email */}
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
                  />
                  {meta.touched && meta.error && (
                    <small className="text-red-500">{meta.error}</small>
                  )}
                </div>
              )}
            </Field>

            {/* Phone */}
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
                  />
                  {meta.touched && meta.error && (
                    <small className="text-red-500">{meta.error}</small>
                  )}
                </div>
              )}
            </Field>

            {/* Message */}
            <Field name="message">
              {({ field, meta }: FieldProps) => (
                <div>
                  <Textarea
                    {...field}
                    size="lg"
                    label="Message"
                    variant="bordered"
                    placeholder="Leave us a message..."
                  />
                  {meta.touched && meta.error && (
                    <small className="text-red-500">{meta.error}</small>
                  )}
                </div>
              )}
            </Field>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                className="bg-primary text-gray-100"
                size="lg"
                variant="solid"
                endContent={<LuArrowRight />}
                isLoading={isSubmitting}
              >
                Submit Inquiry
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default InquiryForm;
