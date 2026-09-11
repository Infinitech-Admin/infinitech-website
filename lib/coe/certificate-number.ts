// File: lib/coe/certificate-number.ts
//
// Certificate numbering + default signatory now live here instead of
// Laravel's config/coe.php. Laravel only reports the highest certificate_no
// on file (GET /api/admin/coe/last-number); this file decides what the next
// one should be and who signs by default.

const CERTIFICATE_PREFIX = process.env.COE_CERTIFICATE_PREFIX ?? "CE";
const CERTIFICATE_START = Number(process.env.COE_CERTIFICATE_START ?? 50);
// Zero-pad width for the numeric part, e.g. 4 -> "CE-0050". Matches the old
// Laravel format, which used a 4-digit padded sequence.
const CERTIFICATE_PAD_WIDTH = Number(
  process.env.COE_CERTIFICATE_PAD_WIDTH ?? 4,
);

export const DEFAULT_SIGNATORY_NAME =
  process.env.COE_DEFAULT_SIGNATORY_NAME ?? "";
export const DEFAULT_SIGNATORY_TITLE =
  process.env.COE_DEFAULT_SIGNATORY_TITLE ?? "";

/**
 * Given the last certificate_no on file (e.g. "CE-0050"), returns the next
 * one (e.g. "CE-0051"). If there's no last one yet (null/undefined, or a
 * value that doesn't match this prefix — e.g. after switching prefixes),
 * starts fresh from CERTIFICATE_START.
 */
export function computeNextCertificateNo(
  lastCertificateNo: string | null | undefined,
): string {
  const nextSeq = getNextSequence(lastCertificateNo);
  const padded = String(nextSeq).padStart(CERTIFICATE_PAD_WIDTH, "0");
  return `${CERTIFICATE_PREFIX}-${padded}`;
}

function getNextSequence(lastCertificateNo: string | null | undefined): number {
  if (!lastCertificateNo) return CERTIFICATE_START;

  const escapedPrefix = CERTIFICATE_PREFIX.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const match = lastCertificateNo.match(
    new RegExp(`^${escapedPrefix}-(\\d+)$`),
  );

  if (!match) {
    // Doesn't match the current prefix format (e.g. prefix was just changed,
    // or this is the first record ever). Start fresh rather than guessing.
    return CERTIFICATE_START;
  }

  const lastSeq = parseInt(match[1], 10);
  const next = lastSeq + 1;
  return next > CERTIFICATE_START ? next : CERTIFICATE_START;
}
