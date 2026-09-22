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

// Common keyboard-mash / keyboard-row patterns
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

// Common English bigrams (letter pairs that appear frequently in real words)
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

// Score how "real" a word looks based on bigram plausibility
const bigramScore = (word: string) => {
  const lower = word.toLowerCase().replace(/[^a-z]/g, "");
  if (lower.length < 2) return 1; // too short to judge, assume ok

  let commonCount = 0;
  const totalBigrams = lower.length - 1;

  for (let i = 0; i < totalBigrams; i++) {
    const pair = lower.slice(i, i + 2);
    if (COMMON_BIGRAMS.has(pair)) commonCount++;
  }

  return commonCount / totalBigrams;
};

// Shared gibberish detector — checks consonant clusters, vowel ratio,
// keyboard patterns, and bigram plausibility
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

  // reject if less than 30% of letter-pairs are common English bigrams
  if (lower.length >= 5 && bigramScore(lower) < 0.3) return true;

  return false;
};

// Rejects keyboard-mash strings like "ajdglajsdasdasd"
const isLikelyRealName = (value?: string) => {
  if (!value) return false;

  const trimmed = value.trim().replace(/\s+/g, " ");
  const words = trimmed.split(" ");

  if (words.length < 2 || words.length > 4) return false;

  const seen = new Set<string>();

  for (const word of words) {
    const lower = word.toLowerCase();

    if (word.length < 2) return false;
    if (!/^[A-Za-z'-]+$/.test(word)) return false;
    if (isGibberishText(word)) return false;
    if (BLOCKED_NAME_WORDS.includes(lower)) return false;
    if (seen.has(lower)) return false;

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

  if (/^\d+$/.test(localPart)) return false; // only digits
  if (isGibberishText(localPart)) return false;

  return true;
};

// Reject numbers with an invalid PH prefix or repeating-digit patterns
const isValidPhMobile = (value?: string) => {
  if (!value) return false;
  if (!/^09\d{9}$/.test(value)) return false;

  const prefix = value.slice(0, 4);
  if (!VALID_PH_PREFIXES.includes(prefix)) return false;

  if (/^(\d)\1{9,}$/.test(value.slice(2))) return false;

  return true;
};

// Reject spammy/gibberish messages
const isValidMessage = (value?: string) => {
  if (!value) return false;
  const trimmed = value.trim();

  if (/https?:\/\/|www\./i.test(trimmed)) return false; // no links
  if (isGibberishText(trimmed)) return false;

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
