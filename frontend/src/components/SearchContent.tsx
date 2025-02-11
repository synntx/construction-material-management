"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectsSearchResults } from "@/components/ProjectsSearchResults";

export function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsSearchResults query={query} />
    </Suspense>
  );
}
