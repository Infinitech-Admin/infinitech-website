"use client";

import { useEffect, useState } from "react";
import { Divider } from "@heroui/react";
import { poetsen_one } from "@/config/fonts";
import { Testimonial } from "@/components/testimonials/types";
import TestimonialModal from "@/components/testimonials/TestimonialModal";
import TestimonialSlider from "@/components/testimonials/TestimonialSlider";
// import ReviewPlatforms from "@/components/testimonials/ReviewPlatforms";
import LoadingSkeleton from "@/components/testimonials/LoadingSkeleton";
import CategoryFilter from "@/components/testimonials/CategoryFilter";
import TestimonialForm from "@/components/testimonials/TestimonialForm";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filtered, setFiltered] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);

  const categories = Array.from(
    new Set(
      testimonials.map((t) => t.company).filter((c): c is string => c !== null),
    ),
  );

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/testimonials?page=solutions", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load testimonials");
      const json = await res.json();
      const data: Testimonial[] = json.data ?? [];
      setTestimonials(data);
      setFiltered(data);
    } catch (err) {
      setError("Could not load testimonials. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(testimonials);
    } else {
      setFiltered(testimonials.filter((t) => t.company === activeCategory));
    }
  }, [activeCategory, testimonials]);

  return (
    <>
      <section>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mt-12 mx-auto text-center">
            <h2 className="font-bold text-accent text-4xl tracking-wider uppercase">
              Testimonials
            </h2>
            <h1
              className={`text-4xl text-primary mt-2 ${poetsen_one.className}`}
            >
              Our work brings to life the success stories of our partners
            </h1>
          </div>

          {!loading && !error && categories.length > 1 && (
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={(cat) => setActiveCategory(cat)}
            />
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <p className="text-center text-red-500 py-12">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No testimonials yet. Be the first to share your experience!
            </p>
          ) : (
            <TestimonialSlider
              key={activeCategory}
              testimonials={filtered}
              onCardClick={setSelectedTestimonial}
            />
          )}

          <Divider className="my-12" />

          {/* <ReviewPlatforms /> */}

          <Divider className="my-12" />

          <TestimonialForm onSubmitted={fetchTestimonials} />
        </div>
      </section>

      <TestimonialModal
        testimonial={selectedTestimonial}
        isOpen={selectedTestimonial !== null}
        onClose={() => setSelectedTestimonial(null)}
      />
    </>
  );
}
