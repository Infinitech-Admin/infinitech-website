import Member from "@/components/user/about/members/member";
import React from "react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id

  return <Member id={id} />;
};

export default Page;
