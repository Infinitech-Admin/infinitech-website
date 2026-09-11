import React from "react";
import { PortalHero } from "@/components/portal-demo/portal-hero";
import CompanyPortalDemo from "@/components/portal-demo/company-portal-demo";

const Page = () => {
  return (
    <div className="min-h-screen bg-default-50">
      <PortalHero />
      <CompanyPortalDemo />
    </div>
  );
};

export default Page;
