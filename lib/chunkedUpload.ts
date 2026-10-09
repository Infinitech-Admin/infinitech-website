// File: lib/chunkedUpload.ts

const getAuthHeaders = (): HeadersInit => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Keep each chunk below the Next.js request-body limit before proxying to Laravel.
const CHUNK_SIZE = 2 * 1024 * 1024;

export interface UploadResult {
  path: string;
  url: string;
}

/**
 * Uploads a large file (e.g. video) to Laravel in small chunks through the
 * authenticated Next.js proxy.
 */
export async function uploadFileInChunks(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const identifier = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  let lastResult: { status: string; path?: string; url?: string } | null = null;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk, file.name);
    formData.append("chunkIndex", String(chunkIndex));
    formData.append("totalChunks", String(totalChunks));
    formData.append("identifier", identifier);
    formData.append("filename", file.name);

    const response = await fetch("/api/admin/blog/uploads/chunk", {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Chunk ${chunkIndex + 1}/${totalChunks} failed to upload`,
      );
    }

    lastResult = await response.json();

    if (onProgress) {
      onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
    }
  }

  if (
    !lastResult ||
    lastResult.status !== "completed" ||
    !lastResult.path ||
    !lastResult.url
  ) {
    throw new Error("Upload did not complete correctly");
  }

  return { path: lastResult.path, url: lastResult.url };
}

/**
 * Direct single-request upload for images (small enough not to need chunking).
 * Uses XHR instead of fetch so we get real upload progress events.
 */
export function uploadImageDirect(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/blog/uploads/image");

    const token = localStorage.getItem("adminToken");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid response from image upload"));
        }
      } else {
        reject(new Error(`Image upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Image upload failed"));
    xhr.send(formData);
  });
}

/**
 * Uploads several images, one request per file, tracking overall progress
 * as an average of each file's individual progress. Runs them in parallel.
 */
export async function uploadMultipleImages(
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<UploadResult[]> {
  const perFileProgress = new Array(files.length).fill(0);

  const report = () => {
    if (!onProgress) return;
    const avg = perFileProgress.reduce((a, b) => a + b, 0) / files.length;
    onProgress(Math.round(avg));
  };

  return Promise.all(
    files.map((file, i) =>
      uploadImageDirect(file, (pct) => {
        perFileProgress[i] = pct;
        report();
      }),
    ),
  );
}
