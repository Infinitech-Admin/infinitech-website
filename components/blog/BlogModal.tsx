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

  const needsPoster = Boolean(post?.videoUrl) && !post?.imageUrl;
  const { thumbnail } = useVideoThumbnail(needsPoster ? post?.videoUrl : null);

  if (!isOpen || !post) return null;

  const poster = post.imageUrl ?? thumbnail ?? undefined;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-gray-500 hover:text-primary hover:bg-white shadow transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media */}
        {post.videoUrl ? (
          <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
            <video
              src={post.videoUrl}
              poster={poster}
              controls
              className="w-full h-full"
            />
          </div>
        ) : currentImage ? (
          <div className="relative w-full h-[400px] overflow-hidden rounded-t-2xl">
            {/* blurred backdrop fill */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
            />
            <div className="absolute inset-0 bg-black/10" />

            {/* sharp, uncropped image on top */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage}
                alt={post.title}
                className="max-w-full max-h-full object-contain shadow-xl"
              />
            </div>

            {/* gallery controls, only if more than one image */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white shadow transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white shadow transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === activeImage ? "bg-white w-5" : "bg-white/50"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-4">
            {post.category && (
              <span className="flex items-center gap-1.5 text-accent font-semibold">
                <Tag className="w-3.5 h-3.5" />
                {post.category}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt)}
            </span>
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {post.author}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
            {post.title}
          </h2>

          <div className="text-gray-600 leading-relaxed whitespace-pre-line">
            {post.content || post.description}
          </div>
        </div>
      </div>
    </div>
  );
}
