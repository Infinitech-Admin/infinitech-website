// PHP <-> USD conversion helper, with an optional live exchange rate.
//
// FALLBACK_USD_TO_PHP_RATE is used until (or unless) a live rate loads
// successfully. Update it occasionally so the fallback stays reasonable.
export const FALLBACK_USD_TO_PHP_RATE = 62.69;

export type Currency = "PHP" | "USD";

const CACHE_KEY = "usd_php_rate_cache_v1";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type RateCache = {
  rate: number;
  fetchedAt: number;
};

/**
 * Fetches the current USD -> PHP rate from a free, no-API-key exchange
 * rate service (open.er-api.com). Falls back to a localStorage cache if
 * the request fails, and to FALLBACK_USD_TO_PHP_RATE if there's no cache
 * either.
 *
 * Swap the endpoint for a paid provider (e.g. exchangerate-api.com,
 * Fixer.io, Open Exchange Rates) if you need higher reliability/SLA —
 * the shape you need back is just `{ rate: number }`.
 */
export async function fetchLiveUsdToPhpRate(): Promise<{
  rate: number;
  source: "live" | "cache" | "fallback";
}> {
  // 1. Try cache first if it's fresh — avoids refetching on every render/mount.
  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { rate: cached.rate, source: "cache" };
  }

  // 2. Try a live fetch.
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error(`FX request failed: ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.PHP;
    if (typeof rate !== "number" || Number.isNaN(rate)) {
      throw new Error("PHP rate missing from response");
    }
    writeCache({ rate, fetchedAt: Date.now() });
    return { rate, source: "live" };
  } catch (err) {
    // 3. Live fetch failed — fall back to stale cache if we have one.
    if (cached) return { rate: cached.rate, source: "cache" };
    // 4. No cache either — use the hardcoded fallback.
    return { rate: FALLBACK_USD_TO_PHP_RATE, source: "fallback" };
  }
}

function readCache(): RateCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.rate === "number" &&
      typeof parsed?.fetchedAt === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeCache(cache: RateCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — safe to ignore.
  }
}

/**
 * Resolves the display price for a plan in the selected currency.
 *
 * - If an explicit USD override is provided (usdAmount) and currency is USD,
 *   that exact value is used (useful for "clean" USD price points like $888
 *   instead of a rounded conversion).
 * - Otherwise the PHP amount is converted using the given rate.
 */
export function convertPrice(
  phpAmount: number | undefined,
  usdOverride: number | undefined,
  currency: Currency,
  rate: number = FALLBACK_USD_TO_PHP_RATE,
): number {
  if (currency === "USD") {
    if (usdOverride !== undefined) return usdOverride;
    if (phpAmount === undefined) return 0;
    return Math.round(phpAmount / rate);
  }

  // currency === "PHP"
  if (phpAmount !== undefined) return phpAmount;
  if (usdOverride !== undefined) return Math.round(usdOverride * rate);
  return 0;
}

export function formatPrice(amount: number, currency: Currency): string {
  return amount.toLocaleString(currency === "USD" ? "en-US" : "en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function currencySymbol(currency: Currency): string {
  return currency === "USD" ? "$" : "₱";
}
