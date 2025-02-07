"use client";

import { CSVExportButton, ExcelExportButton } from "@/components/exportButton";
import { ImportExcelButton } from "@/components/importExcelButton";
import ItemTable from "@/components/ItemTable";
import api from "@/lib/apiClient";
import { Project } from "@/lib/types";
import { formatDistanceToNowStrict } from "date-fns";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export default function Projects() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const projectId = params.projectId as string;

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`api/v1/projects/${projectId}`);
      setLoading(false);
      setProject(response.data);
    } catch (e: unknown) {
      setError(e as Error);
      setLoading(false);
    }
  }, [projectId, setProject, setLoading, setError]);

  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId, fetchProject]);

  const handleImportSuccess = () => {
    fetchProject();
    console.log("Data Imported");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-4">
        <div className="text-center">
          Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full py-4">
        <div className="text-center">Error while fetching: {error.message}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center h-full py-4">
        <div className="text-center text-gray-600">
          Project not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-row items-center justify-center sm:justify-normal gap-2">
            <h1 className="text-lg sm:text-2xl font-normal">{project.name}</h1>
            <span className="text-xs mt-1.5 sm:mt-2 text-muted-foreground">
              {formatDistanceToNowStrict(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="flex flex-row gap-1 sm:gap-4 justify-start sm:justify-end">
            <ImportExcelButton
              projectId={projectId}
              onImportSuccess={handleImportSuccess}
            />
            <ExcelExportButton projectId={project.id} />
            <CSVExportButton projectId={project.id} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <ItemTable
            project={project}
            refreshImportedItems={handleImportSuccess}
          />
        </div>
      </div>
    </div>
  );
}
