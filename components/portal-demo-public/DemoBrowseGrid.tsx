// 📁 Place this file at: components/portal-demo-public/DemoBrowseGrid.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon, Users } from "lucide-react";
import type { PortalDemoRecord } from "@/lib/portalDemoApi";

type Props = {
  demos: PortalDemoRecord[];
  onOpen: (demo: PortalDemoRecord) => void;
};

export function DemoBrowseGrid({ demos, onOpen }: Props) {
  if (demos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20">
        No portal demos are available right now.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {demos.map((demo) => (
        <Card
          key={demo.id}
          className="border-2 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
        >
          <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
            {demo.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={demo.image_url}
                alt={demo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <CardContent className="p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              {demo.category && (
                <Badge variant="secondary">{demo.category}</Badge>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {demo.role_count} role{demo.role_count === 1 ? "" : "s"}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
              {demo.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
              {demo.description}
            </p>
            <Button
              onClick={() => onOpen(demo)}
              className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700"
            >
              Open Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
