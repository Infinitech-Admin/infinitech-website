"use client";

import React from "react";
import { PORTALS } from "./portal-data";
import { Portal } from "./types";
import { PortalCard } from "./portal-card";

interface PortalGridProps {
  onOpenDemo: (portal: Portal) => void;
}

export const PortalGrid = ({ onOpenDemo }: PortalGridProps) => {
  return (
    <section id="portal-grid" className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium tracking-wide text-default-400">
          Portal samples
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          Explore an admin workspace built for your business
        </h2>
        <p className="max-w-2xl text-sm text-default-500">
          Each sample is an interactive, read-only walkthrough. Pick a
          workspace, choose a role, and see exactly what your team would see
          once it&apos;s live &mdash; no sign-up required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PORTALS.map((portal) => (
          <PortalCard key={portal.id} portal={portal} onOpenDemo={onOpenDemo} />
        ))}
      </div>
    </section>
  );
};
