import * as Yup from "yup";
import disposableDomains from "disposable-email-domains";

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

// Common troll/test inputs
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

// Rejects keyboard-mash strings like "ajdglajsdasdasd"
const isLikelyRealName = (value?: string) => {
  if (!value) return false;

  const trimmed = value.trim().replace(/\s+/g, " ");
  const words = trimmed.split(" ");

  // must be 2–4 words (first + last, optional middle names)
  if (words.length < 2 || words.length > 4) return false;

  const seen = new Set<string>();

  for (const word of words) {
    const lower = word.toLowerCase();

    if (word.length < 2) return false;
    if (!/^[A-Za-z'-]+$/.test(word)) return false; // letters only
    if (!/[aeiouAEIOU]/.test(word)) return false; // must contain a vowel
    if (/(.)\1{2,}/.test(word)) return false; // no 3+ repeated letters
    if (BLOCKED_NAME_WORDS.includes(lower)) return false; // blocklist
    if (seen.has(lower)) return false; // no repeated words e.g. "Juan Juan"

    seen.add(lower);
  }

  return true;
};

// Reject temp/disposable email domains (uses npm package's list)
const isNotDisposableEmail = (value?: string) => {
  if (!value) return false;
  const domain = value.split("@")[1]?.toLowerCase();
  return !disposableDomains.includes(domain ?? "");
};

// Reject obviously gibberish local-parts (before the @)
const isLikelyRealEmail = (value?: string) => {
  if (!value) return false;
  const localPart = value.split("@")[0]?.toLowerCase();
  if (!localPart) return false;

  // must contain at least one vowel somewhere in the local part
  if (!/[aeiou]/i.test(localPart)) return false;

  // reject long runs of the same character, e.g. "aaaa" or "1111"
  if (/(.)\1{3,}/.test(localPart)) return false;

  // reject local parts that are ONLY digits (e.g. "123123123@gmail.com")
  if (/^\d+$/.test(localPart)) return false;

  return true;
};

// Reject numbers with an invalid PH prefix or repeating-digit patterns
const isValidPhMobile = (value?: string) => {
  if (!value) return false;
  if (!/^09\d{9}$/.test(value)) return false;

  const prefix = value.slice(0, 4);
  if (!VALID_PH_PREFIXES.includes(prefix)) return false;

  // reject all-same-digit or simple repeating patterns e.g. "09111111111"
  if (/^(\d)\1{9,}$/.test(value.slice(2))) return false;

  return true;
};

// Reject spammy/gibberish messages
const isValidMessage = (value?: string) => {
  if (!value) return false;
  const trimmed = value.trim();

  if (!/[aeiouAEIOU]/i.test(trimmed)) return false; // must have vowels
  if (/(.)\1{4,}/.test(trimmed)) return false; // no long repeated chars
  if (/https?:\/\/|www\./i.test(trimmed)) return false; // no links

  return true;
};

export const Inquiry = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(4, "Name is too short")
    .max(60, "Name is too long")
    .test(
      "is-real-name",
      "Please enter your full name (e.g. Juan Dela Cruz)",
      isLikelyRealName,
    )
    .required("Full Name is required"),

  email: Yup.string()
    .trim()
    .lowercase()
    .email("Invalid Email")
    .test(
      "not-disposable",
      "Please use a permanent email address",
      isNotDisposableEmail,
    )
    .test(
      "is-real-email",
      "Please enter a valid email address",
      isLikelyRealEmail,
    )
    .required("Email Address is required"),

  phone: Yup.string()
    .test(
      "valid-ph-mobile",
      "Please enter a valid PH mobile number (e.g. 09171234567)",
      isValidPhMobile,
    )
    .required("Phone Number is required"),

  message: Yup.string()
    .trim()
    .min(10, "Message is too short")
    .max(1000, "Message is too long")
    .test(
      "valid-message",
      "Please enter a valid message (no links or spam text)",
      isValidMessage,
    )
    .required("Message is required"),
});
