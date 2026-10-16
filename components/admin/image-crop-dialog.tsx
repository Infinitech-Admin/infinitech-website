"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
} from "react-image-crop";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageCropDialogProps {
  file: File | null;
  // number = locked ratio (1 = square), undefined = free-form
  aspect?: number;
  title?: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const MAX_OUTPUT_SIZE = 1024;

// Inlined copy of the essential react-image-crop styles, so no CSS import,
// no globals.css change and no type declaration is needed.
const CROP_CSS = `
.ReactCrop{position:relative;display:inline-block;cursor:crosshair;max-width:100%}
.ReactCrop *,.ReactCrop *::before,.ReactCrop *::after{box-sizing:border-box}
.ReactCrop__child-wrapper{overflow:hidden;max-height:inherit}
.ReactCrop__child-wrapper>img,.ReactCrop__child-wrapper>video{display:block;max-width:100%;max-height:inherit}
.ReactCrop:not(.ReactCrop--disabled) .ReactCrop__child-wrapper>img{touch-action:none}
.ReactCrop__crop-mask{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
.ReactCrop__crop-selection{position:absolute;top:0;left:0;transform:translateZ(0);cursor:move;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.ReactCrop__crop-selection:focus{outline:none}
.ReactCrop--disabled .ReactCrop__crop-selection{cursor:inherit}
.ReactCrop--invisible-crop .ReactCrop__crop-mask,.ReactCrop--invisible-crop .ReactCrop__crop-selection{display:none}
.ReactCrop__rule-of-thirds-vt::before,.ReactCrop__rule-of-thirds-vt::after,.ReactCrop__rule-of-thirds-hz::before,.ReactCrop__rule-of-thirds-hz::after{content:"";display:block;position:absolute;background-color:rgba(255,255,255,.4)}
.ReactCrop__rule-of-thirds-vt::before,.ReactCrop__rule-of-thirds-vt::after{width:1px;height:100%}
.ReactCrop__rule-of-thirds-vt::before{left:33.3333%}
.ReactCrop__rule-of-thirds-vt::after{left:66.6666%}
.ReactCrop__rule-of-thirds-hz::before,.ReactCrop__rule-of-thirds-hz::after{width:100%;height:1px}
.ReactCrop__rule-of-thirds-hz::before{top:33.3333%}
.ReactCrop__rule-of-thirds-hz::after{top:66.6666%}
.ReactCrop__drag-handle{position:absolute;width:12px;height:12px;background-color:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.9)}
.ReactCrop__drag-handle.ord-nw{top:0;left:0;margin-top:-6px;margin-left:-6px;cursor:nw-resize}
.ReactCrop__drag-handle.ord-n{top:0;left:50%;margin-top:-6px;margin-left:-6px;cursor:n-resize}
.ReactCrop__drag-handle.ord-ne{top:0;right:0;margin-top:-6px;margin-right:-6px;cursor:ne-resize}
.ReactCrop__drag-handle.ord-e{top:50%;right:0;margin-top:-6px;margin-right:-6px;cursor:e-resize}
.ReactCrop__drag-handle.ord-se{bottom:0;right:0;margin-bottom:-6px;margin-right:-6px;cursor:se-resize}
.ReactCrop__drag-handle.ord-s{bottom:0;left:50%;margin-bottom:-6px;margin-left:-6px;cursor:s-resize}
.ReactCrop__drag-handle.ord-sw{bottom:0;left:0;margin-bottom:-6px;margin-left:-6px;cursor:sw-resize}
.ReactCrop__drag-handle.ord-w{top:50%;left:0;margin-top:-6px;margin-left:-6px;cursor:w-resize}
.ReactCrop__drag-bar{position:absolute}
.ReactCrop__drag-bar.ord-n{top:0;left:0;width:100%;height:8px;margin-top:-4px;cursor:n-resize}
.ReactCrop__drag-bar.ord-e{right:0;top:0;width:8px;height:100%;margin-right:-4px;cursor:e-resize}
.ReactCrop__drag-bar.ord-s{bottom:0;left:0;width:100%;height:8px;margin-bottom:-4px;cursor:s-resize}
.ReactCrop__drag-bar.ord-w{top:0;left:0;width:8px;height:100%;margin-left:-4px;cursor:w-resize}
.ReactCrop--fixed-aspect .ReactCrop__drag-handle.ord-n,
.ReactCrop--fixed-aspect .ReactCrop__drag-handle.ord-e,
.ReactCrop--fixed-aspect .ReactCrop__drag-handle.ord-s,
.ReactCrop--fixed-aspect .ReactCrop__drag-handle.ord-w{display:none}
.ReactCrop--disabled .ReactCrop__drag-handle,.ReactCrop--disabled .ReactCrop__drag-bar{display:none}
`;

export function ImageCropDialog({
  file,
  aspect,
  title = "Crop Image",
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) {
      setSrc(null);
      setCrop(undefined);

      return;
    }
    const url = URL.createObjectURL(file);

    setSrc(url);
    setCrop(undefined);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    if (aspect) {
      setCrop(
        centerCrop(
          makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
          width,
          height,
        ),
      );
    } else {
      setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    }
  };

  const handleConfirm = async () => {
    const img = imgRef.current;

    if (!file || !img || !crop) return;
    setSaving(true);
    try {
      const pixel = convertToPixelCrop(crop, img.width, img.height);
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const srcW = pixel.width * scaleX;
      const srcH = pixel.height * scaleY;
      const ratio = Math.min(1, MAX_OUTPUT_SIZE / Math.max(srcW, srcH));

      const canvas = document.createElement("canvas");

      canvas.width = Math.round(srcW * ratio);
      canvas.height = Math.round(srcH * ratio);

      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas not supported");

      ctx.drawImage(
        img,
        pixel.x * scaleX,
        pixel.y * scaleY,
        srcW,
        srcH,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      // keep PNG transparency (signatures), otherwise JPEG
      const keepPng = file.type === "image/png";
      const mime = keepPng ? "image/png" : "image/jpeg";

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mime, 0.92),
      );

      if (!blob) throw new Error("Failed to crop image");

      const baseName = file.name.replace(/\.[^.]+$/, "");

      onConfirm(
        new File([blob], `${baseName}.${keepPng ? "png" : "jpg"}`, {
          type: mime,
        }),
      );
    } catch {
      // fall back to the uncropped file rather than blocking the upload
      onConfirm(file);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg">
        <style>{CROP_CSS}</style>

        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Drag the corners or edges to resize, drag inside to move.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] items-center justify-center overflow-auto rounded-lg bg-slate-900 p-2">
          {src && (
            <ReactCrop
              aspect={aspect}
              crop={crop}
              keepSelection
              ruleOfThirds
              onChange={(_, percentCrop) => setCrop(percentCrop)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                alt="Crop preview"
                className="max-h-[55vh] w-auto object-contain"
                src={src}
                onLoad={handleImageLoad}
              />
            </ReactCrop>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button disabled={saving} variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            disabled={saving || !crop?.width || !crop?.height}
            onClick={handleConfirm}
          >
            {saving ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Cropping...
              </>
            ) : (
              "Apply Crop"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
