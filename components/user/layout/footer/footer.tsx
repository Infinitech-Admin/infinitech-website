"use client";

import React from "react";
import { Divider } from "@heroui/react";
import FooterContent from "./content";

const FooterLayout = () => {
  return (
    <>
      <footer className="w-full flex flex-col items-center justify-center bg-blue-900 text-white py-4 lg:py-8">
        <div className="container mx-auto flex flex-col px-4 md:px-16 lg:px-4">
          <FooterContent />
          <Divider className="my-4 bg-gray-100" />
          <div className="flex flex-col md:flex-row justify-center items-center text-default-400">
            <h1 className="text-white">© 2025 Infinitech Advertising Corporation</h1>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterLayout;
