"use client";

import api from "@/lib/apiClient";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import Building from "@/icons/building";
import Link from "next/link";
import { GlobalSearchBar } from "@/components/globalSearchBar";
import { CreateProjectModal } from "@/components/creatProject";
import { ProjectActions } from "@/components/ProjectActions";
import { Project } from "@/lib/types";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response: AxiosResponse<Project[]> = await api.get(
        "api/v1/projects"
      );
      setLoading(false);
      setProjects(response.data);
    } catch (e: unknown) {
      setError(e as Error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = () => {
    fetchProjects();
  };

  if (loading) {
    return <div className="text-center py-4">Loading projects...</div>;
  }
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error fetching projects: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold hidden md:block">Projects</h1>
        <div className="flex items-center gap-4">
          <GlobalSearchBar />
          <CreateProjectModal onProjectCreated={handleProjectCreated} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative rounded-lg bg-muted/20 hover:bg-muted duration-200 group"
          >
            <div className="absolute top-5 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ProjectActions
                project={project}
                onProjectUpdated={fetchProjects}
                onProjectDeleted={fetchProjects}
              />
            </div>
            <Link
              href={`/projects/${project.id}`}
              className="block p-4 relative"
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
          </div>
        ))}
      </div>
    </div>
  );
}
