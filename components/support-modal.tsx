"use client";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ============================================================================
 * VALIDATION HELPERS
 * ========================================================================== */

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
  if (!trimmed) return "Name is required.";
  if (trimmed.length < 4) return "Name is too short.";
  if (trimmed.length > 60) return "Name is too long.";

  const words = trimmed.split(" ");
  if (words.length < 2 || words.length > 4) {
    return "Please enter your full name (e.g. Juan Dela Cruz).";
  }

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
  if (!trimmed) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Please enter a valid email address.";
  }

  const localPart = trimmed.split("@")[0]?.toLowerCase();
  if (!localPart) return "Please enter a valid email address.";
  if (/^\d+$/.test(localPart)) return "Please enter a valid email address.";
  if (isGibberishText(localPart)) return "Please enter a valid email address.";

  return null;
};

// Subject/message stay lenient — bug reports legitimately contain URLs,
// error codes, and technical shorthand, so we only check bare minimums.
const getSubjectError = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return "Subject is required.";
  if (trimmed.length < 3) return "Subject is too short.";
  if (trimmed.length > 150) return "Subject is too long.";
  return null;
};

const getMessageError = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return "Message is required.";
  if (trimmed.length < 10)
    return "Please provide a bit more detail (at least 10 characters).";
  if (trimmed.length > 2000) return "Message is too long.";
  return null;
};

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "bug_report",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = getNameError(formData.name);
    const emailErr = getEmailError(formData.email);
    const subjectErr = getSubjectError(formData.subject);
    const messageErr = getMessageError(formData.message);

    setErrors({
      name: nameErr ?? "",
      email: emailErr ?? "",
      subject: subjectErr ?? "",
      message: messageErr ?? "",
    });

    if (nameErr || emailErr || subjectErr || messageErr) {
      toast({
        title: "Please check the form",
        description:
          nameErr ||
          emailErr ||
          subjectErr ||
          messageErr ||
          "Some fields need attention.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          domain: typeof window !== "undefined" ? window.location.origin : "",
          currentPage:
            typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create support ticket");
      }

      toast({
        title: "Success",
        description: `Support ticket created: ${data.ticket_id}`,
      });

      setFormData({
        name: "",
        email: "",
        category: "bug_report",
        subject: "",
        message: "",
      });
      setErrors({ name: "", email: "", subject: "", message: "" });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create support ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Website Support & Feedback</DialogTitle>
          <DialogDescription>
            Report website issues or share feedback to help us improve.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
              }}
              onBlur={() =>
                setErrors((p) => ({
                  ...p,
                  name: getNameError(formData.name) ?? "",
                }))
              }
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              onBlur={() =>
                setErrors((p) => ({
                  ...p,
                  email: getEmailError(formData.email) ?? "",
                }))
              }
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="bug_report">Bug Report</option>
              <option value="feature_request">Feature Request</option>
              <option value="general_feedback">General Feedback</option>
              <option value="menu_question">Menu Question</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => {
                setFormData({ ...formData, subject: e.target.value });
                if (errors.subject) setErrors((p) => ({ ...p, subject: "" }));
              }}
              onBlur={() =>
                setErrors((p) => ({
                  ...p,
                  subject: getSubjectError(formData.subject) ?? "",
                }))
              }
              required
            />
            {errors.subject && (
              <p className="text-red-500 text-xs">{errors.subject}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                if (errors.message) setErrors((p) => ({ ...p, message: "" }));
              }}
              onBlur={() =>
                setErrors((p) => ({
                  ...p,
                  message: getMessageError(formData.message) ?? "",
                }))
              }
              rows={4}
              required
              className="resize-none"
            />
            {errors.message && (
              <p className="text-red-500 text-xs">{errors.message}</p>
            )}
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-orange-400 hover:bg-orange-500 text-black"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Submitting..." : "Submit Website Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
