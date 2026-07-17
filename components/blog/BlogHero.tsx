"use client";

import {
  Play,
  Camera,
  Aperture,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Tag,
} from "lucide-react";
import { BlogPost } from "./types";
import { useVideoThumbnail } from "./useVideoThumbnail";
import { poetsen_one } from "@/config/fonts";

interface BlogHeroProps {
  post: BlogPost;
  allPosts: BlogPost[];
  categories: string[];
  onClick: () => void;
  onViewAll: () => void;
}

export default function BlogHero({
  post,
  allPosts,
  categories,
  onClick,
  onViewAll,
}: BlogHeroProps) {
  const hasVideo = Boolean(post.videoUrl);
  const hasImage = Boolean(post.imageUrl);

  const { thumbnail } = useVideoThumbnail(
    !hasImage && hasVideo ? post.videoUrl : null,
  );
  const backdrop = hasImage ? post.imageUrl! : thumbnail;

  const videoCount = allPosts.filter((p) => p.videoUrl).length;
  const photoCount = allPosts.length - videoCount;

  // small fanned stack of other stories, peeking out behind the main frame
  const otherShots = allPosts
    .filter((p) => p !== post && (p.imageUrl || p.videoUrl))
    .slice(0, 3);

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-16"
      style={{
        background:
          "radial-gradient(circle at 15% 20%, rgba(255,166,43,0.08), transparent 40%), linear-gradient(135deg, #0b1a3f 0%, #16295c 55%, #0a1730 100%)",
      }}
    >
      <span className="absolute top-10 right-16 w-1.5 h-1.5 rounded-full bg-accent/50" />
      <span className="absolute top-24 right-32 w-1 h-1 rounded-full bg-white/30" />
      <span className="absolute bottom-16 left-1/3 w-1 h-1 rounded-full bg-accent/40" />
      <span className="absolute top-1/2 right-8 w-1 h-1 rounded-full bg-white/20" />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
        {/* Framed image + contact-sheet stack */}
        <div className="relative max-w-sm mx-auto">
          {/* fanned mini shots peeking out behind the frame */}
          {otherShots.map((shot, i) => {
            const src = shot.imageUrl ?? undefined;
            const rotation = [-8, 10, -4][i % 3];
            const offset = [-14, -10, -18][i % 3];
            return (
              <div
                key={i}
                className="hidden sm:block absolute top-6 right-0 w-20 h-24 rounded-md border border-white/15 bg-white/5 overflow-hidden shadow-lg pointer-events-none"
                style={{
                  transform: `rotate(${rotation}deg) translateX(${offset}px)`,
                  zIndex: 0,
                }}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover opacity-70"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Video className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={onClick}
            className="group relative block w-full z-10"
          >
            <div className="absolute -inset-3 pointer-events-none">
              <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent/70" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent/70" />
            </div>

            <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-[#0a1730]">
              {backdrop ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={backdrop}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/30 text-sm">
                  No image
                </div>
              )}

              {hasVideo && (
                <span className="absolute bottom-4 left-4 flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg group-hover:scale-110 transition-transform">
                  <Play
                    className="w-4 h-4 text-accent ml-0.5"
                    fill="currentColor"
                  />
                </span>
              )}
            </div>

            <span className="absolute -top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-semibold text-white/90">
              <Camera className="w-3 h-3 text-accent" />
              {hasVideo ? "Video" : "Photo"} ·{" "}
              {post.category ?? "Uncategorized"}
            </span>
          </button>

          {/* floating shutter-count badge, breaks the frame's edge */}
          <div className="absolute -bottom-5 -left-5 z-20 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-accent text-primary shadow-xl rotate-[-6deg]">
            <Aperture className="w-4 h-4 mb-0.5" />
            <span className="text-lg font-black leading-none">
              {allPosts.length}
            </span>
            <span className="text-[9px] font-bold tracking-wide uppercase">
              Stories
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-2 text-accent text-xs font-bold tracking-[0.2em] uppercase">
              <Aperture className="w-4 h-4" />
              Infinitech Advertising Corp.
            </span>
          </div>

          <h1
            className={`text-4xl sm:text-5xl leading-[1.1] mb-4 text-white ${poetsen_one.className}`}
          >
            {post.title}
          </h1>

          {/* single tag for THIS post's category - context, not a directory */}
          {post.category && (
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent text-xs font-semibold">
                <Tag className="w-3 h-3" />
                {post.category}
              </span>
            </div>
          )}

          <p className="text-white/60 leading-relaxed mb-8 max-w-md">
            {post.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <button
              onClick={onClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-accent text-accent font-bold text-sm hover:bg-accent hover:text-primary transition-colors"
            >
              Read the story
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onViewAll}
              className="px-6 py-2.5 rounded-lg border border-white/20 text-white/80 font-bold text-sm hover:border-white/40 hover:text-white transition-colors"
            >
              View all posts
            </button>
          </div>

          {/* stat cards - floating glass row instead of a stacked list */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
            <div className="group flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:-translate-y-1 hover:border-accent/40 transition-all duration-300">
              <ImageIcon className="w-5 h-5 text-accent" />
              <div className="font-black text-white text-xl leading-none">
                {photoCount}
              </div>
              <div className="text-white/50 text-[11px] leading-tight">
                Photo {photoCount === 1 ? "Story" : "Stories"}
              </div>
            </div>

            <div className="group flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:-translate-y-1 hover:border-accent/40 transition-all duration-300">
              <Video className="w-5 h-5 text-accent" />
              <div className="font-black text-white text-xl leading-none">
                {videoCount}
              </div>
              <div className="text-white/50 text-[11px] leading-tight">
                Video {videoCount === 1 ? "Story" : "Stories"}
              </div>
            </div>

            <div className="group flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:-translate-y-1 hover:border-accent/40 transition-all duration-300">
              <Tag className="w-5 h-5 text-accent" />
              <div className="font-black text-white text-xl leading-none">
                {categories.length}
              </div>
              <div className="text-white/50 text-[11px] leading-tight">
                {categories.length === 1 ? "Category" : "Categories"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
