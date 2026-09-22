// 📁 Place this file at: components/portal-demo/PortalDemoCard.tsx
"use client";

import { ArrowRight, Users } from "lucide-react";
import { PublicPortalDemo } from "@/lib/publicPortalDemoApi";

interface PortalDemoCardProps {
  demo: PublicPortalDemo;
  index: number;
  onOpenDemo: (demo: PublicPortalDemo) => void;
}

const VISIBLE_AREAS = 3;

export default function PortalDemoCard({
  demo,
  index,
  onOpenDemo,
}: PortalDemoCardProps) {
  const accent = demo.theme_configuration?.primary || "#22d3ee";
  const visibleAreas = demo.core_operating_areas.slice(0, VISIBLE_AREAS);
  const extraAreaCount = demo.core_operating_areas.length - visibleAreas.length;

  return (
    <div className="flex flex-col bg-slate-800/70 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-all hover:-translate-y-1 duration-300">
      <div className="relative h-44 bg-slate-900">
        {demo.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={demo.image_url}
            alt={demo.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${accent}33, transparent)`,
            }}
          />
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur text-xs font-semibold text-slate-200">
          {String(index + 1).padStart(2, "0")} · {demo.category || "Portal"}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-xl font-bold text-white mb-2">{demo.name}</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
          {demo.description}
        </p>

        {demo.best_suited_for && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Best suited for
            </p>
            <p className="text-sm text-slate-300">{demo.best_suited_for}</p>
          </div>
        )}

        {visibleAreas.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Core operating areas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visibleAreas.map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/70 text-slate-200"
                >
                  {area}
                </span>
              ))}
              {extraAreaCount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/40 text-slate-400">
                  +{extraAreaCount} more
                </span>
              )}
            </div>
          </div>
        )}

        {demo.example_workflow.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Example workflow
            </p>
            <p className="text-sm text-slate-300">
              {demo.example_workflow.join(" → ")}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-700">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            {demo.roles_count} role perspective
            {demo.roles_count === 1 ? "" : "s"}
          </span>
          <button
            onClick={() => onOpenDemo(demo)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: `linear-gradient(90deg, ${accent}, ${demo.theme_configuration?.secondary || accent})`,
            }}
          >
            Open demo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
