"use client";

import { Skeleton } from "@heroui/react";

export default function LoadingSkeleton() {
  return (
    <div className="flex gap-4 mt-8 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4"
        >
          <Skeleton className="w-7 h-7 rounded-lg" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <div className="border-t border-gray-100 pt-3 flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
