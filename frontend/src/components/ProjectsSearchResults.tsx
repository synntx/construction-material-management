"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Building from "@/icons/building";
import { formatDistanceToNowStrict } from "date-fns";
import api from "@/lib/apiClient";
import { Project } from "@/lib/types";

export function ProjectsSearchResults({ query }: { query: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/v1/project/search", {
          params: { q: query, page, limit: 10 },
        });
        setProjects(response.data.projects);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [query, page]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Link
            href={`/projects/${project.id}`}
            key={project.id}
            className="rounded-lg p-4 bg-muted/20 hover:bg-muted hover:cursor-pointer border border-none duration-200"
          >
            <div className="flex items-center space-x-3">
              <Building strokeColor={"#525252"} />
              <div>
                <h3 className="text-sm text-foreground truncate">
                  {project.name}
                </h3>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
