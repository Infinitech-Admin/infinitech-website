// Shared validation helpers used across all request modals
// (Social Media, TikTok Shop, Graphic Design, Paid Ads, Market Research, etc.)

export const VALID_PH_PREFIXES = [
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

export const isGibberishText = (text: string) => {
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

export const getNameError = (value: string): string | null => {
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

export const getEmailError = (value: string): string | null => {
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

// `optional` = true means blank is allowed (used where phone isn't required)
export const getPhoneError = (
  value: string,
  optional: boolean = true,
): string | null => {
  if (value.trim() === "") {
    return optional ? null : "Phone number is required.";
  }

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

// Only allow digits, spaces, +, -, ( ) while typing a phone field
export const PHONE_ALLOWED_CHARS = /^[0-9+\-()\s]*$/;
