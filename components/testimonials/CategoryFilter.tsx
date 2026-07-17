"use client";

import { Chip } from "@heroui/react";

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-5">
      {["All", ...categories].map((cat) => (
        <Chip
          key={cat}
          variant={active === cat ? "solid" : "bordered"}
          color={active === cat ? "primary" : "default"}
          className="cursor-pointer"
          onClick={() => onChange(cat)}
        >
          {cat}
        </Chip>
      ))}
    </div>
  );
}
