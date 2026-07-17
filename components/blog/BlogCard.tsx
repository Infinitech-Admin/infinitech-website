"use client";

import { Play } from "lucide-react";
import { BlogPost } from "./types";
import { formatDate, excerpt } from "./utils";
import { useVideoThumbnail } from "./useVideoThumbnail";

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
}

export default function BlogCard({ post, onClick }: BlogCardProps) {
  const hasThumbnail = Boolean(post.thumbnailUrl);
  const hasImage = Boolean(post.imageUrl);
  const hasVideo = Boolean(post.videoUrl);

  // Generated video-frame thumbnail is only a last resort, when there's
  // neither a dedicated thumbnail nor a gallery image to fall back on.
  const { thumbnail: generatedThumbnail, loading: thumbLoading } =
    useVideoThumbnail(
      !hasThumbnail && !hasImage && hasVideo ? post.videoUrl : null,
    );

  const coverSrc = hasThumbnail
    ? post.thumbnailUrl!
    : hasImage
      ? post.imageUrl!
      : generatedThumbnail;
  const title = post.title?.trim() || "Untitled post";
  const description = post.description?.trim();

  return (
    <button onClick={onClick} className="group text-left flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-primary/10 mb-4">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : !hasThumbnail && !hasImage && hasVideo && thumbLoading ? (
          <div className="w-full h-full animate-pulse bg-primary/10" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/30 text-xs uppercase tracking-widest">
            No image
          </div>
        )}
        {hasVideo && (
          <span className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-accent ml-0.5" fill="currentColor" />
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 min-h-[132px]">
        {post.category && (
          <span className="text-accent text-[11px] font-bold tracking-[0.15em] uppercase mb-2">
            {post.category}
          </span>
        )}

        <h3 className="text-xl font-bold text-primary leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
          {description ? excerpt(description, 110) : "No description provided."}
        </p>

        <div className="flex items-center gap-2 text-[11px] tracking-wider uppercase text-gray-400 font-semibold pt-3 border-t border-gray-200">
          {post.author && <span className="truncate">{post.author}</span>}
          {post.author && (
            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
          )}
          <span className="shrink-0">{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </button>
  );
}
