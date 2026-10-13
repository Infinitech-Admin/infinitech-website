"use client";

import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Employee } from "./employee-types";

export type EmployeeFileType = "profile-image" | "signature";

function imageExtension(storagePath: string | null | undefined): string {
  const extension = storagePath?.split(".").pop()?.toLowerCase();
  return extension && ["jpg", "jpeg", "png", "webp"].includes(extension)
    ? `.${extension}`
    : "";
}

function usePrivateEmployeeImage(
  employeeId: number | undefined,
  fileType: EmployeeFileType,
  storagePath: string | null | undefined,
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl(null);
    if (!employeeId || !storagePath) return;

    const controller = new AbortController();
    let objectUrl: string | null = null;

    const loadImage = async () => {
      const token = localStorage.getItem("adminSessionActive");
      if (!token) return;

      const response = await fetch(
        `/api/employee-masterfile/${employeeId}/files/${fileType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        },
      );

      if (response.status === 404) return;
      if (!response.ok) {
        throw new Error(`Unable to load employee ${fileType}.`);
      }

      const blob = await response.blob();
      if (controller.signal.aborted) return;
      if (!blob.type.startsWith("image/")) {
        throw new Error(`Employee ${fileType} response is not an image.`);
      }

      objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
    };

    loadImage().catch((error: unknown) => {
      if (!controller.signal.aborted) {
        console.error(error);
      }
    });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [employeeId, fileType, storagePath]);

  return imageUrl;
}

export function EmployeeAvatar({
  employee,
  className,
}: {
  employee: Pick<Employee, "id" | "first_name" | "profile_image_path">;
  className: string;
}) {
  const imageUrl = usePrivateEmployeeImage(
    employee.id,
    "profile-image",
    employee.profile_image_path,
  );
  const [imageFailed, setImageFailed] = useState(false);
  const initial = employee.first_name?.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => setImageFailed(false), [imageUrl]);

  return (
    <EmployeeImageViewer
      src={imageUrl && !imageFailed ? imageUrl : null}
      alt={`${employee.first_name || "Employee"} profile`}
      downloadName={`employee-${employee.id}-profile-image${imageExtension(employee.profile_image_path)}`}
      className="shrink-0"
    >
      <div className={cn("relative overflow-hidden rounded-full", className)}>
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={`${employee.first_name || "Employee"} profile`}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          initial
        )}
      </div>
    </EmployeeImageViewer>
  );
}

export function EmployeeImageViewer({
  src,
  alt,
  children,
  className,
  downloadName,
}: {
  src: string | null;
  alt: string;
  children: React.ReactNode;
  className?: string;
  downloadName?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!src) setOpen(false);
  }, [src]);

  return (
    <>
      <div className={cn("group/image relative inline-flex", className)}>
        {children}
        {src && (
          <button
            type="button"
            aria-label={`View ${alt}`}
            title={`View ${alt}`}
            onClick={() => setOpen(true)}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-all hover:bg-black/35 hover:opacity-100 focus-visible:bg-black/35 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Search className="h-5 w-5 drop-shadow" aria-hidden="true" />
          </button>
        )}
      </div>
      {src && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl flex-col items-center justify-center gap-3 overflow-hidden border-0 bg-transparent p-0 shadow-none">
            <DialogTitle className="sr-only">{alt}</DialogTitle>
            <img
              src={src}
              alt={alt}
              className="max-h-[85dvh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <a
              href={src}
              download={downloadName || "employee-profile-image"}
              aria-label={`Download ${alt}`}
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-lg transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download image
            </a>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function EmployeePrivateImage({
  employeeId,
  fileType,
  storagePath,
  alt,
  className,
  fallback,
  viewable = false,
}: {
  employeeId: number | undefined;
  fileType: EmployeeFileType;
  storagePath: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  viewable?: boolean;
}) {
  const imageUrl = usePrivateEmployeeImage(employeeId, fileType, storagePath);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [imageUrl]);

  if (!imageUrl || imageFailed) return fallback ?? null;

  const image = (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setImageFailed(true)}
    />
  );

  return viewable ? (
    <EmployeeImageViewer
      src={imageUrl}
      alt={alt}
      downloadName={`employee-${employeeId ?? "profile"}-${fileType}${imageExtension(storagePath)}`}
      className="absolute inset-0"
    >
      {image}
    </EmployeeImageViewer>
  ) : (
    image
  );
}
