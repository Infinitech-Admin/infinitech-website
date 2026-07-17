// File: lib/videoThumbnail.ts

/**
 * Captures a single frame from a video File and returns it as a JPEG File,
 * so it can be uploaded through the exact same pipeline as regular images
 * (uploadMultipleImages) -- no new backend fields required.
 */
export async function generateVideoThumbnail(
  file: File,
  seekTime: number = 1,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(video.src);

    video.onloadedmetadata = () => {
      // Don't seek past the end of very short clips
      const target = Math.min(seekTime, Math.max(video.duration - 0.1, 0));
      video.currentTime = target;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) {
              reject(new Error("Failed to generate thumbnail blob"));
              return;
            }
            const thumbFile = new File(
              [blob],
              `${file.name.replace(/\.[^/.]+$/, "")}-thumb.jpg`,
              { type: "image/jpeg" },
            );
            resolve(thumbFile);
          },
          "image/jpeg",
          0.85,
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video for thumbnail generation"));
    };
  });
}
