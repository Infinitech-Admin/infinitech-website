// File: lib/api.ts

// Base URL of the Laravel backend. Set NEXT_PUBLIC_API_URL in .env.local.
// Everything here talks DIRECTLY to Laravel -- no Next.js API route in
// between, so Next's 4MB body limit is irrelevant to any of these calls.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BlogPostRecord {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  thumbnail: string | null;
  thumbnail_url: string | null;
  images: string[];
  image_urls: string[];
  video_path: string | null;
  video_url: string | null;
  category: string | null;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export async function fetchBlogPosts(
  params: {
    search?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<PaginatedResponse<BlogPostRecord>> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));

  const res = await fetch(`${API_URL}/api/blog-posts?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch blog posts: ${res.status}`);
  return res.json();
}

export async function fetchBlogPost(id: number): Promise<BlogPostRecord> {
  const res = await fetch(`${API_URL}/api/blog-posts/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch blog post: ${res.status}`);
  return res.json();
}

export async function createBlogPost(
  payload: Partial<BlogPostRecord>,
): Promise<BlogPostRecord> {
  const res = await fetch(`${API_URL}/api/blog-posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create blog post: ${res.status}`);
  return res.json();
}

export async function updateBlogPost(
  id: number,
  payload: Partial<BlogPostRecord>,
): Promise<BlogPostRecord> {
  const res = await fetch(`${API_URL}/api/blog-posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update blog post: ${res.status}`);
  return res.json();
}

export async function deleteBlogPost(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/blog-posts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete blog post: ${res.status}`);
}
