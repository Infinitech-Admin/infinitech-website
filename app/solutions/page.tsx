import React from "react";
import { poetsen_one } from "@/config/fonts";
import SolutionsCard from "@/components/user/home/solutions/solutionscard";

const Page = () => {
  return (
    <section className="container mx-auto py-12 px-4">
      <div className="flex flex-col justify-center items-center">
        <div className="flex justify-between">
          <div className="max-w-2xl text-center">
            <h1 className="text-4xl text-accent font-bold mt-12">SOLUTIONS</h1>
            <h1 className={`text-3xl text-primary ${poetsen_one.className}`}>
              We design & build your custom website
            </h1>
          </div>
        </div>

        <div>
          <SolutionsCard/>
        </div>
      </div>
    </section>
  );
};

export default Page;
