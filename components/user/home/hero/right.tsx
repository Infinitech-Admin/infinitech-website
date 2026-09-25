"use client";

import React from "react";
import { Image } from "@heroui/react";

const Right = () => {
  return (
    <div className="relative hidden lg:flex justify-center items-center">
      <Image
        alt="Infinitech team at work"
        src="/images/rigtimage.png"
        className="w-full h-auto object-contain"
      />
    </div>
  );
};

export default Right;
