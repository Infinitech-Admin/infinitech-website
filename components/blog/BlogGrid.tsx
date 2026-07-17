"use client";

import BlogCard from "./BlogCard";
import { BlogPost } from "./types";

interface BlogGridProps {
  posts: BlogPost[];
  onCardClick: (post: BlogPost) => void;
}

export default function BlogGrid({ posts, onCardClick }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-gray-200">
      {posts.map((post) => (
        <div
          key={post.id}
          className="py-8 sm:py-0 sm:px-8 sm:first:pl-0 sm:[&:nth-child(3n+1)]:pl-0 border-gray-200 sm:border-l first:border-l-0 sm:[&:nth-child(3n+1)]:border-l-0"
        >
          <BlogCard post={post} onClick={() => onCardClick(post)} />
        </div>
      ))}
    </div>
  );
}
