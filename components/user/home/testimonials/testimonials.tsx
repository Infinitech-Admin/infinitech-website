"use client";

import React, { useEffect, useState } from "react";
import { Testimonial } from "@/components/testimonials/types";
import TestimonialSlider from "@/components/testimonials/TestimonialSlider";
import TestimonialModal from "@/components/testimonials/TestimonialModal";
import TestimonialForm from "@/components/testimonials/TestimonialForm";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/testimonials?page=home", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load testimonials");
      const json = await res.json();
      setTestimonials(json.data ?? []);
    } catch (err) {
      setError("Could not load testimonials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    <section className="bg-slate-50">
      <div className="container mx-auto py-16 lg:py-24 px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-sm font-bold text-accent tracking-widest uppercase">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl text-primary font-bold mt-2">
            What Our Clients Say
          </h2>
          <p className="text-gray-500 mt-3">
            Real feedback from businesses we've helped grow.
          </p>
        </div>

        {/* Slider (left) + submission form (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            {loading ? (
              <p className="text-center text-gray-400 py-12">
                Loading testimonials...
              </p>
            ) : error ? (
              <p className="text-center text-red-500 py-12">{error}</p>
            ) : testimonials.length === 0 ? (
              <p className="text-center text-gray-400 py-12">
                No testimonials yet.
              </p>
            ) : (
              <TestimonialSlider
                testimonials={testimonials}
                onCardClick={setSelectedTestimonial}
              />
            )}
          </div>

          <div>
            <TestimonialForm onSubmitted={fetchTestimonials} />
          </div>
        </div>
      </div>

      <TestimonialModal
        testimonial={selectedTestimonial}
        isOpen={selectedTestimonial !== null}
        onClose={() => setSelectedTestimonial(null)}
      />
    </section>
  );
};

export default Testimonials;
