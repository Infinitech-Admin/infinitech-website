import React from "react";
import Cards from "./cards";

const Members = () => {
  return (
    <section className="py-12">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="inline-block rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1 font-mono text-xs text-[#38bdf8]">
          OUR TEAM
        </span>
        <h2 className="mt-4 font-['Poetsen_One'] text-3xl font-bold text-white sm:text-4xl">
          Meet our dedicated and passionate team members
        </h2>
      </div>
      <Cards />
    </section>
  );
};

export default Members;
