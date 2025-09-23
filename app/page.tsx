import React from "react";
import Hero from "@/components/user/home/hero/hero";
import PortfolioShowcase from "@/components/user/home/portfolio/portfolio-showcase";
import About from "@/components/user/home/about";
import Services from "@/components/user/home/services/services";

import Testimonials from "@/components/user/home/testimonials/testimonials";
import Contact from "@/components/user/contact/contact";

const Page = () => {
  return (
    <>
      <Hero />
      <PortfolioShowcase />
      <About />
      <Services />
   
      <Testimonials />
      <section className="bg-gray-100">
        <Contact />
      </section>
    </>
  );
};

export default Page;
