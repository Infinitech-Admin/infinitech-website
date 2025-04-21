import React from "react";
import { poetsen_one } from "@/config/fonts";
import Cards from "./cards";

const Members = () => {
  return (
    <section className="container mx-auto py-12 px-4">
      <div className="flex flex-col justify-center items-center">
        <div className="max-w-lg text-center">
          <span className="text-4xl text-accent font-bold">OUR TEAM</span>
          <h1
            className={`text-3xl text-primary capitalize ${poetsen_one.className}`}
          >
            Meet our dedicated and passionate team members
          </h1>
        </div>

        <div className="mt-12">
          <Cards />
        </div>
      </div>
    </section>
  );
};

export default Members;
