// File: components/blog/useVideoThumbnail.ts
"use client";

import { useEffect, useState } from "react";

const thumbnailCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

function proxiedUrl(videoUrl: string): string {
  return `/api/video-proxy?url=${encodeURIComponent(videoUrl)}`;
}

/**
 * Samples the canvas to see whether the captured frame is (almost)
 * a single solid color -- which usually means we hit a black title
 * card / fade-in frame or a codec the browser couldn't decode.
 */
function isMostlyBlank(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): boolean {
  // Sample a small grid instead of every pixel for speed.
  const sampleStepX = Math.max(1, Math.floor(w / 20));
  const sampleStepY = Math.max(1, Math.floor(h / 20));
  const { data } = ctx.getImageData(0, 0, w, h);

  let total = 0;
  let sum = 0;
  let sumSq = 0;

  for (let y = 0; y < h; y += sampleStepY) {
    for (let x = 0; x < w; x += sampleStepX) {
      const idx = (y * w + x) * 4;
      // Rough luminance
      const lum =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      total += 1;
      sum += lum;
      sumSq += lum * lum;
    }
  }

  if (total === 0) return false;

  const mean = sum / total;
  const variance = sumSq / total - mean * mean;
  const stdDev = Math.sqrt(Math.max(variance, 0));

  // Very low variance across the sampled grid means the frame is
  // essentially a flat color (black, white, or otherwise blank).
  // Low mean additionally catches near-black frames specifically.
  const looksFlat = stdDev < 4;
  const looksDark = mean < 12;

  return looksFlat || (looksFlat === false && looksDark && stdDev < 8);
}

function captureFrameAt(
  video: HTMLVideoElement,
  seekTime: number,
): Promise<{
  dataUrl: string;
  blank: boolean;
}> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blank = isMostlyBlank(ctx, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve({ dataUrl, blank });
      } catch (err) {
        reject(err);
      }
    };

    const onError = () => {
      cleanup();
      reject(new Error(`Video seek error (readyState=${video.readyState})`));
    };

    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    const target = Math.min(seekTime, Math.max(video.duration - 0.1, 0));
    video.currentTime = isFinite(target) ? target : 0;
  });
}

function captureFrame(videoUrl: string, seekTimes: number[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    // No crossOrigin needed -- the proxy route makes this same-origin.
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = proxiedUrl(videoUrl);

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out loading video"));
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
    };

    const onError = () => {
      cleanup();
      reject(new Error(`Video load error (readyState=${video.readyState})`));
    };

    const onLoadedMetadata = async () => {
      try {
        let fallback: string | null = null;

        for (const t of seekTimes) {
          try {
            const { dataUrl, blank } = await captureFrameAt(video, t);
            if (!blank) {
              cleanup();
              resolve(dataUrl);
              return;
            }
            // Keep the first successful (even if blank) frame as a
            // fallback in case every sampled timestamp looks blank.
            if (!fallback) fallback = dataUrl;
          } catch {
            // Try the next timestamp on failure.
            continue;
          }
        }

        cleanup();
        if (fallback) {
          // Every candidate frame was blank/dark -- still better than
          // nothing, so return the first one we managed to capture.
          resolve(fallback);
        } else {
          reject(new Error("Could not capture a usable frame"));
        }
      } catch (err) {
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
  });
}

export function useVideoThumbnail(
  videoUrl: string | null | undefined,
  seekTime = 1,
) {
  const [thumbnail, setThumbnail] = useState<string | null>(
    videoUrl ? (thumbnailCache.get(videoUrl) ?? null) : null,
  );
  const [loading, setLoading] = useState(Boolean(videoUrl) && !thumbnail);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) return;

    const cached = thumbnailCache.get(videoUrl);
    if (cached) {
      setThumbnail(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Try a spread of timestamps so a black intro frame at t=1 doesn't
    // become the permanent thumbnail -- we fall through until we find
    // one that isn't (mostly) a flat/dark frame.
    const seekTimes = Array.from(
      new Set([seekTime, 2, 3, 0.5, 5].filter((t) => t > 0)),
    );

    const promise =
      inFlight.get(videoUrl) ??
      captureFrame(videoUrl, seekTimes).then((dataUrl) => {
        thumbnailCache.set(videoUrl, dataUrl);
        inFlight.delete(videoUrl);
        return dataUrl;
      });
    inFlight.set(videoUrl, promise);

    promise
      .then((dataUrl) => {
        if (!cancelled) {
          setThumbnail(dataUrl);
          setLoading(false);
        }
      })
      .catch((err) => {
        inFlight.delete(videoUrl);
        console.error(`[useVideoThumbnail] failed for ${videoUrl}:`, err);
        if (!cancelled) {
          setError(err?.message ?? "Thumbnail generation failed");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [videoUrl, seekTime]);

  return { thumbnail, loading, error };
}
