"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const router = useRouter();

  return <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>;
};

export default Providers;
