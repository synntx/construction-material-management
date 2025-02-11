"use client";

import { Suspense } from "react";
import { SearchInput } from "@/components/SearchInput";
import { SearchContent } from "@/components/SearchContent";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project Search</h1>

        <div className="flex flex-col gap-6">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchInput />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <SearchContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
