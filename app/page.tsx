import React from "react";
import Hero from "@/components/user/home/hero/hero";
import About from "@/components/user/home/about";
import Services from "@/components/user/home/services/services";
import Solutions from "@/components/user/home/solutions/solutions";
import Testimonials from "@/components/user/home/testimonials/testimonials";
import Contact from "@/components/user/contact/contact";

const Page = () => {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Solutions />
      <Testimonials />
      <section className="bg-gray-100">
        <Contact />
      </section>
    </>
  );
};

export default Page;
