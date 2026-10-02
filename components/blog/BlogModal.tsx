"use client";

import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BlogPost } from "./types";
import { formatDate } from "./utils";
import { useVideoThumbnail } from "./useVideoThumbnail";

interface BlogModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const navBtn =
  "absolute top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-[#070d1f]/80 text-white backdrop-blur-md transition hover:border-[#38bdf8]/60 hover:text-[#38bdf8] hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8]";

export default function BlogModal({ post, isOpen, onClose }: BlogModalProps) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // reset to the first image whenever a new post is opened
  useEffect(() => {
    setActiveImage(0);
  }, [post?.id]);

  // Only generate a video-frame poster if there's no thumbnail or gallery image.
  const needsPoster =
    Boolean(post?.videoUrl) && !post?.imageUrl && !post?.thumbnailUrl;
  const { thumbnail: generatedThumbnail } = useVideoThumbnail(
    needsPoster ? post?.videoUrl : null,
  );

  if (!isOpen || !post) return null;

  const poster =
    post.imageUrl ?? post.thumbnailUrl ?? generatedThumbnail ?? undefined;
  const gallery = post.imageUrls?.length
    ? post.imageUrls
    : post.imageUrl
      ? [post.imageUrl]
      : [];
  const currentImage = gallery[activeImage];

  const goPrev = () =>
    setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setActiveImage((i) => (i + 1) % gallery.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/80 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#38bdf8]/30 bg-[#0a1226] shadow-[0_0_80px_rgba(56,189,248,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* glowing top line */}
        <span
          aria-hidden
          className="absolute -top-px left-10 z-10 h-[2px] w-40 rounded-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_14px_rgba(56,189,248,0.9)]"
        />

        {/* window bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="font-mono text-[11px] text-[#8a97bd]">
              {post.category ?? "story"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#b8c3e6] transition hover:border-[#f5a623]/60 hover:text-[#f5a623] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {/* Media */}
          {post.videoUrl ? (
            <div className="aspect-video overflow-hidden bg-black">
              <video
                src={post.videoUrl}
                poster={poster}
                controls
                className="h-full w-full"
              />
            </div>
          ) : currentImage ? (
            <div className="relative h-[320px] w-full overflow-hidden bg-[#070d1f] sm:h-[400px]">
              {/* blurred backdrop fill */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
              />
              <div className="absolute inset-0 bg-[#070d1f]/30" />

              {/* sharp, uncropped image on top */}
              <div className="relative flex h-full w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage}
                  alt={post.title}
                  className="max-h-full max-w-full object-contain shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                />
              </div>

              {gallery.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className={`${navBtn} left-3`}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className={`${navBtn} right-3`}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === activeImage
                            ? "w-5 bg-[#f5a623] shadow-[0_0_10px_rgba(245,166,35,0.7)]"
                            : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* Body */}
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#8a97bd]">
              {post.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-2.5 py-0.5 font-mono text-[11px] text-[#f5a623]">
                  <Tag className="h-3 w-3" />
                  {post.category}
                </span>
              )}
              <span className="flex items-center gap-1.5 font-mono">
                <Calendar className="h-3.5 w-3.5 text-[#38bdf8]" />
                {formatDate(post.publishedAt)}
              </span>
              {post.author && (
                <span className="flex items-center gap-1.5 font-mono">
                  <User className="h-3.5 w-3.5 text-[#38bdf8]" />
                  {post.author}
                </span>
              )}
            </div>

            <h2 className="mb-5 font-['Poetsen_One'] text-2xl font-bold leading-tight text-white sm:text-3xl">
              {post.title}
            </h2>

            <div
              className="mb-5 h-px"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(56,189,248,0.5), rgba(255,255,255,0.08), transparent)",
              }}
            />

            <div className="whitespace-pre-line leading-relaxed text-[#c5cff0]">
              {post.content || post.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
