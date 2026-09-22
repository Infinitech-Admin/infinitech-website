"use client";

import { Sparkles } from "lucide-react";

export function PlaceholderPageView({ name }: { name: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-24 text-muted-foreground">
      <Sparkles className="h-8 w-8 mb-3 text-slate-300" />
      <p
        className="font-medium"
        style={{ color: "var(--portal-header_text, #475569)" }}
      >
        {name}
      </p>
      <p className="text-sm mt-1">
        This page hasn't been set up for this demo yet.
      </p>
    </div>
  );
}
