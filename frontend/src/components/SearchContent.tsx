"use client";

import { Suspense, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { ProjectsSearchResults } from "@/components/ProjectsSearchResults";
import { ItemsSearchResults } from "@/components/ItemsSearchResults";

export function SearchContent() {
  const [activeTab, setActiveTab] = useState("projects");
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="items">Items</TabsTrigger>
      </TabsList>

      <Suspense fallback={<div>Loading...</div>}>
        {activeTab === "projects" ? (
          <ProjectsSearchResults query={query} />
        ) : (
          <ItemsSearchResults query={query} />
        )}
      </Suspense>
    </Tabs>
  );
}