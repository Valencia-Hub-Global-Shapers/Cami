"use client";

import dynamic from "next/dynamic";
import { Programme } from "@/lib/types";

const MapView = dynamic(() => import("@/components/directory/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-card border border-border bg-sand" />
  )
});

export function ProgrammeMap({ programme }: { programme: Programme }) {
  return <MapView programmes={[programme]} height="h-64" />;
}
