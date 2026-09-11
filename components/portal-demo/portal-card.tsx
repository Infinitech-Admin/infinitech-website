// components/portal-demo/portal-card.tsx
"use client";

import React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { Portal } from "./types";
import { PortalIcon } from "./portal-icon";

interface PortalCardProps {
  portal: Portal;
  onOpenDemo: (portal: Portal) => void;
}

const VISIBLE_AREAS = 3;
const VISIBLE_STEPS = 4;

export const PortalCard = ({ portal, onOpenDemo }: PortalCardProps) => {
  const extraAreas = portal.coreOperatingAreas.length - VISIBLE_AREAS;
  const visibleSteps = portal.exampleWorkflow.slice(0, VISIBLE_STEPS);
  const extraSteps = portal.exampleWorkflow.length - VISIBLE_STEPS;

  return (
    <Card
      shadow="sm"
      className="relative flex h-full flex-col overflow-hidden border border-default-200/60 bg-content1"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${portal.accent}`}
      />
      <CardBody className="h-full p-4">
        <div className="flex h-full flex-col gap-3.5">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-default-200 bg-default-50">
              <PortalIcon
                icon={portal.icon}
                className="h-4 w-4 text-default-600"
              />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-default-400">
              {portal.index} · {portal.categoryLabel}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-snug text-foreground">
              {portal.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-relaxed text-default-500">
              {portal.description}
            </p>
          </div>

          <div className="rounded-md border border-default-200 bg-default-50 px-3 py-2">
            <p className="text-[10px] font-medium text-default-400">
              Best suited for
            </p>
            <p className="line-clamp-1 text-xs text-default-700">
              {portal.bestSuitedFor}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-default-400">
              Core operating areas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {portal.coreOperatingAreas.slice(0, VISIBLE_AREAS).map((area) => (
                <Chip
                  key={area}
                  size="sm"
                  variant="flat"
                  className="h-6 bg-default-100 text-[11px] text-default-600"
                >
                  {area}
                </Chip>
              ))}
              {extraAreas > 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="h-6 bg-default-100 text-[11px] text-default-600"
                >
                  +{extraAreas} more
                </Chip>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-default-400">
              Example workflow
            </p>
            <div className="flex flex-wrap items-center gap-1">
              {visibleSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <Chip
                    size="sm"
                    variant="bordered"
                    className="h-6 text-[11px] text-default-600"
                  >
                    {step}
                  </Chip>
                  {i < visibleSteps.length - 1 && (
                    <span className="text-default-300">→</span>
                  )}
                </React.Fragment>
              ))}
              {extraSteps > 0 && (
                <span className="text-[11px] text-default-400">
                  +{extraSteps} more
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 mt-auto">
            <div className="text-xs text-default-500">
              <span className="font-semibold text-foreground">
                {portal.roles.length}
              </span>{" "}
              role perspectives
            </div>
            <Button
              size="sm"
              color="primary"
              variant="bordered"
              endContent={<ArrowRight className="h-3.5 w-3.5" />}
              onPress={() => onOpenDemo(portal)}
            >
              Open demo
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
