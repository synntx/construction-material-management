"use client";

import { Suspense } from "react";
import { SearchInput } from "@/components/SearchInput";
import { ProjectsSearchResults } from "@/components/ProjectsSearchResults";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <Search />
    </Suspense>
  );
}

const Search = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project Search</h1>

        <div className="flex flex-col gap-6">
          <Suspense fallback={<div>Loading Search Input...</div>}>
            <SearchInput />
          </Suspense>

          <Suspense fallback={<div>Loading Search Results...</div>}>
            <ProjectsSearchResults query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
