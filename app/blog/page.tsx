"use client";

import { useEffect, useRef, useState } from "react";
import { Divider } from "@heroui/react";
import { poetsen_one } from "@/config/fonts";
import { BlogPost } from "@/components/blog/types";
import BlogModal from "@/components/blog/BlogModal";
import BlogGrid from "@/components/blog/BlogGrid";
import BlogHero from "@/components/blog/BlogHero";
import LoadingSkeleton from "@/components/blog/LoadingSkeleton";
import CategoryFilter from "@/components/blog/CategoryFilter";
import { API_URL, BlogPostRecord } from "@/lib/api";

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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filtered, setFiltered] = useState<BlogPost[]>([]);
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
      const data = records.map(mapToBlogPost);

      setPosts(data);
      setFiltered(data);
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

  // pick the featured post once, when posts first load (stable per page load,
  // matches whatever BlogHero displays since we now pass it down directly)
  useEffect(() => {
    if (posts.length > 0 && !featuredPost) {
      setFeaturedPost(posts[Math.floor(Math.random() * posts.length)]);
    }
  }, [posts, featuredPost]);

  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(posts);
    } else {
      setFiltered(posts.filter((p) => p.category === activeCategory));
    }
  }, [activeCategory, posts]);

  // only hide the featured post from the grid when browsing "All" — if the
  // person filters to a specific category, they should see every post in
  // that category, including the one currently shown in the hero
  const gridPosts =
    featuredPost && activeCategory === "All"
      ? filtered.filter((p) => p.id !== featuredPost.id)
      : filtered;

  return (
    <>
      <section>
        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <p className="text-center text-red-500 py-12">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No blog posts yet. Check back soon!
            </p>
          ) : (
            <>
              {featuredPost && (
                <div className="mt-8 sm:mt-10">
                  <BlogHero
                    post={featuredPost}
                    allPosts={posts}
                    categories={categories}
                    onClick={() => setSelectedPost(featuredPost)}
                    onViewAll={() =>
                      gridRef.current?.scrollIntoView({ behavior: "smooth" })
                    }
                  />
                </div>
              )}

              <div ref={gridRef} className="pt-16">
                {categories.length > 1 && (
                  <CategoryFilter
                    categories={categories}
                    active={activeCategory}
                    onChange={setActiveCategory}
                  />
                )}

                <h2
                  className={`text-2xl text-primary mt-6 mb-6 ${poetsen_one.className}`}
                >
                  {activeCategory === "All" ? "More stories" : activeCategory}
                </h2>

                {gridPosts.length === 0 ? (
                  <p className="text-center text-gray-400 py-12">
                    No other posts in this category yet.
                  </p>
                ) : (
                  <BlogGrid posts={gridPosts} onCardClick={setSelectedPost} />
                )}
              </div>
            </>
          )}

          <Divider className="my-12" />
        </div>
      </section>

      <BlogModal
        post={selectedPost}
        isOpen={selectedPost !== null}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
