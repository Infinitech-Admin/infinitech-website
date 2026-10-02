"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaPlay, FaRegCalendarAlt } from "react-icons/fa";
import { BlogPost } from "@/components/blog/types";
import BlogModal from "@/components/blog/BlogModal";
import { useVideoThumbnail } from "@/components/blog/useVideoThumbnail";
import { API_URL, BlogPostRecord } from "@/lib/api";

/* ============================================================================
 * THEME TOKENS — same as the Solutions page
 * base #070d1f · surface #0d1630 · amber #f5a623 (brand) · cyan #38bdf8
 * text #e6ecff · muted #8a97bd
 * ========================================================================== */
const GRID_BG: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
};

const mono = "font-mono";
const glass = "border border-white/10 bg-white/[0.04] backdrop-blur-md";
const grad = (dir: string, ...stops: string[]): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${dir}, ${stops.join(", ")})`,
});

const css = `
@keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
.bl-scan { animation: scan 4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .bl-scan { animation: none; } }
`;

/* ============================================================================
 * DATA
 * ========================================================================== */
function mapToBlogPost(record: BlogPostRecord): BlogPost {
  return {
    id: String(record.id),
    title: record.title,
    description: record.description,
    content: record.content ?? "",
    thumbnailUrl: record.thumbnail_url ?? null,
    imageUrl: record.image_urls?.[0] ?? null,
    imageUrls: record.image_urls ?? [],
    videoUrl: record.video_url,
    category: record.category,
    author: record.author,
    publishedAt: record.published_at ?? record.created_at,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const cover = (p: BlogPost) => p.thumbnailUrl ?? p.imageUrl ?? null;

/* ============================================================================
 * UI PIECES
 * ========================================================================== */
function Dots() {
  return (
    <span className="flex gap-1.5">
      <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
    </span>
  );
}

function SectionHead({
  tag,
  title,
  text,
}: {
  tag: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span
        className={`${mono} inline-block rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1 text-xs text-[#38bdf8]`}
      >
        {tag}
      </span>
      <h2 className="mt-4 text-3xl font-bold text-white font-['Poetsen_One'] sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-4 text-[#8a97bd]">{text}</p>}
    </div>
  );
}

function CategoryPill({ label }: { label?: string | null }) {
  if (!label) return null;
  return (
    <span
      className={`${mono} inline-block rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-2.5 py-0.5 text-[11px] text-[#f5a623]`}
    >
      {label}
    </span>
  );
}

function Cover({ post, className }: { post: BlogPost; className: string }) {
  const direct = cover(post);
  // video-only posts: grab a frame so the card is never empty
  const { thumbnail } = useVideoThumbnail(
    !direct && post.videoUrl ? post.videoUrl : null,
  );
  const src = direct ?? thumbnail;
  if (!src) {
    return (
      <div
        className={`${className} grid place-items-center bg-[#0a1226] text-xs ${mono} text-[#8a97bd]`}
      >
        no image
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={post.title} className={className} />
  );
}

/* ---- HERO (featured post) ---- */
function Hero({
  post,
  total,
  categoryCount,
  onOpen,
  onViewAll,
}: {
  post: BlogPost;
  total: number;
  categoryCount: number;
  onOpen: () => void;
  onViewAll: () => void;
}) {
  const stats = [
    { v: String(total), l: "stories published" },
    { v: String(categoryCount), l: "categories" },
    { v: "Weekly", l: "fresh insights" },
  ];
  return (
    <div className="mb-8 w-full">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <span
            className={`${mono} inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-xs text-[#f5a623]`}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f5a623]" />
            FEATURED STORY
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] text-white font-['Poetsen_One'] sm:text-5xl lg:text-[3.2rem]">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CategoryPill label={post.category} />
            {post.publishedAt && (
              <span
                className={`${mono} inline-flex items-center gap-1.5 text-xs text-[#8a97bd]`}
              >
                <FaRegCalendarAlt className="h-3 w-3" />
                {formatDate(post.publishedAt)}
              </span>
            )}
            {post.author && (
              <span className={`${mono} text-xs text-[#8a97bd]`}>
                by {post.author}
              </span>
            )}
          </div>
          <p className="mt-5 line-clamp-4 max-w-md text-[#8a97bd]">
            {post.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onOpen}
              className="rounded-lg bg-[#f5a623] px-6 py-3 text-sm font-bold text-[#070d1f] shadow-[0_0_30px_rgba(245,166,35,0.45)] transition hover:-translate-y-0.5 hover:bg-[#ffb93f] hover:shadow-[0_0_44px_rgba(245,166,35,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
            >
              Read the story
            </button>
            <button
              onClick={onViewAll}
              className={`${glass} rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10`}
            >
              Browse all stories
            </button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div
            aria-hidden
            className="absolute -inset-10 rounded-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(56,189,248,0.28), transparent 65%)",
            }}
          />
          <button
            onClick={onOpen}
            aria-label={`Read ${post.title}`}
            className={`${glass} group relative block w-full overflow-hidden rounded-2xl text-left shadow-[0_0_80px_rgba(56,189,248,0.15)] transition hover:border-[#38bdf8]/60`}
          >
            <div className="relative">
              <Cover
                post={post}
                className="aspect-[4/3] w-full object-cover object-top transition duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden
                className="bl-scan pointer-events-none absolute inset-x-0 h-16"
                style={grad(
                  "to bottom",
                  "transparent",
                  "rgba(56,189,248,0.25)",
                  "transparent",
                )}
              />
              {post.videoUrl && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f5a623] text-[#070d1f] shadow-[0_0_30px_rgba(245,166,35,0.6)]">
                    <FaPlay className="ml-1 h-4 w-4" />
                  </span>
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      <div
        className={`${glass} mt-16 grid grid-cols-3 divide-x divide-white/10 rounded-2xl`}
      >
        {stats.map((x) => (
          <div key={x.l} className="px-3 py-6 text-center">
            <p
              className={`${mono} text-2xl font-bold text-[#f5a623] sm:text-4xl`}
            >
              {x.v}
            </p>
            <p className="mt-1 text-xs text-[#b8c3e6] sm:text-sm">{x.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- CATEGORY TABS ---- */
function Tabs({
  categories,
  active,
  counts,
  onChange,
}: {
  categories: string[];
  active: string;
  counts: Record<string, number>;
  onChange: (c: string) => void;
}) {
  return (
    <div
      role="tablist"
      className={`${glass} mx-auto mb-10 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-xl p-1.5`}
    >
      {["All", ...categories].map((c) => (
        <button
          key={c}
          role="tab"
          aria-selected={active === c}
          onClick={() => onChange(c)}
          className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8] ${active === c ? "bg-[#f5a623] text-[#070d1f] shadow-[0_0_22px_rgba(245,166,35,0.4)]" : "text-[#b8c3e6] hover:text-white"}`}
        >
          {c}
          <span
            className={`${mono} rounded-full px-1.5 text-[10px] ${active === c ? "bg-[#070d1f]/20" : "bg-white/10"}`}
          >
            {counts[c] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---- POST CARD ---- */
function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1226] text-left transition hover:-translate-y-1 hover:border-[#38bdf8]/60 hover:shadow-[0_0_40px_rgba(56,189,248,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8]"
    >
      <div className="relative overflow-hidden">
        <Cover
          post={post}
          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {post.videoUrl && (
          <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#f5a623] text-[#070d1f] shadow-[0_0_20px_rgba(245,166,35,0.6)]">
            <FaPlay className="ml-0.5 h-3 w-3" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <CategoryPill label={post.category} />
          {post.publishedAt && (
            <span className={`${mono} text-[11px] text-[#8a97bd]`}>
              {formatDate(post.publishedAt)}
            </span>
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-white">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-[#b8c3e6]">
          {post.description}
        </p>
        <span
          className={`${mono} mt-4 inline-flex items-center gap-2 text-xs text-[#38bdf8] transition group-hover:gap-3`}
        >
          read more <FaArrowRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}

/* ---- LOADING SKELETON ---- */
function Skeleton() {
  const bar = "animate-pulse rounded bg-white/10";
  return (
    <div className="w-full">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div className="space-y-4">
          <div className={`${bar} h-6 w-40 rounded-full`} />
          <div className={`${bar} h-14 w-full`} />
          <div className={`${bar} h-14 w-3/4`} />
          <div className={`${bar} h-20 w-2/3`} />
        </div>
        <div className={`${bar} aspect-video w-full rounded-2xl`} />
      </div>
      <div className="mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * PAGE
 * ========================================================================== */
export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const categories = Array.from(
    new Set(
      posts
        .map((p) => p.category)
        .filter((c): c is string => c !== null && c !== undefined),
    ),
  );

  const counts: Record<string, number> = { All: posts.length };
  posts.forEach((p) => {
    if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${API_URL}/api/blog-posts?is_published=true&per_page=100`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Failed to load blog posts");
      const json = await res.json();
      const records: BlogPostRecord[] = json.data ?? [];
      setPosts(records.map(mapToBlogPost));
    } catch (err) {
      setError("Could not load blog posts. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // pick the featured post once, when posts first load
  useEffect(() => {
    if (posts.length > 0 && !featuredPost) {
      setFeaturedPost(posts[Math.floor(Math.random() * posts.length)]);
    }
  }, [posts, featuredPost]);

  const filtered =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  // hide the featured post from the grid only when browsing "All"
  const gridPosts =
    featuredPost && activeCategory === "All"
      ? filtered.filter((p) => p.id !== featuredPost.id)
      : filtered;

  return (
    <>
      <div className="relative flex w-full flex-col items-center overflow-hidden bg-[#070d1f]">
        <style>{css}</style>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[44rem]"
          style={GRID_BG}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#38bdf8]/15 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-[60rem] h-96 w-96 rounded-full bg-[#f5a623]/10 blur-[120px]"
        />

        <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          {loading ? (
            <Skeleton />
          ) : error ? (
            <p className="py-12 text-center text-[#f87171]">{error}</p>
          ) : posts.length === 0 ? (
            <p className="py-12 text-center text-[#8a97bd]">
              No blog posts yet. Check back soon!
            </p>
          ) : (
            <>
              {featuredPost && (
                <Hero
                  post={featuredPost}
                  total={posts.length}
                  categoryCount={categories.length}
                  onOpen={() => setSelectedPost(featuredPost)}
                  onViewAll={() =>
                    gridRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              )}

              <div className="h-16" />

              <div ref={gridRef} className="mb-16 w-full scroll-mt-24">
                <SectionHead
                  tag="THE BLOG"
                  title={
                    activeCategory === "All" ? "More stories" : activeCategory
                  }
                  text="Ideas, updates, and lessons from our work. Pick a category to narrow things down."
                />

                {categories.length > 1 && (
                  <Tabs
                    categories={categories}
                    active={activeCategory}
                    counts={counts}
                    onChange={setActiveCategory}
                  />
                )}

                {gridPosts.length === 0 ? (
                  <p className="py-12 text-center text-[#8a97bd]">
                    No other posts in this category yet.
                  </p>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {gridPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onClick={() => setSelectedPost(post)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <BlogModal
        post={selectedPost}
        isOpen={selectedPost !== null}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
