import React from "react";
import { Divider } from "@heroui/react";
import Hero from "@/components/user/about/hero";
import VMG from "@/components/user/about/vmg";
import Members from "@/components/user/about/members/members";

const Page = () => {
  return (
    <section className="container mx-auto py-12 px-4">
      <Hero />
      <Divider className="my-4" />
      <VMG />
      <Members />
    </section>
  );
};

export default Page;
